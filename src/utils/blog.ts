import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '@/i18n/ui';

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
