// src/server/seed/seedMockMarketData.ts
import { prisma } from "@/lib/prisma";

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export async function seedMockMarketData(days = 120, take = 200) {
  const securities = await prisma.security.findMany({
    select: { symbol: true },
    take,
    orderBy: { symbol: "asc" },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dailyRows: any[] = [];
  const barRows: any[] = [];

  for (const s of securities) {
    let price = rand(5, 250);

    // give each symbol a stable-ish share count so market caps look consistent
    const sharesOutstanding = rand(2_000_000_000, 40_000_000_000);

    for (let d = days; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(today.getDate() - d);
      date.setHours(0, 0, 0, 0);

      const pct = rand(-0.05, 0.05);
      const close = Math.max(0.5, price * (1 + pct));
      const open = price;
      const high = Math.max(open, close) * (1 + rand(0, 0.02));
      const low = Math.min(open, close) * (1 - rand(0, 0.02));
      const volume = Math.floor(rand(50_000, 25_000_000));

      const value = close * volume;
      const marketCap = close * sharesOutstanding;

      // crude 52W simulation (good enough for MVP)
      const high52w = Math.max(high, close) * (1 + rand(0, 0.12));
      const low52w = Math.min(low, close) * (1 - rand(0, 0.12));

      dailyRows.push({
        symbol: s.symbol,
        date,
        open: round2(open),
        high: round2(high),
        low: round2(low),
        close: round2(close),
        volume,
        value: round2(value),
        marketCap: round2(marketCap),
        high52w: round2(high52w),
        low52w: round2(low52w),
      });

      barRows.push({
        symbol: s.symbol,
        date,
        open: round2(open),
        high: round2(high),
        low: round2(low),
        close: round2(close),
        volume,
      });

      price = close;
    }
  }

  // Delete existing rows in the seeding window to avoid @@unique([symbol,date]) conflicts
  const minDate = new Date(today);
  minDate.setDate(today.getDate() - days);
  minDate.setHours(0, 0, 0, 0);

  const symbols = securities.map((s) => s.symbol);

  await prisma.dailyPrice.deleteMany({
    where: { symbol: { in: symbols }, date: { gte: minDate, lte: today } },
  });

  await prisma.ohlcvBar.deleteMany({
    where: { symbol: { in: symbols }, date: { gte: minDate, lte: today } },
  });

  // Insert in chunks for speed
  const chunk = async (
    rows: any[],
    fn: (data: any[]) => Promise<any>,
    size = 5000
  ) => {
    for (let i = 0; i < rows.length; i += size) {
      const slice = rows.slice(i, i + size);
      await fn(slice);
    }
  };

  await chunk(dailyRows, (data) => prisma.dailyPrice.createMany({ data }), 5000);
  await chunk(barRows, (data) => prisma.ohlcvBar.createMany({ data }), 5000);

  return {
    ok: true,
    securities: securities.length,
    dailyRows: dailyRows.length,
    barRows: barRows.length,
    minDate,
    today,
  };
}