import { NextResponse } from 'next/server';
import { getLatestExchangeRates } from '@/lib/forex/forex-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getLatestExchangeRates();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
        'X-Forex-Source': data.source,
      },
    });
  } catch (error: any) {
    console.error('API Error in /api/forex/rates:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve forex exchange rates' },
      { status: 500 }
    );
  }
}
