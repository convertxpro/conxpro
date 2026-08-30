'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { AdPlacementKey, AD_PLACEMENTS } from './ad-config';

export interface AdSlotProps {
  placement: AdPlacementKey;
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ placement, className }) => {
  const config = AD_PLACEMENTS[placement];
  if (!config || !config.enabled) return null;

  return (
    <div
      className={cn(
        'ad-slot-reserved my-6 flex w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-2 text-center transition-all dark:border-slate-800/80 dark:bg-slate-900/40',
        config.hideOnMobile && 'hidden md:flex',
        className
      )}
      style={{ minHeight: `${config.minHeight}px` }}
      data-ad-slot={placement}
      data-testid={`ad-slot-${placement}`}
    >
      {/* Strict compliance label per Google AdSense policies */}
      <span className="mb-1 select-none text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        Advertisement
      </span>

      <div className="flex h-full w-full items-center justify-center">
        <div
          className="flex flex-col items-center justify-center rounded-lg border border-slate-200/90 bg-white/80 p-3 text-slate-400 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-500"
          style={{
            width: `${config.width}px`,
            maxWidth: '100%',
            height: `${config.height}px`,
          }}
        >
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            <span>{config.name}</span>
          </div>
          <span className="mt-0.5 text-[10px] text-slate-400">
            {config.width} × {config.height} px • CLS-Locked
          </span>
        </div>
      </div>
    </div>
  );
};
