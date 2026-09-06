import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  UNIT_CATEGORIES,
  UnitCategory,
  UnitDefinition,
  generateConversionTableData,
  parseUnitPairSlug,
} from '@/components/converters/unit/unit-definitions';
import { ToolLayout } from '@/components/layout/ToolLayout';
import { UnitConverterCore } from '@/components/converters/unit/UnitConverterCore';
import { generateToolMetadata } from '@/lib/seo/metadata';

interface UnitPairPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const params: { slug: string }[] = [];
  Object.values(UNIT_CATEGORIES).forEach((category) => {
    category.popularPairs.forEach(([from, to]) => {
      params.push({ slug: `${from}-to-${to}` });
    });
  });
  return params;
}

export async function generateMetadata({ params }: UnitPairPageProps): Promise<Metadata> {
  const parsed = parseUnitPairSlug(params.slug);
  if (!parsed) return {};

  const { category, fromUnit, toUnit } = parsed;
  const toolName = `${fromUnit.name} to ${toUnit.name} Converter`;
  const description = `Convert ${fromUnit.plural} to ${toUnit.plural} (${fromUnit.symbol} to ${toUnit.symbol}) instantly for free. Accurate SI conversion formula, step-by-step arithmetic, and full lookup table.`;

  return generateToolMetadata({
    title: `Convert ${fromUnit.name} to ${toUnit.name} Free Online`,
    description,
    category: category.title,
    slug: params.slug,
    categorySlug: 'unit',
    keywords: [
      `${fromUnit.id} to ${toUnit.id}`,
      `convert ${fromUnit.name.toLowerCase()} to ${toUnit.name.toLowerCase()}`,
      `${fromUnit.symbol} to ${toUnit.symbol}`,
      `${fromUnit.name} to ${toUnit.name} formula`,
      `${fromUnit.name} to ${toUnit.name} table`,
      `${category.title} converter`,
    ],
  });
}

export default function UnitPairPage({ params }: UnitPairPageProps) {
  const parsed = parseUnitPairSlug(params.slug);
  if (!parsed) notFound();

  const { category, fromUnit, toUnit } = parsed;
  const toolName = `${fromUnit.name} to ${toUnit.name} Converter`;
  const description = `Accurate, zero-latency online conversion tool for calculating ${toUnit.plural} from ${fromUnit.plural} (${fromUnit.symbol} to ${toUnit.symbol}).`;

  // Pre-calculated lookup table for standard values 1 to 1000
  const conversionTable = generateConversionTableData(category, fromUnit.id, toUnit.id, [
    1, 2, 3, 5, 10, 15, 20, 25, 50, 75, 100, 250, 500, 1000,
  ]);

  const formulaInfo = category.formulaTemplate(fromUnit.name, toUnit.name);

  const howToSteps = [
    {
      title: `Enter Value in ${fromUnit.plural}`,
      description: `Type the numerical amount of ${fromUnit.plural.toLowerCase()} you wish to convert into the input field above.`,
      tip: 'Supports decimal numbers and scientific notation.',
    },
    {
      title: 'Review Calculation Parameters',
      description: `Adjust decimal precision (2 to 8 decimals) or switch to exponential scientific format if calculating microscopic or astronomical quantities.`,
    },
    {
      title: `Get Instant ${toUnit.plural} Result`,
      description: `The calculated value in ${toUnit.plural.toLowerCase()} updates automatically with 100% mathematical precision. Click the Copy button to paste anywhere.`,
    },
  ];

  const faqs = [
    {
      question: `How do I convert ${fromUnit.plural} to ${toUnit.plural}?`,
      answer: `To convert from ${fromUnit.name} to ${toUnit.name}, multiply the value by the SI standard conversion ratio. For example, ${formulaInfo.example}`,
    },
    {
      question: `What is the exact formula for ${fromUnit.name} to ${toUnit.name}?`,
      answer: `The formula is: ${formulaInfo.expression}. Our calculator applies this formula with 64-bit floating point precision.`,
    },
    {
      question: `Is this ${fromUnit.symbol} to ${toUnit.symbol} converter free?`,
      answer: `Yes, ApexTools unit converters are 100% free with no registration, no file limits, and instant browser-based computation.`,
    },
    {
      question: `Can I reverse this calculation from ${toUnit.name} to ${fromUnit.name}?`,
      answer: `Yes! Click the swap icon on the calculator or use the direct reverse link below to calculate ${toUnit.name} to ${fromUnit.name}.`,
    },
  ];

  const reverseTool = category.units[`${toUnit.id}`]
    ? {
        name: `${toUnit.name} to ${fromUnit.name}`,
        url: `/unit/${toUnit.id}-to-${fromUnit.id}`,
      }
    : undefined;

  const relatedTools = category.popularPairs
    .filter(([f, t]) => !(f === fromUnit.id && t === toUnit.id))
    .slice(0, 4)
    .map(([f, t]) => {
      const fU = category.units[f];
      const tU = category.units[t];
      return {
        id: `${f}-to-${t}`,
        name: `${fU?.name || f} to ${tU?.name || t}`,
        slug: `${f}-to-${t}`,
        categorySlug: 'unit',
        categoryName: category.title,
        description: `Convert ${fU?.plural || f} to ${tU?.plural || t} online.`,
        iconName: 'Ruler',
      };
    });

  return (
    <ToolLayout
      toolName={toolName}
      category={category.title}
      categorySlug="unit"
      slug={params.slug}
      description={description}
      badgeText="⚡ Instant SI Unit Calculation"
      howToSteps={howToSteps}
      formula={formulaInfo}
      conversionTable={conversionTable}
      faqs={faqs}
      relatedTools={relatedTools}
      reverseTool={reverseTool}
    >
      <UnitConverterCore
        defaultCategoryId={category.id}
        defaultFromUnit={fromUnit.id}
        defaultToUnit={toUnit.id}
        showCategorySelector={true}
        showQuickTable={false}
      />
    </ToolLayout>
  );
}
