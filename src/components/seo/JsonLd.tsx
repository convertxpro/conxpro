import React from 'react';
import { FaqItem } from '@/components/layout/FAQAccordion';
import { HowToStep } from '@/components/layout/HowToGuide';
import { siteConfig } from '@/config/site';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface ArticleSchemaData {
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  image?: string;
}

export interface DefinedTermData {
  name: string;
  description: string;
  termSet?: string;
}

export interface ItemListData {
  name: string;
  description: string;
  items: { name: string; url: string }[];
}

export interface JsonLdProps {
  toolName?: string;
  url: string;
  description: string;
  category?: string;
  faqs?: FaqItem[];
  howToSteps?: HowToStep[];
  breadcrumbs?: BreadcrumbItem[];
  financialProduct?: {
    name: string;
    description: string;
    baseCurrency?: string;
    targetCurrency?: string;
    currentRate?: number;
  };
  article?: ArticleSchemaData;
  /** Speakable CSS selectors for AEO voice assistant targeting */
  speakableSelectors?: string[];
  /** DefinedTerm schema for unit/format definitions (AEO) */
  definedTerms?: DefinedTermData[];
  /** ItemList schema for category hub pages */
  itemList?: ItemListData;
}

export const JsonLd: React.FC<JsonLdProps> = ({
  toolName,
  url,
  description,
  category = 'UtilitiesApplication',
  faqs = [],
  howToSteps = [],
  breadcrumbs = [],
  financialProduct,
  article,
  speakableSelectors,
  definedTerms = [],
  itemList,
}) => {
  const schemaList: Record<string, any>[] = [];

  // 1. WebApplication / SoftwareApplication Schema (Enhanced)
  if (toolName) {
    schemaList.push({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: toolName,
      url,
      description,
      applicationCategory: category,
      applicationSubCategory: category,
      operatingSystem: 'Web Browser (Chrome, Firefox, Safari, Edge)',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      featureList: [
        'Free unlimited conversions',
        'No registration required',
        'Bank-grade privacy with auto-purge',
        'Works on mobile and desktop',
        'Client-side processing for instant results',
      ],
      screenshot: `${siteConfig.url}/og?title=${encodeURIComponent(toolName)}&category=${encodeURIComponent(category)}`,
      softwareVersion: '2.0',
      creator: {
        '@type': 'Organization',
        name: siteConfig.name,
        url: siteConfig.url,
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '1250',
        bestRating: '5',
        worstRating: '1',
      },
    });
  }

  // 1.1 Article / TechArticle Schema (for Guides)
  if (article) {
    schemaList.push({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.headline,
      description: article.description,
      url,
      datePublished: article.datePublished,
      dateModified: article.dateModified || article.datePublished,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url,
      },
      author: {
        '@type': 'Person',
        name: article.authorName || `${siteConfig.name} Technical Editorial Team`,
        url: siteConfig.url,
      },
      publisher: {
        '@type': 'Organization',
        name: siteConfig.name,
        logo: {
          '@type': 'ImageObject',
          url: `${siteConfig.url}/icons/icon-512x512.png`,
        },
      },
      image: article.image || `${siteConfig.url}/og?title=${encodeURIComponent(article.headline)}&category=Guide`,
    });
  }

  // 1.2 Optional FinancialProduct Schema
  if (financialProduct) {
    schemaList.push({
      '@context': 'https://schema.org',
      '@type': 'FinancialProduct',
      name: financialProduct.name,
      description: financialProduct.description,
      feesAndCommissionsSpecification: 'Zero fee on bank remittances over $100 via State Bank of Pakistan PRI',
      provider: {
        '@type': 'Organization',
        name: `${siteConfig.name} Forex Engine`,
        url: siteConfig.url,
      },
      ...(financialProduct.baseCurrency && financialProduct.targetCurrency
        ? {
            currency: financialProduct.baseCurrency,
            priceCurrency: financialProduct.targetCurrency,
          }
        : {}),
    });
  }

  // 2. BreadcrumbList Schema
  if (breadcrumbs.length > 0) {
    schemaList.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    });
  }

  // 3. FAQPage Schema
  if (faqs.length > 0) {
    schemaList.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });
  }

  // 4. HowTo Schema
  if (howToSteps.length > 0 && toolName) {
    schemaList.push({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: `How to Convert with ${toolName}`,
      description: `Step-by-step instructions on converting with ${toolName} on ${siteConfig.name}.`,
      step: howToSteps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: step.title,
        text: step.description,
        url: `${url}#step-${index + 1}`,
      })),
    });
  }

  // 5. Speakable Schema (AEO — Voice Assistant Targeting)
  if (speakableSelectors && speakableSelectors.length > 0) {
    schemaList.push({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: toolName || siteConfig.name,
      url,
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: speakableSelectors,
      },
    });
  }

  // 6. DefinedTerm Schema (AEO — Unit/Format Definitions for Knowledge Graph)
  if (definedTerms.length > 0) {
    definedTerms.forEach((term) => {
      schemaList.push({
        '@context': 'https://schema.org',
        '@type': 'DefinedTerm',
        name: term.name,
        description: term.description,
        ...(term.termSet
          ? {
              inDefinedTermSet: {
                '@type': 'DefinedTermSet',
                name: term.termSet,
              },
            }
          : {}),
      });
    });
  }

  // 7. ItemList Schema (Category Hub Pages — Rich List Results)
  if (itemList) {
    schemaList.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: itemList.name,
      description: itemList.description,
      numberOfItems: itemList.items.length,
      itemListElement: itemList.items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: item.url,
      })),
    });
  }

  return (
    <>
      {schemaList.map((schema, idx) => (
        <script
          key={`schema-${idx}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
};

