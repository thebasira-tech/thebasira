import { prisma } from "@/lib/prisma";

export async function seedNewsSources() {
  const sources = [
    // High-signal Nigerian markets/business feeds
    {
      name: "Nairametrics (Markets)",
      feedUrl: "https://nairametrics.com/category/markets/feed/",
      homepage: "https://nairametrics.com/category/markets/",
      country: "NG",
    },
    {
      name: "Nairametrics (Companies)",
      feedUrl: "https://nairametrics.com/category/exclusives/companies/feed/",
      homepage: "https://nairametrics.com/category/exclusives/companies/",
      country: "NG",
    },
    {
      name: "BusinessDay",
      feedUrl: "https://businessday.ng/feed/",
      homepage: "https://businessday.ng",
      country: "NG",
    },
    {
      name: "Punch (Business)",
      feedUrl: "https://punchng.com/topics/business/feed/",
      homepage: "https://punchng.com/topics/business/",
      country: "NG",
    },
    {
      name: "Vanguard (Business)",
      feedUrl: "https://www.vanguardngr.com/category/business/feed/",
      homepage: "https://www.vanguardngr.com/category/business/",
      country: "NG",
    },
    {
      name: "The Guardian NG (Business)",
      feedUrl: "https://guardian.ng/category/business-services/feed/",
      homepage: "https://guardian.ng/category/business-services/",
      country: "NG",
    },
    {
      name: "Premium Times",
      feedUrl: "https://www.premiumtimesng.com/feed",
      homepage: "https://www.premiumtimesng.com",
      country: "NG",
    },
    {
      name: "Channels TV",
      feedUrl: "https://www.channelstv.com/feed/",
      homepage: "https://www.channelstv.com",
      country: "NG",
    },
    // New: company-result-heavy and markets-focused additions
    {
      name: "Proshare",
      feedUrl: "https://www.proshareng.com/feed",
      homepage: "https://www.proshareng.com",
      country: "NG",
    },
    {
      name: "Investors King",
      feedUrl: "https://investorsking.com/feed",
      homepage: "https://investorsking.com",
      country: "NG",
    },
    {
      name: "Business Post Nigeria",
      feedUrl: "https://businesspost.ng/feed",
      homepage: "https://businesspost.ng",
      country: "NG",
    },
  ];

  for (const s of sources) {
    await prisma.newsSource.upsert({
      where: { feedUrl: s.feedUrl },
      update: { name: s.name, homepage: s.homepage, country: s.country },
      create: s,
    });
  }

  return { ok: true, count: sources.length };
}