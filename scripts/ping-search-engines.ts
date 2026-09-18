import * as dotenv from 'dotenv';
dotenv.config();
import { ALL_TOOLS, CATEGORIES } from '../src/config/categories';
import { GUIDES } from '../src/lib/guides/guides';
import { submitToIndexNow, pingSearchEngines } from '../src/lib/seo/indexnow';

async function main() {
  console.log('=====================================================');
  console.log('🚀 ApexTools Autonomous SEO Engine: Search Engine Ping');
  console.log('=====================================================\n');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://apextools.app';

  // 1. Gather all canonical URLs
  const urls: string[] = [
    siteUrl,
    `${siteUrl}/guides`,
    `${siteUrl}/convert/document`,
    `${siteUrl}/convert/image`,
    `${siteUrl}/convert/audio`,
    `${siteUrl}/convert/media`,
    `${siteUrl}/convert/unit`,
    `${siteUrl}/convert/currency`,
    `${siteUrl}/convert/developer`,
    `${siteUrl}/convert/hardware`,
  ];

  // Category pages
  CATEGORIES.forEach((cat) => {
    urls.push(`${siteUrl}/convert/${cat.slug}`);
  });

  // Tool pages
  ALL_TOOLS.forEach((tool) => {
    urls.push(`${siteUrl}/convert/${tool.categorySlug}/${tool.slug}`);
  });

  // Guides
  GUIDES.forEach((guide) => {
    urls.push(`${siteUrl}/guides/${guide.slug}`);
  });

  const uniqueUrls = Array.from(new Set(urls));
  console.log(`[DISCOVERY] Discovered ${uniqueUrls.length} canonical URLs across site.`);

  // 2. Submit to IndexNow
  console.log('\n[INDEXNOW] Submitting URL batch to Bing, Yandex, and IndexNow...');
  try {
    const indexNowResults = await submitToIndexNow(uniqueUrls, {
      host: siteUrl.replace(/^https?:\/\//, ''),
      key: process.env.INDEXNOW_KEY || 'apextools2026indexnowkey8832a4',
    });

    indexNowResults.forEach((res) => {
      if (res.ok) {
        console.log(`  ✅ [${res.endpoint}] HTTP ${res.status}: ${res.message}`);
      } else {
        console.log(`  ⚠️ [${res.endpoint}] HTTP ${res.status}: ${res.message}`);
      }
    });
  } catch (err: any) {
    console.error('  ❌ IndexNow error:', err?.message || err);
  }

  // 3. Ping Google & Bing Sitemap
  const sitemapUrl = `${siteUrl}/sitemap.xml`;
  console.log(`\n[SITEMAP] Pinging sitemap (${sitemapUrl}) to Google & Bing...`);
  try {
    const pingResults = await pingSearchEngines(sitemapUrl);
    pingResults.forEach((res) => {
      console.log(`  ${res.ok ? '✅' : 'ℹ️'} [${res.engine}] Status: ${res.status || 'Sent'}`);
    });
  } catch (err: any) {
    console.error('  ❌ Sitemap ping error:', err?.message || err);
  }

  console.log('\n✨ Automated Search Engine Ping Complete!\n');
}

main().catch((err) => {
  console.error('Fatal error in ping-search-engines:', err);
  process.exit(1);
});
