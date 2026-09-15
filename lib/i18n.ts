export const locales = ["zh", "en", "ja"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "zh";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export const untranslatedNotice =
  "Not yet translated — shown in the original language.";
