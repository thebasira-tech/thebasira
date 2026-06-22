import Link from "next/link";
import EmailSignup from "@/components/EmailSignup";

export default function SiteFooter() {
  return (
    <footer className="border-t border-border mt-16 bg-background">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Email signup — appears on all pages */}
        <div className="mb-8 max-w-xl">
          <EmailSignup />
        </div>

        <div className="text-sm text-text-muted flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} The Basira Ltd. All rights reserved.</div>

          <nav className="flex flex-wrap items-center gap-4">
            <Link href="/contact" className="hover:text-text-primary transition-colors">
              Contact
            </Link>
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
      </div>
    </footer>
  );
}