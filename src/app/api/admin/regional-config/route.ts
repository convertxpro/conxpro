import { NextRequest, NextResponse } from 'next/server';

export interface RegionalConfig {
  goldPrice24kPerTola: number;
  goldPrice22kPerTola: number;
  silverPricePerTola: number;
  marlaPresetSqFt: number; // 225 vs 272.25 vs 250
  forexMarkupPercent: number;
  districtDefaults: {
    lahore: number;
    rawalpindi: number;
    karachi: number;
    multan: number;
    peshawar: number;
    quetta: number;
  };
  lastUpdated: string;
}

let regionalConfig: RegionalConfig = {
  goldPrice24kPerTola: 248500,
  goldPrice22kPerTola: 227790,
  silverPricePerTola: 2950,
  marlaPresetSqFt: 225, // Default DHA / Urban standard
  forexMarkupPercent: 0.75, // 0.75% interbank to open market spread
  districtDefaults: {
    lahore: 225,
    rawalpindi: 272.25,
    karachi: 225,
    multan: 272.25,
    peshawar: 272.25,
    quetta: 272.25,
  },
  lastUpdated: new Date().toISOString(),
};

export async function GET() {
  return NextResponse.json({
    success: true,
    config: regionalConfig,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    regionalConfig = {
      ...regionalConfig,
      ...(body.goldPrice24kPerTola !== undefined && { goldPrice24kPerTola: Number(body.goldPrice24kPerTola) }),
      ...(body.goldPrice22kPerTola !== undefined && { goldPrice22kPerTola: Number(body.goldPrice22kPerTola) }),
      ...(body.silverPricePerTola !== undefined && { silverPricePerTola: Number(body.silverPricePerTola) }),
      ...(body.marlaPresetSqFt !== undefined && { marlaPresetSqFt: Number(body.marlaPresetSqFt) }),
      ...(body.forexMarkupPercent !== undefined && { forexMarkupPercent: Number(body.forexMarkupPercent) }),
      ...(body.districtDefaults && {
        districtDefaults: {
          ...regionalConfig.districtDefaults,
          ...body.districtDefaults,
        },
      }),
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Regional configurations updated successfully.',
      config: regionalConfig,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update regional configuration' },
      { status: 500 }
    );
  }
}
