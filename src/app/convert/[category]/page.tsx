import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { CATEGORIES, ALL_TOOLS, getCategoryBySlug } from '@/config/categories';
import { siteConfig } from '@/config/site';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { AdSlot } from '@/components/ads/AdSlot';
import {
  ArrowUpRight,
  Sparkles,
  Building,
  FileText,
  Image as ImageIcon,
  Video,
  Ruler,
  DollarSign,
  Code,
  Clock,
  Palette,
  Archive,
} from 'lucide-react';
import ToolPage, { generateMetadata as generateToolMetadata } from './[tool]/page';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

const ICON_MAP: Record<string, any> = {
  Building,
  Building2: Building,
  Coins: DollarSign,
  Scale: Ruler,
  Moon: Sparkles,
  FileText,
  FileEdit: FileText,
  Table: FileText,
  Images: ImageIcon,
  Image: ImageIcon,
  Layers: FileText,
  Minimize2: FileText,
  Smartphone: ImageIcon,
  FileImage: ImageIcon,
  Sliders: ImageIcon,
  Maximize: ImageIcon,
  Music: Video,
  Film: Video,
  Video,
  Minimize: Video,
  Volume2: Video,
  Ruler,
  Thermometer: Ruler,
  Maximize2: Ruler,
  Gauge: Ruler,
  HardDrive: Ruler,
  DollarSign,
  CreditCard: DollarSign,
  Code,
  FileSpreadsheet: Code,
  Binary: Code,
  CheckCircle2: Code,
  Link: Code,
  Clock,
  Calendar: Clock,
  Palette,
  Printer: Palette,
  Archive,
};

export async function generateStaticParams() {
  const categoryParams = CATEGORIES.map((category) => ({
    category: category.slug,
  }));

  const toolParams = ALL_TOOLS.map((tool) => ({
    category: tool.slug,
  }));

  return [...categoryParams, ...toolParams];
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = getCategoryBySlug(params.category);
  if (!category) {
    const directTool = ALL_TOOLS.find((t) => t.slug === params.category);
    if (directTool) {
      return generateToolMetadata({
        params: { category: directTool.categorySlug, tool: directTool.slug },
      });
    }
    return {};
  }

  const title = `${category.name} — Free Online Converters`;
  const description = `Explore free online ${category.name} tools on ConvertHub. ${category.description}`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/convert/${category.slug}`,
    },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url: `${siteConfig.url}/convert/${category.slug}`,
    },
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = getCategoryBySlug(params.category);
  if (!category) {
    const directTool = ALL_TOOLS.find((t) => t.slug === params.category);
    if (directTool) {
      return <ToolPage params={{ category: directTool.categorySlug, tool: directTool.slug }} />;
    }
    notFound();
  }

  const breadcrumbs = [
    { name: 'Home', url: siteConfig.url },
    { name: 'Categories', url: `${siteConfig.url}/#categories` },
    { name: category.name, url: `${siteConfig.url}/convert/${category.slug}` },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 1. Header Leaderboard Ad */}
      <AdSlot placement="header_leaderboard" />

      {/* 2. Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* 3. Category Header */}
      <div className="my-8">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md"
            style={{ backgroundColor: category.color }}
          >
            {category.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              {category.name}
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Tools Grid */}
      <div className="my-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {category.tools.map((tool) => {
          const IconComponent = ICON_MAP[tool.iconName] || FileText;

          return (
            <Link
              key={tool.id}
              href={`/convert/${tool.categorySlug}/${tool.slug}`}
              className="group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg dark:border-slate-800/80 dark:bg-slate-900/50 dark:hover:border-indigo-800"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-indigo-950 dark:group-hover:text-indigo-400">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  {tool.badge && (
                    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                      {tool.badge}
                    </span>
                  )}
                  {tool.pakistanSpecific && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      🇵🇰 Pakistan
                    </span>
                  )}
                </div>

                <h2 className="mt-4 text-base font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                  {tool.name}
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {tool.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-medium text-indigo-600 dark:border-slate-800/60 dark:text-indigo-400">
                <span>Free & Instant</span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* 5. In-Content Native Ad */}
      <AdSlot placement="in_content_native" />
    </div>
  );
}
