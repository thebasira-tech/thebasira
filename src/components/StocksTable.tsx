"use client";

import React from "react";
import Link from "next/link";
import { formatNaira } from "@/lib/data"; // keep for now (or switch later if you moved it)
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
};

function Arrow({ value }: { value: number }) {
  if (value > 0) return <span className="ml-1 text-[10px] text-green-600">▲</span>;
  if (value < 0) return <span className="ml-1 text-[10px] text-red-600">▼</span>;
  return <span className="ml-1 text-[10px] text-gray-400">•</span>;
}

function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="ml-1 text-[10px] text-gray-300">↕</span>;
  return <span className="ml-1 text-[10px] text-gray-600">{dir === "asc" ? "↑" : "↓"}</span>;
}

function numOrNegInf(v: unknown) {
  // Sorting helper: null/undefined/NaN should sink to bottom on desc
  if (v === null || v === undefined) return Number.NEGATIVE_INFINITY;
  const n = Number(v);
  return Number.isFinite(n) ? n : Number.NEGATIVE_INFINITY;
}

function renderPct(v: number | null | undefined) {
  if (v === null || v === undefined) return <span className="text-gray-400">—</span>;
  const sign = v >= 0 ? "+" : "";
  return (
    <>
      {sign}
      {v.toFixed(2)}% <Arrow value={v} />
    </>
  );
}

export default function StocksTable({ initialStocks }: { initialStocks: StockRow[] }) {
  const [query, setQuery] = React.useState("");
  const [sector, setSector] = React.useState("All");

  // Sorting
  const [sortKey, setSortKey] = React.useState<SortKey>("marketCap");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");

  // Mobile timeframe toggle (collapses 1H/1D/7D into one column)
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
      setSortDir("desc"); // default like CMC
    }
  };

  const mobileChangeKey: SortKey =
    mobileTf === "1h" ? "change_1h" : mobileTf === "7d" ? "change_7d" : "change_1d";

  return (
    <>
      {/* Search + Sector */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by ticker or company name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full sm:w-2/3 px-4 py-2 border rounded-lg text-sm"
        />
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="w-full sm:w-1/3 px-4 py-2 border rounded-lg text-sm"
        >
          {sectors.map((sec) => (
            <option key={sec} value={sec}>
              {sec}
            </option>
          ))}
        </select>
      </div>

      {/* Mobile timeframe toggle */}
      <div className="mb-3 flex items-center justify-between sm:hidden">
        <div className="text-xs text-gray-500">Change timeframe</div>
        <div className="inline-flex rounded-lg border overflow-hidden">
          {(["1h", "1d", "7d"] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setMobileTf(tf)}
              className={`px-3 py-1 text-xs font-medium ${
                mobileTf === tf ? "bg-gray-900 text-white" : "bg-white text-gray-700"
              }`}
              type="button"
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Stock</th>

              <th
                className="px-4 py-3 text-right cursor-pointer select-none"
                onClick={() => toggleSort("price")}
                title="Sort by Price"
              >
                Price <SortIndicator active={sortKey === "price"} dir={sortDir} />
              </th>

              {/* Desktop: 1H/1D/7D */}
              <th
                className="hidden sm:table-cell px-4 py-3 text-right cursor-pointer select-none"
                onClick={() => toggleSort("change_1h")}
                title="Sort by 1H change"
              >
                1H % <SortIndicator active={sortKey === "change_1h"} dir={sortDir} />
              </th>

              <th
                className="hidden sm:table-cell px-4 py-3 text-right cursor-pointer select-none"
                onClick={() => toggleSort("change_1d")}
                title="Sort by 1D change"
              >
                1D % <SortIndicator active={sortKey === "change_1d"} dir={sortDir} />
              </th>

              <th
                className="hidden sm:table-cell px-4 py-3 text-right cursor-pointer select-none"
                onClick={() => toggleSort("change_7d")}
                title="Sort by 7D change"
              >
                7D % <SortIndicator active={sortKey === "change_7d"} dir={sortDir} />
              </th>

              {/* Mobile: single Change column */}
              <th
                className="sm:hidden px-4 py-3 text-right cursor-pointer select-none"
                onClick={() => toggleSort(mobileChangeKey)}
                title="Sort by selected timeframe"
              >
                Change ({mobileTf.toUpperCase()}){" "}
                <SortIndicator active={sortKey === mobileChangeKey} dir={sortDir} />
              </th>

              <th
                className="px-4 py-3 text-right cursor-pointer select-none"
                onClick={() => toggleSort("volume")}
                title="Sort by Volume"
              >
                Volume <SortIndicator active={sortKey === "volume"} dir={sortDir} />
              </th>

              <th
                className="px-4 py-3 text-right cursor-pointer select-none"
                onClick={() => toggleSort("marketCap")}
                title="Sort by Market Cap"
              >
                Market Cap <SortIndicator active={sortKey === "marketCap"} dir={sortDir} />
              </th>

              <th className="px-4 py-3 text-left">Sector</th>
            </tr>
          </thead>

          <tbody>
            {sorted.map((stock, index) => {
              const c1h = stock.change_1h;
              const c1d = stock.change_1d;
              const c7d = stock.change_7d;
              const mobileVal = (stock as any)[mobileChangeKey] as number | null | undefined;

              const classFor = (v: number | null | undefined) =>
                v === null || v === undefined
                  ? "text-gray-400"
                  : v >= 0
                  ? "text-green-600"
                  : "text-red-600";

              return (
                <tr key={stock.symbol} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{index + 1}</td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <StockIcon symbol={stock.symbol} size={28} />
                      <div>
                        <div className="font-medium">
                          <Link href={`/stocks/${stock.symbol}`} className="hover:underline">
                            {stock.symbol}
                          </Link>
                        </div>
                        <div className="text-xs text-gray-500">{stock.name}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right">{formatNaira(stock.price || 0)}</td>

                  {/* Desktop % columns */}
                  <td className={`hidden sm:table-cell px-4 py-3 text-right font-medium ${classFor(c1h)}`}>
                    {renderPct(c1h)}
                  </td>

                  <td className={`hidden sm:table-cell px-4 py-3 text-right font-medium ${classFor(c1d)}`}>
                    {renderPct(c1d)}
                  </td>

                  <td className={`hidden sm:table-cell px-4 py-3 text-right font-medium ${classFor(c7d)}`}>
                    {renderPct(c7d)}
                  </td>

                  {/* Mobile single Change column */}
                  <td className={`sm:hidden px-4 py-3 text-right font-medium ${classFor(mobileVal)}`}>
                    {renderPct(mobileVal)}
                  </td>

                  <td className="px-4 py-3 text-right">{(stock.volume || 0).toLocaleString("en-NG")}</td>
                  <td className="px-4 py-3 text-right">{formatNaira(stock.marketCap || 0)}</td>
                  <td className="px-4 py-3">{stock.sector || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
