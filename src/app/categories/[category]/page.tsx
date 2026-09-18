import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { CATEGORIES, getCategoryBySlug } from '@/config/categories';
import { siteConfig } from '@/config/site';
import CategoryPage, { generateMetadata as baseGenerateMetadata } from '@/app/convert/[category]/page';

interface CategoryAliasProps {
  params: {
    category: string;
  };
}

export async function generateStaticParams() {
  return CATEGORIES.map((category) => ({
    category: category.slug,
  }));
}

export async function generateMetadata({ params }: CategoryAliasProps): Promise<Metadata> {
  const category = getCategoryBySlug(params.category);
  if (!category) return {};

  const baseMeta = await baseGenerateMetadata({ params });
  return {
    ...baseMeta,
    alternates: {
      canonical: `${siteConfig.url}/convert/${category.slug}`,
    },
  };
}

export default function CategoryAliasPage({ params }: CategoryAliasProps) {
  const category = getCategoryBySlug(params.category);
  if (!category) {
    notFound();
  }

  return <CategoryPage params={params} />;
}
