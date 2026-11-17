import { getCollection, render, type CollectionEntry } from 'astro:content';
import type { Lang } from '@/i18n/ui';

export interface SidebarHeading {
  depth: number;
  slug: string;
  text: string;
}

export interface SidebarEntry {
  slug: string;
  title: string;
  sidebarTitle: string;
  category: string;
  series?: string;
  date: string;
  order?: number;
  headings: SidebarHeading[];
  post: CollectionEntry<'blog'>;
}

/**
 * Returns non-draft blog posts sorted by explicit sidebar order ascending, then date descending.
 */
export async function getSortedPublishedPosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return [...posts].sort((a, b) => {
    const orderA = a.data.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.data.order ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return b.data.date.localeCompare(a.data.date);
  });
}

/**
 * Builds sidebar navigation entries with H2/H3 section headings extracted at build time.
 */
export async function getBlogSidebarEntries(): Promise<SidebarEntry[]> {
  const sortedPosts = await getSortedPublishedPosts();
  return Promise.all(
    sortedPosts.map(async (post) => {
      const { headings } = await render(post);
      return {
        slug: post.data.slug,
        title: post.data.title,
        sidebarTitle: post.data.sidebarTitle || post.data.title,
        category: post.data.category || 'Articles',
        series: post.data.series,
        date: post.data.date,
        order: post.data.order,
        headings: headings
          .filter((h) => h.depth === 2 || h.depth === 3)
          .map((h) => ({ depth: h.depth, slug: h.slug, text: h.text })),
        post,
      };
    }),
  );
}

/**
 * Returns static path entries for all non-draft blog posts.
 */
export async function getPublishedBlogPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({
    params: { slug: post.data.slug },
    props: { post },
  }));
}

/**
 * Builds Schema.org BlogPosting JSON-LD metadata for a blog post page.
 */
export function buildArticleJsonLd(
  post: CollectionEntry<'blog'>,
  lang: Lang,
  site: URL | undefined,
): Record<string, unknown> {
  const prefix = lang === 'tr' ? '/tr' : '';
  const postUrl = new URL(
    `${prefix}/blog/${post.data.slug}/`,
    site || 'https://mericasaner.com',
  ).toString();

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.data.title,
    description: post.data.summary,
    datePublished: post.data.date,
    author: {
      '@type': 'Person',
      name: 'Meriç Alper Aşaner',
      url: 'https://mericasaner.com',
    },
    url: postUrl,
    keywords: post.data.tags.join(', '),
    ...(post.data.repoUrl ? { codeRepository: post.data.repoUrl } : {}),
  };
}
