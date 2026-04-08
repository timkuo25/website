import Link from "next/link";
import { getPostData, getAllPostSlugs } from "@/lib/posts";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const post = await getPostData(slug);
    return { title: `${post.title} — Tim Kuo` };
  } catch {
    return { title: "Post Not Found" };
  }
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;

  let post;
  try {
    post = await getPostData(slug);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <Link
        href="/blog"
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

        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </article>
    </div>
  );
}
