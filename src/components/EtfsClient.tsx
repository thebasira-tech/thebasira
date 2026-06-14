"use client";

import React from "react";
import { etfs, formatNaira } from "@/lib/data";
import StockIcon from "@/components/StockIcon";

type SortKey = "change_ytd" | "marketCap" | "volume";
type SortDir = "asc" | "desc";

function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="ml-1 text-[10px] text-text-muted/50">↕</span>;
  return <span className="ml-1 text-[10px] text-text-primary">{dir === "asc" ? "↑" : "↓"}</span>;
}

export default function EtfsPage() {
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("marketCap");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");

  const totalEtfMarketCap = React.useMemo(
    () => etfs.reduce((sum, e) => sum + e.marketCap, 0),
    []
  );

  const bestYtd = React.useMemo(() => {
    if (!etfs.length) return null;
    return [...etfs].sort((a, b) => b.change_ytd - a.change_ytd)[0];
  }, []);

  const worstYtd = React.useMemo(() => {
    if (!etfs.length) return null;
    return [...etfs].sort((a, b) => a.change_ytd - b.change_ytd)[0];
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return etfs.filter((e) => {
      if (!q) return true;
      return e.symbol.toLowerCase().includes(q) || e.name.toLowerCase().includes(q);
    });
  }, [query]);

  const sorted = React.useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === bv) return 0;
      const cmp = av > bv ? 1 : -1;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-display font-semibold tracking-tight text-text-primary">ETFs (NGX)</h1>
        <p className="text-text-muted mt-1">
          YTD % is simulated for v1. Real calculations will use historical pricing.
        </p>
      </header>

      {/* ETF Summary Strip */}
      <section className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl p-4 bg-surface border border-border">
          <div className="text-xs text-text-muted uppercase tracking-wide">Total ETF Market Cap (Simulated)</div>
          <div className="mt-1 text-2xl font-display font-semibold text-text-primary">
            {formatNaira(totalEtfMarketCap)}
          </div>
        </div>

        <div className="rounded-xl p-4 bg-surface border border-border">
          <div className="text-xs text-text-muted uppercase tracking-wide">Best YTD</div>
          {bestYtd ? (
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StockIcon symbol={bestYtd.symbol} size={28} />
                <div>
                  <div className="font-medium text-text-primary">{bestYtd.symbol}</div>
                  <div className="text-xs text-text-muted">{bestYtd.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-data text-text-primary">{formatNaira(bestYtd.price)}</div>
                <div className="text-sm font-data font-medium text-up">
                  +{bestYtd.change_ytd}%
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-2 text-sm text-text-muted">—</div>
          )}
        </div>

        <div className="rounded-xl p-4 bg-surface border border-border">
          <div className="text-xs text-text-muted uppercase tracking-wide">Worst YTD</div>
          {worstYtd ? (
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StockIcon symbol={worstYtd.symbol} size={28} />
                <div>
                  <div className="font-medium text-text-primary">{worstYtd.symbol}</div>
                  <div className="text-xs text-text-muted">{worstYtd.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-data text-text-primary">{formatNaira(worstYtd.price)}</div>
                <div className="text-sm font-data font-medium text-down">
                  {worstYtd.change_ytd}%
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-2 text-sm text-text-muted">—</div>
          )}
        </div>
      </section>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search ETFs by symbol or name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* ETFs Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-surface scroll-dark">
        <table className="min-w-full text-sm">
          <thead className="bg-surface-2">
            <tr>
              <th className="px-4 py-3 text-left text-text-muted font-medium text-xs uppercase tracking-wide">ETF</th>
              <th className="px-4 py-3 text-right text-text-muted font-medium text-xs uppercase tracking-wide">Price</th>

              <th
                className="px-4 py-3 text-right cursor-pointer select-none text-text-muted font-medium text-xs uppercase tracking-wide hover:text-text-primary transition-colors"
                onClick={() => toggleSort("change_ytd")}
                title="Sort by YTD %"
              >
                YTD % <SortIndicator active={sortKey === "change_ytd"} dir={sortDir} />
              </th>

              <th
                className="px-4 py-3 text-right cursor-pointer select-none text-text-muted font-medium text-xs uppercase tracking-wide hover:text-text-primary transition-colors"
                onClick={() => toggleSort("volume")}
                title="Sort by Volume"
              >
                Volume <SortIndicator active={sortKey === "volume"} dir={sortDir} />
              </th>

              <th
                className="px-4 py-3 text-right cursor-pointer select-none text-text-muted font-medium text-xs uppercase tracking-wide hover:text-text-primary transition-colors"
                onClick={() => toggleSort("marketCap")}
                title="Sort by Market Cap"
              >
                Market Cap <SortIndicator active={sortKey === "marketCap"} dir={sortDir} />
              </th>
            </tr>
          </thead>

          <tbody>
            {sorted.map((etf) => (
              <tr key={etf.symbol} className="border-t border-border hover:bg-surface-2 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <StockIcon symbol={etf.symbol} size={28} />
                    <div>
                      <div className="font-medium text-text-primary">{etf.symbol}</div>
                      <div className="text-xs text-text-muted">{etf.name}</div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3 text-right font-data text-text-primary">{formatNaira(etf.price)}</td>

                <td
                  className={`px-4 py-3 text-right font-data font-medium ${
                    etf.change_ytd >= 0 ? "text-up" : "text-down"
                  }`}
                >
                  {etf.change_ytd >= 0 ? "+" : ""}
                  {etf.change_ytd}%
                </td>

                <td className="px-4 py-3 text-right font-data text-text-muted">
                  {etf.volume.toLocaleString("en-NG")}
                </td>

                <td className="px-4 py-3 text-right font-data text-text-primary">{formatNaira(etf.marketCap)}</td>
              </tr>
            ))}

            {sorted.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-sm text-text-muted" colSpan={5}>
                  No ETFs match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="mt-10 text-xs text-text-muted">
        Market data displayed is simulated and for informational purposes only. Not investment advice.
      </footer>
    </main>
  );
}