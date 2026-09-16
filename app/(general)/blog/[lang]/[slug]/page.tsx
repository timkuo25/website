import Link from "next/link";
import { getPostData, getAllPostSlugs } from "@/lib/posts";
import { isLocale, untranslatedNotice } from "@/lib/i18n";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ lang: string; slug: string }>;
}

export function generateStaticParams() {
  return getAllPostSlugs("general").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return { title: "Post Not Found" };
  try {
    const post = await getPostData("general", slug, lang);
    return { title: `${post.title} — TCK` };
  } catch {
    return { title: "Post Not Found" };
  }
}

export default async function BlogPost({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  let post;
  try {
    post = await getPostData("general", slug, lang);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <Link
        href={`/blog/${lang}`}
        className="text-sm text-gray-400 hover:text-gray-700 transition-colors mb-10 inline-block"
      >
        ← Back to Blog
      </Link>

      <article>
        <header className="mb-10">
          <time className="text-xs text-gray-400 tracking-wide">
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            {post.title}
          </h1>
        </header>

        {!post.translated && (
          <p className="mb-8 text-sm text-gray-500 bg-gray-100 rounded-md px-4 py-3">
            {untranslatedNotice}
          </p>
        )}

        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </article>
    </div>
  );
}
