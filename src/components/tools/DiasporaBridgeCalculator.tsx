"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  computeBridge,
  summarizeBridge,
  type FxPoint,
  type PricePoint,
} from "@/lib/calculators/remittanceBridge";

type Security = { symbol: string; name: string; assetType: string };
type FxRow = { year: number; month: number; rate: number };

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatNaira(n: number) {
  return `₦${Math.round(n).toLocaleString("en-NG")}`;
}

function formatUsd(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function DiasporaBridgeCalculator({
  fx,
  securities,
}: {
  fx: FxRow[];
  securities: Security[];
}) {
  const earliest = fx[0] ?? { year: 2020, month: 1 };
  const latest = fx[fx.length - 1] ?? { year: 2026, month: 6 };

  const [usdAmount, setUsdAmount] = React.useState(1000);
  const [startYear, setStartYear] = React.useState(earliest.year);
  const [startMonth, setStartMonth] = React.useState(earliest.month);
  const [symbol, setSymbol] = React.useState<string>("");

  const [prices, setPrices] = React.useState<PricePoint[]>([]);
  const [loadingPrices, setLoadingPrices] = React.useState(false);

  // Surface ETFs first in the dropdown — most relevant for this tool
  const sortedSecurities = React.useMemo(() => {
    const etfs = securities.filter((s) => s.assetType === "ETF");
    const others = securities.filter((s) => s.assetType !== "ETF");
    return [...etfs, ...others];
  }, [securities]);

  React.useEffect(() => {
    if (!symbol) {
      setPrices([]);
      return;
    }
    let cancelled = false;
    setLoadingPrices(true);

    fetch(`/api/tools/price-series?symbol=${encodeURIComponent(symbol)}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        setPrices(json?.series ?? []);
      })
      .catch(() => {
        if (!cancelled) setPrices([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingPrices(false);
      });

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  const fxPoints: FxPoint[] = fx;

  const series = React.useMemo(
    () =>
      computeBridge({
        usdAmount,
        startYear,
        startMonth,
        fx: fxPoints,
        prices,
      }),
    [usdAmount, startYear, startMonth, fxPoints, prices]
  );

  const summary = React.useMemo(() => summarizeBridge(series, usdAmount), [series, usdAmount]);

  const yearOptions: number[] = [];
  for (let y = earliest.year; y <= latest.year; y++) yearOptions.push(y);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="rounded-xl border border-border bg-surface p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs text-text-muted mb-1">Amount (USD)</label>
          <input
            type="number"
            min={0}
            value={usdAmount}
            onChange={(e) => setUsdAmount(Number(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm text-text-primary font-data focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-1">Start year</label>
          <select
            value={startYear}
            onChange={(e) => setStartYear(Number(e.target.value))}
            className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-1">Start month</label>
          <select
            value={startMonth}
            onChange={(e) => setStartMonth(Number(e.target.value))}
            className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {MONTH_NAMES.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-1">
            Invest naira proceeds in (optional)
          </label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="">None — cash comparison only</option>
            {sortedSecurities.map((s) => (
              <option key={s.symbol} value={s.symbol}>
                {s.symbol} — {s.name} {s.assetType === "ETF" ? "(ETF)" : ""}
              </option>
            ))}
          </select>
          {loadingPrices && (
            <div className="mt-1 text-xs text-text-muted">Loading price history…</div>
          )}
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl p-4 bg-surface border border-border">
            <div className="text-xs text-text-muted uppercase tracking-wide">
              {formatUsd(summary.usdAmount)} in {summary.startLabel}
            </div>
            <div className="mt-1 text-xl font-display font-semibold text-text-primary font-data">
              {formatNaira(summary.nairaAtStart)}
            </div>
            <div className="mt-1 text-xs text-text-muted font-data">
              @ ₦{summary.fxStart.toFixed(0)}/$
            </div>
          </div>

          <div className="rounded-xl p-4 bg-surface border border-border">
            <div className="text-xs text-text-muted uppercase tracking-wide">
              Still held as USD, converted {summary.endLabel}
            </div>
            <div className="mt-1 text-xl font-display font-semibold text-up font-data">
              {formatNaira(summary.usdValueInNairaToday)}
            </div>
            <div className="mt-1 text-xs text-text-muted font-data">
              @ ₦{summary.fxEnd.toFixed(0)}/$
            </div>
          </div>

          <div className="rounded-xl p-4 bg-surface border border-border">
            <div className="text-xs text-text-muted uppercase tracking-wide">
              Converted to naira cash, held since {summary.startLabel}
            </div>
            <div className="mt-1 text-xl font-display font-semibold text-text-muted font-data">
              {formatNaira(summary.nairaCashHeldToday)}
            </div>
            <div className="mt-1 text-xs text-text-muted">
              No growth — same naira amount as {summary.startLabel}
            </div>
          </div>

          <div className="rounded-xl p-4 bg-surface border border-border">
            <div className="text-xs text-text-muted uppercase tracking-wide">
              {symbol ? `Converted & invested in ${symbol}` : "Converted & invested"}
            </div>
            <div className="mt-1 text-xl font-display font-semibold text-text-primary font-data">
              {summary.etfValueToday != null ? formatNaira(summary.etfValueToday) : "—"}
            </div>
            {!symbol && (
              <div className="mt-1 text-xs text-text-muted">
                Select a stock or ETF above to compare
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="text-sm font-medium text-text-primary mb-2">
          Naira value over time ({summary?.startLabel} – {summary?.endLabel})
        </div>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={series}>
            <CartesianGrid stroke="#23282E" />
            <XAxis dataKey="label" stroke="#8B96A5" fontSize={11} minTickGap={30} />
            <YAxis
              stroke="#8B96A5"
              fontSize={11}
              tickFormatter={(v) => `₦${(v / 1_000_000).toFixed(1)}m`}
            />
            <Tooltip
              contentStyle={{
                background: "#15191E",
                border: "1px solid #23282E",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#F5F6F7" }}
              formatter={(value) => formatNaira(Number(value))}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="usdValueInNaira" name="Held as USD (converted today)" stroke="#16C784" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="nairaCashHeld" name="Converted then held as cash" stroke="#8B96A5" strokeWidth={2} dot={false} />
            {symbol && (
              <Line type="monotone" dataKey="etfValue" name={`Converted & invested in ${symbol}`} stroke="#00A878" strokeWidth={2} dot={false} connectNulls />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}