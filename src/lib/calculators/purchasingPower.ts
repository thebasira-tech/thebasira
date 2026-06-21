export type InflationPoint = { year: number; month: number; cpi: number };
export type PricePoint = { year: number; month: number; close: number };

export type PurchasingPowerSeriesPoint = {
  year: number;
  month: number;
  label: string;
  nominal: number;
  requiredToday: number;
  savings: number;
  investment: number | null;
};

export type PurchasingPowerSummary = {
  startLabel: string;
  endLabel: string;
  nominalAmount: number;
  requiredTodayAmount: number;
  purchasingPowerRetained: number;
  erosionPct: number;
  savingsAmount: number;
  investmentAmount: number | null;
};

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function keyOf(year: number, month: number) {
  return year * 12 + (month - 1);
}

export function computePurchasingPower(params: {
  amountNaira: number;
  startYear: number;
  startMonth: number;
  inflation: InflationPoint[]; // ordered ascending
  prices?: PricePoint[]; // ordered ascending, monthly close (optional)
  savingsAnnualRatePct?: number; // default 5
}): PurchasingPowerSeriesPoint[] {
  const {
    amountNaira,
    startYear,
    startMonth,
    inflation,
    prices = [],
    savingsAnnualRatePct = 5,
  } = params;

  const startKey = keyOf(startYear, startMonth);
  const inflationByKey = new Map(inflation.map((p) => [keyOf(p.year, p.month), p.cpi]));
  const priceByKey = new Map(prices.map((p) => [keyOf(p.year, p.month), p.close]));

  const cpiStart = inflationByKey.get(startKey);
  const priceStart = priceByKey.get(startKey);
  const sharesBought = priceStart && priceStart > 0 ? amountNaira / priceStart : null;

  const monthlySavingsRate = Math.pow(1 + savingsAnnualRatePct / 100, 1 / 12) - 1;

  return inflation
    .filter((p) => keyOf(p.year, p.month) >= startKey)
    .map((p) => {
      const k = keyOf(p.year, p.month);
      const monthsElapsed = k - startKey;

      const requiredToday = cpiStart ? amountNaira * (p.cpi / cpiStart) : amountNaira;
      const savings = amountNaira * Math.pow(1 + monthlySavingsRate, monthsElapsed);

      let investment: number | null = null;
      const price = priceByKey.get(k);
      if (sharesBought != null && price != null) {
        investment = sharesBought * price;
      }

      return {
        year: p.year,
        month: p.month,
        label: `${MONTH_LABELS[p.month - 1]} ${p.year}`,
        nominal: amountNaira,
        requiredToday,
        savings,
        investment,
      };
    });
}

export function summarizePurchasingPower(
  series: PurchasingPowerSeriesPoint[]
): PurchasingPowerSummary | null {
  if (!series.length) return null;

  const first = series[0];
  const last = series[series.length - 1];

  const ratio = first.nominal > 0 ? last.requiredToday / first.nominal : 1;
  const purchasingPowerRetained = first.nominal / ratio;
  const erosionPct = (1 - 1 / ratio) * 100;

  return {
    startLabel: first.label,
    endLabel: last.label,
    nominalAmount: first.nominal,
    requiredTodayAmount: last.requiredToday,
    purchasingPowerRetained,
    erosionPct,
    savingsAmount: last.savings,
    investmentAmount: last.investment,
  };
}