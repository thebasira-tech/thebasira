import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.trim().toUpperCase();
  if (!symbol) {
    return NextResponse.json({ ok: false, error: "Missing symbol" }, { status: 400 });
  }

  const prices = await prisma.dailyPrice.findMany({
    where: { symbol },
    orderBy: { date: "asc" },
    select: { date: true, close: true },
  });

  // Reduce to one (last) close per calendar month
  const monthly = new Map<string, { year: number; month: number; close: number }>();
  for (const p of prices) {
    if (p.close == null) continue;
    const d = new Date(p.date);
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth() + 1;
    monthly.set(`${year}-${month}`, { year, month, close: p.close });
  }

  const series = Array.from(monthly.values()).sort(
    (a, b) => a.year * 12 + a.month - (b.year * 12 + b.month)
  );

  return NextResponse.json({ ok: true, symbol, series });
}