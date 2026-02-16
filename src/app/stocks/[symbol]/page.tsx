// src/app/stocks/[symbol]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import StockIcon from "@/components/StockIcon";
import StockChartSection from "@/components/StockChartSection";
import { formatNaira } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function StockDetailPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;

  const stock = await prisma.security.findUnique({
    where: { symbol: symbol.toUpperCase() },
    include: {
      dailyPrices: { orderBy: { date: "desc" }, take: 1 },
      ohlcvBars: { orderBy: { date: "asc" }, take: 4000 },
    },
  });

  if (!stock) return notFound();

  const latest = stock.dailyPrices[0];

  const bars = stock.ohlcvBars.map((b) => ({
    time: b.date.toISOString().slice(0, 10), // "YYYY-MM-DD" for charts
    open: b.open,
    high: b.high,
    low: b.low,
    close: b.close,
    volume: b.volume ?? 0,
  }));

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-2">
        <StockIcon symbol={stock.symbol} size={36} />
        <h1 className="text-2xl font-bold">{stock.name}</h1>
      </div>

      <p className="text-gray-500 mb-6">
        {stock.symbol} • {stock.sector ?? "—"}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="border rounded-xl p-4">
          <div className="text-sm text-gray-500">Price (EOD)</div>
          <div className="text-xl font-semibold">{formatNaira(latest?.close ?? 0)}</div>
        </div>
        <div className="border rounded-xl p-4">
          <div className="text-sm text-gray-500">Market Cap</div>
          <div className="text-xl font-semibold">{formatNaira(latest?.marketCap ?? 0)}</div>
        </div>
      </div>

      <StockChartSection symbol={stock.symbol} bars={bars} />

      <p className="text-gray-700 mt-6">{stock.symbol} charts and data are for informational purposes only.</p>
    </main>
  );
}
