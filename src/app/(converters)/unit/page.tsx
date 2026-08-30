import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { UNIT_CATEGORIES } from '@/components/converters/unit/unit-definitions';
import { UnitConverterCore } from '@/components/converters/unit/UnitConverterCore';
import { ToolLayout } from '@/components/layout/ToolLayout';
import { generateToolMetadata } from '@/lib/seo/metadata';
import { Ruler, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = generateToolMetadata({
  title: 'All-in-One Unit Converter — 13 Physical Categories',
  description: 'Free online multi-category unit converter. Convert Length, Weight, Temperature, Area, Volume, Speed, Time, Pressure, Energy, Power, Data, Angle, and Fuel Economy.',
  category: 'Unit Converters',
  slug: 'all-units',
  categorySlug: 'unit',
  keywords: [
    'unit converter',
    'online unit converter',
    'metric to imperial',
    'length converter',
    'weight converter',
    'temperature converter',
    'free unit calculator',
  ],
});

export default function MasterUnitHubPage() {
  const howToSteps = [
    {
      title: 'Select Category & Measurement Units',
      description: 'Choose from 13 physical categories (Length, Weight, Temperature, Area, Volume, Speed, etc.) and select your source and target units.',
    },
    {
      title: 'Enter Amount',
      description: 'Type any numerical value into the input field. The calculator handles decimals and scientific exponents instantly.',
    },
    {
      title: 'Copy or Swap Values',
      description: 'View the live converted result with exact SI precision. Use the swap button to invert the conversion or copy with one click.',
    },
  ];

  const faqs = [
    {
      question: 'How many unit categories does ConvertHub support?',
      answer: 'ConvertHub supports 13 comprehensive physical measurement categories containing over 70 standardized SI, metric, imperial, and astronomical units.',
    },
    {
      question: 'Are the unit conversions mathematically exact?',
      answer: 'Yes! All unit definitions and conversion ratios are based on international BIPM and NIST standard SI definitions with 64-bit precision.',
    },
    {
      question: 'Can I use this unit converter offline on mobile?',
      answer: 'Yes! ConvertHub runs 100% client-side in your web browser with zero server latency and works seamlessly on mobile devices.',
    },
  ];

  const relatedTools = [
    {
      id: 'marla-to-square-feet',
      name: 'Marla to Square Feet',
      slug: 'marla-to-square-feet',
      categorySlug: 'unit',
      categoryName: 'Unit Converters',
      description: 'Convert real estate land units (Marla, Kanal, Square Feet).',
      iconName: 'Building',
    },
    {
      id: 'data-storage-converter',
      name: 'Data Storage Converter',
      slug: 'data-storage-converter',
      categorySlug: 'unit',
      categoryName: 'Unit Converters',
      description: 'Convert Bytes, KB, MB, GB, TB, and binary units.',
      iconName: 'HardDrive',
    },
  ];

  return (
    <ToolLayout
      toolName="Master Multi-Unit Converter"
      category="Unit Converters"
      categorySlug="unit"
      slug="master-hub"
      description="Convert between metric, imperial, SI, and international units across 13 measurement categories with zero latency."
      badgeText="13 Physical Categories • 70+ Units"
      howToSteps={howToSteps}
      faqs={faqs}
      relatedTools={relatedTools}
    >
      <div className="space-y-10">
        {/* Interactive Master Converter Core */}
        <UnitConverterCore showCategorySelector={true} showQuickTable={true} />

        {/* 13 Categories Matrix Grid */}
        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Explore All 13 Unit Categories & Exact-Match Pairs
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any high-volume exact unit pair for dedicated formulas and pre-calculated matrices.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.values(UNIT_CATEGORIES).map((cat) => (
              <div
                key={cat.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-indigo-800"
              >
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {cat.title}
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {cat.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {cat.popularPairs.slice(0, 4).map(([from, to]) => {
                    const fU = cat.units[from];
                    const tU = cat.units[to];
                    return (
                      <Link
                        key={`${from}-to-${to}`}
                        href={`/unit/${from}-to-${to}`}
                        className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300"
                      >
                        {fU?.symbol || from} → {tU?.symbol || to}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
