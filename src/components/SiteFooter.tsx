import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t mt-16">
      <div className="max-w-7xl mx-auto px-6 py-6 text-sm text-gray-600 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          © {new Date().getFullYear()} The Basira Ltd. All rights reserved.
        </div>

        <nav className="flex items-center gap-4">
          <Link href="/disclaimer" className="hover:text-gray-900">
            Disclaimer
          </Link>
          <Link href="/terms" className="hover:text-gray-900">
            Terms of Use
          </Link>
          <Link href="/privacy" className="hover:text-gray-900">
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
