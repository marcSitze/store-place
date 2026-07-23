import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aura - Premium Curated eCommerce Store",
  description: "Experience modern, high-end shopping with Aura. Curated products, minimal design, and ultra-fast checkout.",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "Aura - Premium Curated eCommerce Store",
    description: "Experience modern, high-end shopping with Aura.",
    url: "/",
    siteName: "Aura Store",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
