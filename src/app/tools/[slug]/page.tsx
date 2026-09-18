import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ALL_TOOLS } from '@/config/categories';
import { getToolSeoData } from '@/config/tool-seo-registry';
import { generateToolMetadataFromData } from '@/lib/seo/metadata';
import { ToolLayout } from '@/components/layout/ToolLayout';
import { ConverterCanvas } from '@/components/converters/ConverterCanvas';
import { siteConfig } from '@/config/site';

interface DirectToolPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return ALL_TOOLS.map((tool) => ({
    slug: tool.slug,
  }));
}

export async function generateMetadata({ params }: DirectToolPageProps): Promise<Metadata> {
  const tool = ALL_TOOLS.find((t) => t.slug === params.slug);
  if (!tool) return {};

  const seoData = getToolSeoData(tool);
  const metadata = generateToolMetadataFromData(seoData);

  // Set canonical URL to primary route to prevent duplicate content indexing
  return {
    ...metadata,
    alternates: {
      canonical: `${siteConfig.url}/convert/${tool.categorySlug}/${tool.slug}`,
    },
  };
}

export default function DirectToolPage({ params }: DirectToolPageProps) {
  const tool = ALL_TOOLS.find((t) => t.slug === params.slug);
  if (!tool) {
    notFound();
  }

  const seoData = getToolSeoData(tool);

  const isCurrency =
    tool.categorySlug === 'currency' ||
    tool.slug.includes('-to-pkr') ||
    tool.slug === 'currency-converter';

  let financialProduct: any = undefined;
  if (isCurrency) {
    const fromCurr = tool.slug.includes('-to-') ? tool.slug.split('-to-')[0].toUpperCase() : 'USD';
    const toCurr = tool.slug.includes('-to-') ? tool.slug.split('-to-')[1].toUpperCase() : 'PKR';
    financialProduct = {
      name: `${tool.name} Live Forex & Remittance Rates`,
      description: tool.description,
      baseCurrency: fromCurr,
      targetCurrency: toCurr,
    };
  }

  return (
    <ToolLayout
      toolName={seoData.name}
      category={seoData.categoryName}
      categorySlug={seoData.categorySlug}
      slug={seoData.slug}
      description={seoData.description}
      badgeText={seoData.badge || (isCurrency ? '⚡ Live Forex Hourly' : 'Free & Instant')}
      howToSteps={seoData.howToSteps}
      formula={seoData.formula}
      conversionTable={seoData.conversionTable}
      faqs={seoData.faqs}
      relatedTools={seoData.relatedTools}
      reverseTool={seoData.reverseTool}
      financialProduct={financialProduct}
      dap={seoData.directAnswer}
      lastUpdated={seoData.lastUpdated}
    >
      <ConverterCanvas tool={tool} />
    </ToolLayout>
  );
}
