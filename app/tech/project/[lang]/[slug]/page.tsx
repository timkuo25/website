import Link from "next/link";
import { getPostData, getAllPostSlugs, getAdjacentPosts } from "@/lib/posts";
import { isLocale, untranslatedNotice } from "@/lib/i18n";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ lang: string; slug: string }>;
}

export function generateStaticParams() {
  return getAllPostSlugs("project").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return { title: "Post Not Found" };
  try {
    const post = await getPostData("project", slug, lang);
    return { title: `${post.title} — TCK` };
  } catch {
    return { title: "Post Not Found" };
  }
}

export default async function TechProjectPost({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  let post;
  try {
    post = await getPostData("project", slug, lang);
  } catch {
    notFound();
  }

  const { prev, next } = getAdjacentPosts("project", slug, lang);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <Link
        href={`/tech/project/${lang}`}
        className="text-sm text-gray-400 hover:text-gray-700 transition-colors mb-10 inline-block dark:text-gray-500 dark:hover:text-gray-300"
      >
        ← Back to Project
      </Link>

      <article>
        <header className="mb-10">
          <time className="text-xs text-gray-400 tracking-wide dark:text-gray-500">
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
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
              <Link href={`/tech/project/${lang}/${prev.slug}`} className="group block">
                <span className="block text-gray-400 dark:text-gray-500">← Previous</span>
                <span className="block mt-1 text-gray-700 group-hover:text-gray-900 transition-colors dark:text-gray-300 dark:group-hover:text-gray-100">
                  {prev.title}
                </span>
              </Link>
            )}
          </div>
          <div className="flex-1 text-right">
            {next && (
              <Link href={`/tech/project/${lang}/${next.slug}`} className="group block">
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
  );
}
