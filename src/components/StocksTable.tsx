// src/components/StocksTable.tsx
"use client";

import React from "react";
import Link from "next/link";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { formatNaira } from "@/lib/format";
import StockIcon from "@/components/StockIcon";

type SortKey = "marketCap" | "price" | "volume" | "change_1h" | "change_1d" | "change_7d";
type SortDir = "asc" | "desc";
type Timeframe = "1h" | "1d" | "7d";

export type StockRow = {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  volume: number;
  marketCap: number;
  change_1h?: number | null;
  change_1d?: number | null;
  change_7d?: number | null;
  sparkline?: number[]; // last N closes, oldest -> newest
};

function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="ml-1 text-[10px] text-text-muted/50">↕</span>;
  return <span className="ml-1 text-[10px] text-text-primary">{dir === "asc" ? "↑" : "↓"}</span>;
}

function numOrNegInf(v: unknown) {
  if (v === null || v === undefined) return Number.NEGATIVE_INFINITY;
  const n = Number(v);
  return Number.isFinite(n) ? n : Number.NEGATIVE_INFINITY;
}

function PctPill({ v }: { v: number | null | undefined }) {
  if (v === null || v === undefined) {
    return <span className="font-data text-xs text-text-muted">—</span>;
  }
  const positive = v >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-data text-xs font-medium whitespace-nowrap ${
        positive ? "bg-up/10 text-up" : "bg-down/10 text-down"
      }`}
    >
      {positive ? "▲" : "▼"} {Math.abs(v).toFixed(2)}%
    </span>
  );
}

function Sparkline({ data, positive }: { data?: number[]; positive: boolean }) {
  if (!data || data.length < 2) {
    return <div className="w-20 h-8 flex items-center justify-center text-text-muted text-xs">—</div>;
  }
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <div className="w-20 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={positive ? "#16C784" : "#EA3943"}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function StocksTable({ initialStocks }: { initialStocks: StockRow[] }) {
  const [query, setQuery] = React.useState("");
  const [sector, setSector] = React.useState("All");

  const [sortKey, setSortKey] = React.useState<SortKey>("marketCap");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");

  const [mobileTf, setMobileTf] = React.useState<Timeframe>("1d");

  const sectors = React.useMemo(() => {
    const s = initialStocks?.length ? initialStocks : [];
    return ["All", ...Array.from(new Set(s.map((x) => x.sector || "—")))];
  }, [initialStocks]);

  const filtered = React.useMemo(() => {
    const s = initialStocks?.length ? initialStocks : [];
    const q = query.trim().toLowerCase();
    return s.filter((x) => {
      const matchesQuery =
        !q || x.symbol.toLowerCase().includes(q) || x.name.toLowerCase().includes(q);
      const matchesSector = sector === "All" || (x.sector || "—") === sector;
      return matchesQuery && matchesSector;
    });
  }, [initialStocks, query, sector]);

  const sorted = React.useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = numOrNegInf((a as any)[sortKey]);
      const bv = numOrNegInf((b as any)[sortKey]);
      if (av === bv) return 0;
      const cmp = av > bv ? 1 : -1;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const mobileChangeKey: SortKey =
    mobileTf === "1h" ? "change_1h" : mobileTf === "7d" ? "change_7d" : "change_1d";

  const headerCls =
    "px-4 py-3 text-right cursor-pointer select-none text-text-muted font-medium text-xs uppercase tracking-wide hover:text-text-primary transition-colors whitespace-nowrap";

  return (
    <>
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by ticker or company name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full sm:w-2/3 px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="w-full sm:w-1/3 px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {sectors.map((sec) => (
            <option key={sec} value={sec}>
              {sec}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3 flex items-center justify-between sm:hidden">
        <div className="text-xs text-text-muted">Change timeframe</div>
        <div className="inline-flex rounded-lg border border-border overflow-hidden">
          {(["1h", "1d", "7d"] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setMobileTf(tf)}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                mobileTf === tf ? "bg-accent text-background" : "bg-surface text-text-muted"
              }`}
              type="button"
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Bounded scroll container: enables both horizontal scroll (mobile)
          and a frozen header + frozen first column via sticky positioning. */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="overflow-auto max-h-[75vh] scroll-dark">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="hidden sm:table-cell sticky top-0 z-20 bg-surface-2 px-4 py-3 text-left text-text-muted font-medium text-xs uppercase tracking-wide whitespace-nowrap">
                  #
                </th>
                <th className="sticky top-0 left-0 z-30 bg-surface-2 px-4 py-3 text-left text-text-muted font-medium text-xs uppercase tracking-wide whitespace-nowrap">
                  Stock
                </th>

                <th
                  className={`sticky top-0 z-20 bg-surface-2 ${headerCls}`}
                  onClick={() => toggleSort("price")}
                  title="Sort by Price"
                >
                  Price <SortIndicator active={sortKey === "price"} dir={sortDir} />
                </th>

                <th
                  className={`hidden sm:table-cell sticky top-0 z-20 bg-surface-2 ${headerCls}`}
                  onClick={() => toggleSort("change_1h")}
                  title="Sort by 1H change"
                >
                  1H % <SortIndicator active={sortKey === "change_1h"} dir={sortDir} />
                </th>

                <th
                  className={`hidden sm:table-cell sticky top-0 z-20 bg-surface-2 ${headerCls}`}
                  onClick={() => toggleSort("change_1d")}
                  title="Sort by 1D change"
                >
                  1D % <SortIndicator active={sortKey === "change_1d"} dir={sortDir} />
                </th>

                <th
                  className={`hidden sm:table-cell sticky top-0 z-20 bg-surface-2 ${headerCls}`}
                  onClick={() => toggleSort("change_7d")}
                  title="Sort by 7D change"
                >
                  7D % <SortIndicator active={sortKey === "change_7d"} dir={sortDir} />
                </th>

                <th
                  className={`sm:hidden sticky top-0 z-20 bg-surface-2 ${headerCls}`}
                  onClick={() => toggleSort(mobileChangeKey)}
                  title="Sort by selected timeframe"
                >
                  {mobileTf.toUpperCase()} %{" "}
                  <SortIndicator active={sortKey === mobileChangeKey} dir={sortDir} />
                </th>

                <th className="hidden md:table-cell sticky top-0 z-20 bg-surface-2 px-4 py-3 text-center text-text-muted font-medium text-xs uppercase tracking-wide whitespace-nowrap">
                  Last 7D
                </th>

                <th
                  className={`hidden sm:table-cell sticky top-0 z-20 bg-surface-2 ${headerCls}`}
                  onClick={() => toggleSort("volume")}
                  title="Sort by Volume"
                >
                  Volume <SortIndicator active={sortKey === "volume"} dir={sortDir} />
                </th>

                <th
                  className={`sticky top-0 z-20 bg-surface-2 ${headerCls}`}
                  onClick={() => toggleSort("marketCap")}
                  title="Sort by Market Cap"
                >
                  Mkt Cap <SortIndicator active={sortKey === "marketCap"} dir={sortDir} />
                </th>

                <th className="hidden lg:table-cell sticky top-0 z-20 bg-surface-2 px-4 py-3 text-left text-text-muted font-medium text-xs uppercase tracking-wide whitespace-nowrap">
                  Sector
                </th>
              </tr>
            </thead>

            <tbody>
              {sorted.map((stock, index) => {
                const mobileVal = (stock as any)[mobileChangeKey] as number | null | undefined;
                const trendPositive = (stock.change_7d ?? 0) >= 0;

                return (
                  <tr key={stock.symbol} className="group border-t border-border">
                    <td className="hidden sm:table-cell px-4 py-3 text-text-muted font-data text-xs bg-surface group-hover:bg-surface-2 transition-colors">
                      {index + 1}
                    </td>

                    <td className="sticky left-0 z-10 bg-surface group-hover:bg-surface-2 transition-colors px-4 py-3">
                      <div className="flex items-center gap-3 min-w-[140px] sm:min-w-[180px]">
                        <StockIcon symbol={stock.symbol} size={28} />
                        <div>
                          <div className="font-semibold text-text-primary">
                            <Link href={`/stocks/${stock.symbol}`} className="hover:text-accent transition-colors">
                              {stock.symbol}
                            </Link>
                          </div>
                          <div className="text-xs text-text-muted truncate max-w-[120px] sm:max-w-none">
                            {stock.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right font-data font-medium text-text-primary whitespace-nowrap">
                      {formatNaira(stock.price || 0)}
                    </td>

                    <td className="hidden sm:table-cell px-4 py-3 text-right">
                      <PctPill v={stock.change_1h} />
                    </td>

                    <td className="hidden sm:table-cell px-4 py-3 text-right">
                      <PctPill v={stock.change_1d} />
                    </td>

                    <td className="hidden sm:table-cell px-4 py-3 text-right">
                      <PctPill v={stock.change_7d} />
                    </td>

                    <td className="sm:hidden px-4 py-3 text-right">
                      <PctPill v={mobileVal} />
                    </td>

                    <td className="hidden md:table-cell px-4 py-3">
                      <div className="flex justify-center">
                        <Sparkline data={stock.sparkline} positive={trendPositive} />
                      </div>
                    </td>

                    <td className="hidden sm:table-cell px-4 py-3 text-right font-data text-text-muted whitespace-nowrap">
                      {(stock.volume || 0).toLocaleString("en-NG")}
                    </td>
                    <td className="px-4 py-3 text-right font-data font-medium text-text-primary whitespace-nowrap">
                      {formatNaira(stock.marketCap || 0)}
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded-full border border-border text-xs text-text-muted whitespace-nowrap">
                        {stock.sector || "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-2 text-xs text-text-muted sm:hidden">
        Tip: scroll sideways to see more columns — Stock stays pinned.
      </p>
    </>
  );
}