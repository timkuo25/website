"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PostMeta } from "@/lib/posts";
import { categories, categoryLabels, type Category } from "@/lib/categories";

export default function CategorySidebar({
  posts,
  basePath,
  lang,
  allArticlesLabel,
}: {
  posts: PostMeta[];
  basePath: string;
  lang: string;
  allArticlesLabel: string;
}) {
  const pathname = usePathname();
  const prefix = `${basePath}/${lang}/`;
  const currentSlug = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : null;
  const currentCategory = currentSlug
    ? posts.find((post) => post.slug === currentSlug)?.category
    : undefined;

  const [openCategories, setOpenCategories] = useState<Set<Category>>(
    () => new Set(currentCategory ? [currentCategory] : [])
  );

  function toggle(category: Category) {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  return (
    <nav className="text-sm">
      <Link
        href={`${basePath}/${lang}`}
        className={
          !currentSlug
            ? "block font-semibold text-gray-900 mb-4 dark:text-gray-100"
            : "block font-semibold text-gray-600 hover:text-gray-900 mb-4 transition-colors dark:text-gray-400 dark:hover:text-gray-100"
        }
      >
        {allArticlesLabel}
      </Link>

      <ul className="space-y-1">
        {categories.map((category) => {
          const categoryPosts = posts.filter((post) => post.category === category);
          const isOpen = openCategories.has(category);

          return (
            <li key={category}>
              <button
                type="button"
                onClick={() => toggle(category)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-2 py-1.5 text-left font-medium text-gray-700 hover:text-gray-900 transition-colors dark:text-gray-300 dark:hover:text-gray-100"
              >
                <span>{categoryLabels[category]}</span>
                <span
                  aria-hidden="true"
                  className={`text-xs text-gray-400 transition-transform dark:text-gray-500 ${isOpen ? "rotate-180" : ""}`}
                >
                  ▾
                </span>
              </button>

              {isOpen && (
                <ul className="mt-1 mb-2 ml-3 space-y-1 border-l border-gray-100 pl-3 dark:border-gray-800">
                  {categoryPosts.length === 0 ? (
                    <li className="py-1 text-xs text-gray-400 dark:text-gray-600">—</li>
                  ) : (
                    categoryPosts.map((post) => (
                      <li key={post.slug}>
                        <Link
                          href={`${basePath}/${lang}/${post.slug}`}
                          className={
                            post.slug === currentSlug
                              ? "block py-1 font-medium text-gray-900 dark:text-gray-100"
                              : "block py-1 text-gray-500 hover:text-gray-900 transition-colors dark:text-gray-400 dark:hover:text-gray-100"
                          }
                        >
                          {post.title}
                        </Link>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
