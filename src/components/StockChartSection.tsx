"use client";

import PriceChart from "@/components/PriceChart";
import PriceMoveExplainer from "@/components/PriceMoveExplainer";

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
      <div className="rounded-xl border border-border bg-surface p-4 mb-6">
        <div className="text-sm text-text-muted">Chart</div>
        <div className="mt-2 text-sm text-text-primary">No historical data available yet.</div>

        {/* AI explainer still useful even if chart bars are missing */}
        <div className="mt-4">
          <PriceMoveExplainer symbol={symbol} />
        </div>
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
    <section className="rounded-xl border border-border p-4 mb-6 bg-surface">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-text-muted">Price Chart</div>
          <div className="text-lg font-display font-semibold text-text-primary">{symbol}</div>
        </div>
        {prev && (
          <div className={`text-sm font-data font-medium ${isUp ? "text-up" : "text-down"}`}>
            {isUp ? "▲" : "▼"} {isUp ? "+" : ""}
            {pct.toFixed(2)}%
          </div>
        )}
      </div>

      {/* PriceChart expects prop name "data" and DailyBar-like shape */}
      <PriceChart data={bars as any} />

      {/* AI explainer injected under chart */}
      <div className="mt-4">
        <PriceMoveExplainer symbol={symbol} />
      </div>
    </section>
  );
}