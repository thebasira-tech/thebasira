import { prisma } from "@/lib/prisma";
import { AssetType } from "@prisma/client";

const CORE_SECURITIES = [
  { symbol: "MTNN", name: "MTN Nigeria Communications Plc", assetType: AssetType.EQUITY},
  { symbol: "DANGCEM", name: "Dangote Cement Plc" , assetType: AssetType.EQUITY},
  { symbol: "BUACEMENT", name: "BUA Cement Plc" , assetType: AssetType.EQUITY},
  { symbol: "GTCO", name: "Guaranty Trust Holding Company Plc" , assetType: AssetType.EQUITY},
  { symbol: "ZENITHBANK", name: "Zenith Bank Plc" , assetType: AssetType.EQUITY},
  { symbol: "ACCESSCORP", name: "Access Holdings Plc" , assetType: AssetType.EQUITY},
  { symbol: "UBA", name: "United Bank for Africa Plc" , assetType: AssetType.EQUITY},
  { symbol: "FBNH", name: "FBN Holdings Plc" , assetType: AssetType.EQUITY},
  { symbol: "WAPCO", name: "Lafarge Africa Plc" , assetType: AssetType.EQUITY},
  { symbol: "NB", name: "Nigerian Breweries Plc" , assetType: AssetType.EQUITY},
  { symbol: "SEPLAT", name: "Seplat Energy Plc" , assetType: AssetType.EQUITY},
  { symbol: "TOTAL", name: "TotalEnergies Marketing Nigeria Plc" , assetType: AssetType.EQUITY},
  { symbol: "OANDO", name: "Oando Plc" , assetType: AssetType.EQUITY},
  { symbol: "FIDELITYBK", name: "Fidelity Bank Plc" , assetType: AssetType.EQUITY},
  { symbol: "FCMB", name: "FCMB Group Plc" , assetType: AssetType.EQUITY},
  { symbol: "STERLINGNG", name: "Sterling Financial Holdings Plc" , assetType: AssetType.EQUITY},
  { symbol: "UCAP", name: "United Capital Plc" , assetType: AssetType.EQUITY},
  { symbol: "TRANSCORP", name: "Transnational Corporation Plc" , assetType: AssetType.EQUITY},
  { symbol: "AIICO", name: "AIICO Insurance Plc" , assetType: AssetType.EQUITY},
  { symbol: "MANSARD", name: "AXA Mansard Insurance Plc" , assetType: AssetType.EQUITY},
  { symbol: "PRESCO", name: "Presco Plc" , assetType: AssetType.EQUITY},
  { symbol: "OKOMUOIL", name: "Okomu Oil Palm Plc" , assetType: AssetType.EQUITY},
  { symbol: "DANGSUGAR", name: "Dangote Sugar Refinery Plc" , assetType: AssetType.EQUITY},
  { symbol: "NASCON", name: "NASCON Allied Industries Plc" , assetType: AssetType.EQUITY},
  { symbol: "FLOURMILL", name: "Flour Mills of Nigeria Plc" , assetType: AssetType.EQUITY},
  { symbol: "CADBURY", name: "Cadbury Nigeria Plc" , assetType: AssetType.EQUITY},
  { symbol: "INTBREW", name: "International Breweries Plc" , assetType: AssetType.EQUITY},
  { symbol: "GUINNESS", name: "Guinness Nigeria Plc" , assetType: AssetType.EQUITY},
  { symbol: "HONYFLOUR", name: "Honeywell Flour Mills Plc" , assetType: AssetType.EQUITY}
];

function generateMock(symbol: string) {
    return {
      symbol,
      name: `${symbol} Plc`,
      assetType: AssetType.EQUITY,
    };
  }  

export async function seedSecurities() {
  const bulk = [...CORE_SECURITIES];

  // generate up to 200
  for (let i = bulk.length; i < 200; i++) {
    bulk.push(generateMock(`NGX${i}`));
  }

  for (const sec of bulk) {
    await prisma.security.upsert({
      where: { symbol: sec.symbol },
      update: {},
      create: sec
    });
  }

  console.log("✅ Seeded securities:", bulk.length);
}
