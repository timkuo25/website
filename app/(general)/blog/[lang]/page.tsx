import Link from "next/link";
import { getSortedPostsData } from "@/lib/posts";
import { isLocale, untranslatedNotice } from "@/lib/i18n";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ lang: string }>;
}

export const metadata = {
  title: "TCK",
  description: "Articles and thoughts by Chung-Chia (Tim) Kuo",
};

export default async function BlogIndex({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const posts = getSortedPostsData("general", lang);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
        Blog
      </h1>
      <p className="text-gray-500 mb-12">
        Thoughts on life, language, and everything in between.
      </p>

      {posts.length === 0 ? (
        <p className="text-gray-400">No posts yet. Check back soon.</p>
      ) : (
        <ul className="space-y-10">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${lang}/${post.slug}`}
                className="group block"
              >
                <time className="text-xs text-gray-400 tracking-wide">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <h2 className="mt-1.5 text-lg font-semibold text-gray-900 group-hover:text-gray-600 transition-colors">
                  {post.title}
                </h2>
                {!post.translated && (
                  <p className="mt-1 text-xs text-gray-400">{untranslatedNotice}</p>
                )}
                {post.excerpt && (
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}
                <span className="mt-3 inline-block text-xs text-gray-400 group-hover:text-gray-700 transition-colors">
                  Read more →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
