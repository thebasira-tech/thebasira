import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const VOTER_COOKIE = "basira_voter_id";

function todayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function GET(req: NextRequest) {
  const sectorParam = req.nextUrl.searchParams.get("sector");
  const sector = sectorParam && sectorParam !== "" ? sectorParam : "ALL";

  const date = todayUTC();

  const votes = await prisma.marketPulseVote.groupBy({
    by: ["sentiment"],
    where: { date, sector },
    _count: { _all: true },
  });

  let bullish = 0;
  let bearish = 0;
  for (const v of votes) {
    if (v.sentiment === "BULLISH") bullish = v._count._all;
    if (v.sentiment === "BEARISH") bearish = v._count._all;
  }

  const total = bullish + bearish;
  const bullishPct = total > 0 ? (bullish / total) * 100 : 50;

  const cookieStore = await cookies();
  const voterId = cookieStore.get(VOTER_COOKIE)?.value;

  let userVote: "BULLISH" | "BEARISH" | null = null;
  if (voterId) {
    const existing = await prisma.marketPulseVote.findUnique({
      where: { date_voterHash_sector: { date, voterHash: voterId, sector } },
      select: { sentiment: true },
    });
    userVote = existing?.sentiment ?? null;
  }

  return NextResponse.json({ ok: true, sector, bullish, bearish, total, bullishPct, userVote });
}