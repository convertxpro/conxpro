'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  ArrowRight,
  CornerDownLeft,
  Sparkles,
  Building,
  Building2,
  FileText,
  FileEdit,
  Image as ImageIcon,
  Video,
  Ruler,
  DollarSign,
  Coins,
  Scale,
  Moon,
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
  Table,
  Sliders,
  Maximize,
  Maximize2,
  Music,
  Film,
  Volume2,
  Thermometer,
  Gauge,
  HardDrive,
  CreditCard,
  FileSpreadsheet,
  Binary,
  CheckCircle2,
  Link as LinkIcon,
  Calendar,
  Printer,
  Receipt,
  HeartHandshake,
  MapPin,
  Zap,
  Flame,
  FileCode2,
  FileCode,
  Settings,
  Database,
  DatabaseBackup,
  KeyRound,
  ShieldCheck,
  LayoutGrid,
  QrCode,
  Subtitles,
  Layers,
  Smartphone,
  FileImage,
} from 'lucide-react';
import { ALL_TOOLS, CATEGORIES, ToolMetadata } from '@/config/categories';
import { cn } from '@/lib/utils';

export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICON_MAP: Record<string, any> = {
  Building,
  Building2,
  Coins,
  Scale,
  Moon,
  FileText,
  FileEdit,
  Table,
  Presentation,
  Images: ImageIcon,
  Image: ImageIcon,
  Layers,
  Scissors,
  Minimize2: FileText,
  RotateCw,
  Lock,
  Unlock,
  FolderArchive,
  Smartphone,
  FileImage,
  Sliders,
  Maximize,
  Music,
  Film,
  Video,
  Minimize: Video,
  Volume2,
  Ruler,
  Thermometer,
  Maximize2,
  Gauge,
  HardDrive,
  DollarSign,
  CreditCard,
  Code,
  FileSpreadsheet,
  Binary,
  CheckCircle2,
  Link: LinkIcon,
  Clock,
  Calendar,
  Palette,
  Printer,
  Archive,
  Receipt,
  HeartHandshake,
  MapPin,
  Zap,
  Flame,
  FileCode2,
  FileCode,
  Settings,
  Database,
  DatabaseBackup,
  KeyRound,
  ShieldCheck,
  LayoutGrid,
  QrCode,
  Subtitles,
  Sparkles,
};

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter tools based on query
  const filteredTools = React.useMemo(() => {
    if (!query.trim()) {
      return ALL_TOOLS.filter((t) => t.popular).slice(0, 8);
    }
    const q = query.toLowerCase().trim();
    return ALL_TOOLS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.categoryName.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [query]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard navigation inside modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredTools.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? Math.max(0, filteredTools.length - 1) : prev - 1
        );
      } else if (e.key === 'Enter' && filteredTools[selectedIndex]) {
        e.preventDefault();
        const selected = filteredTools[selectedIndex];
        router.push(`/convert/${selected.categorySlug}/${selected.slug}`);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredTools, selectedIndex, router, onClose]);

  if (!isOpen) return null;

  const handleSelectTool = (tool: ToolMetadata) => {
    router.push(`/convert/${tool.categorySlug}/${tool.slug}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-slate-200 px-4 py-3.5 dark:border-slate-800">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search 50+ converters (e.g. Marla, PDF to Word, HEIC, USD to PKR)..."
            className="flex-1 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="mr-2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 sm:inline-block dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Popular Quick Pills */}
        {!query && (
          <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-2.5 dark:border-slate-800/50 dark:bg-slate-900/40">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Trending Quick Searches:
            </span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {[
                'Marla to SqFt',
                'PDF to Word',
                'HEIC to JPG',
                'USD to PKR',
                'Tola to Gram',
                'JSON to CSV',
              ].map((pill) => (
                <button
                  key={pill}
                  onClick={() => setQuery(pill)}
                  className="rounded-lg border border-slate-200/60 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredTools.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              <p>No converters found matching &quot;{query}&quot;</p>
              <p className="mt-1 text-xs text-slate-400">
                Try searching for a category like &quot;Document&quot;, &quot;Unit&quot;, or &quot;Pakistan&quot;
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {query ? 'Search Results' : 'Popular Converters'}
              </div>
              {filteredTools.map((tool, idx) => {
                const isSelected = idx === selectedIndex;
                const IconComponent = ICON_MAP[tool.iconName] || FileText;

                return (
                  <div
                    key={tool.id}
                    onClick={() => handleSelectTool(tool)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      'flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors cursor-pointer',
                      isSelected
                        ? 'bg-indigo-50 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-100'
                        : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50'
                    )}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        )}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{tool.name}</span>
                          {tool.badge && (
                            <span className="shrink-0 rounded-full bg-indigo-100 px-1.5 py-0.2 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                              {tool.badge}
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                          {tool.categoryName} • {tool.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400">
                      {isSelected ? (
                        <span className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                          <span>Open</span>
                          <CornerDownLeft className="h-3 w-3" />
                        </span>
                      ) : (
                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer Keybind Info */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-4 py-2 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded border bg-white px-1 py-0.5 font-mono shadow-xs dark:bg-slate-800 dark:border-slate-700">
                ↑
              </kbd>{' '}
              <kbd className="rounded border bg-white px-1 py-0.5 font-mono shadow-xs dark:bg-slate-800 dark:border-slate-700">
                ↓
              </kbd>{' '}
              to navigate
            </span>
            <span>
              <kbd className="rounded border bg-white px-1 py-0.5 font-mono shadow-xs dark:bg-slate-800 dark:border-slate-700">
                ↵
              </kbd>{' '}
              to select
            </span>
          </div>
          <span>ConvertHub Fast Search</span>
        </div>
      </div>
    </div>
  );
};
