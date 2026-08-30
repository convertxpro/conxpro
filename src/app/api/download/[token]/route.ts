import { NextRequest, NextResponse } from 'next/server';
import { TempStorageManager } from '@/lib/storage/temp-storage';
import fs from 'fs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    if (!token) {
      return NextResponse.json({ error: 'Download token is required' }, { status: 400 });
    }

    const record = await TempStorageManager.getByToken(token);
    if (!record) {
      return NextResponse.json(
        {
          error:
            'File expired or not found. Converted files are automatically removed after 2 hours for your privacy.',
        },
        { status: 404 }
      );
    }

    if (!fs.existsSync(record.filePath)) {
      return NextResponse.json({ error: 'File data is no longer available.' }, { status: 404 });
    }

    const fileBuffer = await fs.promises.readFile(record.filePath);

    // Escape filename for safe header
    const encodedFilename = encodeURIComponent(record.targetFilename);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': record.mime || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${record.targetFilename}"; filename*=UTF-8''${encodedFilename}`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'private, no-transform, max-age=7200',
      },
    });
  } catch (err: any) {
    console.error('File download error:', err);
    return NextResponse.json({ error: 'Error downloading file' }, { status: 500 });
  }
}
