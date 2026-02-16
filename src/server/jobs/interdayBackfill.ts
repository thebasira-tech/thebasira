// src/server/jobs/interdayBackfill.ts
import { prisma } from "@/lib/prisma";
import { ngxFetchJson } from "@/server/ngxClient";

type NgxInterdayRow = {
  // NGX doc says date "in ticks" sometimes; actual payload may vary.
  // We'll handle both "Date" and "date".
  Date?: number | string;
  date?: number | string;
  Open?: number;
  High?: number;
  Low?: number;
  Close?: number;
  Volume?: number;
};

function parseDateMaybeTicks(x: any) {
  if (x === null || x === undefined) return null;

  // If it’s already ISO string
  if (typeof x === "string") {
    const d = new Date(x);
    if (!Number.isNaN(d.getTime())) return d;
  }

  // If it’s ticks/ms
  const n = Number(x);
  if (Number.isFinite(n)) {
    // Many APIs use ms since epoch; if it looks like seconds, multiply.
    const ms = n < 10_000_000_000 ? n * 1000 : n;
    const d = new Date(ms);
    if (!Number.isNaN(d.getTime())) return d;
  }

  return null;
}

export async function runInterdayBackfill({
  symbols,
  from,
  to,
}: {
  symbols: string[];
  from: string; // "YYYY-MM-DD"
  to?: string;  // "YYYY-MM-DD"
}) {
  const run = await prisma.ingestionRun.create({
    data: { job: "INTERDAY_BACKFILL", status: "STARTED", meta: { symbols, from, to } },
  });

  try {
    let upserts = 0;

    for (const raw of symbols) {
      const symbol = raw.trim().toUpperCase();
      if (!symbol) continue;

      const rows = await ngxFetchJson<NgxInterdayRow[]>(
        "/price/interdayprices.json",
        { s: symbol, f: from, ...(to ? { t: to } : {}) }
      );

      for (const r of rows || []) {
        const d = parseDateMaybeTicks(r.Date ?? r.date);
        if (!d) continue;

        await prisma.ohlcvBar.upsert({
          where: { symbol_date: { symbol, date: d } },
          update: {
            open: Number(r.Open ?? 0),
            high: Number(r.High ?? 0),
            low: Number(r.Low ?? 0),
            close: Number(r.Close ?? 0),
            volume: Number(r.Volume ?? 0),
          },
          create: {
            symbol,
            date: d,
            open: Number(r.Open ?? 0),
            high: Number(r.High ?? 0),
            low: Number(r.Low ?? 0),
            close: Number(r.Close ?? 0),
            volume: Number(r.Volume ?? 0),
          },
        });

        upserts++;
      }
    }

    await prisma.ingestionRun.update({
      where: { id: run.id },
      data: { status: "SUCCESS", endedAt: new Date(), meta: { ...(run.meta as any), upserts } },
    });

    return { ok: true, upserts };
  } catch (e: any) {
    await prisma.ingestionRun.update({
      where: { id: run.id },
      data: { status: "FAILED", endedAt: new Date(), meta: { error: String(e?.message || e) } },
    });
    throw e;
  }
}
