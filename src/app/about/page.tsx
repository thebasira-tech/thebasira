import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">About Basira</h1>
        <p className="text-gray-600 mt-2">
          Basira is building modern market data and analytics infrastructure for African capital
          markets—starting with Nigeria.
        </p>
      </header>

      <section className="space-y-4 text-gray-700 text-sm leading-relaxed">
        <h2 className="text-base font-semibold text-gray-900">Mission</h2>
        <p>
          Our mission is to make African market information easier to access, understand, and trust.
          We believe transparent, well-presented data helps investors, businesses, and the public
          make better decisions.
        </p>

        <h2 className="text-base font-semibold text-gray-900">What we’re building</h2>
        <p>
          Basira is developing a suite of tools that organize public market information into a
          simple, consistent experience—prices, volumes, indices, and key market metrics—designed
          for clarity and speed.
        </p>

        <h2 className="text-base font-semibold text-gray-900">Basira</h2>
        <p>
          <span className="font-medium">Basira</span> is Basira’s first product: a Nigerian
          stock market dashboard focused on NGX-listed equities and ETFs. It provides market data,
          rankings, and basic analytics in a clean, table-first format.
        </p>

        <div className="rounded-xl border bg-gray-50 p-4">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Important:</span> Basira and Basira provide
            information for general and educational purposes only and do not provide investment
            advice. Please review our{" "}
            <Link href="/disclaimer" className="underline">
              Disclaimer
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="underline">
              Terms of Use
            </Link>
            .
          </p>
        </div>

        <h2 className="text-base font-semibold text-gray-900">What’s next</h2>
        <p>
          We plan to expand coverage and capabilities over time, including improved data depth,
          additional market metrics, and broader African exchange support under the Basira brand.
        </p>

        <h2 className="text-base font-semibold text-gray-900">Values</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border rounded-xl p-4 bg-white">
            <div className="font-semibold text-gray-900">Accuracy</div>
            <p className="mt-1 text-sm text-gray-700">
            We prioritise correct, well-sourced market information and clear timestamps.
            </p>
        </div>

        <div className="border rounded-xl p-4 bg-white">
            <div className="font-semibold text-gray-900">Clarity</div>
            <p className="mt-1 text-sm text-gray-700">
            We keep interfaces simple so market data is easy to understand.
            </p>
        </div>

        <div className="border rounded-xl p-4 bg-white">
            <div className="font-semibold text-gray-900">Access</div>
            <p className="mt-1 text-sm text-gray-700">
            We aim to make African market information easier to discover and use.
            </p>
        </div>
        </div>

        <h2 className="text-base font-semibold text-gray-900">FAQ</h2>
        <div className="space-y-3">
        <div className="border rounded-xl p-4 bg-white">
            <div className="font-medium text-gray-900">Is this real-time data?</div>
            <p className="mt-1 text-sm text-gray-700">
            Not yet. Basira currently focuses on end-of-day (EOD) or delayed market data.
            Real-time data may be added later subject to data licensing.
            </p>
        </div>

        <div className="border rounded-xl p-4 bg-white">
            <div className="font-medium text-gray-900">Can I trade directly on Basira?</div>
            <p className="mt-1 text-sm text-gray-700">
            No. Basira is an information and analytics platform and does not execute trades.
            To trade, you’ll need a licensed broker.
            </p>
        </div>

        <div className="border rounded-xl p-4 bg-white">
            <div className="font-medium text-gray-900">Where does the data come from?</div>
            <p className="mt-1 text-sm text-gray-700">
            Market data may be sourced from licensed data providers and/or public market data sources.
            Where required, we attribute data sources on the platform.
            </p>
        </div>
        </div>

        <h2 className="text-base font-semibold text-gray-900">Contact</h2>
        <p>
          For partnerships, data licensing, or feedback, contact{" "}
          <span className="font-medium">hello@thebasira.com</span>.
        </p>
      </section>
    </main>
  );
}
