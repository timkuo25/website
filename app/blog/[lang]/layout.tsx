import { notFound } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { isLocale, locales, type Locale } from "@/lib/i18n";

interface Props {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function BlogLangLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 flex justify-end">
        <LanguageSwitcher current={lang as Locale} base="/blog" />
      </div>
      {children}
    </>
  );
}
