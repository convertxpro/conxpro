import React from 'react';
import { cn } from '@/lib/utils';

interface AdPlaceholderProps {
  label?: string;
  width?: number;
  height?: number;
  className?: string;
}

export const AdPlaceholder: React.FC<AdPlaceholderProps> = ({
  label = 'Sponsored Ad',
  width = 728,
  height = 90,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200/80 bg-slate-50/40 p-2 text-center dark:border-slate-800/80 dark:bg-slate-900/30',
        className
      )}
      style={{ minHeight: `${height + 24}px` }}
    >
      <span className="mb-1 text-[10px] uppercase tracking-wider text-slate-400">
        Advertisement
      </span>
      <div
        className="flex items-center justify-center rounded-lg border border-slate-200/60 bg-white/40 text-xs text-slate-400 dark:border-slate-800/60 dark:bg-slate-950/40"
        style={{ width: `${width}px`, maxWidth: '100%', height: `${height}px` }}
      >
        {label} ({width}×{height})
      </div>
    </div>
  );
};
