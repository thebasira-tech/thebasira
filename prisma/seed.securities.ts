import { prisma } from "@/lib/prisma";
import { AssetType } from "@prisma/client";

async function main() {
  const seeds = [
    { symbol: "MTNN", name: "MTN Nigeria Communications Plc", assetType: AssetType.EQUITY, sector: "Telecoms" },
    { symbol: "GTCO", name: "Guaranty Trust Holding Company Plc", assetType: AssetType.EQUITY, sector: "Banking" },
    { symbol: "BUACEMENT", name: "BUA Cement Plc", assetType: AssetType.EQUITY, sector: "Industrial Goods" },
  ];

  for (const s of seeds) {
    await prisma.security.upsert({
      where: { symbol: s.symbol },
      update: { name: s.name, assetType: s.assetType, sector: s.sector },
      create: s,
    });
  }

  console.log("Seeded securities:", seeds.length);
}

main().finally(() => prisma.$disconnect());
