import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-border mt-16 bg-background">
      <div className="max-w-7xl mx-auto px-6 py-6 text-sm text-text-muted flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          © {new Date().getFullYear()} The Basira Ltd. All rights reserved.
        </div>

        <nav className="flex items-center gap-4">
          <Link href="/disclaimer" className="hover:text-text-primary transition-colors">
            Disclaimer
          </Link>
          <Link href="/terms" className="hover:text-text-primary transition-colors">
            Terms of Use
          </Link>
          <Link href="/privacy" className="hover:text-text-primary transition-colors">
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}