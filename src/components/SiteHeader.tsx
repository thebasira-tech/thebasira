"use client";

import React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import NaijaStocksLogo from "@/components/NaijaStocksLogo";
import ThemeToggle from "@/components/ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "Stocks" },
  { href: "/etfs", label: "ETFs" },
  { href: "/pulse", label: "Pulse" },
  { href: "/tools/purchasing-power", label: "Purchasing Power" },
  { href: "/tools/diaspora-bridge", label: "Diaspora Bridge" },
  { href: "/about", label: "About" },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <header className="border-b border-border bg-background sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
            <NaijaStocksLogo size={30} />
            <div className="leading-tight">
              <div className="text-xl font-display font-bold tracking-tight text-text-primary">Basira</div>
            </div>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-5 text-sm">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-text-primary hover:text-accent transition-colors whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Status pill (mock for now) */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-text-muted">Market</span>
            <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-text-primary whitespace-nowrap">
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-up" />
              Open (simulated)
            </span>
          </div>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden p-2 rounded-lg border border-border text-text-primary hover:bg-surface-2 transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {menuOpen && (
        <nav className="lg:hidden border-t border-border bg-background px-4 sm:px-6 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm text-text-primary hover:bg-surface-2 hover:text-accent transition-colors"
            >
              {link.label}
            </Link>
          ))}

          <div className="mt-2 px-3 flex items-center gap-2 sm:hidden">
            <span className="text-xs text-text-muted">Market</span>
            <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-text-primary">
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-up" />
              Open (simulated)
            </span>
          </div>
        </nav>
      )}

      {/* Accent line */}
      <div className="h-1 bg-accent" />
    </header>
  );
}