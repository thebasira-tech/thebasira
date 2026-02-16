"use client";

import Link from "next/link";
import NaijaStocksLogo from "@/components/NaijaStocksLogo";

export default function SiteHeader() {
  return (
    <header className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <NaijaStocksLogo size={30} />
            <div className="leading-tight">
              <div className="text-xl font-bold tracking-tight text-gray-900">Basira</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="text-gray-700 hover:text-gray-900">
            Stocks
          </Link>
          <Link href="/etfs" className="text-gray-700 hover:text-gray-900">
            ETFs
          </Link>
          <span className="text-gray-300">•</span>
          <span className="text-gray-500">Sectors (soon)</span>
          <span className="text-gray-300">•</span>
          <Link href="/about" className="text-gray-700 hover:text-gray-900">
            About
          </Link>
        </nav>

        {/* Status pill (mock for now) */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-gray-500">Market</span>
          <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-600" />
            Open (simulated)
          </span>
        </div>
      </div>

      {/* Accent line */}
      <div className="h-1 bg-green-600" />
    </header>
  );
}

