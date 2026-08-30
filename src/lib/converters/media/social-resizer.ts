import { ffmpeg } from './ffmpeg-config';

export type AspectRatioPreset = '9:16' | '16:9' | '1:1' | '4:5';
export type BackgroundStyle = 'blur' | 'black' | 'white' | 'color' | 'crop';

export interface SocialResizeOptions {
  preset: AspectRatioPreset;
  backgroundStyle: BackgroundStyle;
  customColorHex?: string; // e.g. '#1e293b' or '0x1e293b'
}

export function getCanvasDimensions(preset: AspectRatioPreset): { targetWidth: number; targetHeight: number } {
  switch (preset) {
    case '9:16': // TikTok, Instagram Reels, YouTube Shorts
      return { targetWidth: 1080, targetHeight: 1920 };
    case '16:9': // YouTube, Desktop widescreen
      return { targetWidth: 1920, targetHeight: 1080 };
    case '1:1': // Square (Instagram Feed, Facebook)
      return { targetWidth: 1080, targetHeight: 1080 };
    case '4:5': // Instagram Portrait Post
      return { targetWidth: 1080, targetHeight: 1350 };
    default:
      return { targetWidth: 1080, targetHeight: 1920 };
  }
}

export function resizeVideoForSocial(
  inputPath: string,
  outputPath: string,
  options: SocialResizeOptions,
  onProgress?: (percent: number) => void
): Promise<void> {
  const { targetWidth, targetHeight } = getCanvasDimensions(options.preset);

  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath);

    if (options.backgroundStyle === 'crop') {
      // Scale and crop to fill entire canvas without padding
      const filter = `scale=w=${targetWidth}:h=${targetHeight}:force_original_aspect_ratio=increase,crop=${targetWidth}:${targetHeight}`;
      command = command.videoFilters(filter);
    } else if (options.backgroundStyle === 'blur') {
      // Blurred mirrored background filtergraph
      const filterComplex = [
        `[0:v]scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=increase,crop=${targetWidth}:${targetHeight},boxblur=25:25[bg]`,
        `[0:v]scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease[fg]`,
        `[bg][fg]overlay=(W-w)/2:(H-h)/2[outv]`,
      ].join(';');

      command = command
        .complexFilter(filterComplex, ['outv'])
        .outputOptions(['-map [outv]', '-map 0:a?']);
    } else {
      // Solid color letterbox / pillarbox padding
      let hex = '0x000000';
      if (options.backgroundStyle === 'white') {
        hex = '0xFFFFFF';
      } else if (options.backgroundStyle === 'color' && options.customColorHex) {
        hex = options.customColorHex.startsWith('#')
          ? options.customColorHex.replace('#', '0x')
          : options.customColorHex.startsWith('0x')
          ? options.customColorHex
          : `0x${options.customColorHex}`;
      }

      const filter = `scale=w=${targetWidth}:h=${targetHeight}:force_original_aspect_ratio=decrease,pad=${targetWidth}:${targetHeight}:(ow-iw)/2:(oh-ih)/2:color=${hex}`;
      command = command.videoFilters(filter);
    }

    command
      .outputOptions([
        '-c:v libx264',
        '-pix_fmt yuv420p', // Universal Apple iOS, Android, and web browser compatibility
        '-c:a aac',
        '-b:a 192k',
        '-preset fast',
        '-movflags +faststart', // Web streaming instant playback
      ])
      .save(outputPath)
      .on('progress', (p) => {
        if (onProgress && p.percent) {
          onProgress(Math.min(Math.round(p.percent), 99));
        }
      })
      .on('end', () => resolve())
      .on('error', (err) => reject(new Error(`Video resizing failed: ${err.message}`)));
  });
}
