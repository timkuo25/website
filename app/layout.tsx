import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chung-Chia Kuo",
  description: "Personal website of Chung-Chia (Tim) Kuo",
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
      <body className="min-h-full flex flex-col bg-slate-50 text-gray-900">
        <header className="sticky top-0 z-50 bg-white border-b border-blue-50">
          <nav className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link
              href="/"
              className="font-semibold text-gray-900 hover:text-gray-600 transition-colors"
            >
              Chung-Chia Kuo
            </Link>
            <div className="flex gap-6 text-sm text-gray-600">
              <Link href="/" className="hover:text-gray-900 transition-colors">
                About
              </Link>
              <Link
                href="/blog"
                className="hover:text-gray-900 transition-colors"
              >
                Blog
              </Link>
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-100 py-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} Chung-Chia Kuo
          </div>
        </footer>
      </body>
    </html>
  );
}
