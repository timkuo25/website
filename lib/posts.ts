import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { defaultLocale, type Locale } from './i18n';

const postsDirectory = path.join(process.cwd(), 'posts');

// Posts live under posts/<locale>/<slug>.md. The defaultLocale folder is
// canonical (every post has an entry there); other locales only need a file
// when a translation exists — otherwise callers fall back to defaultLocale.
function localeDir(locale: Locale): string {
  return path.join(postsDirectory, locale);
}

function slugFilePath(slug: string, locale: Locale): string {
  return path.join(localeDir(locale), `${slug}.md`);
}

function canonicalSlugs(): string[] {
  const dir = localeDir(defaultLocale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
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
  translated: boolean;
}

export interface Post extends PostMeta {
  contentHtml: string;
}

interface HastNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
  value?: string;
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

export function getSortedPostsData(locale: Locale = defaultLocale): PostMeta[] {
  return canonicalSlugs()
    .map((slug) => {
      const { filePath, translated } = resolveFile(slug, locale);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);
      return {
        slug,
        title: data.title as string,
        date: data.date as string,
        excerpt: data.excerpt as string | undefined,
        translated,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostData(slug: string, locale: Locale = defaultLocale): Promise<Post> {
  const { filePath, translated } = resolveFile(slug, locale);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  const { remark } = await import('remark');
  const remarkGfm = (await import('remark-gfm')).default;
  const remarkRehype = (await import('remark-rehype')).default;
  const rehypeHighlight = (await import('rehype-highlight')).default;
  const rehypeStringify = (await import('rehype-stringify')).default;
  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeImageFigure)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(content);
  const contentHtml = processedContent.toString();

  return {
    slug,
    title: data.title as string,
    date: data.date as string,
    excerpt: data.excerpt as string | undefined,
    translated,
    contentHtml,
  };
}

// Every canonical slug resolves for every locale (falling back to
// defaultLocale when untranslated), so the slug set doesn't vary by locale.
export function getAllPostSlugs(): string[] {
  return canonicalSlugs();
}
