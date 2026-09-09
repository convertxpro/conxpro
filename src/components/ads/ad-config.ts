export type AdPlacementKey =
  | 'header_leaderboard'
  | 'sidebar_rectangle'
  | 'in_content_native'
  | 'processing_screen'
  | 'download_page'
  | 'footer_banner';

export interface AdPlacementConfig {
  key: AdPlacementKey;
  name: string;
  width: number;
  height: number;
  minHeight: number;
  mobileWidth?: number;
  mobileHeight?: number;
  hideOnMobile?: boolean;
  enabled: boolean;
  format: 'banner' | 'rectangle' | 'native';
  description: string;
  slotId?: string; // AdSense slot ID
  adsterraKey?: string; // Specific Adsterra unit key
}

export const AD_PLACEMENTS: Record<AdPlacementKey, AdPlacementConfig> = {
  header_leaderboard: {
    key: 'header_leaderboard',
    name: 'Top Leaderboard',
    width: 728,
    height: 90,
    minHeight: 106,
    mobileWidth: 320,
    mobileHeight: 50,
    enabled: true,
    format: 'banner',
    description: 'Placed above primary converter tool and hero on desktop and mobile',
  },
  sidebar_rectangle: {
    key: 'sidebar_rectangle',
    name: 'Sidebar Medium Rectangle',
    width: 300,
    height: 250,
    minHeight: 266,
    hideOnMobile: true,
    enabled: true,
    format: 'rectangle',
    description: 'Sticky sidebar desktop ad unit',
  },
  in_content_native: {
    key: 'in_content_native',
    name: 'In-Content Native Banner',
    width: 728,
    height: 90,
    minHeight: 110,
    mobileWidth: 320,
    mobileHeight: 100,
    enabled: true,
    format: 'native',
    description: 'Native fluid placement situated directly beneath the converter canvas',
  },
  processing_screen: {
    key: 'processing_screen',
    name: 'Processing Screen Unit',
    width: 300,
    height: 250,
    minHeight: 266,
    enabled: true,
    format: 'rectangle',
    description: 'Displayed cleanly alongside progress indicator during async conversion operations',
  },
  download_page: {
    key: 'download_page',
    name: 'Download Page Header',
    width: 728,
    height: 90,
    minHeight: 106,
    mobileWidth: 320,
    mobileHeight: 50,
    enabled: true,
    format: 'banner',
    description: 'Prominently placed alongside download CTA with clear distinction',
  },
  footer_banner: {
    key: 'footer_banner',
    name: 'Bottom Anchor Banner',
    width: 728,
    height: 90,
    minHeight: 106,
    mobileWidth: 320,
    mobileHeight: 50,
    enabled: true,
    format: 'banner',
    description: 'Bottom page footer banner',
  },
};

// Default verified Adsterra placement keys for apextools.app
export const ADSTERRA_DEFAULTS = {
  BANNER_728x90: '5e2225e39119a73ae77646c87c438f0d',
  BANNER_300x250: '72c99a66c73c1b76917fed937f2e345b',
  HOST: 'www.highrevenueformat.com',
  SOCIAL_BAR_URL: 'https://pl31263049.profitableratecpmnetwork.com/4d/c4/8b/4dc48b3d89a24296167b5fb68617f41c.js',
};

/**
 * Resolves the appropriate Adsterra placement key for a given placement.
 * Checks for:
 * 1. Placement-specific override key
 * 2. Format-based environment variables:
 *    - 728x90 Leaderboard / Banners -> NEXT_PUBLIC_ADSTERRA_BANNER_728x90_KEY (fallback to ADSTERRA_DEFAULTS)
 *    - 300x250 Medium Rectangles -> NEXT_PUBLIC_ADSTERRA_BANNER_300x250_KEY (fallback to ADSTERRA_DEFAULTS)
 *    - Native formats -> NEXT_PUBLIC_ADSTERRA_NATIVE_KEY
 * 3. Default fallback banner key -> NEXT_PUBLIC_ADSTERRA_DEFAULT_BANNER_KEY
 */
export function getAdsterraKeyForPlacement(
  placement: AdPlacementKey,
  overrideKey?: string
): string | undefined {
  if (overrideKey) return overrideKey;

  const config = AD_PLACEMENTS[placement];
  if (!config) return undefined;

  if (config.adsterraKey) return config.adsterraKey;

  // Check format-specific env vars
  if (config.format === 'banner' && config.width === 728) {
    return (
      process.env.NEXT_PUBLIC_ADSTERRA_BANNER_728x90_KEY ||
      process.env.NEXT_PUBLIC_ADSTERRA_DEFAULT_BANNER_KEY ||
      ADSTERRA_DEFAULTS.BANNER_728x90
    );
  }

  if (config.format === 'rectangle' && config.width === 300) {
    return (
      process.env.NEXT_PUBLIC_ADSTERRA_BANNER_300x250_KEY ||
      process.env.NEXT_PUBLIC_ADSTERRA_DEFAULT_BANNER_KEY ||
      ADSTERRA_DEFAULTS.BANNER_300x250
    );
  }

  if (config.format === 'native') {
    return (
      process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_KEY ||
      process.env.NEXT_PUBLIC_ADSTERRA_BANNER_728x90_KEY ||
      process.env.NEXT_PUBLIC_ADSTERRA_DEFAULT_BANNER_KEY ||
      ADSTERRA_DEFAULTS.BANNER_728x90
    );
  }

  return (
    process.env.NEXT_PUBLIC_ADSTERRA_DEFAULT_BANNER_KEY ||
    ADSTERRA_DEFAULTS.BANNER_728x90
  );
}
