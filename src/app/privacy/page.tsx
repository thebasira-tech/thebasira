export const metadata = {
  title: "Privacy Policy — Basira",
  description: "How Basira collects, uses, and protects your information.",
};

const LAST_UPDATED = "June 2026";

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-text-primary">Privacy Policy</h1>
        <p className="text-text-muted mt-2 text-sm">Last updated: {LAST_UPDATED}</p>
      </header>

      <div className="space-y-8 text-text-primary leading-relaxed">
        <section className="space-y-3">
          <p className="text-text-muted">
            This Privacy Policy explains how The Basira Ltd ("Basira", "we", "us")
            collects, uses, and protects information when you use our website and tools.
            Basira provides Nigerian market data and analytics for informational purposes
            only. By using the site, you agree to the practices described here.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-display font-semibold text-text-primary">
            Information we collect
          </h2>
          <p className="text-text-muted">
            We aim to collect as little personal information as possible. Specifically:
          </p>

          <div className="space-y-3 text-text-muted">
            <div>
              <span className="font-medium text-text-primary">Page feedback.</span> When you
              submit feedback, we store your star rating, the reason you provide, any
              improvement suggestions, and which page you were on. This form does not ask for
              your name or email, and we do not attach your identity to it.
            </div>

            <div>
              <span className="font-medium text-text-primary">Email subscription.</span> If you
              join our mailing list, we collect the name and email address you provide, and a
              record of which page you signed up from. We use this to send you market insights
              and product updates.
            </div>

            <div>
              <span className="font-medium text-text-primary">Contact messages.</span> When you
              use our contact form, we collect your name, email address, optional subject, and
              your message, so we can respond to you.
            </div>

            <div>
              <span className="font-medium text-text-primary">Market Pulse votes.</span> When
              you vote in Market Pulse, we store a randomly generated identifier in a cookie on
              your device. This lets us count one vote per person per day without knowing who
              you are — the identifier is not linked to your name or email.
            </div>

            <div>
              <span className="font-medium text-text-primary">Theme preference.</span> Your
              choice of light or dark mode is stored locally in your browser. It never leaves
              your device and is not sent to us.
            </div>

            <div>
              <span className="font-medium text-text-primary">Usage analytics.</span> We use
              privacy-friendly analytics to understand aggregate, anonymous traffic patterns
              (such as which pages are visited). This does not identify you personally.
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-display font-semibold text-text-primary">
            How we use your information
          </h2>
          <p className="text-text-muted">We use the information we collect to:</p>
          <ul className="list-disc pl-5 space-y-1 text-text-muted">
            <li>Operate, maintain, and improve the Basira website and its tools.</li>
            <li>Respond to your enquiries and feedback.</li>
            <li>Send mailing-list subscribers market insights and product updates.</li>
            <li>Understand how the site is used, in aggregate, so we can improve it.</li>
            <li>Protect the integrity of community features such as Market Pulse.</li>
          </ul>
          <p className="text-text-muted">
            We do not sell your personal information, and we do not use it for advertising.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-display font-semibold text-text-primary">
            Service providers
          </h2>
          <p className="text-text-muted">
            We rely on a small number of trusted third parties to run Basira. They process data
            only on our behalf and are bound by their own privacy and security commitments:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-text-muted">
            <li>
              <span className="font-medium text-text-primary">Hosting &amp; analytics:</span>{" "}
              our website and anonymous usage analytics are provided by Vercel.
            </li>
            <li>
              <span className="font-medium text-text-primary">Database:</span> submissions
              (feedback, subscriptions, contact messages) are stored in a managed PostgreSQL
              database provided by Neon.
            </li>
            <li>
              <span className="font-medium text-text-primary">AI features:</span> our
              explanation features use OpenAI to generate text. These requests are based on
              market data and news context, not your personal information.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-display font-semibold text-text-primary">
            Data retention
          </h2>
          <p className="text-text-muted">
            We keep personal information only for as long as it is needed for the purposes
            described above, or as required by law. You can ask us to delete your information at
            any time (see below).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-display font-semibold text-text-primary">Your rights</h2>
          <p className="text-text-muted">
            Depending on where you live, you may have rights over your personal information,
            including the right to access, correct, or delete it, and to unsubscribe from our
            mailing list at any time. Nigerian users have rights under the Nigeria Data
            Protection Act. To exercise any of these rights, contact us using the details below
            and we will respond within a reasonable time.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-display font-semibold text-text-primary">
            Cookies and local storage
          </h2>
          <p className="text-text-muted">
            Basira uses a small number of cookies and local-storage items strictly to make the
            site work — for example, remembering your theme preference and preventing duplicate
            Market Pulse votes. We do not use third-party advertising or cross-site tracking
            cookies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-display font-semibold text-text-primary">
            Children's privacy
          </h2>
          <p className="text-text-muted">
            Basira is not directed at children, and we do not knowingly collect personal
            information from anyone under the age of 18.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-display font-semibold text-text-primary">
            Changes to this policy
          </h2>
          <p className="text-text-muted">
            We may update this Privacy Policy from time to time. When we do, we will revise the
            "last updated" date above. Significant changes may be communicated to mailing-list
            subscribers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-display font-semibold text-text-primary">Contact us</h2>
          <p className="text-text-muted">
            If you have any questions about this Privacy Policy or how your information is
            handled, please reach out through our{" "}
            <a href="/contact" className="text-accent hover:underline">
              contact page
            </a>
            .
          </p>
        </section>

        <section className="pt-4 border-t border-border">
          <p className="text-xs text-text-muted">
            This page is provided for general information and is not legal advice. We recommend
            having it reviewed by a qualified legal professional, particularly before any
            commercial launch or where data protection laws such as the Nigeria Data Protection
            Act or the GDPR apply to your users.
          </p>
        </section>
      </div>
    </main>
  );
}