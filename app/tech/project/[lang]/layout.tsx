import { notFound } from "next/navigation";
import { isLocale, locales } from "@/lib/i18n";

interface Props {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function TechProjectLangLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return <>{children}</>;
}
