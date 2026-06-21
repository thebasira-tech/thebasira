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
  computePurchasingPower,
  summarizePurchasingPower,
  type InflationPoint,
  type PricePoint,
} from "@/lib/calculators/purchasingPower";

type Security = { symbol: string; name: string };
type InflationRow = { year: number; month: number; cpi: number; yoyRate: number };

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatNaira(n: number) {
  return `₦${Math.round(n).toLocaleString("en-NG")}`;
}

export default function PurchasingPowerCalculator({
  inflation,
  securities,
}: {
  inflation: InflationRow[];
  securities: Security[];
}) {
  const earliest = inflation[0] ?? { year: 2020, month: 1 };
  const latest = inflation[inflation.length - 1] ?? { year: 2026, month: 6 };

  const [amount, setAmount] = React.useState(1_000_000);
  const [startYear, setStartYear] = React.useState(earliest.year);
  const [startMonth, setStartMonth] = React.useState(earliest.month);
  const [savingsRate, setSavingsRate] = React.useState(5);
  const [symbol, setSymbol] = React.useState<string>("");

  const [prices, setPrices] = React.useState<PricePoint[]>([]);
  const [loadingPrices, setLoadingPrices] = React.useState(false);

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

  const inflationPoints: InflationPoint[] = inflation.map((r) => ({
    year: r.year,
    month: r.month,
    cpi: r.cpi,
  }));

  const series = React.useMemo(
    () =>
      computePurchasingPower({
        amountNaira: amount,
        startYear,
        startMonth,
        inflation: inflationPoints,
        prices,
        savingsAnnualRatePct: savingsRate,
      }),
    [amount, startYear, startMonth, inflationPoints, prices, savingsRate]
  );

  const summary = React.useMemo(() => summarizePurchasingPower(series), [series]);

  // Build year options from earliest to (latest - 0) so user can pick any start
  const yearOptions: number[] = [];
  for (let y = earliest.year; y <= latest.year; y++) yearOptions.push(y);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="rounded-xl border border-border bg-surface p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs text-text-muted mb-1">Amount (₦)</label>
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
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
            Savings rate (% p.a.)
          </label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={savingsRate}
            onChange={(e) => setSavingsRate(Number(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm text-text-primary font-data focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-4">
          <label className="block text-xs text-text-muted mb-1">
            Compare against a stock (optional)
          </label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="">None — cash vs savings only</option>
            {securities.map((s) => (
              <option key={s.symbol} value={s.symbol}>
                {s.symbol} — {s.name}
              </option>
            ))}
          </select>
          {loadingPrices && (
            <div className="mt-1 text-xs text-text-muted">Loading price history…</div>
          )}
          {symbol && !loadingPrices && prices.length === 0 && (
            <div className="mt-1 text-xs text-text-muted">
              No price history available for {symbol} at the selected start date.
            </div>
          )}
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl p-4 bg-surface border border-border">
            <div className="text-xs text-text-muted uppercase tracking-wide">
              Original amount ({summary.startLabel})
            </div>
            <div className="mt-1 text-xl font-display font-semibold text-text-primary font-data">
              {formatNaira(summary.nominalAmount)}
            </div>
          </div>

          <div className="rounded-xl p-4 bg-surface border border-border">
            <div className="text-xs text-text-muted uppercase tracking-wide">
              Needed today ({summary.endLabel}) for same buying power
            </div>
            <div className="mt-1 text-xl font-display font-semibold text-down font-data">
              {formatNaira(summary.requiredTodayAmount)}
            </div>
          </div>

          <div className="rounded-xl p-4 bg-surface border border-border">
            <div className="text-xs text-text-muted uppercase tracking-wide">
              Purchasing power lost
            </div>
            <div className="mt-1 text-xl font-display font-semibold text-down font-data">
              {summary.erosionPct.toFixed(1)}%
            </div>
            <div className="mt-1 text-xs text-text-muted">
              Original cash now buys what {formatNaira(summary.purchasingPowerRetained)}{" "}
              bought in {summary.startLabel}
            </div>
          </div>

          <div className="rounded-xl p-4 bg-surface border border-border">
            <div className="text-xs text-text-muted uppercase tracking-wide">
              In a savings account today
            </div>
            <div className="mt-1 text-xl font-display font-semibold text-text-primary font-data">
              {formatNaira(summary.savingsAmount)}
            </div>
            {summary.investmentAmount != null && (
              <div className="mt-1 text-xs text-up font-data">
                Invested in {symbol}: {formatNaira(summary.investmentAmount)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="text-sm font-medium text-text-primary mb-2">
          Value over time ({summary?.startLabel} – {summary?.endLabel})
        </div>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={series}>
            <CartesianGrid stroke="#23282E" />
            <XAxis
              dataKey="label"
              stroke="#8B96A5"
              fontSize={11}
              minTickGap={30}
            />
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
            <Line type="monotone" dataKey="nominal" name="Cash (nominal)" stroke="#8B96A5" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="requiredToday" name="Needed for same buying power" stroke="#EA3943" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="savings" name="Savings account" stroke="#00A878" strokeWidth={2} dot={false} />
            {symbol && (
              <Line type="monotone" dataKey="investment" name={`Invested in ${symbol}`} stroke="#16C784" strokeWidth={2} dot={false} connectNulls />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}