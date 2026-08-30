import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { validateAndSanitizeMediaFile } from '@/lib/storage/file-security';
import { TempStorageManager } from '@/lib/storage/temp-storage';
import { checkBurstLimit } from '@/lib/rate-limit/burst-limiter';
import { getClientIp } from '@/lib/rate-limit/headers';
import { updateJobProgress } from '@/lib/queue/media-queue';
import { mergeAudioTracks, AudioJoinerOptions } from '@/lib/converters/media/audio-joiner-engine';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_TOTAL_SIZE_BYTES = 100 * 1024 * 1024; // 100MB total

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting
    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent');
    const burstResult = await checkBurstLimit(ip, userAgent);

    if (!burstResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait a minute before starting another audio merge.',
          remaining: 0,
          reset: burstResult.reset,
        },
        { status: 429 }
      );
    }

    // 2. Parse Multipart FormData
    const formData = await request.formData();
    const files: File[] = [];

    // Collect all uploaded audio files
    const entries = Array.from(formData.entries());
    for (const [key, value] of entries) {
      if (value instanceof File && (key === 'files' || key.startsWith('file'))) {
        files.push(value);
      }
    }

    if (files.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 audio tracks are required to merge.' },
        { status: 400 }
      );
    }

    let totalSizeBytes = 0;
    for (const file of files) {
      totalSizeBytes += file.size;
    }

    if (totalSizeBytes > MAX_TOTAL_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'Total combined audio files exceed maximum size allowance of 100MB.' },
        { status: 413 }
      );
    }

    // 3. Options
    const crossfadeDurationSec = parseFloat((formData.get('crossfadeDurationSec') as string) || '0');
    const targetFormat = ((formData.get('targetFormat') as string) || 'mp3').toLowerCase().replace(/^\./, '');
    const bitrate = (formData.get('bitrate') as string) || '320k';

    const options: AudioJoinerOptions = {
      crossfadeDurationSec: isNaN(crossfadeDurationSec) ? 0 : crossfadeDurationSec,
      targetFormat: targetFormat === 'wav' ? 'wav' : 'mp3',
      bitrate,
    };

    const jobId = uuidv4();
    const downloadToken = uuidv4();
    const targetFilename = `merged-audio-${Date.now()}.${targetFormat}`;

    // 4. Save each file to temp storage
    const savedInputPaths: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const buffer = Buffer.from(await file.arrayBuffer());
      const validated = await validateAndSanitizeMediaFile(buffer, file.name || `track-${i + 1}.mp3`);
      const { filePath } = await TempStorageManager.saveUpload(
        buffer,
        validated.cleanFilename,
        `${jobId}-${i}`
      );
      savedInputPaths.push(filePath);
    }

    const tempConvertedDir = path.join(os.tmpdir(), 'converthub', 'converted');
    if (!fs.existsSync(tempConvertedDir)) {
      fs.mkdirSync(tempConvertedDir, { recursive: true });
    }
    const outputPath = path.join(tempConvertedDir, `${jobId}-${targetFilename}`);

    // 5. Initialize job state
    await updateJobProgress(jobId, {
      status: 'processing',
      progress: 10,
      stage: 'Merging Audio Tracks',
      message: `Combining ${files.length} audio tracks with ${options.crossfadeDurationSec}s crossfade...`,
    });

    // 6. Execute async merge in background
    (async () => {
      try {
        await mergeAudioTracks(savedInputPaths, outputPath, options, async (percent) => {
          await updateJobProgress(jobId, {
            status: 'processing',
            progress: Math.max(10, percent),
            stage: 'Encoding Master Audio',
            message: `Rendering high-fidelity ${options.targetFormat.toUpperCase()} master (${percent}%)...`,
          });
        });

        // Register output for secure download
        const outputBuffer = fs.readFileSync(outputPath);
        const outputRecord = await TempStorageManager.saveConverted(outputBuffer, {
          jobId,
          originalFilename: files[0]?.name || 'joined-audio',
          targetFilename,
          mime: options.targetFormat === 'wav' ? 'audio/wav' : 'audio/mpeg',
          targetFormat: options.targetFormat,
          sourceFormat: 'audio',
          originalSizeBytes: totalSizeBytes,
        });

        await updateJobProgress(jobId, {
          status: 'completed',
          progress: 100,
          stage: 'Complete',
          message: 'Audio merge complete! Ready for high-bitrate download.',
          result: {
            downloadUrl: `/api/download?token=${outputRecord.downloadToken}&filename=${encodeURIComponent(targetFilename)}`,
            targetFilename,
            convertedSizeBytes: outputBuffer.length,
            originalSizeBytes: totalSizeBytes,
            format: options.targetFormat,
            downloadToken: outputRecord.downloadToken,
          },
        });
      } catch (err: any) {
        console.error(`Audio join failed for job ${jobId}:`, err);
        await updateJobProgress(jobId, {
          status: 'failed',
          progress: 0,
          error: err?.message || 'Audio merge failed during FFmpeg encoding.',
        });
      } finally {
        // Clean input files
        savedInputPaths.forEach((p) => {
          try {
            if (fs.existsSync(p)) fs.unlinkSync(p);
          } catch {}
        });
      }
    })();

    return NextResponse.json({
      success: true,
      jobId,
      downloadToken,
      status: 'processing',
      progressUrl: `/api/jobs/${jobId}/progress`,
      targetFilename,
      trackCount: files.length,
      targetFormat,
    });
  } catch (error: any) {
    console.error('Audio join API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Audio join operation failed to initialize' },
      { status: 500 }
    );
  }
}
