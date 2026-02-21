import { prisma } from "@/lib/prisma";

const ALIASES: Record<string, string[]> = {
  MTNN: ["MTN", "MTN Nigeria", "MTN Group", "MTN Nigeria Communications"],
  DANGCEM: ["Dangote Cement", "Dangcem", "Dangote"],
  GTCO: ["GTBank", "Guaranty Trust", "Guaranty Trust Bank", "GTB"],
  ZENITHBANK: ["Zenith", "Zenith Bank", "Zenith Plc"],
  ACCESSCORP: ["Access Bank", "Access Holdings", "Access Corp"],
  UBA: ["UBA", "UBA Bank", "United Bank for Africa"],
  FBNH: ["First Bank", "FBN", "FBN Holdings", "First Bank of Nigeria"],
  SEPLAT: ["Seplat", "Seplat Energy", "Seplat Petroleum"],
  NB: ["Nigerian Breweries", "NB Plc", "Nigerian Breweries Plc"],
  TRANSCORP: ["Transcorp", "Transnational Corporation", "Transcorp Plc"],
  UCAP: ["United Capital", "UCAP Plc", "United Capital Plc"],

  // ADD more top names (examples)
  WAPCO: ["Lafarge", "Lafarge Africa", "WAPCO"],
  BUACEMENT: ["BUA Cement", "BUA"],
  DANGSUGAR: ["Dangote Sugar", "DSR", "Dangote Sugar Refinery"],
  OANDO: ["Oando Plc", "Oando"],
  TOTAL: ["TotalEnergies", "Total Nigeria", "TotalEnergies Nigeria"],
  ZENITHBANK: ["Zenith", "Zenith Bank", "Zenith Plc"],
};

export async function seedAliases() {
  let inserted = 0;

  for (const [symbol, list] of Object.entries(ALIASES)) {
    for (const alias of list) {
      // ✅ Use the compound unique key (symbol+alias)
      await prisma.securityAlias.upsert({
        where: { symbol_alias: { symbol, alias } },
        update: {},
        create: { symbol, alias },
      });

      inserted++;
    }
  }

  console.log("✅ Aliases seeded:", inserted);
  return { ok: true, inserted };
}
