import { prisma } from "@/lib/prisma";
import DiasporaBridgeCalculator from "@/components/tools/DiasporaBridgeCalculator";

export const dynamic = "force-dynamic";

export default async function DiasporaBridgePage() {
  const fxRows = await prisma.fxRate.findMany({
    where: { pair: "USDNGN" },
    orderBy: { date: "asc" },
    select: { date: true, rate: true },
  });

  const fx = fxRows.map((r) => {
    const d = new Date(r.date);
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, rate: r.rate };
  });

  const securities = await prisma.security.findMany({
    orderBy: { symbol: "asc" },
    select: { symbol: true, name: true, assetType: true },
  });

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-display font-bold text-text-primary">
          Diaspora Remittance &amp; Investment Bridge
        </h1>
        <p className="text-text-muted mt-1">
          Compare holding USD, converting to naira cash, or investing in NGX —
          based on historical exchange rates and price history.
        </p>
      </header>

      <DiasporaBridgeCalculator fx={fx} securities={securities} />

      <footer className="mt-10 text-xs text-text-muted">
        Exchange rate figures are illustrative estimates and will be refined with a
        live FX feed. Stock price data is simulated for development. Not investment
        or remittance advice.
      </footer>
    </main>
  );
}