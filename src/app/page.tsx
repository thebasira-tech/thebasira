// src/app/page.tsx
import { prisma } from "@/lib/prisma";
import StocksTable from "@/components/StocksTable";
import { formatNaira } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const securities = await prisma.security.findMany({
    orderBy: { symbol: "asc" },
    include: {
      dailyPrices: {
        orderBy: { date: "desc" },
        take: 1,
      },
    },
  });

  const stocks = securities.map((s) => {
    const latest = s.dailyPrices[0];
    const price = latest?.close ?? 0;
    const prevClose = null; // optional later (compute from 2nd latest)
    const changePct = null; // optional later

    return {
      symbol: s.symbol,
      name: s.name,
      sector: s.sector ?? "—",
      price,
      volume: latest?.volume ?? 0,
      marketCap: latest?.marketCap ?? 0,
      // keep your UI expecting these:
      change1h: null,
      change1d: changePct,
      change7d: null,
    };
  });

  const totalMarketCap = stocks.reduce((sum, x) => sum + (x.marketCap || 0), 0);

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Basira</h1>
        <p className="text-gray-600 mt-1">Nigerian Market Data — Simplified</p>
      </header>

      <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-xl p-4 bg-white">
          <div className="text-xs text-gray-500">Total Market Cap (Seed)</div>
          <div className="mt-1 text-xl font-semibold">{formatNaira(totalMarketCap)}</div>
          <div className="mt-1 text-xs text-gray-500">Across listed equities/ETFs</div>
        </div>

        <div className="border rounded-xl p-4 bg-white">
          <div className="text-xs text-gray-500">NGX 30 Index</div>
          <div className="mt-1 text-xl font-semibold">—</div>
          <div className="mt-1 text-xs text-gray-500">Connect via NGX Index Values API later</div>
        </div>

        <div className="border rounded-xl p-4 bg-white">
          <div className="text-xs text-gray-500">Fear &amp; Greed</div>
          <div className="mt-1 text-xl font-semibold">—</div>
          <div className="mt-1 text-xs text-gray-500">Optional metric (custom)</div>
        </div>
      </section>

      <StocksTable initialStocks={stocks} />

      <footer className="mt-10 text-xs text-gray-500">
        Market data displayed may be delayed/simulated and is for informational purposes only. Not investment advice.
      </footer>
    </main>
  );
}
