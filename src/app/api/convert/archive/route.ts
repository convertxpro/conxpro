import { NextRequest, NextResponse } from 'next/server';
import { validateAndSanitizeArchiveFile } from '@/lib/storage/file-security';
import { TempStorageManager } from '@/lib/storage/temp-storage';
import { createZipArchive, ZipFileInput } from '@/lib/converters/archive/zip-creator';
import { inspectAndExtractArchive } from '@/lib/converters/archive/archive-extractor';
import { checkBurstLimit } from '@/lib/rate-limit/burst-limiter';
import { getClientIp } from '@/lib/rate-limit/headers';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_ARCHIVE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export async function POST(request: NextRequest) {
  try {
    // 1. IP & Rate Limiting Check
    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent');
    const burstResult = await checkBurstLimit(ip, userAgent);

    if (!burstResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait a moment before processing another archive.',
          remaining: 0,
          reset: burstResult.reset,
        },
        { status: 429 }
      );
    }

    // 2. Parse Multipart FormData
    const formData = await request.formData();
    const action = (formData.get('action') as string) || 'create-zip';
    const files = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File | null;

    if (action === 'create-zip') {
      const uploadList: File[] = files.length > 0 ? files : singleFile ? [singleFile] : [];
      if (uploadList.length === 0) {
        return NextResponse.json({ error: 'Please upload files to compress into ZIP.' }, { status: 400 });
      }

      let totalSize = 0;
      const fileInputs: ZipFileInput[] = [];

      for (const f of uploadList) {
        totalSize += f.size;
        const buf = Buffer.from(await f.arrayBuffer());
        fileInputs.push({ name: f.name, buffer: buf });
      }

      if (totalSize > MAX_ARCHIVE_SIZE_BYTES) {
        return NextResponse.json(
          { error: 'Total files size exceeds 50MB allowance' },
          { status: 413 }
        );
      }

      const zipBuffer = await createZipArchive(fileInputs);
      const zipName = (formData.get('archiveName') as string) || 'archive.zip';
      const cleanZipName = zipName.endsWith('.zip') ? zipName : `${zipName}.zip`;

      const savedRecord = await TempStorageManager.saveConverted(zipBuffer, {
        originalFilename: uploadList[0]?.name || 'bundle',
        targetFilename: cleanZipName,
        mime: 'application/zip',
        targetFormat: 'zip',
        sourceFormat: 'files',
        originalSizeBytes: totalSize,
        ipHash: ip,
        ttlHours: 2,
      });

      const savedBytes = Math.max(0, totalSize - zipBuffer.length);
      const savedPercent = totalSize > 0 ? Math.round((savedBytes / totalSize) * 100) : 0;

      return NextResponse.json({
        success: true,
        downloadToken: savedRecord.downloadToken,
        downloadUrl: `/api/download/${savedRecord.downloadToken}`,
        originalFilename: uploadList[0]?.name,
        targetFilename: cleanZipName,
        originalSizeBytes: totalSize,
        convertedSizeBytes: zipBuffer.length,
        savedBytes,
        savedPercent,
        totalFilesBundled: fileInputs.length,
        targetFormat: 'zip',
        mime: 'application/zip',
        expiresAt: savedRecord.expiresAt,
      });
    }

    if (action === 'extract-zip' || action === 'inspect') {
      const fileToExtract = singleFile || files[0];
      if (!fileToExtract) {
        return NextResponse.json({ error: 'Please upload a ZIP archive to extract.' }, { status: 400 });
      }

      const rawBuffer = Buffer.from(await fileToExtract.arrayBuffer());
      const validated = await validateAndSanitizeArchiveFile(rawBuffer, fileToExtract.name);

      const extracted = await inspectAndExtractArchive(rawBuffer);

      if (action === 'inspect') {
        return NextResponse.json({
          success: true,
          totalFiles: extracted.totalFiles,
          totalSizeBytes: extracted.totalSizeBytes,
          entries: extracted.entries,
        });
      }

      // Save extracted archive contents as clean repackaged ZIP or download
      const savedRecord = await TempStorageManager.saveConverted(rawBuffer, {
        originalFilename: validated.cleanFilename,
        targetFilename: `extracted-${validated.cleanFilename}`,
        mime: 'application/zip',
        targetFormat: 'zip',
        sourceFormat: validated.ext,
        originalSizeBytes: rawBuffer.length,
        ipHash: ip,
        ttlHours: 2,
      });

      return NextResponse.json({
        success: true,
        downloadToken: savedRecord.downloadToken,
        downloadUrl: `/api/download/${savedRecord.downloadToken}`,
        originalFilename: validated.cleanFilename,
        targetFilename: `extracted-${validated.cleanFilename}`,
        originalSizeBytes: rawBuffer.length,
        convertedSizeBytes: rawBuffer.length,
        totalFilesExtracted: extracted.totalFiles,
        entries: extracted.entries,
        targetFormat: 'zip',
        mime: 'application/zip',
        expiresAt: savedRecord.expiresAt,
      });
    }

    return NextResponse.json({ error: `Unknown archive action: ${action}` }, { status: 400 });
  } catch (err: any) {
    console.error('Archive route error:', err);
    return NextResponse.json(
      { error: err.message || 'Archive processing failed. Please check the file.' },
      { status: 500 }
    );
  }
}
