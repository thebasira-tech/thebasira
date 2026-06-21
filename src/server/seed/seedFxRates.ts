import { prisma } from "@/lib/prisma";

// Approximate USD/NGN anchor points (NGN per 1 USD), linearly interpolated
// to monthly granularity for the Diaspora Bridge tool.
// ⚠️ SEED DATA: replace with a real FX API (e.g. CBN or a market data
// provider) once available.
const USDNGN_ANCHORS: { year: number; month: number; rate: number }[] = [
  { year: 2020, month: 1, rate: 306 },
  { year: 2020, month: 7, rate: 360 },
  { year: 2021, month: 1, rate: 380 },
  { year: 2021, month: 7, rate: 410 },
  { year: 2022, month: 1, rate: 415 },
  { year: 2022, month: 7, rate: 425 },
  { year: 2023, month: 1, rate: 460 },
  { year: 2023, month: 6, rate: 770 }, // naira float, June 2023
  { year: 2024, month: 1, rate: 900 },
  { year: 2024, month: 7, rate: 1500 },
  { year: 2025, month: 1, rate: 1550 },
  { year: 2025, month: 7, rate: 1530 },
  { year: 2026, month: 1, rate: 1500 },
  { year: 2026, month: 6, rate: 1480 },
];

function keyOf(year: number, month: number) {
  return year * 12 + (month - 1);
}

export async function seedFxRates() {
  const points = USDNGN_ANCHORS.map((a) => ({ key: keyOf(a.year, a.month), rate: a.rate }));
  const startKey = points[0].key;
  const endKey = points[points.length - 1].key;

  let written = 0;

  for (let k = startKey; k <= endKey; k++) {
    // find surrounding anchor points for linear interpolation
    let lower = points[0];
    let upper = points[points.length - 1];

    for (let i = 0; i < points.length - 1; i++) {
      if (points[i].key <= k && points[i + 1].key >= k) {
        lower = points[i];
        upper = points[i + 1];
        break;
      }
    }

    const span = upper.key - lower.key;
    const rate =
      span === 0
        ? lower.rate
        : lower.rate + ((upper.rate - lower.rate) * (k - lower.key)) / span;

    const year = Math.floor(k / 12);
    const month = (k % 12) + 1;
    const date = new Date(Date.UTC(year, month - 1, 1));

    await prisma.fxRate.upsert({
      where: { date_pair: { date, pair: "USDNGN" } },
      update: { rate },
      create: { date, pair: "USDNGN", rate },
    });
    written++;
  }

  return { ok: true, written };
}