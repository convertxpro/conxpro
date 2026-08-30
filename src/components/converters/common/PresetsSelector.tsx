'use client';

import React from 'react';
import { Sparkles, FileCode } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PresetItem {
  id: string;
  label: string;
  description?: string;
  data: string;
  icon?: React.ReactNode;
}

export interface PresetsSelectorProps {
  presets: PresetItem[];
  activePresetId?: string;
  onSelect: (preset: PresetItem) => void;
  className?: string;
  title?: string;
}

export const PresetsSelector: React.FC<PresetsSelectorProps> = ({
  presets,
  activePresetId,
  onSelect,
  className,
  title = 'Load Sample Preset:',
}) => {
  if (!presets || presets.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Sparkles className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
        <span>{title}</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {presets.map((preset) => {
          const isActive = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset)}
              title={preset.description}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-150',
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 dark:bg-indigo-500'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
              )}
            >
              {preset.icon || <FileCode className="h-3 w-3 opacity-70" />}
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
