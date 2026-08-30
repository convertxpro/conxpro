import { NextRequest, NextResponse } from 'next/server';
import { validateAndSanitizeFile } from '@/lib/storage/file-security';
import { TempStorageManager } from '@/lib/storage/temp-storage';
import { processImage, ImageTargetFormat, ImageConvertOptions } from '@/lib/converters/image-engine';
import { checkBurstLimit } from '@/lib/rate-limit/burst-limiter';
import { getClientIp } from '@/lib/rate-limit/headers';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Max free upload size: 25MB
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // 1. IP & Rate Limiting Check
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
      return NextResponse.json({ error: 'No image file uploaded' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File size exceeds maximum free allowance of 25MB' },
        { status: 413 }
      );
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());

    // 3. Magic Byte & Security Validation
    const validatedFile = await validateAndSanitizeFile(rawBuffer, file.name || 'image');

    // 4. Parse Conversion Options
    const rawTargetFormat = (formData.get('targetFormat') as string) || 'jpg';
    const quality = parseInt((formData.get('quality') as string) || '85', 10);
    const effort = formData.get('effort') ? parseInt(formData.get('effort') as string, 10) : undefined;
    const chromaSubsampling = (formData.get('chromaSubsampling') as '4:2:0' | '4:4:4') || undefined;
    const stripExif = formData.get('stripExif') !== 'false';
    const dpi = formData.get('dpi') ? parseInt(formData.get('dpi') as string, 10) : undefined;
    const tintColor = (formData.get('tintColor') as string) || undefined;
    const multiResolutionIco = formData.get('multiResolutionIco') === 'true';

    const width = formData.get('width') ? parseInt(formData.get('width') as string, 10) : undefined;
    const height = formData.get('height') ? parseInt(formData.get('height') as string, 10) : undefined;
    const fit = (formData.get('fit') as any) || 'inside';
    const grayscale = formData.get('grayscale') === 'true';
    const flattenBackground = (formData.get('flattenBackground') as string) || undefined;

    const convertOptions: ImageConvertOptions = {
      targetFormat: rawTargetFormat.toLowerCase() as ImageTargetFormat,
      quality: isNaN(quality) ? 85 : quality,
      effort: effort && !isNaN(effort) ? effort : 4,
      chromaSubsampling,
      stripExif,
      dpi: dpi && !isNaN(dpi) ? dpi : 300,
      tintColor,
      multiResolutionIco,
      width: width && !isNaN(width) ? width : undefined,
      height: height && !isNaN(height) ? height : undefined,
      fit,
      grayscale,
      flattenBackground,
    };

    // 5. Execute Image Pipeline
    const processed = await processImage(rawBuffer, convertOptions);

    // 6. Generate Target Filename
    const parsedOriginal = path.parse(validatedFile.cleanFilename);
    const targetExt = convertOptions.targetFormat === 'jpeg' ? 'jpg' : convertOptions.targetFormat;
    const targetFilename = `${parsedOriginal.name}.${targetExt}`;

    // 7. Save to Temporary Storage
    const savedRecord = await TempStorageManager.saveConverted(processed.buffer, {
      originalFilename: validatedFile.cleanFilename,
      targetFilename,
      mime: processed.mime,
      targetFormat: convertOptions.targetFormat,
      sourceFormat: validatedFile.ext,
      originalSizeBytes: rawBuffer.length,
      ipHash: ip,
      ttlHours: 2,
    });

    const savedBytes = Math.max(0, rawBuffer.length - processed.sizeBytes);
    const savedPercent = rawBuffer.length > 0 ? Math.round((savedBytes / rawBuffer.length) * 100) : 0;

    return NextResponse.json({
      success: true,
      downloadToken: savedRecord.downloadToken,
      downloadUrl: `/api/download/${savedRecord.downloadToken}`,
      originalFilename: validatedFile.cleanFilename,
      targetFilename,
      originalSizeBytes: rawBuffer.length,
      convertedSizeBytes: processed.sizeBytes,
      savedBytes,
      savedPercent,
      width: processed.width,
      height: processed.height,
      targetFormat: convertOptions.targetFormat,
      mime: processed.mime,
      expiresAt: savedRecord.expiresAt,
    });
  } catch (err: any) {
    console.error('Image conversion error:', err);
    return NextResponse.json(
      { error: err.message || 'Image conversion failed. Please try a valid image file.' },
      { status: 500 }
    );
  }
}
