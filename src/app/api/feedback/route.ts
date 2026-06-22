import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ ok: false, error: "Rating must be 1–5" }, { status: 400 });
  }

  const page = typeof body.page === "string" ? body.page.slice(0, 200) : "unknown";
  const reason = typeof body.reason === "string" ? body.reason.slice(0, 2000) : null;
  const suggestion = typeof body.suggestion === "string" ? body.suggestion.slice(0, 2000) : null;

  await prisma.feedback.create({
    data: { page, rating, reason: reason || null, suggestion: suggestion || null },
  });

  return NextResponse.json({ ok: true });
}