import { NextResponse } from "next/server";
import { seedNewsSources } from "@/server/seed/newsSources";

export async function POST() {
  const r = await seedNewsSources();
  return NextResponse.json(r);
}
