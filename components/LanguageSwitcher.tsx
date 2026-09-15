"use client";

import { useRouter, usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";

const labels: Record<Locale, string> = {
  zh: "中文",
  en: "English",
  ja: "日本語",
};

export default function LanguageSwitcher({
  current,
  base,
}: {
  current: Locale;
  base: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const prefix = `${base}/${current}`;
    const rest = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : "";
    router.push(`${base}/${e.target.value}${rest}`);
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      aria-label="Language"
      className="text-sm text-gray-600 bg-white border border-gray-200 rounded-md pl-2 pr-6 py-1 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300 cursor-pointer"
    >
      {locales.map((locale) => (
        <option key={locale} value={locale}>
          {labels[locale]}
        </option>
      ))}
    </select>
  );
}
