import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runInterdayBackfill } from "@/server/jobs/interdayBackfill";

export async function GET(req: Request) {
  const secret = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const from = url.searchParams.get("from") || "2016-01-01";

  // MVP approach: only top recently viewed symbols (reduce hits)
  const recent = await prisma.recentlyViewedSymbol.findMany({
    orderBy: { views7d: "desc" },
    take: 25,
  });

  const symbols = recent.map((r) => r.symbol);

  // fallback if empty (first run)
  const finalSymbols = symbols.length ? symbols : ["MTNN", "GTCO", "BUACEMENT"];

  const result = await runInterdayBackfill({ symbols: finalSymbols, from });
  return NextResponse.json({ ...result, symbols: finalSymbols, from });
}
