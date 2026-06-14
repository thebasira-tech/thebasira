// src/app/page.tsx
import { prisma } from "@/lib/prisma";
import StocksTable from "@/components/StocksTable";
import { formatNaira } from "@/lib/format";

export const dynamic = "force-dynamic";

function pctChange(newVal?: number | null, oldVal?: number | null) {
  if (!newVal || !oldVal || oldVal === 0) return null;
  return ((newVal - oldVal) / oldVal) * 100;
}

export default async function HomePage() {
  const securities = await prisma.security.findMany({
    orderBy: { symbol: "asc" },
    include: {
      dailyPrices: {
        orderBy: { date: "desc" },
        take: 8, // ✅ enough to compute 1D + 7D + sparkline
      },
    },
  });

  const stocks = securities.map((s) => {
    const latest = s.dailyPrices[0];
    const prev = s.dailyPrices[1];
    const weekAgo = s.dailyPrices[7];

    const price = latest?.close ?? 0;

    // dailyPrices is ordered desc (newest first); reverse for oldest -> newest
    const sparkline = s.dailyPrices
      .slice(0, 8)
      .map((d) => d.close)
      .filter((c): c is number => c != null)
      .reverse();

    return {
      symbol: s.symbol,
      name: s.name,
      sector: s.sector ?? "—",

      price,
      volume: latest?.volume ?? 0,
      marketCap: latest?.marketCap ?? 0,

      // your StocksTable expects these keys:
      change_1h: null, // we’ll keep null for now
      change_1d: pctChange(latest?.close, prev?.close),
      change_7d: pctChange(latest?.close, weekAgo?.close),
      sparkline,
    };
  });

  const totalMarketCap = stocks.reduce((sum, x) => sum + (x.marketCap || 0), 0);

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Basira</h1>
        <p className="text-text-muted mt-1">Nigerian Market Data — Simplified</p>
      </header>

      <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl p-4 bg-surface border border-border">
          <div className="text-xs text-text-muted uppercase tracking-wide">Total Market Cap (Seed)</div>
          <div className="mt-1 text-2xl font-display font-semibold text-text-primary">
            {formatNaira(totalMarketCap)}
          </div>
          <div className="mt-1 text-xs text-text-muted">Across listed equities/ETFs</div>
        </div>

        <div className="rounded-xl p-4 bg-surface border border-border">
          <div className="text-xs text-text-muted uppercase tracking-wide">NGX 30 Index</div>
          <div className="mt-1 text-2xl font-display font-semibold text-text-primary">—</div>
          <div className="mt-1 text-xs text-text-muted">Connect via NGX Index Values API later</div>
        </div>

        <div className="rounded-xl p-4 bg-surface border border-border">
          <div className="text-xs text-text-muted uppercase tracking-wide">Fear &amp; Greed</div>
          <div className="mt-1 text-2xl font-display font-semibold text-text-primary">—</div>
          <div className="mt-1 text-xs text-text-muted">Optional metric (custom)</div>
        </div>
      </section>

      <StocksTable initialStocks={stocks} />

      <footer className="mt-10 text-xs text-text-muted">
        Market data displayed may be delayed/simulated and is for informational purposes only. Not investment advice.
      </footer>
    </main>
  );
}