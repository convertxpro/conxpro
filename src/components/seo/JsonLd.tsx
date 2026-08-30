import React from 'react';
import { FaqItem } from '@/components/layout/FAQAccordion';
import { HowToStep } from '@/components/layout/HowToGuide';

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
}) => {
  const schemaList: Record<string, any>[] = [];

  // 1. WebApplication / SoftwareApplication Schema
  if (toolName) {
    schemaList.push({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: toolName,
      url,
      description,
      applicationCategory: category,
      operatingSystem: 'All',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      creator: {
        '@type': 'Organization',
        name: 'ConvertHub',
        url: 'https://converthub.com',
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
        name: article.authorName || 'ConvertHub Technical Editorial Team',
        url: 'https://converthub.com',
      },
      publisher: {
        '@type': 'Organization',
        name: 'ConvertHub',
        logo: {
          '@type': 'ImageObject',
          url: 'https://converthub.com/favicon.ico',
        },
      },
      image: article.image || `https://converthub.com/og?title=${encodeURIComponent(article.headline)}&category=Guide`,
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
        name: 'ConvertHub Forex Engine',
        url: 'https://converthub.com',
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
      description: `Step-by-step instructions on converting with ${toolName} on ConvertHub.`,
      step: howToSteps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: step.title,
        text: step.description,
        url: `${url}#step-${index + 1}`,
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
