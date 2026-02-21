import { prisma } from "@/lib/prisma";

export async function seedNewsSources() {
  const sources = [
    { name: "Nairametrics", feedUrl: "https://nairametrics.com/feed", homepage: "https://nairametrics.com", country: "NG" },
    { name: "Premium Times", feedUrl: "https://www.premiumtimesng.com/feed", homepage: "https://www.premiumtimesng.com", country: "NG" },
    { name: "AllAfrica (Business)", feedUrl: "https://allafrica.com/tools/headlines/rdf/business/headlines.rdf", homepage: "https://allafrica.com/business/", country: "AF" },
    { name: "Channels TV", feedUrl: "https://www.channelstv.com/feed/", homepage: "https://www.channelstv.com", country: "NG"},      
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
