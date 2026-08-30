import { NextRequest, NextResponse } from 'next/server';
import { getForexHistory } from '@/lib/forex/forex-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pair = searchParams.get('pair') || 'USD/PKR';
    const daysParam = parseInt(searchParams.get('days') || '30', 10);
    const days = daysParam === 7 ? 7 : 30;

    const data = await getForexHistory(pair, days);

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
      },
    });
  } catch (error: any) {
    console.error('API Error in /api/forex/history:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve forex historical trend data' },
      { status: 500 }
    );
  }
}
