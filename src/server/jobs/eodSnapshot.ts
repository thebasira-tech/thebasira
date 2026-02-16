import { prisma } from "@/lib/prisma";
import { ngxFetchJson } from "@/server/ngxClient";
import { AssetType } from "@prisma/client";

type AnyRow = Record<string, any>;

const upper = (x: any) => String(x ?? "").trim().toUpperCase();

const num = (x: any): number | null => {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
};

function pick(row: AnyRow, keys: string[]) {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
}

function parseTradeDate(row: AnyRow): Date {
  // NGX payloads can vary. Try common keys:
  const raw =
    pick(row, ["TradeDate", "tradeDate", "Date", "date", "Trade_Date", "trade_date"]) ?? null;

  if (!raw) return new Date();

  // ISO-ish string
  if (typeof raw === "string") {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) return d;
  }

  // ticks/epoch seconds/ms
  const n = Number(raw);
  if (Number.isFinite(n)) {
    const ms = n < 10_000_000_000 ? n * 1000 : n;
    const d = new Date(ms);
    if (!Number.isNaN(d.getTime())) return d;
  }

  return new Date();
}

function normalizeEodRow(row: AnyRow) {
  const symbol = upper(pick(row, ["Symbol", "symbol", "SYMBOL"]));
  if (!symbol) return null;

  const date = parseTradeDate(row);

  const name = String(pick(row, ["SecurityName", "securityName", "Name", "name"]) ?? symbol);
  const sector = pick(row, ["Sector", "sector"]) ? String(pick(row, ["Sector", "sector"])) : null;
  const csiStatus = pick(row, ["CSI", "csi", "Csi"]) ? String(pick(row, ["CSI", "csi", "Csi"])) : null;

  const open = num(pick(row, ["Open", "open"]));
  const high = num(pick(row, ["High", "high"]));
  const low = num(pick(row, ["Low", "low"]));
  const close = num(pick(row, ["Close", "close"])) ?? num(pick(row, ["Last", "last"]));

  const volume = num(pick(row, ["Volume", "volume"]));
  const value = num(pick(row, ["Value", "value"]));
  const marketCap = num(pick(row, ["MarketCap", "marketCap", "MktCap"]));

  const high52w = num(pick(row, ["High52Weeks", "high52w", "High52W"]));
  const low52w = num(pick(row, ["Low52Weeks", "low52w", "Low52W"]));

  return {
    symbol,
    date,
    name,
    sector,
    csiStatus,
    open,
    high,
    low,
    close,
    volume,
    value,
    marketCap,
    high52w,
    low52w,
  };
}

type IndexRow = Record<string, any>;

function normalizeIndexRow(row: IndexRow) {
  const symbol = upper(pick(row, ["Symbol", "symbol", "IndexSymbol", "indexSymbol"]));
  if (!symbol) return null;

  const date = parseTradeDate(row);

  const name = String(pick(row, ["Name", "name", "IndexName", "indexName"]) ?? symbol);
  const value = num(pick(row, ["Value", "value", "MarketValue", "marketValue", "IndexValue", "indexValue"]));
  const high = num(pick(row, ["High", "high"]));
  const low = num(pick(row, ["Low", "low"]));
  const change = num(pick(row, ["Change", "change"]));
  const changePct = num(pick(row, ["ChangePercent", "changePercent", "ChangePct", "changePct"]));

  return { symbol, date, name, value, high, low, change, changePct };
}

export async function runEodSnapshot() {
  const run = await prisma.ingestionRun.create({
    data: { job: "EOD_SNAPSHOT", status: "STARTED" },
  });

  try {
    // 1) Prices (EOD)
    const [equities, etfs] = await Promise.all([
      ngxFetchJson<AnyRow[]>("/price/pricesEOD.json", { a: "EQUITY" }),
      ngxFetchJson<AnyRow[]>("/price/pricesEOD.json", { a: "ETF" }),
    ]);

    let upsertedSecurities = 0;
    let upsertedDailyPrices = 0;
    let upsertedIndexValues = 0;

    const handlePrices = async (rows: AnyRow[], assetType: AssetType) => {
      for (const row of rows || []) {
        const n = normalizeEodRow(row);
        if (!n) continue;

        await prisma.security.upsert({
          where: { symbol: n.symbol },
          update: {
            name: n.name,
            sector: n.sector,
            assetType,
            csiStatus: n.csiStatus,
          },
          create: {
            symbol: n.symbol,
            name: n.name,
            sector: n.sector,
            assetType,
            csiStatus: n.csiStatus,
          },
        });
        upsertedSecurities++;

        await prisma.dailyPrice.upsert({
          where: { symbol_date: { symbol: n.symbol, date: n.date } },
          update: {
            open: n.open,
            high: n.high,
            low: n.low,
            close: n.close,
            volume: n.volume,
            value: n.value,
            marketCap: n.marketCap,
            high52w: n.high52w,
            low52w: n.low52w,
          },
          create: {
            symbol: n.symbol,
            date: n.date,
            open: n.open,
            high: n.high,
            low: n.low,
            close: n.close,
            volume: n.volume,
            value: n.value,
            marketCap: n.marketCap,
            high52w: n.high52w,
            low52w: n.low52w,
          },
        });
        upsertedDailyPrices++;
      }
    };

    await handlePrices(equities, AssetType.EQUITY);
    await handlePrices(etfs, AssetType.ETF);

    // 2) Indices (EOD / current)
    // NGX doc: /api/index/indexvalues.{ext}?s=NGX30
    // We’ll fetch ASI + NGX30. Add more if you like.
    const indexRows = await ngxFetchJson<IndexRow[]>("/index/indexvalues.json", { s: "ASI,NGX30" });

    for (const row of indexRows || []) {
      const i = normalizeIndexRow(row);
      if (!i) continue;

      await prisma.indexValue.upsert({
        where: { symbol_date: { symbol: i.symbol, date: i.date } },
        update: {
          name: i.name,
          value: i.value,
          high: i.high,
          low: i.low,
          change: i.change,
          changePct: i.changePct,
        },
        create: {
          symbol: i.symbol,
          date: i.date,
          name: i.name,
          value: i.value,
          high: i.high,
          low: i.low,
          change: i.change,
          changePct: i.changePct,
        },
      });

      upsertedIndexValues++;
    }

    await prisma.ingestionRun.update({
      where: { id: run.id },
      data: {
        status: "SUCCESS",
        endedAt: new Date(),
        meta: { upsertedSecurities, upsertedDailyPrices, upsertedIndexValues },
      },
    });

    return { ok: true, upsertedSecurities, upsertedDailyPrices, upsertedIndexValues };
  } catch (e: any) {
    await prisma.ingestionRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        endedAt: new Date(),
        meta: { error: String(e?.message ?? e) },
      },
    });
    throw e;
  }
}
