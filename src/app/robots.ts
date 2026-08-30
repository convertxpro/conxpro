import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  const commonDisallow = ['/admin/', '/api/', '/dashboard/', '/auth/', '/embed/'];

  return {
    rules: [
      // Default crawler rules
      {
        userAgent: '*',
        allow: '/',
        disallow: commonDisallow,
      },
      // Google crawlers
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/api/', '/dashboard/', '/auth/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/admin/', '/api/', '/dashboard/', '/auth/'],
      },
      // AI Engine Crawlers (AEO) — Explicitly allow full access
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/admin/', '/api/', '/dashboard/', '/auth/'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: ['/admin/', '/api/', '/dashboard/', '/auth/'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/admin/', '/api/', '/dashboard/', '/auth/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/admin/', '/api/', '/dashboard/', '/auth/'],
      },
      {
        userAgent: 'Applebot',
        allow: '/',
        disallow: ['/admin/', '/api/', '/dashboard/', '/auth/'],
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/admin/', '/api/', '/dashboard/', '/auth/'],
      },
      {
        userAgent: 'Anthropic-ai',
        allow: '/',
        disallow: ['/admin/', '/api/', '/dashboard/', '/auth/'],
      },
    ],
    host: siteConfig.url,
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
