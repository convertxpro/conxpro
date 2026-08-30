import { NextRequest, NextResponse } from 'next/server';
import { validateAndSanitizeDocumentFile } from '@/lib/storage/file-security';
import { TempStorageManager } from '@/lib/storage/temp-storage';
import { mergePdfBuffers, splitPdf, rotatePdfPages, protectPdf, unlockPdf } from '@/lib/converters/pdf/pdf-manipulator';
import { compileImagesToPdf } from '@/lib/converters/pdf/images-to-pdf';
import { convertPdfToImages } from '@/lib/converters/pdf/pdf-to-images';
import { compressPdf, CompressionTier } from '@/lib/converters/pdf/pdf-compressor';
import { checkBurstLimit } from '@/lib/rate-limit/burst-limiter';
import { getClientIp } from '@/lib/rate-limit/headers';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_TOTAL_SIZE_BYTES = 50 * 1024 * 1024; // 50MB total allowance for batch/merge

export async function POST(request: NextRequest) {
  try {
    // 1. IP & Rate Limiting Check
    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent');
    const burstResult = await checkBurstLimit(ip, userAgent);

    if (!burstResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait a moment before processing another file.',
          remaining: 0,
          reset: burstResult.reset,
        },
        { status: 429 }
      );
    }

    // 2. Parse Multipart FormData
    const formData = await request.formData();
    const action = (formData.get('action') as string) || 'merge';
    const files = formData.getAll('files') as File[];

    if ((!files || files.length === 0) && !formData.get('file')) {
      return NextResponse.json({ error: 'No files uploaded for PDF processing' }, { status: 400 });
    }

    // Handle both single file ('file') and multiple files ('files')
    const uploadedFiles: File[] = files.length > 0 ? files : [formData.get('file') as File];
    let totalUploadSize = 0;
    for (const f of uploadedFiles) {
      totalUploadSize += f.size;
    }

    if (totalUploadSize > MAX_TOTAL_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'Total files size exceeds 50MB allowance' },
        { status: 413 }
      );
    }

    let outputBuffer: Buffer;
    let targetFilename = 'converted.pdf';
    let mime = 'application/pdf';
    let targetFormat = 'pdf';
    const firstFilename = uploadedFiles[0]?.name || 'document.pdf';
    const parsedName = path.parse(firstFilename).name;

    // 3. Process according to action
    switch (action) {
      case 'merge': {
        if (uploadedFiles.length < 1) {
          return NextResponse.json({ error: 'At least 1 PDF file is required to merge.' }, { status: 400 });
        }
        const pdfBuffers: Buffer[] = [];
        for (const file of uploadedFiles) {
          const buf = Buffer.from(await file.arrayBuffer());
          pdfBuffers.push(buf);
        }
        outputBuffer = await mergePdfBuffers(pdfBuffers);
        targetFilename = `merged-${parsedName}.pdf`;
        break;
      }

      case 'split': {
        const file = uploadedFiles[0];
        const rawBuffer = Buffer.from(await file.arrayBuffer());
        const range = (formData.get('range') as string) || 'all';
        const bundleAsZip = formData.get('bundleAsZip') === 'true' || range === 'all';

        const result = await splitPdf(rawBuffer, range, bundleAsZip);

        if (bundleAsZip && result.zipBuffer) {
          outputBuffer = result.zipBuffer;
          targetFilename = `split-${parsedName}.zip`;
          mime = 'application/zip';
          targetFormat = 'zip';
        } else if (result.combinedBuffer) {
          outputBuffer = result.combinedBuffer;
          targetFilename = `extracted-${parsedName}.pdf`;
        } else {
          throw new Error('Split operation did not produce output.');
        }
        break;
      }

      case 'rotate': {
        const file = uploadedFiles[0];
        const rawBuffer = Buffer.from(await file.arrayBuffer());
        const angle = parseInt((formData.get('angle') as string) || '90', 10) as 90 | 180 | 270;
        outputBuffer = await rotatePdfPages(rawBuffer, angle);
        targetFilename = `rotated-${parsedName}.pdf`;
        break;
      }

      case 'compress': {
        const file = uploadedFiles[0];
        const rawBuffer = Buffer.from(await file.arrayBuffer());
        const tier = ((formData.get('tier') as string) || 'recommended') as CompressionTier;
        const result = await compressPdf(rawBuffer, tier);
        outputBuffer = result.buffer;
        targetFilename = `compressed-${parsedName}.pdf`;
        break;
      }

      case 'protect': {
        const file = uploadedFiles[0];
        const rawBuffer = Buffer.from(await file.arrayBuffer());
        const password = (formData.get('password') as string) || '';
        outputBuffer = await protectPdf(rawBuffer, password);
        targetFilename = `protected-${parsedName}.pdf`;
        break;
      }

      case 'unlock': {
        const file = uploadedFiles[0];
        const rawBuffer = Buffer.from(await file.arrayBuffer());
        const password = (formData.get('password') as string) || '';
        outputBuffer = await unlockPdf(rawBuffer, password);
        targetFilename = `unlocked-${parsedName}.pdf`;
        break;
      }

      case 'images-to-pdf': {
        const imageItems: { buffer: Buffer; name: string }[] = [];
        for (const file of uploadedFiles) {
          const buf = Buffer.from(await file.arrayBuffer());
          imageItems.push({ buffer: buf, name: file.name });
        }
        const pageSize = (formData.get('pageSize') as any) || 'A4';
        const orientation = (formData.get('orientation') as any) || 'auto';
        outputBuffer = await compileImagesToPdf(imageItems, { pageSize, orientation });
        targetFilename = `compiled-images.pdf`;
        break;
      }

      case 'pdf-to-images': {
        const file = uploadedFiles[0];
        const rawBuffer = Buffer.from(await file.arrayBuffer());
        const format = ((formData.get('format') as string) || 'jpg') as 'jpg' | 'png';
        const dpi = parseInt((formData.get('dpi') as string) || '150', 10);
        const result = await convertPdfToImages(rawBuffer, format, dpi);

        if (result.zipBuffer) {
          outputBuffer = result.zipBuffer;
          targetFilename = `${parsedName}-images.zip`;
          mime = 'application/zip';
          targetFormat = 'zip';
        } else if (result.singleBuffer) {
          outputBuffer = result.singleBuffer;
          targetFilename = `${parsedName}-page-001.${format}`;
          mime = format === 'png' ? 'image/png' : 'image/jpeg';
          targetFormat = format;
        } else {
          throw new Error('PDF to image conversion produced no pages.');
        }
        break;
      }

      default:
        return NextResponse.json({ error: `Unknown PDF action: ${action}` }, { status: 400 });
    }

    // 4. Save to Temp Storage
    const savedRecord = await TempStorageManager.saveConverted(outputBuffer, {
      originalFilename: firstFilename,
      targetFilename,
      mime,
      targetFormat,
      sourceFormat: 'pdf',
      originalSizeBytes: totalUploadSize,
      ipHash: ip,
      ttlHours: 2,
    });

    const savedBytes = Math.max(0, totalUploadSize - outputBuffer.length);
    const savedPercent = totalUploadSize > 0 ? Math.round((savedBytes / totalUploadSize) * 100) : 0;

    return NextResponse.json({
      success: true,
      downloadToken: savedRecord.downloadToken,
      downloadUrl: `/api/download/${savedRecord.downloadToken}`,
      originalFilename: firstFilename,
      targetFilename,
      originalSizeBytes: totalUploadSize,
      convertedSizeBytes: outputBuffer.length,
      savedBytes,
      savedPercent,
      targetFormat,
      mime,
      expiresAt: savedRecord.expiresAt,
    });
  } catch (err: any) {
    console.error('PDF API route error:', err);
    return NextResponse.json(
      { error: err.message || 'PDF processing operation failed. Please verify your PDF file.' },
      { status: 500 }
    );
  }
}
