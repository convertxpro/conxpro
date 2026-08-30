import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { validateAndSanitizeMediaFile } from '@/lib/storage/file-security';
import { TempStorageManager } from '@/lib/storage/temp-storage';
import { checkBurstLimit } from '@/lib/rate-limit/burst-limiter';
import { getClientIp } from '@/lib/rate-limit/headers';
import { addMediaJob, MediaJobData, MediaToolType, MediaJobOptions } from '@/lib/queue/media-queue';
import { executeMediaConversion } from '@/lib/converters/media/media-engine';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB for media files

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent');
    const burstResult = await checkBurstLimit(ip, userAgent);

    if (!burstResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait a minute before starting another conversion.',
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
      return NextResponse.json({ error: 'No media file uploaded' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File size exceeds maximum free allowance of 100MB' },
        { status: 413 }
      );
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());

    // 3. Validate & Sanitize Media File (magic bytes & security check)
    const validatedFile = await validateAndSanitizeMediaFile(rawBuffer, file.name || 'media.mp4');

    // 4. Parse conversion parameters
    const rawToolType = (formData.get('toolType') as string) || 'video-convert';
    const toolType = rawToolType as MediaToolType;

    const rawTargetFormat = (formData.get('targetFormat') as string) || (toolType === 'video-to-mp3' ? 'mp3' : toolType === 'video-to-gif' ? 'gif' : toolType === 'gif-to-webm' ? 'webm' : 'mp4');
    const targetFormat = rawTargetFormat.toLowerCase().replace(/^\./, '');

    // Parse options (bitrate, resolution, targetSizeMb, crf, qualityCrf, preset, backgroundStyle, customColorHex, startTime, duration, etc.)
    let options: MediaJobOptions = {};
    const optionsRaw = formData.get('options');
    if (typeof optionsRaw === 'string') {
      try {
        options = JSON.parse(optionsRaw);
      } catch {
        options = {};
      }
    } else {
      if (formData.has('bitrate')) options.bitrate = formData.get('bitrate') as string;
      if (formData.has('resolution')) options.resolution = formData.get('resolution') as string;
      if (formData.has('targetSizeMb')) options.targetSizeMb = parseFloat(formData.get('targetSizeMb') as string);
      if (formData.has('crf')) options.crf = parseInt(formData.get('crf') as string, 10);
      if (formData.has('qualityCrf')) options.qualityCrf = parseInt(formData.get('qualityCrf') as string, 10);
      if (formData.has('preset')) options.preset = formData.get('preset') as string;
      if (formData.has('backgroundStyle')) options.backgroundStyle = formData.get('backgroundStyle') as string;
      if (formData.has('customColorHex')) options.customColorHex = formData.get('customColorHex') as string;
      if (formData.has('fps')) options.fps = parseInt(formData.get('fps') as string, 10);
      if (formData.has('startTime')) options.startTime = formData.get('startTime') as string;
      if (formData.has('duration')) options.duration = formData.get('duration') as string;
      if (formData.has('muteOnly')) options.muteOnly = formData.get('muteOnly') === 'true';
      if (formData.has('subtitleContent')) options.subtitleContent = formData.get('subtitleContent') as string;
      if (formData.has('fontName')) options.fontName = formData.get('fontName') as string;
      if (formData.has('fontSize')) options.fontSize = parseInt(formData.get('fontSize') as string, 10);
      if (formData.has('primaryColorHex')) options.primaryColorHex = formData.get('primaryColorHex') as string;
      if (formData.has('outlineColorHex')) options.outlineColorHex = formData.get('outlineColorHex') as string;
      if (formData.has('outlineThickness')) options.outlineThickness = parseInt(formData.get('outlineThickness') as string, 10);
      if (formData.has('alignment')) options.alignment = parseInt(formData.get('alignment') as string, 10);
      if (formData.has('marginV')) options.marginV = parseInt(formData.get('marginV') as string, 10);
    }

    // 5. Generate unique IDs and target filenames
    const jobId = uuidv4();
    const downloadToken = uuidv4();
    const parsedOriginal = path.parse(validatedFile.cleanFilename);
    const targetFilename = `${parsedOriginal.name}.${targetFormat}`;

    // Handle secondary subtitle file upload if present
    const subFile = formData.get('subtitleFile') as File | null;
    if (subFile && typeof subFile === 'object' && 'arrayBuffer' in subFile && subFile.size > 0) {
      const subBuffer = Buffer.from(await subFile.arrayBuffer());
      const { filePath: subSavedPath } = await TempStorageManager.saveUpload(
        subBuffer,
        subFile.name || 'subtitles.srt',
        `${jobId}-sub`
      );
      options.subtitlePath = subSavedPath;
    }

    // Handle secondary audio replacement file upload if present
    const audioFile = formData.get('audioFile') as File | null;
    if (audioFile && typeof audioFile === 'object' && 'arrayBuffer' in audioFile && audioFile.size > 0) {
      const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
      const { filePath: audioSavedPath } = await TempStorageManager.saveUpload(
        audioBuffer,
        audioFile.name || 'audio.mp3',
        `${jobId}-audio`
      );
      options.newAudioPath = audioSavedPath;
    }

    // 6. Save upload to disk
    const { filePath: inputPath } = await TempStorageManager.saveUpload(
      rawBuffer,
      validatedFile.cleanFilename,
      jobId
    );

    const tempConvertedDir = path.join(os.tmpdir(), 'converthub', 'converted');
    if (!require('fs').existsSync(tempConvertedDir)) {
      require('fs').mkdirSync(tempConvertedDir, { recursive: true });
    }
    const outputPath = path.join(tempConvertedDir, `${jobId}-${targetFilename}`);

    const jobData: MediaJobData = {
      jobId,
      downloadToken,
      inputPath,
      outputPath,
      originalFilename: validatedFile.cleanFilename,
      targetFilename,
      toolType,
      sourceFormat: validatedFile.ext,
      targetFormat,
      originalSizeBytes: rawBuffer.length,
      ipHash: ip,
      options,
    };

    // 7. Enqueue BullMQ job
    const { queuedInBull } = await addMediaJob(jobData);

    // If not enqueued into a running BullMQ queue (or in direct serverless execution mode),
    // launch direct asynchronous execution in background
    if (!queuedInBull) {
      executeMediaConversion(jobData).catch((err) => {
        console.error(`Direct media conversion failed for job ${jobId}:`, err);
      });
    }

    return NextResponse.json({
      success: true,
      jobId,
      downloadToken,
      status: 'processing',
      progressUrl: `/api/jobs/${jobId}/progress`,
      targetFilename,
      originalFilename: validatedFile.cleanFilename,
      targetFormat,
    });
  } catch (error: any) {
    console.error('Media conversion API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Media conversion failed to initialize' },
      { status: 500 }
    );
  }
}
