import { seedMockMarketData } from "@/server/seed/seedMockMarketData";

export const runtime = "nodejs";      // ensure Node runtime
export const maxDuration = 300;       // allow long run (esp on Vercel)

export async function POST() {
  const result = await seedMockMarketData(120, 200);
  return Response.json(result);
}
