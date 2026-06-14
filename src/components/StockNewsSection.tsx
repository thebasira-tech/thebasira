import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function StockNewsSection({ symbol }: { symbol: string }) {
  const mentions = await prisma.newsMention.findMany({
    where: { symbol },
    take: 20,
    orderBy: { article: { publishedAt: "desc" } },
    include: {
      article: { include: { source: true } },
    },
  });

  return (
    <section className="mt-8">
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-lg font-display font-semibold text-text-primary">News</h2>
        <div className="text-xs text-text-muted">Latest 20</div>
      </div>

      {mentions.length === 0 ? (
        <div className="text-sm text-text-muted">
          No matched news for {symbol} yet.
        </div>
      ) : (
        <div className="space-y-3">
          {mentions.map(({ article }) => (
            <div
              key={article.id}
              className="rounded-xl border border-border bg-surface p-4 hover:bg-surface-2 transition-colors"
            >
              <div className="text-xs text-text-muted flex items-center gap-2">
                <span className="font-medium text-text-primary">{article.source.name}</span>
                <span>•</span>
                <span>
                  {article.publishedAt
                    ? new Date(article.publishedAt).toLocaleString("en-NG")
                    : "—"}
                </span>
              </div>

              <div className="mt-1 font-medium">
                <Link
                  href={article.url}
                  target="_blank"
                  className="text-text-primary hover:text-accent transition-colors"
                >
                  {article.title}
                </Link>
              </div>

              {article.summary ? (
                <div className="mt-1 text-sm text-text-muted">{article.summary}</div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}