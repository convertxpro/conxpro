import { NextRequest, NextResponse } from 'next/server';
import { TempStorageManager } from '@/lib/storage/temp-storage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const result = await TempStorageManager.purgeExpiredFiles();
    return NextResponse.json({
      success: true,
      message: `Purged ${result.purgedTokens} expired tokens and ${result.purgedFiles} temp disk files.`,
      purgedTokens: result.purgedTokens,
      purgedFiles: result.purgedFiles,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Auto-purge cron error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Auto-purge execution failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
