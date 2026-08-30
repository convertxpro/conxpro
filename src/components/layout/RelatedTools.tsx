import React from 'react';
import Link from 'next/link';
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
  Presentation,
  Scissors,
  RotateCw,
  Lock,
  Unlock,
  FolderArchive,
} from 'lucide-react';
import { ToolMetadata } from '@/config/categories';
import { cn } from '@/lib/utils';

export interface RelatedToolItem {
  name: string;
  url: string;
  description?: string;
  category?: string;
  badge?: string;
  iconName?: string;
}

export interface RelatedToolsProps {
  tools: (RelatedToolItem | ToolMetadata)[];
  className?: string;
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
  Presentation,
  Images: ImageIcon,
  Image: ImageIcon,
  Layers: FileText,
  Scissors,
  Minimize2: FileText,
  RotateCw,
  Lock,
  Unlock,
  FolderArchive,
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

export const RelatedTools: React.FC<RelatedToolsProps> = ({ tools, className }) => {
  return (
    <div className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {tools.map((tool, idx) => {
        const isToolMetadata = 'slug' in tool;
        const name = tool.name;
        const url = isToolMetadata
          ? `/convert/${(tool as ToolMetadata).categorySlug}/${(tool as ToolMetadata).slug}`
          : (tool as RelatedToolItem).url;
        const description = tool.description || 'Quick and free online conversion tool';
        const badge = tool.badge || (isToolMetadata && (tool as ToolMetadata).pakistanSpecific ? '🇵🇰 Pakistan' : undefined);
        const iconName = tool.iconName || 'FileText';
        const IconComponent = ICON_MAP[iconName] || FileText;

        return (
          <Link
            key={`related-${idx}`}
            href={url}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/40 dark:hover:border-indigo-800"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-indigo-950 dark:group-hover:text-indigo-400">
                  <IconComponent className="h-4 w-4" />
                </div>
                {badge && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {badge}
                  </span>
                )}
              </div>

              <h4 className="mt-3 text-sm font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                {name}
              </h4>

              <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                {description}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-end text-xs font-medium text-indigo-600 dark:text-indigo-400">
              <span className="inline-flex items-center gap-1 group-hover:underline">
                Convert Now <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
