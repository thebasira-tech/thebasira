import { prisma } from "@/lib/prisma";
import MarketPulseWidget from "@/components/MarketPulseWidget";

export const dynamic = "force-dynamic";

export default async function MarketPulsePage() {
  const sectorsRaw = await prisma.security.findMany({
    where: { sector: { not: null } },
    select: { sector: true },
    distinct: ["sector"],
    orderBy: { sector: "asc" },
  });

  const sectors = sectorsRaw
    .map((s) => s.sector)
    .filter((s): s is string => !!s && s !== "N/A");

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-display font-bold text-text-primary">Market Pulse</h1>
        <p className="text-text-muted mt-1">
          A daily community read on NGX sentiment — overall and by sector.
        </p>
      </header>

      <MarketPulseWidget sectors={sectors} />

      <footer className="mt-10 text-xs text-text-muted">
        Market Pulse reflects community sentiment only and is not investment advice or
        a trading signal.
      </footer>
    </main>
  );
}