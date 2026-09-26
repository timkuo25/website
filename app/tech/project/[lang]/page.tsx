import Link from "next/link";
import { getSortedPostsData } from "@/lib/posts";
import { isLocale, untranslatedNotice } from "@/lib/i18n";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ lang: string }>;
}

export const metadata = {
  title: "Project — TCK",
  description: "Things I've built.",
};

export default async function TechProjectIndex({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const posts = getSortedPostsData("project", lang);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2 dark:text-gray-100">
        Project
      </h1>
      <p className="text-gray-500 mb-12 dark:text-gray-400">
        Things I&apos;ve built.
      </p>

      {posts.length === 0 ? (
        <p className="text-gray-400 dark:text-gray-500">No posts yet. Check back soon.</p>
      ) : (
        <ul className="space-y-10">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/tech/project/${lang}/${post.slug}`} className="group block">
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-gray-600 transition-colors dark:text-gray-100 dark:group-hover:text-gray-400">
                  {post.title}
                </h2>
                {!post.translated && (
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{untranslatedNotice}</p>
                )}
                {post.excerpt && (
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed dark:text-gray-400">
                    {post.excerpt}
                  </p>
                )}
                <span className="mt-3 inline-block text-xs text-gray-400 group-hover:text-gray-700 transition-colors dark:text-gray-500 dark:group-hover:text-gray-300">
                  Read more →
                </span>
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
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
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
