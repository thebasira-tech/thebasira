"use client";

import PriceChart from "@/components/PriceChart";

type Bar = {
  time: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export default function StockChartSection({
  symbol,
  bars,
}: {
  symbol: string;
  bars: Bar[];
}) {
  if (!bars?.length) {
    return (
      <div className="border rounded-xl p-4 mb-6">
        <div className="text-sm text-gray-500">Chart</div>
        <div className="mt-2 text-sm">No historical data available yet.</div>
      </div>
    );
  }

  // Last-day change label
  const last = bars[bars.length - 1];
  const prev = bars.length > 1 ? bars[bars.length - 2] : null;
  const diff = prev ? last.close - prev.close : 0;
  const pct = prev && prev.close ? (diff / prev.close) * 100 : 0;
  const isUp = diff >= 0;

  return (
    <section className="border rounded-xl p-4 mb-6 bg-white">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-gray-500">Price Chart</div>
          <div className="text-lg font-semibold">{symbol}</div>
        </div>
        {prev && (
          <div className={`text-sm font-medium ${isUp ? "text-green-600" : "text-red-600"}`}>
            {isUp ? "▲" : "▼"} {isUp ? "+" : ""}
            {pct.toFixed(2)}%
          </div>
        )}
      </div>

      {/* PriceChart expects prop name "data" and DailyBar-like shape */}
      <PriceChart data={bars as any} />
    </section>
  );
}
