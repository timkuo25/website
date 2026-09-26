// Sub-categories within the "tech" section, used to group posts in the
// sidebar. Kept separate from lib/posts.ts (which uses fs/path) so client
// components can import these without pulling in server-only code.
export const categories = ['web', 'ds-algo', 'ai-agent', 'security'] as const;
export type Category = (typeof categories)[number];
export const categoryLabels: Record<Category, string> = {
  web: 'Web',
  'ds-algo': 'DS & Algo',
  'ai-agent': 'AI Agent',
  security: 'Security',
};

export function isCategory(value: string): value is Category {
  return (categories as readonly string[]).includes(value);
}
