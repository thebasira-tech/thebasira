import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "Basira",
  description: "Nigerian market data, charts and analytics — simplified.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        <SiteHeader />
        <div className="min-h-[calc(100vh-72px)]">{children}</div>
        <SiteFooter />
      </body>

    </html>
  );
}
