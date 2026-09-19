"use client";

import { useRouter, usePathname } from "next/navigation";
import { locales, isLocale, type Locale } from "@/lib/i18n";

const labels: Record<Locale, string> = {
  zh: "中文",
  en: "English",
  ja: "日本語",
};

// Only blog routes are localized (/blog/<lang>/... and /tech/blog/<lang>/...),
// so this reads the current path itself and renders nothing elsewhere —
// that way it can live in the shared Header instead of a blog-only layout.
function parseBlogPath(pathname: string): { base: string; current: Locale; rest: string } | null {
  const match = pathname.match(/^((?:\/tech)?\/blog)\/([a-z]+)((?:\/.*)?)$/);
  if (!match) return null;
  const [, base, lang, rest] = match;
  if (!isLocale(lang)) return null;
  return { base, current: lang, rest };
}

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const parsed = parseBlogPath(pathname);

  if (!parsed) return null;
  const { base, current, rest } = parsed;

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    router.push(`${base}/${e.target.value}${rest}`);
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      aria-label="Language"
      className="text-sm text-gray-600 bg-white border border-gray-200 rounded-md pl-2 pr-6 py-1 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300 cursor-pointer dark:text-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-600"
    >
      {locales.map((locale) => (
        <option key={locale} value={locale}>
          {labels[locale]}
        </option>
      ))}
    </select>
  );
}
