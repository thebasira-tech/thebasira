export type DailyBar = {
  time: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// Deterministic pseudo-random from symbol
function seededRand(seed: number) {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromSymbol(symbol: string) {
  let s = 0;
  for (let i = 0; i < symbol.length; i++) s = (s * 31 + symbol.charCodeAt(i)) >>> 0;
  return s;
}

function formatDate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function generateDailyOHLC({
  symbol,
  startPrice,
  days = 365,
}: {
  symbol: string;
  startPrice: number;
  days?: number;
}): DailyBar[] {
  const rand = seededRand(seedFromSymbol(symbol));
  const out: DailyBar[] = [];

  // generate backwards from today (EOD series)
  const today = new Date();
  let close = Math.max(1, startPrice);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    // daily drift + volatility (simulated)
    const drift = (rand() - 0.5) * 0.015; // +/-0.75%
    const vol = rand() * 0.02; // up to 2%

    const open = close;
    const change = drift + (rand() - 0.5) * vol;
    const newClose = clamp(open * (1 + change), 0.5, open * 3);

    const high = Math.max(open, newClose) * (1 + rand() * 0.01);
    const low = Math.min(open, newClose) * (1 - rand() * 0.01);

    const volume = Math.floor(100000 + rand() * 5000000);

    close = newClose;

    out.push({
      time: formatDate(d),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(newClose.toFixed(2)),
      volume,
    });
  }

  return out;
}
