import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "katex/dist/katex.min.css";

// Runs before hydration so the correct theme is applied on first paint.
// Falls back to a manual localStorage choice, then to "dark by default
// under /tech", then to the OS preference everywhere else.
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var isTech = location.pathname.startsWith('/tech');
    var dark = stored ? stored === 'dark' : (isTech || matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        {children}
        <footer className="border-t border-gray-100 py-8 dark:border-gray-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} TCK
          </div>
        </footer>
      </body>
    </html>
  );
}
