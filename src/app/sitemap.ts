import { MetadataRoute } from 'next';
import { CATEGORIES, ALL_TOOLS } from '@/config/categories';
import { GUIDES } from '@/lib/guides/guides';
import { getAllBlogPosts } from '@/lib/blog/posts';
import { PROGRAMMATIC_CONVERSION_PAIRS } from '@/config/conversion-matrix';
import { siteConfig } from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  // 1. Core Static Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteConfig.url}/blog`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${siteConfig.url}/guides`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/embed`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${siteConfig.url}/terms`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${siteConfig.url}/disclaimer`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${siteConfig.url}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // 2. Category Pillar Hub Pages (e.g. /convert/document)
  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${siteConfig.url}/convert/${category.slug}`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.95,
  }));

  // 3. Programmatic Tool Pages (e.g. /convert/document/pdf-to-word)
  const toolRoutes: MetadataRoute.Sitemap = ALL_TOOLS.map((tool) => ({
    url: `${siteConfig.url}/convert/${tool.categorySlug}/${tool.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: tool.popular ? 0.95 : 0.85,
  }));

  // 4. Programmatic Conversion Matrix Pages
  const existingUrls = new Set(toolRoutes.map((r) => r.url));
  const matrixRoutes: MetadataRoute.Sitemap = PROGRAMMATIC_CONVERSION_PAIRS
    .map((pair) => ({
      url: `${siteConfig.url}/convert/${pair.categorySlug}/${pair.slug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: pair.searchVolumeTier === 'ultra-high' ? 0.95 : 0.85,
    }))
    .filter((r) => !existingUrls.has(r.url));

  // 5. Topical Educational Guides (e.g. /guides/pakistan-property-measurement-units-guide)
  const guideRoutes: MetadataRoute.Sitemap = GUIDES.map((guide) => ({
    url: `${siteConfig.url}/guides/${guide.slug}`,
    lastModified: new Date(guide.updatedDate || guide.publishedDate),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // 6. Engineering & Optimization Blog Articles (e.g. /blog/webp-vs-png-vs-jpg-image-formats-guide)
  const blogRoutes: MetadataRoute.Sitemap = getAllBlogPosts().map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: new Date(post.updatedDate || post.publishedDate),
    changeFrequency: 'weekly',
    priority: post.featured ? 0.92 : 0.88,
  }));

  return [...staticRoutes, ...categoryRoutes, ...toolRoutes, ...matrixRoutes, ...guideRoutes, ...blogRoutes];
}

