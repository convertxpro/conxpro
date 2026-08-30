import { ffmpeg } from './ffmpeg-config';

export interface GifToVideoOptions {
  targetFormat: 'mp4' | 'webm';
  qualityCrf?: number; // 18 - 28 (Default: 23 for mp4, 30 for webm)
  fps?: number; // Optional frame rate clamp
}

export function convertGifToVideo(
  inputPath: string,
  outputPath: string,
  options: GifToVideoOptions,
  onProgress?: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath);

    if (options.fps && options.fps > 0) {
      command = command.fps(options.fps);
    }

    if (options.targetFormat === 'mp4') {
      command = command.outputOptions([
        '-c:v libx264',
        '-pix_fmt yuv420p', // Critical for universal iOS, Android, and browser playback
        `-crf ${options.qualityCrf || 23}`,
        '-preset medium',
        '-movflags +faststart', // Instant web streaming without full buffer download
        // Ensure even dimensions (H.264 requires width & height divisible by 2)
        '-vf pad=ceil(iw/2)*2:ceil(ih/2)*2',
        '-an', // Strip audio tracks (GIFs are silent)
      ]);
    } else if (options.targetFormat === 'webm') {
      command = command.outputOptions([
        '-c:v libvpx-vp9',
        `-crf ${options.qualityCrf || 30}`,
        '-b:v 0',
        '-pix_fmt yuv420p',
        '-an',
      ]);
    }

    command
      .on('progress', (p) => {
        if (onProgress && p.percent) {
          onProgress(Math.min(Math.round(p.percent), 99));
        }
      })
      .on('end', () => resolve())
      .on('error', (err) => reject(new Error(`GIF conversion failed: ${err.message}`)))
      .save(outputPath);
  });
}
