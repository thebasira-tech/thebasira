import { NextResponse } from "next/server";
import { runEodSnapshot } from "@/server/jobs/eodSnapshot";

export async function GET(req: Request) {
  const secret = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await runEodSnapshot();
  return NextResponse.json(result);
}
