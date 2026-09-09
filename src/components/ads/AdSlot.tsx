'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { AdPlacementKey, AD_PLACEMENTS, getAdsterraKeyForPlacement } from './ad-config';
import { AdsterraBanner } from './AdsterraBanner';

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export interface AdSlotProps {
  placement: AdPlacementKey;
  slotId?: string; // AdSense slot ID override
  adsterraKey?: string; // Adsterra unit key override
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({
  placement,
  slotId,
  adsterraKey: propAdsterraKey,
  className,
}) => {
  const config = AD_PLACEMENTS[placement];
  const networkPreference = process.env.NEXT_PUBLIC_AD_NETWORK?.toLowerCase();

  // Adsterra Configuration
  const adsterraKey = getAdsterraKeyForPlacement(placement, propAdsterraKey);
  const isAdsterraActive = Boolean(
    adsterraKey &&
    (networkPreference === 'adsterra' || !networkPreference || networkPreference === 'all')
  );

  // AdSense Configuration
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-9256656578273481';
  const targetSlotId = slotId || config?.slotId;
  const isAdSenseConfigured = Boolean(
    clientId &&
    !clientId.includes('XXXX') &&
    targetSlotId &&
    (networkPreference === 'adsense' || !networkPreference)
  );

  const adRef = useRef<HTMLModElement>(null);
  const [adSenseLoaded, setAdSenseLoaded] = useState(false);

  useEffect(() => {
    // Only trigger adsbygoogle push if AdSense is the chosen active network for this slot
    if (isAdsterraActive || !isAdSenseConfigured || !adRef.current || adSenseLoaded) return;

    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setAdSenseLoaded(true);
      }
    } catch (e) {
      console.warn('AdSense ad push warning:', e);
    }
  }, [isAdsterraActive, isAdSenseConfigured, adSenseLoaded]);

  if (!config || !config.enabled) return null;

  const maxWidthClass =
    config.format === 'rectangle' ? 'max-w-[340px]' : 'max-w-[760px]';

  return (
    <div
      className={cn(
        'ad-slot-reserved my-6 mx-auto flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/50 p-2.5 text-center transition-all dark:border-slate-800/80 dark:bg-slate-900/40',
        maxWidthClass,
        config.hideOnMobile && 'hidden md:flex',
        className
      )}
      style={{ minHeight: `${config.minHeight}px` }}
      data-ad-slot={placement}
      data-testid={`ad-slot-${placement}`}
    >
      {/* Strict compliance label */}
      <span className="mb-1 select-none text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        Advertisement
      </span>

      {isAdsterraActive && adsterraKey ? (
        /* 1. Adsterra Sandboxed Iframe Banner */
        <div className="flex w-full items-center justify-center">
          <AdsterraBanner
            adKey={adsterraKey}
            width={config.width}
            height={config.height}
          />
        </div>
      ) : isAdSenseConfigured ? (
        /* 2. Google AdSense Responsive Unit */
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
            data-ad-format={
              config.format === 'banner'
                ? 'horizontal'
                : config.format === 'rectangle'
                ? 'rectangle'
                : 'auto'
            }
            data-full-width-responsive="true"
          />
        </div>
      ) : (
        /* 3. Development, Staging & Fallback Layout (CLS Reserved) */
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

