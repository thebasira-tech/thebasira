import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Sentiment } from "@prisma/client";
import crypto from "crypto";

const VOTER_COOKIE = "basira_voter_id";

function todayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const sentiment = body?.sentiment;
  const sector: string = typeof body?.sector === "string" && body.sector ? body.sector : "ALL";

  if (sentiment !== "BULLISH" && sentiment !== "BEARISH") {
    return NextResponse.json({ ok: false, error: "Invalid sentiment" }, { status: 400 });
  }

  const cookieStore = await cookies();
  let voterId = cookieStore.get(VOTER_COOKIE)?.value;

  if (!voterId) {
    voterId = crypto.randomUUID();
    cookieStore.set(VOTER_COOKIE, voterId, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  const date = todayUTC();

  await prisma.marketPulseVote.upsert({
    where: { date_voterHash_sector: { date, voterHash: voterId, sector } },
    update: { sentiment: sentiment as Sentiment },
    create: { date, voterHash: voterId, sector, sentiment: sentiment as Sentiment },
  });

  return NextResponse.json({ ok: true });
}