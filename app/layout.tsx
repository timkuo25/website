import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "highlight.js/styles/github.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TCK",
  description: "Personal website of TCK",
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
        {children}
        <footer className="border-t border-gray-100 py-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} TCK
          </div>
        </footer>
      </body>
    </html>
  );
}
