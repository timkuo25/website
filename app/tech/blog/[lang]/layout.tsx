import { notFound } from "next/navigation";
import { isLocale, locales } from "@/lib/i18n";
import { getSortedPostsData } from "@/lib/posts";
import CategorySidebar from "@/components/CategorySidebar";

interface Props {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function TechBlogLangLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const posts = getSortedPostsData("tech", lang);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col sm:flex-row gap-10">
      <aside className="sm:w-56 shrink-0">
        <CategorySidebar posts={posts} basePath="/tech/blog" lang={lang} allArticlesLabel="All Articles" />
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
