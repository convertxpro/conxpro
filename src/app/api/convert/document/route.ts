import { NextRequest, NextResponse } from 'next/server';
import { validateAndSanitizeDocumentFile } from '@/lib/storage/file-security';
import { TempStorageManager } from '@/lib/storage/temp-storage';
import { convertOfficeDocument, OfficeTargetFormat } from '@/lib/converters/office/libreoffice-bridge';
import { checkBurstLimit } from '@/lib/rate-limit/burst-limiter';
import { getClientIp } from '@/lib/rate-limit/headers';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent');
    const burstResult = await checkBurstLimit(ip, userAgent);

    if (!burstResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait a minute before converting another file.',
          remaining: 0,
          reset: burstResult.reset,
        },
        { status: 429 }
      );
    }

    // 2. Parse Multipart FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No document file uploaded' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File size exceeds maximum free allowance of 25MB' },
        { status: 413 }
      );
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());

    // 3. Validate & Sanitize Document File
    const validatedFile = await validateAndSanitizeDocumentFile(rawBuffer, file.name || 'document');

    // 4. Target Format
    const rawTargetFormat = (formData.get('targetFormat') as string) || 'pdf';
    const targetFormat = rawTargetFormat.toLowerCase().replace(/^\./, '') as OfficeTargetFormat;

    // 5. Execute Office Document Conversion
    const outputBuffer = await convertOfficeDocument(
      rawBuffer,
      targetFormat,
      validatedFile.ext
    );

    // 6. Generate Target Filename & Save
    const parsedOriginal = path.parse(validatedFile.cleanFilename);
    const targetFilename = `${parsedOriginal.name}.${targetFormat}`;

    let mime = 'application/pdf';
    if (targetFormat === 'docx') mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    else if (targetFormat === 'xlsx') mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    else if (targetFormat === 'pptx') mime = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    else if (targetFormat === 'txt') mime = 'text/plain';
    else if (targetFormat === 'html') mime = 'text/html';

    const savedRecord = await TempStorageManager.saveConverted(outputBuffer, {
      originalFilename: validatedFile.cleanFilename,
      targetFilename,
      mime,
      targetFormat,
      sourceFormat: validatedFile.ext,
      originalSizeBytes: rawBuffer.length,
      ipHash: ip,
      ttlHours: 2,
    });

    const savedBytes = Math.max(0, rawBuffer.length - outputBuffer.length);
    const savedPercent = rawBuffer.length > 0 ? Math.round((savedBytes / rawBuffer.length) * 100) : 0;

    return NextResponse.json({
      success: true,
      downloadToken: savedRecord.downloadToken,
      downloadUrl: `/api/download/${savedRecord.downloadToken}`,
      originalFilename: validatedFile.cleanFilename,
      targetFilename,
      originalSizeBytes: rawBuffer.length,
      convertedSizeBytes: outputBuffer.length,
      savedBytes,
      savedPercent,
      targetFormat,
      mime,
      expiresAt: savedRecord.expiresAt,
    });
  } catch (err: any) {
    console.error('Document conversion route error:', err);
    return NextResponse.json(
      { error: err.message || 'Document conversion failed. Please try again.' },
      { status: 500 }
    );
  }
}
