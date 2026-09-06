import { NextRequest, NextResponse } from 'next/server';
import { siteConfig } from '@/config/site';

/**
 * IndexNow Instant Search Engine Indexing API Route
 * Allows pinging Bing, Yandex, and IndexNow endpoints whenever tools or guides are modified.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const secretKey = process.env.INDEXNOW_SECRET_KEY || process.env.ADMIN_SECRET_KEY;

    if (secretKey && authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const urls: string[] = body.urls || [siteConfig.url];
    const key = process.env.INDEXNOW_KEY || 'apextools-indexnow-key';
    const keyLocation = `${siteConfig.url}/${key}.txt`;

    const host = new URL(siteConfig.url).hostname;

    const payload = {
      host,
      key,
      keyLocation,
      urlList: urls,
    };

    // Ping IndexNow Endpoint
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      submittedUrls: urls.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to submit IndexNow ping', message: error?.message },
      { status: 500 }
    );
  }
}
