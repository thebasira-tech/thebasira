// src/components/MarketTicker.tsx
import { prisma } from "@/lib/prisma";

const TICKER_SYMBOLS = [
  "MTNN", "DANGCEM", "GTCO", "ZENITHBANK", "BUACEMENT",
  "ACCESSCORP", "UBA", "SEPLAT", "NB", "TRANSCORP",
];

function pctChange(curr?: number | null, prev?: number | null) {
  if (curr == null || prev == null || prev === 0) return null;
  return ((curr - prev) / prev) * 100;
}

export default async function MarketTicker() {
  const securities = await prisma.security.findMany({
    where: { symbol: { in: TICKER_SYMBOLS } },
    include: { dailyPrices: { orderBy: { date: "desc" }, take: 2 } },
  });

  const items = securities
    .map((s) => {
      const [latest, prev] = s.dailyPrices;
      return {
        symbol: s.symbol,
        price: latest?.close ?? 0,
        change: pctChange(latest?.close, prev?.close),
      };
    })
    .filter((i) => i.price > 0);

  if (!items.length) return null;

  const renderItems = (keyPrefix: string) =>
    items.map((item) => (
      <span
        key={`${keyPrefix}-${item.symbol}`}
        className="inline-flex items-center gap-2 px-6 font-data text-xs whitespace-nowrap"
      >
        <span className="font-semibold text-text-primary">{item.symbol}</span>
        <span className="text-text-muted">
          ₦{item.price.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
        </span>
        {item.change !== null && (
          <span className={item.change >= 0 ? "text-up" : "text-down"}>
            {item.change >= 0 ? "▲" : "▼"} {Math.abs(item.change).toFixed(2)}%
          </span>
        )}
      </span>
    ));

  return (
    <div className="w-full bg-surface border-b border-border overflow-hidden py-1.5">
      <div className="flex ticker-track w-max">
        {renderItems("a")}
        {renderItems("b")}
      </div>
    </div>
  );
}