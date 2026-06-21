import { prisma } from "@/lib/prisma";
import PurchasingPowerCalculator from "@/components/tools/PurchasingPowerCalculator";

export const dynamic = "force-dynamic";

export default async function PurchasingPowerPage() {
  const inflation = await prisma.inflationRate.findMany({
    orderBy: [{ year: "asc" }, { month: "asc" }],
    select: { year: true, month: true, cpi: true, yoyRate: true },
  });

  const securities = await prisma.security.findMany({
    orderBy: { symbol: "asc" },
    select: { symbol: true, name: true },
  });

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-display font-bold text-text-primary">
          Naira Purchasing Power Tracker
        </h1>
        <p className="text-text-muted mt-1">
          See how inflation has eroded the value of cash — and how it compares to
          keeping money in a savings account or invested in NGX stocks.
        </p>
      </header>

      <PurchasingPowerCalculator inflation={inflation} securities={securities} />

      <footer className="mt-10 text-xs text-text-muted">
        Inflation figures are illustrative estimates based on NBS headline rates and
        will be refined as official monthly CPI data is integrated. Stock price data
        is simulated for development. Not investment advice.
      </footer>
    </main>
  );
}