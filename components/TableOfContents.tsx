"use client";

import { useEffect, useState } from "react";
import type { TocEntry } from "@/lib/posts";

export default function TableOfContents({ toc, title }: { toc: TocEntry[]; title: string }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const headings = toc
      .map((entry) => document.getElementById(entry.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "0px 0px -70% 0px" }
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [toc]);

  if (toc.length === 0) return null;

  return (
    <nav className="text-sm">
      <p className="font-semibold text-gray-900 mb-3 dark:text-gray-100">{title}</p>
      <ul className="space-y-2">
        {toc.map((entry) => (
          <li key={entry.id} style={{ paddingLeft: entry.depth === 3 ? "0.75rem" : 0 }}>
            <a
              href={`#${entry.id}`}
              className={
                activeId === entry.id
                  ? "block text-blue-600 font-medium dark:text-blue-400"
                  : "block text-gray-500 hover:text-gray-900 transition-colors dark:text-gray-400 dark:hover:text-gray-100"
              }
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
