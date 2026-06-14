import Parser from "rss-parser";
import { prisma } from "@/lib/prisma";

const parser = new Parser({ timeout: 20000 });

async function fetchFeedWithRetry(
  parser: any,
  sourceName: string,
  feedUrl: string,
  attempts = 3
) {
  let lastErr: any;

  for (let i = 1; i <= attempts; i++) {
    try {
      console.log(`🔎 Fetching feed (${i}/${attempts}):`, sourceName, feedUrl);

      // ✅ First try parseURL (often more forgiving)
      try {
        const feed = await parser.parseURL(feedUrl);
        console.log("📰 Items found:", sourceName, feed.items?.length ?? 0);
        return feed;
      } catch (e) {
        // If parseURL failed, we fallback to manual fetch below
        console.warn("⚠️ parseURL failed, falling back to fetch+parseString:", sourceName, String(e));
      }

      // ✅ Fallback: fetch with UA (helps for 403-type blocks)
      const res = await fetch(feedUrl, {
        headers: {
          "User-Agent": "BasiraBot/1.0 (+https://thebasira.com)",
          "Accept": "application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.5",
        },
      });

      if (!res.ok) throw new Error(`Status code ${res.status}`);

      const xml = await res.text();

      // Optional: very light cleanup for malformed XML entities
      const cleaned = xml.replace(/&(?!(amp|lt|gt|quot|apos);)/g, "&amp;");

      const feed = await parser.parseString(cleaned);
      console.log("📰 Items found:", sourceName, feed.items?.length ?? 0);
      return feed;
    } catch (err) {
      lastErr = err;
      console.error(`❌ Feed failed attempt ${i}:`, sourceName, feedUrl, err);
      await new Promise((r) => setTimeout(r, 800 * i));
    }
  }

  throw lastErr;
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Corporate suffixes stripped from company names so "Zenith Bank Plc"
// becomes a matcher for "Zenith Bank" (which is what headlines actually say).
const CORP_SUFFIXES =
  /\b(plc|group|holdings|holding|nigeria|limited|ltd|industries|industry|company|incorporated|inc|international|corporation|corp)\b/g;

function stripSuffixes(name: string) {
  return normalize(name).replace(CORP_SUFFIXES, "").replace(/\s+/g, " ").trim();
}

// Tickers/short tokens that are real English words and cause false-positive
// matches inside unrelated headlines (e.g. "UBA" inside "Cuba", "NB" inside
// "Nb." abbreviations, "TOTAL" inside "total revenue").
const blockedTickerWords = new Set([
  "access",
  "unity",
  "total",
  "guinness",
  "invest",
  "bank",
  "group",
  "holdings",
  "union",
  "cornerstone",
  "nb",
  "uba",
  "gt",
  "may",
  "law",
  "fbnh",
]);

// Market-relevance keywords used to gate articles that don't match any
// security directly — keeps the NewsArticle table focused on NGX content
// rather than every story from broad feeds.
const MARKET_KEYWORDS = [
  "ngx",
  "nigerian exchange",
  "stock exchange",
  "share price",
  "shares",
  "dividend",
  "market cap",
  "equities",
  "equity market",
  "all share index",
  "asi",
  "ngx 30",
  "investors",
  "earnings",
  "profit after tax",
  "agm",
  "annual general meeting",
  "bonus shares",
  "rights issue",
  "listed company",
  "listed companies",
];

function isMarketRelevant(text: string) {
  const t = normalize(text);
  return MARKET_KEYWORDS.some((kw) => t.includes(normalize(kw)));
}

function makeMatchers(symbol: string, name: string, aliases: string[] = []): RegExp[] {
  const sym = normalize(symbol);
  const matchers: string[] = [];

  // Ticker symbol — only if it's long enough and not a common word.
  if (sym && sym.length >= 3 && !blockedTickerWords.has(sym)) {
    matchers.push(sym);
  }

  // Company name with corporate suffixes stripped, e.g. "zenith bank".
  const stripped = stripSuffixes(name);
  if (stripped && stripped.length >= 4 && !blockedTickerWords.has(stripped)) {
    matchers.push(stripped);
  }

  // Aliases (normalized, suffixes stripped too in case an alias includes "Plc").
  for (const al of aliases) {
    const a = stripSuffixes(al);
    if (a.length >= 3 && !blockedTickerWords.has(a)) matchers.push(a);
  }

  // De-duplicate, then build word-boundary regexes.
  return Array.from(new Set(matchers)).map(
    (m) => new RegExp(`\\b${escapeRegex(m)}\\b`)
  );
}

function articleMatches(text: string, matchers: RegExp[]) {
  const t = normalize(text);
  return matchers.some((re) => re.test(t));
}

// Trim a summary to the last complete sentence within maxLen, instead of a
// hard mid-sentence cut — improves quality of context fed to the AI explainer.
function trimSummary(text: string, maxLen = 700) {
  const clean = text.trim();
  if (clean.length <= maxLen) return clean;

  const slice = clean.slice(0, maxLen);
  const lastStop = Math.max(
    slice.lastIndexOf(". "),
    slice.lastIndexOf("! "),
    slice.lastIndexOf("? ")
  );

  if (lastStop > maxLen * 0.5) {
    return slice.slice(0, lastStop + 1).trim();
  }

  return slice.trim() + "…";
}

export async function runNewsIngest() {
  const sources = await prisma.newsSource.findMany();
  const securities = await prisma.security.findMany({
    select: {
      symbol: true,
      name: true,
      aliases: { select: { alias: true } },
    },
  });

  const matchIndex = securities.map((s) => ({
    symbol: s.symbol,
    matchers: makeMatchers(
      s.symbol,
      s.name,
      s.aliases.map((a) => a.alias)
    ),
  }));

  let articlesUpserted = 0;
  let articlesSkippedIrrelevant = 0;
  let mentionsUpserted = 0;

  for (const source of sources) {
    try {
      console.log("🔎 Fetching feed:", source.name, source.feedUrl);

      const feed = await fetchFeedWithRetry(parser, source.name, source.feedUrl, 3);

      console.log("📰 Items found:", source.name, feed.items?.length ?? 0);

      for (const item of (feed.items || []).slice(0, 60)) {
        const url = item.link?.trim();
        if (!url) continue;

        const title = item.title?.trim() ?? "Untitled";
        const rawSummary = String(item.contentSnippet ?? item.content ?? "");
        const summary = trimSummary(rawSummary, 700);
        const publishedAt = item.isoDate ? new Date(item.isoDate) : null;

        const haystack = `${title} ${summary}`;

        // Find which securities this article mentions.
        const matchedSymbols: string[] = [];
        for (const m of matchIndex) {
          if (!m.matchers.length) continue;
          if (articleMatches(haystack, m.matchers)) {
            matchedSymbols.push(m.symbol);
          }
        }

        // Skip articles that neither mention a security nor look
        // market-relevant — keeps NewsArticle focused, especially for
        // broader business feeds.
        if (matchedSymbols.length === 0 && !isMarketRelevant(haystack)) {
          articlesSkippedIrrelevant++;
          continue;
        }

        const article = await prisma.newsArticle.upsert({
          where: { url },
          update: { title, summary, publishedAt },
          create: {
            sourceId: source.id,
            title,
            url,
            summary,
            publishedAt,
          },
        });
        articlesUpserted++;

        for (const symbol of matchedSymbols) {
          await prisma.newsMention.upsert({
            where: { articleId_symbol: { articleId: article.id, symbol } },
            update: {},
            create: { articleId: article.id, symbol },
          });
          mentionsUpserted++;
        }
      }
    } catch (err) {
      console.error("❌ Feed failed:", source.name, source.feedUrl);
      console.error(err);
    }
  }

  return {
    ok: true,
    articlesUpserted,
    articlesSkippedIrrelevant,
    mentionsUpserted,
  };
}