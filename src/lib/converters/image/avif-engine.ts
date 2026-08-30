import sharp from 'sharp';

export interface AvifConvertOptions {
  targetFormat: 'jpeg' | 'png' | 'webp' | 'avif';
  quality?: number; // 1 - 100 (Default: 80)
  effort?: number; // 1 - 9 (CPU effort, Default: 4)
  chromaSubsampling?: '4:2:0' | '4:4:4'; // 4:4:4 preserves sharp edges in graphics
  stripExif?: boolean; // Default: true for privacy and file size reduction
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

/**
 * AVIF Next-Gen Image Transformation Engine
 * Handles bidirectional conversions between AVIF and standard web formats
 * (JPEG, PNG, WebP) with fine-tuned quality, effort, and chroma subsampling.
 */
export async function processAvifConversion(
  inputBuffer: Buffer,
  options: AvifConvertOptions
): Promise<{ buffer: Buffer; mime: string; ext: string }> {
  let pipeline = sharp(inputBuffer, { failOn: 'none' });

  if (options.stripExif !== false) {
    pipeline = pipeline.rotate(); // Auto-rotates based on EXIF then strips metadata
  }

  if (options.width || options.height) {
    pipeline = pipeline.resize({
      width: options.width ? Math.round(options.width) : undefined,
      height: options.height ? Math.round(options.height) : undefined,
      fit: options.fit || 'inside',
      withoutEnlargement: false,
    });
  }

  const quality = Math.min(100, Math.max(1, options.quality ?? 80));
  const effort = Math.min(9, Math.max(1, options.effort ?? 4));

  switch (options.targetFormat) {
    case 'avif':
      pipeline = pipeline.avif({
        quality,
        effort,
        chromaSubsampling: options.chromaSubsampling || '4:2:0',
      });
      return {
        buffer: await pipeline.toBuffer(),
        mime: 'image/avif',
        ext: 'avif',
      };

    case 'webp':
      pipeline = pipeline.webp({
        quality,
        effort: Math.min(6, effort),
      });
      return {
        buffer: await pipeline.toBuffer(),
        mime: 'image/webp',
        ext: 'webp',
      };

    case 'png':
      pipeline = pipeline.png({
        compressionLevel: 9,
        palette: quality < 75,
      });
      return {
        buffer: await pipeline.toBuffer(),
        mime: 'image/png',
        ext: 'png',
      };

    case 'jpeg':
    default:
      pipeline = pipeline.jpeg({
        quality,
        mozjpeg: true,
        chromaSubsampling: options.chromaSubsampling || (quality >= 90 ? '4:4:4' : '4:2:0'),
      });
      return {
        buffer: await pipeline.toBuffer(),
        mime: 'image/jpeg',
        ext: 'jpg',
      };
  }
}
