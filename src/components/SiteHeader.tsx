"use client";

import Link from "next/link";
import NaijaStocksLogo from "@/components/NaijaStocksLogo";

export default function SiteHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <NaijaStocksLogo size={30} />
            <div className="leading-tight">
              <div className="text-xl font-display font-bold tracking-tight text-text-primary">Basira</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="text-text-primary hover:text-accent transition-colors">
            Stocks
          </Link>
          <Link href="/etfs" className="text-text-primary hover:text-accent transition-colors">
            ETFs
          </Link>
          <span className="text-border">•</span>
          <span className="text-text-muted">Sectors (soon)</span>
          <span className="text-border">•</span>
          <Link href="/about" className="text-text-primary hover:text-accent transition-colors">
            About
          </Link>
        </nav>

        {/* Status pill (mock for now) */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-text-muted">Market</span>
          <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-text-primary">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-up" />
            Open (simulated)
          </span>
        </div>
      </div>

      {/* Accent line */}
      <div className="h-1 bg-accent" />
    </header>
  );
}