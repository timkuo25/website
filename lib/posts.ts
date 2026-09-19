import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { defaultLocale, type Locale } from './i18n';
import type { Category } from './categories';

export { categories, categoryLabels, isCategory, type Category } from './categories';

export const sections = ['general', 'tech'] as const;
export type Section = (typeof sections)[number];

const postsDirectory = path.join(process.cwd(), 'posts');

// Posts live under posts/<locale>/<slug>.md. The defaultLocale folder is
// canonical (every post has an entry there); other locales only need a file
// when a translation exists — otherwise callers fall back to defaultLocale.
// Which section(s) a post belongs to is declared in its own frontmatter
// (`sections: [...]`), read from the canonical file, rather than encoded in
// the folder layout — that way a post can belong to more than one section.
function localeDir(locale: Locale): string {
  return path.join(postsDirectory, locale);
}

function slugFilePath(slug: string, locale: Locale): string {
  return path.join(localeDir(locale), `${slug}.md`);
}

interface CanonicalEntry {
  slug: string;
  sections: Section[];
  category?: Category;
}

// Reading every post's frontmatter is cheap, but there's no reason to redo it
// on every call within the same process — the canonical index is computed
// once and reused.
let canonicalIndexCache: CanonicalEntry[] | null = null;

function canonicalIndex(): CanonicalEntry[] {
  if (canonicalIndexCache) return canonicalIndexCache;

  const dir = localeDir(defaultLocale);
  if (!fs.existsSync(dir)) {
    canonicalIndexCache = [];
    return canonicalIndexCache;
  }

  canonicalIndexCache = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const slug = f.replace(/\.md$/, '');
      const { data } = matter(fs.readFileSync(path.join(dir, f), 'utf8'));
      return {
        slug,
        sections: (data.sections as Section[] | undefined) ?? [],
        category: data.category as Category | undefined,
      };
    });

  return canonicalIndexCache;
}

function entriesForSection(section: Section): CanonicalEntry[] {
  return canonicalIndex().filter((entry) => entry.sections.includes(section));
}

// Resolves which file to actually read for a (slug, locale) pair, falling
// back to defaultLocale when no translation exists yet.
function resolveFile(slug: string, locale: Locale): { filePath: string; translated: boolean } {
  const localized = slugFilePath(slug, locale);
  if (locale !== defaultLocale && fs.existsSync(localized)) {
    return { filePath: localized, translated: true };
  }
  return { filePath: slugFilePath(slug, defaultLocale), translated: locale === defaultLocale };
}

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  category?: Category;
  tags: string[];
  translated: boolean;
}

export interface TocEntry {
  id: string;
  text: string;
  depth: 2 | 3;
}

export interface Post extends PostMeta {
  contentHtml: string;
  readingMinutes: number;
  toc: TocEntry[];
}

interface HastNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
  value?: string;
}

interface VFileLike {
  data: Record<string, unknown>;
}

// Gives each h2/h3 a stable id (so the on-page table of contents can jump to
// it) and records {id, text, depth} for those headings on file.data.toc.
// IDs are just an incrementing counter rather than slugified heading text —
// headings are often in Chinese/Japanese, where slugifying is more trouble
// than it's worth for an anchor nobody needs to read.
function rehypeToc() {
  return (tree: HastNode, file: VFileLike) => {
    const toc: TocEntry[] = [];
    let counter = 0;

    const textOf = (node: HastNode): string => {
      if (node.type === 'text') return node.value ?? '';
      return (node.children ?? []).map(textOf).join('');
    };

    const walk = (node: HastNode) => {
      if (!node.children) return;
      for (const child of node.children) {
        if (child.type === 'element' && (child.tagName === 'h2' || child.tagName === 'h3')) {
          const id = `heading-${counter++}`;
          child.properties = { ...(child.properties ?? {}), id };
          toc.push({ id, text: textOf(child), depth: child.tagName === 'h2' ? 2 : 3 });
        }
        walk(child);
      }
    };
    walk(tree);

    file.data.toc = toc;
  };
}

// A rough, language-mixed reading-time estimate: CJK text is counted by
// character (no spaces to split words on) and everything else by word,
// each at a typical reading speed, then summed.
function estimateReadingMinutes(markdown: string): number {
  const withoutCodeBlocks = markdown.replace(/```[\s\S]*?```/g, ' ');
  const cjkCount = (withoutCodeBlocks.match(/[一-鿿぀-ヿ가-힯]/g) ?? []).length;
  const wordCount = (withoutCodeBlocks.replace(/[一-鿿぀-ヿ가-힯]/g, ' ').match(/[A-Za-z0-9]+/g) ?? []).length;
  const minutes = cjkCount / 400 + wordCount / 200;
  return Math.max(1, Math.round(minutes));
}

function rehypeImageFigure() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (!node.children) return;
      node.children = node.children.map((child) => {
        if (
          child.type === 'element' &&
          child.tagName === 'p' &&
          child.children?.length === 1 &&
          child.children[0].type === 'element' &&
          child.children[0].tagName === 'img'
        ) {
          const img = child.children[0];
          const alt = img.properties?.alt as string | undefined;
          const figureChildren: HastNode[] = [img];
          if (alt) {
            figureChildren.push({
              type: 'element',
              tagName: 'figcaption',
              properties: {},
              children: [{ type: 'text', value: alt }],
            });
          }
          return {
            type: 'element',
            tagName: 'figure',
            properties: {},
            children: figureChildren,
          };
        }
        walk(child);
        return child;
      });
    };
    walk(tree);
  };
}

export function getSortedPostsData(section: Section, locale: Locale = defaultLocale): PostMeta[] {
  return entriesForSection(section)
    .map((entry) => {
      const { filePath, translated } = resolveFile(entry.slug, locale);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);
      return {
        slug: entry.slug,
        title: data.title as string,
        date: data.date as string,
        excerpt: data.excerpt as string | undefined,
        category: entry.category,
        tags: (data.tags as string[] | undefined) ?? [],
        translated,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostData(
  section: Section,
  slug: string,
  locale: Locale = defaultLocale
): Promise<Post> {
  const entry = canonicalIndex().find((e) => e.slug === slug);
  if (!entry || !entry.sections.includes(section)) {
    throw new Error(`Post "${slug}" is not in section "${section}"`);
  }

  const { filePath, translated } = resolveFile(slug, locale);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  const { remark } = await import('remark');
  const remarkGfm = (await import('remark-gfm')).default;
  const remarkMath = (await import('remark-math')).default;
  const remarkRehype = (await import('remark-rehype')).default;
  const rehypeKatex = (await import('rehype-katex')).default;
  const rehypeHighlight = (await import('rehype-highlight')).default;
  const rehypeStringify = (await import('rehype-stringify')).default;
  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeToc)
    .use(rehypeKatex)
    .use(rehypeImageFigure)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(content);
  const contentHtml = processedContent.toString();
  const toc = (processedContent.data as { toc?: TocEntry[] }).toc ?? [];

  return {
    slug,
    title: data.title as string,
    date: data.date as string,
    excerpt: data.excerpt as string | undefined,
    category: entry.category,
    tags: (data.tags as string[] | undefined) ?? [],
    readingMinutes: estimateReadingMinutes(content),
    toc,
    translated,
    contentHtml,
  };
}

// Every canonical slug resolves for every locale (falling back to
// defaultLocale when untranslated), so the slug set doesn't vary by locale.
export function getAllPostSlugs(section: Section): string[] {
  return entriesForSection(section).map((entry) => entry.slug);
}

// Adjacent posts follow the same order as the blog index (newest first), so
// "prev" is the newer post shown above it in the list and "next" is older.
export function getAdjacentPosts(
  section: Section,
  slug: string,
  locale: Locale = defaultLocale
): { prev: PostMeta | null; next: PostMeta | null } {
  const posts = getSortedPostsData(section, locale);
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? posts[index - 1] : null,
    next: index < posts.length - 1 ? posts[index + 1] : null,
  };
}
