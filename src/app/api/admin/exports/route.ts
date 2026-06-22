import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const [feedback, subscribers, messages] = await Promise.all([
    prisma.feedback.findMany({ orderBy: { createdAt: "desc" }, take: 500 }),
    prisma.subscriber.findMany({ orderBy: { createdAt: "desc" }, take: 1000 }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 500 }),
  ]);

  return NextResponse.json({ ok: true, feedback, subscribers, messages });
}