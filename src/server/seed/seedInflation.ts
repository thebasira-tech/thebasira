import { prisma } from "@/lib/prisma";

// Approximate annual average headline inflation rates (NBS), used to build
// a monthly CPI index for the Purchasing Power tracker.
// ⚠️ SEED DATA: replace with official NBS monthly CPI series once available.
const ANNUAL_AVG_INFLATION: Record<number, number> = {
  2020: 13.2,
  2021: 17.0,
  2022: 18.8,
  2023: 24.5,
  2024: 32.0,
  2025: 28.0,
  2026: 22.0, // partial-year estimate
};

export async function seedInflation() {
  const startYear = 2020;
  const endYear = 2026;
  const endMonth = 6; // through June 2026

  let cpi = 100; // base index = 100 at Jan 2020

  const rows: { year: number; month: number; cpi: number }[] = [];

  for (let year = startYear; year <= endYear; year++) {
    const annualRate = ANNUAL_AVG_INFLATION[year] ?? ANNUAL_AVG_INFLATION[endYear - 1];
    const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
    const lastMonth = year === endYear ? endMonth : 12;

    for (let month = 1; month <= lastMonth; month++) {
      if (year === startYear && month === 1) {
        rows.push({ year, month, cpi });
        continue;
      }
      cpi = cpi * (1 + monthlyRate);
      rows.push({ year, month, cpi });
    }
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const prior = rows[i - 12];
    const yoyRate = prior
      ? ((row.cpi - prior.cpi) / prior.cpi) * 100
      : ANNUAL_AVG_INFLATION[row.year] ?? 0;

    await prisma.inflationRate.upsert({
      where: { year_month: { year: row.year, month: row.month } },
      update: { cpi: row.cpi, yoyRate },
      create: { year: row.year, month: row.month, cpi: row.cpi, yoyRate },
    });
  }

  return { ok: true, rows: rows.length };
}