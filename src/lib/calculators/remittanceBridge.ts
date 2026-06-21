export type FxPoint = { year: number; month: number; rate: number }; // NGN per USD
export type PricePoint = { year: number; month: number; close: number };

export type BridgeSeriesPoint = {
  year: number;
  month: number;
  label: string;
  usdValueInNaira: number; // what your USD is worth in naira if converted THIS month
  nairaCashHeld: number; // naira from converting at start, held as cash (nominal)
  etfValue: number | null; // naira value if converted at start and invested
};

export type BridgeSummary = {
  startLabel: string;
  endLabel: string;
  usdAmount: number;
  fxStart: number;
  fxEnd: number;
  nairaAtStart: number;
  usdValueInNairaToday: number;
  nairaCashHeldToday: number;
  etfValueToday: number | null;
};

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function keyOf(year: number, month: number) {
  return year * 12 + (month - 1);
}

export function computeBridge(params: {
  usdAmount: number;
  startYear: number;
  startMonth: number;
  fx: FxPoint[]; // ordered ascending
  prices?: PricePoint[]; // ordered ascending, monthly close (optional)
}): BridgeSeriesPoint[] {
  const { usdAmount, startYear, startMonth, fx, prices = [] } = params;

  const startKey = keyOf(startYear, startMonth);
  const fxByKey = new Map(fx.map((p) => [keyOf(p.year, p.month), p.rate]));
  const priceByKey = new Map(prices.map((p) => [keyOf(p.year, p.month), p.close]));

  const fxStart = fxByKey.get(startKey);
  const nairaAtStart = fxStart ? usdAmount * fxStart : 0;

  const priceStart = priceByKey.get(startKey);
  const sharesBought =
    priceStart && priceStart > 0 ? nairaAtStart / priceStart : null;

  return fx
    .filter((p) => keyOf(p.year, p.month) >= startKey)
    .map((p) => {
      const k = keyOf(p.year, p.month);

      const usdValueInNaira = usdAmount * p.rate;
      const nairaCashHeld = nairaAtStart; // constant — cash doesn't grow

      let etfValue: number | null = null;
      const price = priceByKey.get(k);
      if (sharesBought != null && price != null) {
        etfValue = sharesBought * price;
      }

      return {
        year: p.year,
        month: p.month,
        label: `${MONTH_LABELS[p.month - 1]} ${p.year}`,
        usdValueInNaira,
        nairaCashHeld,
        etfValue,
      };
    });
}

export function summarizeBridge(series: BridgeSeriesPoint[], usdAmount: number): BridgeSummary | null {
  if (!series.length) return null;

  const first = series[0];
  const last = series[series.length - 1];

  const fxStart = first.usdValueInNaira / usdAmount;
  const fxEnd = last.usdValueInNaira / usdAmount;

  return {
    startLabel: first.label,
    endLabel: last.label,
    usdAmount,
    fxStart,
    fxEnd,
    nairaAtStart: first.nairaCashHeld,
    usdValueInNairaToday: last.usdValueInNaira,
    nairaCashHeldToday: last.nairaCashHeld,
    etfValueToday: last.etfValue,
  };
}