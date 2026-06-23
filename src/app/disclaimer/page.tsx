export const metadata = {
  title: "Disclaimer — Basira",
  description: "Important information about the data and content provided by Basira.",
};

const LAST_UPDATED = "June 2026";

export default function DisclaimerPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-text-primary">Disclaimer</h1>
        <p className="text-text-muted mt-2 text-sm">Last updated: {LAST_UPDATED}</p>
      </header>

      <div className="space-y-6 text-text-muted leading-relaxed">
        <p>
          Basira ("Basira", "we", "us") is an independent financial information and market data
          platform focused on Nigerian capital markets.
        </p>

        <p>
          All information provided on this website is for general informational and educational
          purposes only and does not constitute investment advice, financial advice, trading
          advice, or any recommendation to buy, sell, or hold any securities.
        </p>

        <p>
          Basira does not provide personalised investment advice and does not operate as a
          broker, dealer, portfolio manager, or investment adviser.
        </p>

        <p>
          Market data displayed on this platform may be delayed, end-of-day, simulated,
          incomplete, or subject to errors, and may differ from official figures published by
          the Nigerian Exchange (NGX) or other sources. During development and early stages, some
          data shown is simulated and does not represent actual market activity. Users should not
          rely on this information for making investment decisions.
        </p>

        <p>
          Some content on this platform, including automated "explanation" features, is generated
          by artificial intelligence from available data and news context. Such content may be
          incomplete, inaccurate, or include inference, and must not be relied upon as a statement
          of fact or as a recommendation.
        </p>

        <p>
          The platform may display third-party content, including news articles and underlying
          market data owned by the NGX and other providers. We do not control and are not
          responsible for third-party content, and its inclusion does not imply endorsement.
          Community features such as Market Pulse reflect aggregated user sentiment only and are
          not a signal, forecast, or recommendation.
        </p>

        <p>
          By using this website, you acknowledge that you do so at your own risk. To the fullest
          extent permitted by law, Basira disclaims all liability for any loss or damage arising
          from reliance on information provided on this platform. You should seek advice from a
          qualified, licensed professional and conduct your own research before making any
          financial decision.
        </p>

        <p className="pt-4 border-t border-border text-xs">
          This page is provided for general information and is not legal advice. We recommend
          having it reviewed by a qualified legal professional, particularly before any commercial
          launch and once formal data agreements with providers such as the NGX are in place.
        </p>
      </div>
    </main>
  );
}