import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import type { ToolSeoData } from '@/config/tool-seo-registry';

export interface ToolSeoProps {
  toolName?: string;
  title?: string;
  category: string;
  categorySlug: string;
  slug: string;
  customTitle?: string;
  customDescription?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  noIndex?: boolean;
}

export function generateToolMetadata({
  toolName,
  title: passedTitle,
  category,
  categorySlug,
  slug,
  customTitle,
  customDescription,
  description: passedDescription,
  keywords = [],
  canonicalUrl,
  noIndex = false,
}: ToolSeoProps): Metadata {
  const resolvedName = toolName || passedTitle || 'Converter';
  const title =
    customTitle ||
    passedTitle ||
    `${resolvedName} — Free Online Converter | ${siteConfig.name}`;
  const description =
    customDescription ||
    passedDescription ||
    `Fast, free, and secure online ${resolvedName.toLowerCase()} tool. 100% free with no registration required. Instant conversion on any mobile or desktop browser.`;

  const url = canonicalUrl || `${siteConfig.url}/convert/${categorySlug}/${slug}`;
  const ogImageUrl = `${siteConfig.url}/og?title=${encodeURIComponent(resolvedName)}&category=${encodeURIComponent(category)}`;

  const mergedKeywords = Array.from(
    new Set([
      ...keywords,
      resolvedName.toLowerCase(),
      `convert ${resolvedName.toLowerCase()}`,
      `free ${resolvedName.toLowerCase()} online`,
      category.toLowerCase(),
      'online converter',
      'free tool',
      'convert online',
      'fast conversion',
      siteConfig.name,
    ])
  );

  return {
    title,
    description,
    keywords: mergedKeywords,
    alternates: {
      canonical: url,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url,
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${resolvedName} Converter Online`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
      creator: '@ApexToolsApp',
    },
  };
}

export function generateToolMetadataFromData(seoData: ToolSeoData): Metadata {
  return generateToolMetadata({
    toolName: seoData.name,
    category: seoData.categoryName,
    categorySlug: seoData.categorySlug,
    slug: seoData.slug,
    customTitle: seoData.seoTitle,
    customDescription: seoData.metaDescription,
    keywords: seoData.keywords,
  });
}

export interface CategorySeoProps {
  categoryName: string;
  categorySlug: string;
  description: string;
  toolCount: number;
  keywords?: string[];
}

export function generateCategoryMetadata({
  categoryName,
  categorySlug,
  description,
  toolCount,
  keywords = [],
}: CategorySeoProps): Metadata {
  const title = `${categoryName} Hub — ${toolCount}+ Free Online Converters | ${siteConfig.name}`;
  const url = `${siteConfig.url}/convert/${categorySlug}`;
  const ogImageUrl = `${siteConfig.url}/og?title=${encodeURIComponent(categoryName + ' Hub')}&category=${encodeURIComponent('Pillar Collection')}`;

  return {
    title,
    description,
    keywords: [
      categoryName.toLowerCase(),
      `${categoryName.toLowerCase()} online`,
      'file converter',
      'free calculators',
      ...keywords,
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${categoryName} Tools`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export interface GuideSeoProps {
  title: string;
  description: string;
  slug: string;
  publishedTime: string;
  author?: string;
  keywords?: string[];
}

export function generateGuideMetadata({
  title,
  description,
  slug,
  publishedTime,
  author = siteConfig.author,
  keywords = [],
}: GuideSeoProps): Metadata {
  const fullTitle = `${title} | ${siteConfig.name} Educational Guides`;
  const url = `${siteConfig.url}/guides/${slug}`;
  const ogImageUrl = `${siteConfig.url}/og?title=${encodeURIComponent(title)}&category=Topical%20Guide`;

  return {
    title: fullTitle,
    description,
    keywords: [
      'guide',
      'tutorial',
      'how to',
      'calculator guide',
      ...keywords,
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'article',
      url,
      title: fullTitle,
      description,
      publishedTime,
      authors: [author],
      siteName: siteConfig.name,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImageUrl],
    },
  };
}

export interface BlogPostSeoProps {
  title: string;
  description: string;
  slug: string;
  publishedTime: string;
  modifiedTime?: string;
  authorName?: string;
  category?: string;
  tags?: string[];
  keywords?: string[];
}

export function generateBlogPostMetadata({
  title,
  description,
  slug,
  publishedTime,
  modifiedTime,
  authorName = siteConfig.author,
  category = 'Technology',
  tags = [],
  keywords = [],
}: BlogPostSeoProps): Metadata {
  const fullTitle = `${title} | ${siteConfig.name} Blog`;
  const url = `${siteConfig.url}/blog/${slug}`;
  const ogImageUrl = `${siteConfig.url}/og?title=${encodeURIComponent(title)}&category=${encodeURIComponent(category)}`;

  const mergedKeywords = Array.from(
    new Set([
      ...tags,
      ...keywords,
      category.toLowerCase(),
      'blog',
      'tech guide',
      'file conversion tutorial',
      'web performance',
      siteConfig.name,
    ])
  );

  return {
    title: fullTitle,
    description,
    keywords: mergedKeywords,
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'article',
      url,
      title: fullTitle,
      description,
      publishedTime,
      modifiedTime: modifiedTime || publishedTime,
      authors: [authorName],
      section: category,
      tags,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImageUrl],
      creator: '@ApexToolsApp',
    },
  };
}

export function generateBlogIndexMetadata(): Metadata {
  const title = `Tech, Productivity & Format Optimization Blog | ${siteConfig.name}`;
  const description =
    'Practical, engineering-grade articles on image compression, PDF optimization, audio bitrates, and privacy-first web utilities from the ApexTools technical team.';
  const url = `${siteConfig.url}/blog`;
  const ogImageUrl = `${siteConfig.url}/og?title=${encodeURIComponent('ApexTools Engineering & Productivity Blog')}&category=${encodeURIComponent('Official Blog')}`;

  return {
    title,
    description,
    keywords: [
      'file converter blog',
      'image optimization tips',
      'pdf compression guide',
      'audio bitrates explained',
      'webp vs png vs jpg',
      'client-side privacy',
      'web tools blog',
      siteConfig.name,
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

