import { prisma } from "@/lib/prisma";
import { AssetType } from "@prisma/client";
import fs from "fs";
import path from "path";

function parseCsvLine(line: string) {
  // naive CSV split (works if fields don't have commas inside quotes)
  return line.split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
}

export async function seedFromTradingViewCsv() {
  const csvPath = path.join(process.cwd(), "data", "tradingview_ngx.csv");
  const raw = fs.readFileSync(csvPath, "utf8");
  const lines = raw.split("\n").filter(Boolean);

  const header = parseCsvLine(lines[0]);
  const symIdx = header.findIndex((h) => /symbol|ticker/i.test(h));
  const nameIdx = header.findIndex((h) => /name|description|company/i.test(h));

  if (symIdx === -1) throw new Error("Could not find Symbol/Ticker column in CSV.");

  let upserts = 0;

  for (const line of lines.slice(1)) {
    const cols = parseCsvLine(line);
    const symbol = cols[symIdx]?.toUpperCase();
    if (!symbol) continue;

    const name = (nameIdx >= 0 ? cols[nameIdx] : `${symbol} Plc`) || `${symbol} Plc`;

    await prisma.security.upsert({
      where: { symbol },
      update: { name },
      create: { symbol, name, assetType: AssetType.EQUITY },
    });

    upserts++;
  }

  return { ok: true, upserts };
}
