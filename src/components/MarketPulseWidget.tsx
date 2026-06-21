"use client";

import React from "react";

type PulseData = {
  bullish: number;
  bearish: number;
  total: number;
  bullishPct: number;
  userVote: "BULLISH" | "BEARISH" | null;
};

export default function MarketPulseWidget({ sectors }: { sectors: string[] }) {
  const [sector, setSector] = React.useState<string>("ALL");
  const [data, setData] = React.useState<PulseData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [voting, setVoting] = React.useState(false);

  const load = React.useCallback(async (sec: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pulse/today?sector=${encodeURIComponent(sec)}`, {
        cache: "no-store",
      });
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load(sector);
  }, [sector, load]);

  async function vote(sentiment: "BULLISH" | "BEARISH") {
    if (voting) return;
    setVoting(true);
    try {
      await fetch("/api/pulse/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentiment, sector }),
      });
      await load(sector);
    } finally {
      setVoting(false);
    }
  }

  const bullishPct = data?.bullishPct ?? 50;
  const bearishPct = 100 - bullishPct;

  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Market Pulse</h3>
          <p className="text-xs text-text-muted">
            {sector === "ALL" ? "Overall NGX sentiment" : `${sector} sector sentiment`} — today
          </p>
        </div>

        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="px-2 py-1 bg-surface-2 border border-border rounded-md text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="ALL">Overall (NGX)</option>
          {sectors.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Gauge */}
      <div className="mb-3">
        <div className="flex justify-between text-xs font-data mb-1">
          <span className="text-up">Bullish {bullishPct.toFixed(0)}%</span>
          <span className="text-down">Bearish {bearishPct.toFixed(0)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-surface-2 overflow-hidden flex">
          <div className="h-full bg-up transition-all" style={{ width: `${bullishPct}%` }} />
          <div className="h-full bg-down transition-all" style={{ width: `${bearishPct}%` }} />
        </div>
        <div className="mt-1 text-xs text-text-muted">
          {data?.total ?? 0} vote{(data?.total ?? 0) === 1 ? "" : "s"} today
        </div>
      </div>

      {/* Vote buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => vote("BULLISH")}
          disabled={voting || loading}
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            data?.userVote === "BULLISH"
              ? "bg-up/10 border-up text-up"
              : "border-border text-text-primary hover:bg-surface-2"
          }`}
        >
          ▲ Bullish
        </button>
        <button
          onClick={() => vote("BEARISH")}
          disabled={voting || loading}
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            data?.userVote === "BEARISH"
              ? "bg-down/10 border-down text-down"
              : "border-border text-text-primary hover:bg-surface-2"
          }`}
        >
          ▼ Bearish
        </button>
      </div>

      <p className="mt-3 text-xs text-text-muted">
        One vote per day, per category. You can change your vote anytime today.
      </p>
    </section>
  );
}