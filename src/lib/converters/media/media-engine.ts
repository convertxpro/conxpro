import { ffmpeg } from './ffmpeg-config';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { MediaJobData, MediaJobOptions, updateJobProgress } from '@/lib/queue/media-queue';
import { TempStorageManager, getMimeForFormat } from '@/lib/storage/temp-storage';
import { getCanvasDimensions, AspectRatioPreset, BackgroundStyle } from './social-resizer';
import { hexToAssColor } from './subtitles-engine';

export interface MediaMetadata {
  durationSeconds: number;
  width?: number;
  height?: number;
  videoCodec?: string;
  audioCodec?: string;
  bitrateKbps?: number;
  formatName?: string;
  sizeBytes?: number;
  fps?: number;
}

/**
 * Extract technical media stream metadata via ffprobe
 */
export async function probeMediaMetadata(filePath: string): Promise<MediaMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        return resolve({
          durationSeconds: 0,
        });
      }

      const format = metadata.format || {};
      const videoStream = metadata.streams?.find((s) => s.codec_type === 'video');
      const audioStream = metadata.streams?.find((s) => s.codec_type === 'audio');

      let fps = 30;
      if (videoStream?.r_frame_rate) {
        const parts = videoStream.r_frame_rate.split('/');
        if (parts.length === 2 && parseFloat(parts[1]) > 0) {
          fps = Math.round(parseFloat(parts[0]) / parseFloat(parts[1]));
        }
      }

      resolve({
        durationSeconds: format.duration ? parseFloat(format.duration.toString()) : 0,
        width: videoStream?.width,
        height: videoStream?.height,
        videoCodec: videoStream?.codec_name,
        audioCodec: audioStream?.codec_name,
        bitrateKbps: format.bit_rate ? Math.round(format.bit_rate / 1000) : undefined,
        formatName: format.format_name,
        sizeBytes: format.size,
        fps,
      });
    });
  });
}

/**
 * Execute media transcoding with fluent-ffmpeg, progress tracking, and secure output storage
 */
export async function executeMediaConversion(
  jobData: MediaJobData
): Promise<{
  success: boolean;
  downloadUrl: string;
  targetFilename: string;
  convertedSizeBytes: number;
  originalSizeBytes: number;
  duration?: number;
  format: string;
  downloadToken: string;
}> {
  const { jobId, downloadToken, inputPath, outputPath, toolType, targetFormat, originalFilename, targetFilename, originalSizeBytes, options = {} } = jobData;

  await updateJobProgress(jobId, {
    status: 'processing',
    progress: 5,
    stage: 'Analyzing Input',
    message: 'Inspecting media streams and audio/video codecs...',
  });

  // 1. Probe input metadata (duration, resolution, etc.)
  const metadata = await probeMediaMetadata(inputPath);
  const totalDuration = metadata.durationSeconds || 1;

  // 2. Build FFmpeg command pipeline
  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath);

    // Track input trim start / duration
    if (options.startTime !== undefined && options.startTime !== null && options.startTime !== '') {
      command = command.setStartTime(options.startTime);
    }
    if (options.duration !== undefined && options.duration !== null && options.duration !== '') {
      command = command.setDuration(options.duration);
    } else if (options.endTime !== undefined && options.endTime !== null && options.endTime !== '' && options.startTime !== undefined) {
      const startSec = typeof options.startTime === 'number' ? options.startTime : parseFloat(options.startTime.toString()) || 0;
      const endSec = typeof options.endTime === 'number' ? options.endTime : parseFloat(options.endTime.toString()) || 0;
      if (endSec > startSec) {
        command = command.setDuration(endSec - startSec);
      }
    }

    // 3. Apply tool-specific transcoding profiles
    switch (toolType) {
      case 'video-to-mp3': {
        const audioBitrate = options.bitrate || '192k';
        command = command
          .noVideo()
          .audioCodec('libmp3lame')
          .audioBitrate(audioBitrate)
          .audioFrequency(options.sampleRate || 44100)
          .audioChannels(options.audioChannels || 2);
        break;
      }

      case 'video-to-gif': {
        const fps = options.fps || 15;
        const width = options.width || 480;
        // High quality 2-pass palettegen + paletteuse filter
        const filterStr = `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5`;
        command = command.complexFilter([filterStr]);
        break;
      }

      case 'gif-to-mp4':
      case 'gif-to-webm':
      case 'gif-to-video': {
        const fmt = targetFormat.toLowerCase();
        if (fmt === 'mp4') {
          command = command.outputOptions([
            '-c:v libx264',
            '-pix_fmt yuv420p',
            `-crf ${options.qualityCrf || options.crf || 23}`,
            '-preset medium',
            '-movflags +faststart',
            '-vf pad=ceil(iw/2)*2:ceil(ih/2)*2',
            '-an',
          ]);
        } else if (fmt === 'webm') {
          command = command.outputOptions([
            '-c:v libvpx-vp9',
            `-crf ${options.qualityCrf || options.crf || 30}`,
            '-b:v 0',
            '-pix_fmt yuv420p',
            '-an',
          ]);
        }
        if (options.fps && options.fps > 0) {
          command = command.fps(options.fps);
        }
        break;
      }

      case 'video-aspect-ratio-resizer':
      case 'social-resize': {
        const preset = (options.preset || '9:16') as AspectRatioPreset;
        const backgroundStyle = (options.backgroundStyle || 'blur') as BackgroundStyle;
        const { targetWidth, targetHeight } = getCanvasDimensions(preset);

        if (backgroundStyle === 'crop') {
          const filter = `scale=w=${targetWidth}:h=${targetHeight}:force_original_aspect_ratio=increase,crop=${targetWidth}:${targetHeight}`;
          command = command.videoFilters(filter);
        } else if (backgroundStyle === 'blur') {
          const filterComplex = [
            `[0:v]scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=increase,crop=${targetWidth}:${targetHeight},boxblur=25:25[bg]`,
            `[0:v]scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease[fg]`,
            `[bg][fg]overlay=(W-w)/2:(H-h)/2[outv]`,
          ].join(';');

          command = command
            .complexFilter(filterComplex, ['outv'])
            .outputOptions(['-map [outv]', '-map 0:a?']);
        } else {
          let hex = '0x000000';
          if (backgroundStyle === 'white') {
            hex = '0xFFFFFF';
          } else if (backgroundStyle === 'color' && options.customColorHex) {
            hex = options.customColorHex.startsWith('#')
              ? options.customColorHex.replace('#', '0x')
              : options.customColorHex.startsWith('0x')
              ? options.customColorHex
              : `0x${options.customColorHex}`;
          }

          const filter = `scale=w=${targetWidth}:h=${targetHeight}:force_original_aspect_ratio=decrease,pad=${targetWidth}:${targetHeight}:(ow-iw)/2:(oh-ih)/2:color=${hex}`;
          command = command.videoFilters(filter);
        }

        command = command.outputOptions([
          '-c:v libx264',
          '-pix_fmt yuv420p',
          '-c:a aac',
          '-b:a 192k',
          '-preset fast',
          '-movflags +faststart',
        ]);
        break;
      }

      case 'video-compress': {
        // Calculate target bitrate if targetSizeMb is provided (e.g. Discord 8MB/25MB, WhatsApp 16MB)
        if (options.targetSizeMb && totalDuration > 0) {
          const targetTotalBits = options.targetSizeMb * 8 * 1024 * 1024 * 0.92; // 8% safety margin for container overhead
          const audioBitrateKbps = 96;
          const targetVideoBitrateKbps = Math.max(
            80,
            Math.floor((targetTotalBits / totalDuration / 1000) - audioBitrateKbps)
          );

          command = command
            .videoCodec('libx264')
            .videoBitrate(`${targetVideoBitrateKbps}k`)
            .audioCodec('aac')
            .audioBitrate(`${audioBitrateKbps}k`)
            .outputOptions([
              '-preset fast',
              '-movflags +faststart',
              `-maxrate ${Math.round(targetVideoBitrateKbps * 1.4)}k`,
              `-bufsize ${Math.round(targetVideoBitrateKbps * 2)}k`,
            ]);
        } else {
          // Standard CRF visually lossless compression
          const crf = options.crf !== undefined ? options.crf : 28;
          command = command
            .videoCodec('libx264')
            .audioCodec('aac')
            .audioBitrate('128k')
            .outputOptions([
              `-crf ${crf}`,
              `-preset ${options.preset || 'medium'}`,
              '-movflags +faststart',
            ]);
        }
        break;
      }

      case 'video-resize':
      case 'video-convert': {
        const formatLower = targetFormat.toLowerCase();

        // Resolution scaling
        if (options.resolution && options.resolution !== 'original') {
          const resMap: Record<string, string> = {
            '1080p': 'scale=1920:-2',
            '720p': 'scale=1280:-2',
            '480p': 'scale=854:-2',
            '360p': 'scale=640:-2',
          };
          if (resMap[options.resolution]) {
            command = command.videoFilters(resMap[options.resolution]);
          }
        }

        // Format-specific codec selection
        if (formatLower === 'mp4' || formatLower === 'm4v') {
          command = command
            .videoCodec('libx264')
            .audioCodec('aac')
            .outputOptions(['-crf 23', '-preset medium', '-movflags +faststart', '-pix_fmt yuv420p']);
        } else if (formatLower === 'webm') {
          command = command
            .videoCodec('libvpx-vp9')
            .audioCodec('libopus')
            .outputOptions(['-crf 30', '-b:v 0', '-preset fast']);
        } else if (formatLower === 'mov') {
          command = command
            .videoCodec('libx264')
            .audioCodec('aac')
            .outputOptions(['-crf 22', '-preset medium']);
        } else if (formatLower === 'mkv') {
          command = command
            .videoCodec('libx264')
            .audioCodec('aac')
            .outputOptions(['-crf 22', '-preset medium']);
        } else if (formatLower === 'avi') {
          command = command
            .videoCodec('libx264')
            .audioCodec('mp3')
            .outputOptions(['-crf 24', '-preset fast']);
        } else if (formatLower === 'wmv') {
          command = command
            .videoCodec('wmv2')
            .audioCodec('wmav2')
            .outputOptions(['-q:v 3']);
        } else if (formatLower === 'flv') {
          command = command
            .videoCodec('flv')
            .audioCodec('mp3')
            .outputOptions(['-q:v 3']);
        }
        break;
      }

      case 'video-trim': {
        // Fast trim preserving stream codecs when possible
        command = command
          .videoCodec('libx264')
          .audioCodec('aac')
          .outputOptions(['-preset fast', '-movflags +faststart']);
        break;
      }

      case 'burn-subtitles-to-video': {
        let subPath = options.subtitlePath;

        // If raw subtitle content is provided in options, write to temp .srt file
        if ((!subPath || !fs.existsSync(subPath)) && options.subtitleContent) {
          const tempSubDir = path.join(os.tmpdir(), 'apextools', 'temp_sub');
          if (!fs.existsSync(tempSubDir)) {
            fs.mkdirSync(tempSubDir, { recursive: true });
          }
          subPath = path.join(tempSubDir, `${jobId}.srt`);
          fs.writeFileSync(subPath, options.subtitleContent, 'utf8');
        }

        if (!subPath || !fs.existsSync(subPath)) {
          throw new Error('Subtitle file or subtitle text content is required for burning subtitles.');
        }

        // Properly escape Windows path for FFmpeg subtitles filter
        // Colons must be escaped (\:), backslashes replaced with forward slashes
        const escapedSubPath = subPath.replace(/\\/g, '/').replace(/:/g, '\\:');

        const fontName = options.fontName || 'Arial';
        const fontSize = options.fontSize || 24;
        const primaryColor = hexToAssColor(options.primaryColorHex || '#FFFFFF');
        const outlineColor = hexToAssColor(options.outlineColorHex || '#000000');
        const outlineThickness = options.outlineThickness !== undefined ? options.outlineThickness : 2;
        const alignment = options.alignment !== undefined ? options.alignment : 2;
        const marginV = options.marginV !== undefined ? options.marginV : 30;

        const forceStyle = `Fontname=${fontName},FontSize=${fontSize},PrimaryColour=${primaryColor},OutlineColour=${outlineColor},BorderStyle=1,Outline=${outlineThickness},Alignment=${alignment},MarginV=${marginV}`;
        const subFilter = `subtitles='${escapedSubPath}':force_style='${forceStyle}'`;

        command = command
          .videoFilters(subFilter)
          .videoCodec('libx264')
          .audioCodec('aac')
          .outputOptions(['-preset fast', '-movflags +faststart', '-pix_fmt yuv420p']);
        break;
      }

      case 'mute-video-replace-audio':
      case 'video-mute':
      case 'video-replace-audio': {
        if (options.muteOnly || !options.newAudioPath || !fs.existsSync(options.newAudioPath)) {
          // Instant Lossless Mute without re-encoding video streams
          command = command.outputOptions(['-c:v copy', '-an']);
        } else {
          // Lossless Video Stream Copy + New AAC Audio Stream
          command = command
            .input(options.newAudioPath)
            .outputOptions([
              '-c:v copy',
              '-c:a aac',
              '-b:a 192k',
              '-map 0:v:0',
              '-map 1:a:0',
              '-shortest',
              '-movflags +faststart',
            ]);
        }
        break;
      }

      case 'audio-speed-pitch-changer':
      case 'audio-speed': {
        const speed = Math.max(0.25, Math.min(4.0, options.speedMultiplier || 1.0));
        const semitones = options.pitchSemitones !== undefined ? Math.max(-12, Math.min(12, options.pitchSemitones)) : 0;
        const preservePitch = options.preservePitch !== false;
        const audioFilters: string[] = [];

        if (semitones !== 0) {
          const pitchRatio = Math.pow(2, semitones / 12);
          const baseSampleRate = 44100;
          const targetRate = Math.round(baseSampleRate * pitchRatio);
          audioFilters.push(`asetrate=${targetRate}`);
          audioFilters.push(`aresample=${baseSampleRate}`);
          let effectiveAtempo = (1 / pitchRatio) * (preservePitch || speed !== 1.0 ? speed : 1.0);
          while (effectiveAtempo > 2.0) {
            audioFilters.push('atempo=2.0');
            effectiveAtempo /= 2.0;
          }
          while (effectiveAtempo < 0.5) {
            audioFilters.push('atempo=0.5');
            effectiveAtempo /= 0.5;
          }
          if (Math.abs(effectiveAtempo - 1.0) > 0.001) {
            audioFilters.push(`atempo=${effectiveAtempo.toFixed(4)}`);
          }
        } else if (preservePitch) {
          let remainingSpeed = speed;
          while (remainingSpeed > 2.0) {
            audioFilters.push('atempo=2.0');
            remainingSpeed /= 2.0;
          }
          while (remainingSpeed < 0.5) {
            audioFilters.push('atempo=0.5');
            remainingSpeed /= 0.5;
          }
          if (Math.abs(remainingSpeed - 1.0) > 0.001) {
            audioFilters.push(`atempo=${remainingSpeed.toFixed(4)}`);
          }
        } else if (Math.abs(speed - 1.0) > 0.001) {
          const baseSampleRate = 44100;
          const targetRate = Math.round(baseSampleRate * speed);
          audioFilters.push(`asetrate=${targetRate}`);
          audioFilters.push(`aresample=${baseSampleRate}`);
        }

        if (audioFilters.length > 0) {
          command = command.audioFilters(audioFilters);
        }

        if (targetFormat.toLowerCase() === 'wav') {
          command = command.audioCodec('pcm_s16le');
        } else {
          command = command.audioCodec('libmp3lame').audioBitrate(options.bitrate || '320k');
        }
        break;
      }

      case 'audio-compress':
      case 'audio-convert':
      case 'audio-trim': {
        const audioFormat = targetFormat.toLowerCase();
        const bitrate = options.bitrate || (toolType === 'audio-compress' ? '96k' : '192k');

        if (audioFormat === 'mp3') {
          command = command.audioCodec('libmp3lame').audioBitrate(bitrate);
        } else if (audioFormat === 'wav') {
          command = command.audioCodec('pcm_s16le');
        } else if (audioFormat === 'aac' || audioFormat === 'm4a') {
          command = command.audioCodec('aac').audioBitrate(bitrate);
        } else if (audioFormat === 'flac') {
          command = command.audioCodec('flac');
        } else if (audioFormat === 'ogg') {
          command = command.audioCodec('libvorbis').audioBitrate(bitrate);
        } else if (audioFormat === 'opus') {
          command = command.audioCodec('libopus').audioBitrate(bitrate);
        }

        if (options.sampleRate) command = command.audioFrequency(options.sampleRate);
        if (options.audioChannels) command = command.audioChannels(options.audioChannels);
        break;
      }
    }

    let lastReportedPercent = 5;

    command
      .on('start', (commandLine) => {
        updateJobProgress(jobId, {
          status: 'processing',
          progress: 10,
          stage: 'Transcoding Stream',
          message: `Transcoding to ${targetFormat.toUpperCase()} with FFmpeg...`,
        });
      })
      .on('progress', (progress) => {
        let percent = 10;

        if (progress.percent && progress.percent > 0) {
          percent = Math.min(Math.round(progress.percent), 98);
        } else if (progress.timemark && totalDuration > 0) {
          // Parse HH:MM:SS.ms timemark
          const timeParts = progress.timemark.split(':');
          if (timeParts.length === 3) {
            const currentSeconds =
              parseFloat(timeParts[0]) * 3600 +
              parseFloat(timeParts[1]) * 60 +
              parseFloat(timeParts[2]);
            percent = Math.min(Math.round((currentSeconds / totalDuration) * 90) + 8, 98);
          }
        }

        if (percent > lastReportedPercent) {
          lastReportedPercent = percent;
          const fpsText = progress.currentFps ? ` at ${Math.round(progress.currentFps)} fps` : '';
          updateJobProgress(jobId, {
            status: 'processing',
            progress: percent,
            stage: `Processing (${percent}%)`,
            message: `Transcoding frames${fpsText}... (${percent}%)`,
          });
        }
      })
      .on('end', async () => {
        try {
          // Verify output file exists
          if (!fs.existsSync(outputPath)) {
            throw new Error(`FFmpeg output file not found at: ${outputPath}`);
          }

          const outputBuffer = await fs.promises.readFile(outputPath);
          const convertedSizeBytes = outputBuffer.length;

          // Save converted output file via TempStorageManager
          const storedRecord = await TempStorageManager.saveConverted(outputBuffer, {
            jobId,
            originalFilename,
            targetFilename,
            mime: getMimeForFormat(targetFormat),
            targetFormat,
            sourceFormat: jobData.sourceFormat,
            originalSizeBytes,
            userId: jobData.userId,
            ipHash: jobData.ipHash,
            ttlHours: 2,
          });

          const downloadUrl = `/api/download/${storedRecord.downloadToken}`;

          const result = {
            success: true,
            downloadUrl,
            targetFilename,
            convertedSizeBytes,
            originalSizeBytes,
            duration: metadata.durationSeconds,
            format: targetFormat,
            downloadToken: storedRecord.downloadToken,
          };

          await updateJobProgress(jobId, {
            status: 'completed',
            progress: 100,
            stage: 'Completed',
            message: 'Conversion completed successfully!',
            result,
          });

          // Clean up temp output file (TempStorageManager already stored safe copy)
          try {
            if (fs.existsSync(outputPath)) await fs.promises.unlink(outputPath);
          } catch {}

          resolve(result);
        } catch (err: any) {
          console.error('Error saving converted media file:', err);
          await updateJobProgress(jobId, {
            status: 'failed',
            progress: 0,
            stage: 'Failed',
            message: err?.message || 'Error saving converted media file.',
            error: err?.message,
          });
          reject(err);
        }
      })
      .on('error', async (err: any) => {
        console.error('FFmpeg execution failed:', err);
        const errMsg = err?.message || 'FFmpeg conversion process failed.';
        await updateJobProgress(jobId, {
          status: 'failed',
          progress: 0,
          stage: 'Failed',
          message: errMsg,
          error: errMsg,
        });
        reject(err);
      })
      .save(outputPath);
  });
}
