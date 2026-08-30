import { NextRequest, NextResponse } from 'next/server';
import { AD_PLACEMENTS, AdPlacementConfig, AdPlacementKey } from '@/components/ads/ad-config';

// In-memory / storage fallback for ad settings
let customAdConfig: Record<string, Partial<AdPlacementConfig> & { provider?: string; unitId?: string }> = {};

export async function GET() {
  // Merge default config with any custom updates
  const merged = Object.entries(AD_PLACEMENTS).reduce((acc, [key, defaultConfig]) => {
    acc[key as AdPlacementKey] = {
      ...defaultConfig,
      ...(customAdConfig[key] || {}),
      provider: customAdConfig[key]?.provider || 'adsense',
      unitId: customAdConfig[key]?.unitId || `ca-pub-9482019482/${key}`,
    };
    return acc;
  }, {} as Record<string, any>);

  return NextResponse.json({
    success: true,
    ads: merged,
    updatedAt: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, enabled, provider, unitId, width, height, hideOnMobile } = body;

    if (!key || !AD_PLACEMENTS[key as AdPlacementKey]) {
      return NextResponse.json(
        { success: false, error: `Invalid ad placement key: ${key}` },
        { status: 400 }
      );
    }

    customAdConfig[key] = {
      ...customAdConfig[key],
      ...(enabled !== undefined && { enabled: Boolean(enabled) }),
      ...(provider !== undefined && { provider: String(provider) }),
      ...(unitId !== undefined && { unitId: String(unitId) }),
      ...(width !== undefined && { width: Number(width) }),
      ...(height !== undefined && { height: Number(height) }),
      ...(hideOnMobile !== undefined && { hideOnMobile: Boolean(hideOnMobile) }),
    };

    return NextResponse.json({
      success: true,
      message: `Placement '${key}' updated successfully.`,
      ad: {
        ...AD_PLACEMENTS[key as AdPlacementKey],
        ...customAdConfig[key],
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update ad configuration' },
      { status: 500 }
    );
  }
}
