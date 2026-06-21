import { NextRequest, NextResponse } from "next/server";
import { seedFxRates } from "@/server/seed/seedFxRates";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await seedFxRates();
  return NextResponse.json(result);
}