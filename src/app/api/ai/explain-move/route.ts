import "server-only";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { openai, getAIModel } from "@/lib/ai/openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sseHeaders() {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  };
}

function sendEvent(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  event: string,
  data: unknown
) {
  controller.enqueue(
    encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  );
}

function getSymbol(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  if (!symbol) return null;
  const s = symbol.trim().toUpperCase();
  if (!/^[A-Z0-9.\-]{1,20}$/.test(s)) return null;
  return s;
}

function pctChange(curr?: number | null, prev?: number | null) {
  if (curr == null || prev == null || !Number.isFinite(curr) || !Number.isFinite(prev) || prev === 0) {
    return null;
  }
  return ((curr - prev) / prev) * 100;
}

export async function GET(req: NextRequest) {
  const symbol = getSymbol(req);
  if (!symbol) {
    return new Response("Invalid symbol", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;

      const safeClose = () => {
        if (!closed) {
          closed = true;
          controller.close();
        }
      };

      try {
        sendEvent(controller, encoder, "meta", { symbol });

        const security = await prisma.security.findUnique({
          where: { symbol },
          select: {
            symbol: true,
            name: true,
            assetType: true,
            sector: true,
            csiStatus: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        if (!security) {
          sendEvent(controller, encoder, "error", {
            message: "Security not found",
          });
          sendEvent(controller, encoder, "done", { ok: false });
          safeClose();
          return;
        }

        const daily = await prisma.dailyPrice.findMany({
          where: { symbol },
          orderBy: { date: "desc" },
          take: 2,
          select: {
            date: true,
            open: true,
            high: true,
            low: true,
            close: true,
            volume: true,
            value: true,
            marketCap: true,
            high52w: true,
            low52w: true,
          },
        });

        const today = daily[0] ?? null;
        const prev = daily[1] ?? null;

        const recentBars = await prisma.ohlcvBar.findMany({
          where: { symbol },
          orderBy: { date: "desc" },
          take: 30,
          select: {
            date: true,
            open: true,
            high: true,
            low: true,
            close: true,
            volume: true,
          },
        });

        const mentions = await prisma.newsMention.findMany({
          where: { symbol },
          orderBy: { createdAt: "desc" },
          take: 12,
          select: {
            createdAt: true,
            article: {
              select: {
                id: true,
                title: true,
                url: true,
                publishedAt: true,
                source: {
                  select: { name: true },
                },
              },
            },
          },
        });

        const volSeries = recentBars
          .map((b) => b.volume)
          .filter((v): v is number => typeof v === "number" && Number.isFinite(v));

        const avgVol =
          volSeries.length >= 10
            ? volSeries.slice(0, 20).reduce((a, b) => a + b, 0) /
              Math.min(20, volSeries.length)
            : null;

        const movePct = pctChange(today?.close, prev?.close);
        const volumeSpike =
          today?.volume != null && avgVol != null && avgVol > 0
            ? today.volume / avgVol
            : null;

        const context = {
          security,
          today,
          prev,
          derived: {
            movePct,
            volumeSpike,
            avgVol,
          },
          recentBars: recentBars
            .slice()
            .reverse()
            .map((b) => ({
              date: b.date,
              o: b.open,
              h: b.high,
              l: b.low,
              c: b.close,
              v: b.volume,
            })),
          news: mentions.map((m, idx) => ({
            ref: `N${idx + 1}`,
            mentionedAt: m.createdAt,
            title: m.article?.title ?? null,
            source: m.article?.source?.name ?? null,
            publishedAt: m.article?.publishedAt ?? null,
          })),
        };

        const stream = openai.responses.stream({
          model: getAIModel(),
          input: [
            {
              role: "system",
              content: [
                {
                  type: "input_text",
                  text:
                    "You are Basira Market Analyst for Nigerian equities (NGX). " +
                    "Use only the provided JSON context. Do not invent news, filings, earnings, or corporate actions. " +
                    "Return exactly these sections: FACTS, PLAUSIBLE DRIVERS, WHAT'S MISSING. " +
                    "When referencing news, cite N1, N2, etc. Be concise.",
                },
              ],
            },
            {
              role: "user",
              content: [
                {
                  type: "input_text",
                  text:
                    `Explain why ${security.symbol} is up or down today.\n\nCONTEXT_JSON:\n` +
                    JSON.stringify(context),
                },
              ],
            },
          ],
          max_output_tokens: 650,
        });

        let sawOutput = false;

        for await (const event of stream) {
          if (event.type === "response.output_text.delta") {
            sawOutput = true;
            sendEvent(controller, encoder, "delta", { delta: event.delta });
            continue;
          }

          if (event.type === "response.refusal.delta") {
            sawOutput = true;
            sendEvent(controller, encoder, "delta", { delta: event.delta });
            continue;
          }

          if (event.type === "response.error") {
            sendEvent(controller, encoder, "error", {
              message: event.error?.message || "OpenAI stream error",
            });
            sendEvent(controller, encoder, "done", { ok: false });
            safeClose();
            return;
          }

          if (event.type === "response.completed") {
            sendEvent(controller, encoder, "done", { ok: true });
            safeClose();
            return;
          }
        }

        // If the stream ends without a completed event, fail loudly.
        if (!sawOutput) {
          sendEvent(controller, encoder, "error", {
            message:
              "No explanation text was returned by the model. Check quota, model access, or response event handling.",
          });
        }

        sendEvent(controller, encoder, "done", { ok: sawOutput });
        safeClose();
      } catch (err) {
        console.error("AI explain-move route error:", err);
        sendEvent(controller, encoder, "error", {
          message:
            err instanceof Error ? err.message : "Unknown AI route error",
        });
        sendEvent(controller, encoder, "done", { ok: false });
        safeClose();
      }
    },
  });

  return new Response(stream, { headers: sseHeaders() });
}