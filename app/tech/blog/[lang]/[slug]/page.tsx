import Link from "next/link";
import { getPostData, getAllPostSlugs, getAdjacentPosts } from "@/lib/posts";
import { categoryLabels } from "@/lib/categories";
import { isLocale, untranslatedNotice } from "@/lib/i18n";
import { notFound } from "next/navigation";
import TableOfContents from "@/components/TableOfContents";

interface Props {
  params: Promise<{ lang: string; slug: string }>;
}

export function generateStaticParams() {
  return getAllPostSlugs("tech").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return { title: "Post Not Found" };
  try {
    const post = await getPostData("tech", slug, lang);
    return { title: `${post.title} — TCK` };
  } catch {
    return { title: "Post Not Found" };
  }
}

export default async function TechBlogPost({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  let post;
  try {
    post = await getPostData("tech", slug, lang);
  } catch {
    notFound();
  }

  const { prev, next } = getAdjacentPosts("tech", slug, lang);

  return (
    <div className="flex gap-10">
      <div className="flex-1 min-w-0">
        <nav className="mb-6 text-sm text-gray-400 dark:text-gray-500" aria-label="Breadcrumb">
          <Link href={`/tech/blog/${lang}`} className="hover:text-gray-700 dark:hover:text-gray-300">
            Blog
          </Link>
          {post.category && (
            <>
              <span className="mx-2" aria-hidden="true">/</span>
              <span>{categoryLabels[post.category]}</span>
            </>
          )}
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="text-gray-600 dark:text-gray-300">{post.title}</span>
        </nav>

        <article>
          <header className="mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {post.title}
            </h1>

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 mt-4 text-xs text-gray-400 tracking-wide dark:text-gray-500">
              <time>
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span aria-hidden="true">·</span>
              <span>{post.readingMinutes} min read</span>
            </div>
          </header>

          {!post.translated && (
            <p className="mb-8 text-sm text-gray-500 bg-gray-100 rounded-md px-4 py-3 dark:text-gray-400 dark:bg-gray-900">
              {untranslatedNotice}
            </p>
          )}

          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        </article>

        {(prev || next) && (
          <nav className="mt-16 pt-8 border-t border-gray-100 flex gap-4 text-sm dark:border-gray-800">
            <div className="flex-1">
              {prev && (
                <Link href={`/tech/blog/${lang}/${prev.slug}`} className="group block">
                  <span className="block text-gray-400 dark:text-gray-500">← Previous</span>
                  <span className="block mt-1 text-gray-700 group-hover:text-gray-900 transition-colors dark:text-gray-300 dark:group-hover:text-gray-100">
                    {prev.title}
                  </span>
                </Link>
              )}
            </div>
            <div className="flex-1 text-right">
              {next && (
                <Link href={`/tech/blog/${lang}/${next.slug}`} className="group block">
                  <span className="block text-gray-400 dark:text-gray-500">Next →</span>
                  <span className="block mt-1 text-gray-700 group-hover:text-gray-900 transition-colors dark:text-gray-300 dark:group-hover:text-gray-100">
                    {next.title}
                  </span>
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>

      {post.toc.length > 0 && (
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-20">
            <TableOfContents toc={post.toc} title="Table of Contents" />
          </div>
        </aside>
      )}
    </div>
  );
}
