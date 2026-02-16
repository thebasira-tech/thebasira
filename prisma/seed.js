// prisma/seed.js
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // --- Basira seed dataset (edit/expand anytime) ---
  const securities = [
    {
      symbol: "MTNN",
      name: "MTN Nigeria Communications Plc",
      assetType: "EQUITY",
      sector: "Telecoms",
      csiStatus: "N/A",
      daily: {
        date: new Date("2026-02-10"),
        open: 242.0,
        high: 248.0,
        low: 240.5,
        close: 245.6,
        volume: 12450000,
        value: 0,
        marketCap: 5100000000000,
        high52w: 0,
        low52w: 0,
      },
      bars: [
        { date: "2026-02-06", open: 238, high: 244, low: 236, close: 241, volume: 9000000 },
        { date: "2026-02-07", open: 241, high: 246, low: 239, close: 243, volume: 11000000 },
        { date: "2026-02-10", open: 242, high: 248, low: 240.5, close: 245.6, volume: 12450000 },
      ],
    },
    {
      symbol: "GTCO",
      name: "Guaranty Trust Holding Company Plc",
      assetType: "EQUITY",
      sector: "Banking",
      csiStatus: "N/A",
      daily: {
        date: new Date("2026-02-10"),
        open: 42.2,
        high: 42.6,
        low: 41.4,
        close: 41.85,
        volume: 18500000,
        value: 0,
        marketCap: 1230000000000,
        high52w: 0,
        low52w: 0,
      },
      bars: [
        { date: "2026-02-06", open: 42.9, high: 43.1, low: 42.1, close: 42.4, volume: 15000000 },
        { date: "2026-02-07", open: 42.4, high: 42.8, low: 41.9, close: 42.3, volume: 17000000 },
        { date: "2026-02-10", open: 42.2, high: 42.6, low: 41.4, close: 41.85, volume: 18500000 },
      ],
    },
    {
      symbol: "BUACEMENT",
      name: "BUA Cement Plc",
      assetType: "EQUITY",
      sector: "Industrial Goods",
      csiStatus: "N/A",
      daily: {
        date: new Date("2026-02-10"),
        open: 110.8,
        high: 114.0,
        low: 109.5,
        close: 112.3,
        volume: 5200000,
        value: 0,
        marketCap: 3800000000000,
        high52w: 0,
        low52w: 0,
      },
      bars: [
        { date: "2026-02-06", open: 108.2, high: 111.0, low: 107.5, close: 110.1, volume: 4100000 },
        { date: "2026-02-07", open: 110.1, high: 113.0, low: 109.2, close: 111.4, volume: 4700000 },
        { date: "2026-02-10", open: 110.8, high: 114.0, low: 109.5, close: 112.3, volume: 5200000 },
      ],
    },
  ];

  // Optional: wipe existing seed rows (safe for dev)
  await prisma.ohlcvBar.deleteMany();
  await prisma.dailyPrice.deleteMany();
  await prisma.security.deleteMany();

  for (const s of securities) {
    await prisma.security.upsert({
      where: { symbol: s.symbol },
      update: {
        name: s.name,
        assetType: s.assetType,
        sector: s.sector,
        csiStatus: s.csiStatus,
      },
      create: {
        symbol: s.symbol,
        name: s.name,
        assetType: s.assetType,
        sector: s.sector,
        csiStatus: s.csiStatus,
      },
    });

    await prisma.dailyPrice.upsert({
      where: { symbol_date: { symbol: s.symbol, date: s.daily.date } },
      update: { ...s.daily },
      create: { symbol: s.symbol, ...s.daily },
    });

    for (const b of s.bars) {
      const date = new Date(b.date + "T00:00:00.000Z");
      await prisma.ohlcvBar.upsert({
        where: { symbol_date: { symbol: s.symbol, date } },
        update: { open: b.open, high: b.high, low: b.low, close: b.close, volume: b.volume },
        create: { symbol: s.symbol, date, open: b.open, high: b.high, low: b.low, close: b.close, volume: b.volume },
      });
    }
  }

  console.log("✅ Seed complete for TheBasira / Basira.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
