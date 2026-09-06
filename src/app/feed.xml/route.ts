import { NextResponse } from 'next/server';
import { GUIDES } from '@/lib/guides/guides';
import { ALL_TOOLS } from '@/config/categories';
import { siteConfig } from '@/config/site';

export async function GET() {
  const feedItems = [
    // 1. Guides & Knowledge Base Articles
    ...GUIDES.map((guide) => ({
      title: guide.title,
      link: `${siteConfig.url}/guides/${guide.slug}`,
      description: guide.shortDescription,
      pubDate: new Date(guide.publishedDate).toUTCString(),
      guid: `${siteConfig.url}/guides/${guide.slug}`,
      category: guide.category,
    })),
    // 2. Popular & Featured Tools
    ...ALL_TOOLS.filter((t) => t.popular).map((tool) => ({
      title: `${tool.name} — Free Online Converter`,
      link: `${siteConfig.url}/convert/${tool.categorySlug}/${tool.slug}`,
      description: tool.description,
      pubDate: new Date('2026-09-01').toUTCString(),
      guid: `${siteConfig.url}/convert/${tool.categorySlug}/${tool.slug}`,
      category: tool.categoryName,
    })),
  ];

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${siteConfig.name} — Free Online Converters, Utilities & Guides</title>
    <link>${siteConfig.url}</link>
    <description>${siteConfig.description}</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteConfig.url}/feed.xml" rel="self" type="application/rss+xml"/>
    ${feedItems
      .map(
        (item) => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.guid}</guid>
      <description><![CDATA[${item.description}]]></description>
      <category>${item.category}</category>
      <pubDate>${item.pubDate}</pubDate>
    </item>`
      )
      .join('')}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=14400, stale-while-revalidate=86400',
    },
  });
}
