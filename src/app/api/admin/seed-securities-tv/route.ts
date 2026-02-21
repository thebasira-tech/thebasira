import { seedFromTradingViewCsv } from "@/server/seed/seedFromTradingViewCsv";

export async function POST() {
  const result = await seedFromTradingViewCsv();
  return Response.json(result);
}
