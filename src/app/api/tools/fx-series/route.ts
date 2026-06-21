import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const pair = req.nextUrl.searchParams.get("pair")?.toUpperCase() || "USDNGN";

  const rows = await prisma.fxRate.findMany({
    where: { pair },
    orderBy: { date: "asc" },
    select: { date: true, rate: true },
  });

  const series = rows.map((r) => {
    const d = new Date(r.date);
    return {
      year: d.getUTCFullYear(),
      month: d.getUTCMonth() + 1,
      rate: r.rate,
    };
  });

  return NextResponse.json({ ok: true, pair, series });
}