import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { validateAndSanitizeMediaFile } from '@/lib/storage/file-security';
import { TempStorageManager } from '@/lib/storage/temp-storage';
import { checkBurstLimit } from '@/lib/rate-limit/burst-limiter';
import { getClientIp } from '@/lib/rate-limit/headers';
import { addMediaJob, MediaJobData } from '@/lib/queue/media-queue';
import { modulateAudioSpeed, AudioSpeedOptions } from '@/lib/converters/media/audio-speed-engine';
import { executeMediaConversion } from '@/lib/converters/media/media-engine';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB for audio files

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent');
    const burstResult = await checkBurstLimit(ip, userAgent);

    if (!burstResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait a minute before starting another audio conversion.',
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
      return NextResponse.json({ error: 'No audio file uploaded' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'Audio file size exceeds maximum limit of 50MB' },
        { status: 413 }
      );
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());

    // 3. Security validation
    const validatedFile = await validateAndSanitizeMediaFile(rawBuffer, file.name || 'audio.mp3');

    // 4. Parse audio options
    const speedMultiplier = parseFloat((formData.get('speedMultiplier') as string) || '1.0');
    const preservePitch = formData.get('preservePitch') !== 'false';
    const pitchSemitones = formData.has('pitchSemitones')
      ? parseInt(formData.get('pitchSemitones') as string, 10)
      : 0;
    const targetFormat = ((formData.get('targetFormat') as string) || 'mp3').toLowerCase().replace(/^\./, '');
    const bitrate = (formData.get('bitrate') as string) || '320k';

    const options: AudioSpeedOptions = {
      speedMultiplier: isNaN(speedMultiplier) ? 1.0 : speedMultiplier,
      preservePitch,
      pitchSemitones: isNaN(pitchSemitones) ? 0 : pitchSemitones,
      targetFormat: targetFormat === 'wav' ? 'wav' : 'mp3',
      bitrate,
    };

    // 5. Generate job & file metadata
    const jobId = uuidv4();
    const downloadToken = uuidv4();
    const parsedOriginal = path.parse(validatedFile.cleanFilename);
    const targetFilename = `${parsedOriginal.name}-modulated.${targetFormat}`;

    // 6. Save upload to disk
    const { filePath: inputPath } = await TempStorageManager.saveUpload(
      rawBuffer,
      validatedFile.cleanFilename,
      jobId
    );

    const tempConvertedDir = path.join(os.tmpdir(), 'apextools', 'converted');
    if (!fs.existsSync(tempConvertedDir)) {
      fs.mkdirSync(tempConvertedDir, { recursive: true });
    }
    const outputPath = path.join(tempConvertedDir, `${jobId}-${targetFilename}`);

    const jobData: MediaJobData = {
      jobId,
      downloadToken,
      inputPath,
      outputPath,
      originalFilename: validatedFile.cleanFilename,
      targetFilename,
      toolType: 'audio-speed-pitch-changer',
      sourceFormat: validatedFile.ext,
      targetFormat,
      originalSizeBytes: rawBuffer.length,
      ipHash: ip,
      options: {
        speedMultiplier: options.speedMultiplier,
        preservePitch: options.preservePitch,
        pitchSemitones: options.pitchSemitones,
        bitrate: options.bitrate,
      },
    };

    // 7. Enqueue BullMQ job or direct execution
    const { queuedInBull } = await addMediaJob(jobData);

    if (!queuedInBull) {
      executeMediaConversion(jobData).catch((err) => {
        console.error(`Direct audio modulation failed for job ${jobId}:`, err);
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
      options,
    });
  } catch (error: any) {
    console.error('Audio modulation API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Audio modulation failed to initialize' },
      { status: 500 }
    );
  }
}
