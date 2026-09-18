import { CATEGORIES, ALL_TOOLS } from '../src/config/categories';
import { getAllToolsSeoData, getToolSeoData } from '../src/config/tool-seo-registry';
import { generateToolMetadataFromData } from '../src/lib/seo/metadata';
import {
  generateSoftwareApplicationSchema,
  generateFAQSchema,
  generateBreadcrumbSchema,
  generateHowToSchema,
} from '../src/components/seo/JsonLd';
import sitemap from '../src/app/sitemap';
import robots from '../src/app/robots';

async function runSeoValidation() {
  console.log('====================================================');
  console.log('🧪 RUNNING APEXTOOLS TECHNICAL SEO & AEO TEST SUITE');
  console.log('====================================================\n');

  let errorCount = 0;
  let warningCount = 0;

  // 1. Categories Validation
  console.log(`Checking ${CATEGORIES.length} Categories...`);
  const seenCatSlugs = new Set<string>();
  for (const cat of CATEGORIES) {
    if (seenCatSlugs.has(cat.slug)) {
      console.error(`❌ Duplicate category slug: ${cat.slug}`);
      errorCount++;
    }
    seenCatSlugs.add(cat.slug);

    if (!cat.name || !cat.description || cat.tools.length === 0) {
      console.error(`❌ Category ${cat.slug} missing name, description, or tools`);
      errorCount++;
    }
  }
  console.log(`✅ Category Slugs Verified: ${seenCatSlugs.size} unique categories.\n`);

  // 2. Tools & AEO Validation
  console.log(`Auditing ${ALL_TOOLS.length} Tools for SEO + AEO Completeness...`);
  const allSeoData = getAllToolsSeoData();
  const seenTitles = new Map<string, string>();
  const seenToolSlugs = new Set<string>();

  for (const tool of allSeoData) {
    if (seenToolSlugs.has(tool.slug)) {
      console.error(`❌ Duplicate tool slug: ${tool.slug}`);
      errorCount++;
    }
    seenToolSlugs.add(tool.slug);

    // Title Tag
    if (!tool.seoTitle || tool.seoTitle.length < 15) {
      console.error(`❌ Tool ${tool.slug} has invalid title: "${tool.seoTitle}"`);
      errorCount++;
    }
    if (seenTitles.has(tool.seoTitle)) {
      console.warn(`⚠️ Duplicate SEO title between "${tool.slug}" and "${seenTitles.get(tool.seoTitle)}"`);
      warningCount++;
    } else {
      seenTitles.set(tool.seoTitle, tool.slug);
    }

    // Meta Description
    if (!tool.metaDescription || tool.metaDescription.length < 50) {
      console.error(`❌ Tool ${tool.slug} has thin meta description: "${tool.metaDescription}"`);
      errorCount++;
    }

    // Direct Answer (AEO)
    if (!tool.directAnswer || tool.directAnswer.length < 30) {
      console.error(`❌ Tool ${tool.slug} missing AEO Direct Answer paragraph`);
      errorCount++;
    }

    // FAQs (AEO)
    if (!tool.faqs || tool.faqs.length < 2) {
      console.warn(`⚠️ Tool ${tool.slug} has fewer than 2 FAQs`);
      warningCount++;
    }

    // Related Tools Internal Links
    if (!tool.relatedTools || tool.relatedTools.length < 1) {
      console.warn(`⚠️ Tool ${tool.slug} has no related tools linked`);
      warningCount++;
    }

    // Schema.org Structured Data
    const softSchema = generateSoftwareApplicationSchema({
      toolName: tool.name,
      url: `https://apextools.app/convert/${tool.categorySlug}/${tool.slug}`,
      description: tool.description,
      category: tool.categoryName,
    });

    if (!softSchema['@type'] || softSchema['@type'] !== 'SoftwareApplication') {
      console.error(`❌ Tool ${tool.slug} generated invalid SoftwareApplication schema`);
      errorCount++;
    }

    // Verify absence of fake aggregateRating (Black-Hat Check)
    if ((softSchema as any).aggregateRating) {
      console.error(`❌ Tool ${tool.slug} schema contains forbidden fake aggregateRating!`);
      errorCount++;
    }

    // FAQ Schema validation
    if (tool.faqs.length > 0) {
      const faqSchema = generateFAQSchema(tool.faqs);
      if (faqSchema['@type'] !== 'FAQPage' || !Array.isArray(faqSchema.mainEntity)) {
        console.error(`❌ Tool ${tool.slug} generated invalid FAQPage schema`);
        errorCount++;
      }
    }
  }

  console.log(`✅ Audited ${allSeoData.length} Tools: 100% have valid Direct Answers, Descriptions, and Clean Schemas.\n`);

  // 3. Sitemap Validation
  console.log('Auditing XML Sitemap...');
  const sitemapEntries = sitemap();
  console.log(`Total Sitemap URLs generated: ${sitemapEntries.length}`);

  const seenUrls = new Set<string>();
  for (const entry of sitemapEntries) {
    if (!entry.url || !entry.url.startsWith('https://apextools.app')) {
      console.error(`❌ Invalid sitemap URL: ${entry.url}`);
      errorCount++;
    }
    if (seenUrls.has(entry.url)) {
      console.error(`❌ Duplicate sitemap URL: ${entry.url}`);
      errorCount++;
    }
    seenUrls.add(entry.url);
  }

  // Check essential static URLs in sitemap
  const essentialUrls = [
    'https://apextools.app',
    'https://apextools.app/tools',
    'https://apextools.app/about',
    'https://apextools.app/how-we-calculate',
    'https://apextools.app/privacy',
    'https://apextools.app/terms',
    'https://apextools.app/contact',
  ];

  for (const url of essentialUrls) {
    if (!seenUrls.has(url)) {
      console.error(`❌ Missing essential page in sitemap: ${url}`);
      errorCount++;
    }
  }
  console.log(`✅ Sitemap verified: ${seenUrls.size} distinct crawlable routes.\n`);

  // 4. Robots.txt Validation
  console.log('Auditing Robots.txt...');
  const robotsConfig = robots();
  if (!robotsConfig.sitemap || !robotsConfig.sitemap.includes('sitemap.xml')) {
    console.error('❌ robots.txt missing sitemap reference');
    errorCount++;
  }
  console.log('✅ Robots.txt verified.\n');

  // Summary
  console.log('====================================================');
  console.log(`TEST RESULTS: Errors: ${errorCount}, Warnings: ${warningCount}`);
  console.log('====================================================');

  if (errorCount > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL TECHNICAL SEO & AEO CHECKS PASSED SUCCESSFULLY!');
  }
}

runSeoValidation().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
