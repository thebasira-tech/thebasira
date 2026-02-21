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

// Avoid false positives like "ACCESS", "UNITY", "TOTAL"
const blockedTickerWords = new Set([
  "access", "unity", "total", "guinness", "invest", "bank", "group", "holdings",
]);

function makeMatchers(symbol: string, name: string, aliases: string[] = []) {
    const sym = normalize(symbol);
    const nm = normalize(name);
  
    const matchers: string[] = [];
  
    // Keep ticker matching, but avoid common false positives
    const blocked = new Set(["access", "total", "unity", "union", "cornerstone"]);
    if (sym && sym.length >= 3 && !blocked.has(sym)) matchers.push(sym);
  
    // Company name (normalized)
    if (nm && nm.length >= 6) matchers.push(nm);
  
    // Add aliases (normalized)
    for (const al of aliases) {
      const a = normalize(al);
      if (a.length >= 4) matchers.push(a);
    }
  
    // De-duplicate
    return Array.from(new Set(matchers));
  }  

function articleMatches(text: string, matchers: string[]) {
  const t = normalize(text);
  return matchers.some((m) => m.length >= 3 && t.includes(m));
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
        const summary = String(item.contentSnippet ?? item.content ?? "").slice(0, 700);
        const publishedAt = item.isoDate ? new Date(item.isoDate) : null;
  
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
  
        const haystack = `${title} ${summary}`;
  
        for (const m of matchIndex) {
          if (!m.matchers.length) continue;
          if (!articleMatches(haystack, m.matchers)) continue;
  
          await prisma.newsMention.upsert({
            where: { articleId_symbol: { articleId: article.id, symbol: m.symbol } },
            update: {},
            create: { articleId: article.id, symbol: m.symbol },
          });
          mentionsUpserted++;
        }
      }
    } catch (err) {
      console.error("❌ Feed failed:", source.name, source.feedUrl);
      console.error(err);
    }
  }  

  return { ok: true, articlesUpserted, mentionsUpserted };
}
