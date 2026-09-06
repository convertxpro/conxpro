'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { AdPlacementKey, AD_PLACEMENTS } from './ad-config';

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export interface AdSlotProps {
  placement: AdPlacementKey;
  slotId?: string;
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ placement, slotId, className }) => {
  const config = AD_PLACEMENTS[placement];
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-9256656578273481';
  const isConfigured = Boolean(
    clientId &&
    !clientId.includes('XXXX')
  );

  const adRef = useRef<HTMLModElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    if (!isConfigured || !adRef.current || adLoaded) return;

    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setAdLoaded(true);
      }
    } catch (e) {
      console.warn('AdSense ad push warning:', e);
    }
  }, [isConfigured, adLoaded]);

  if (!config || !config.enabled) return null;

  const targetSlotId = slotId || config.slotId;

  return (
    <div
      className={cn(
        'ad-slot-reserved my-6 flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/50 p-2 text-center transition-all dark:border-slate-800/80 dark:bg-slate-900/40',
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

      {isConfigured && targetSlotId ? (
        <div className="flex h-full w-full items-center justify-center overflow-hidden">
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{
              display: 'block',
              width: '100%',
              minHeight: `${config.height}px`,
            }}
            data-ad-client={clientId}
            data-ad-slot={targetSlotId}
            data-ad-format={config.format === 'banner' ? 'horizontal' : config.format === 'rectangle' ? 'rectangle' : 'auto'}
            data-full-width-responsive="true"
          />
        </div>
      ) : (
        /* Development, Testing & Fallback Layout (CLS Reserved) */
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
      )}
    </div>
  );
};
