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
