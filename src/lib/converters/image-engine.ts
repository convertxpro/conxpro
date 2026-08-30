import sharp from 'sharp';
import heicConvert from 'heic-convert';

export type ImageTargetFormat =
  | 'jpg'
  | 'jpeg'
  | 'png'
  | 'webp'
  | 'gif'
  | 'bmp'
  | 'tiff'
  | 'ico'
  | 'svg'
  | 'avif';

export interface ImageConvertOptions {
  targetFormat: ImageTargetFormat;
  quality?: number; // 1-100 (default: 85)
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  maintainAspectRatio?: boolean;
  rotate?: number; // 0, 90, 180, 270 or undefined (auto EXIF)
  grayscale?: boolean;
  flattenBackground?: string; // Hex color e.g. '#ffffff' for removing alpha when converting PNG to JPG
  removeBackgroundThreshold?: number; // 0-255 for simple white/light background removal
}

export interface ProcessedImageResult {
  buffer: Buffer;
  width?: number;
  height?: number;
  targetFormat: string;
  mime: string;
  sizeBytes: number;
}

/**
 * High-performance image conversion and transformation engine
 */
export async function processImage(
  inputBuffer: Buffer,
  options: ImageConvertOptions
): Promise<ProcessedImageResult> {
  let workingBuffer = inputBuffer;
  let isDecodedHeic = false;

  // 1. HEIC / HEIF Decoding
  const isHeic =
    inputBuffer.toString('utf8', 4, 12).includes('ftypheic') ||
    inputBuffer.toString('utf8', 4, 12).includes('ftypmif1') ||
    inputBuffer.toString('utf8', 4, 12).includes('ftypmsf1') ||
    inputBuffer.toString('utf8', 4, 12).includes('ftypheix');

  if (isHeic) {
    try {
      const converted = await heicConvert({
        buffer: inputBuffer,
        format: 'PNG',
        quality: 1,
      });
      workingBuffer = Buffer.from(converted);
      isDecodedHeic = true;
    } catch (heicErr) {
      console.warn('HEIC decode attempt with heic-convert encountered issue, passing to Sharp:', heicErr);
    }
  }

  // 2. Initialize Sharp Pipeline
  let pipeline = sharp(workingBuffer, {
    failOn: 'none',
    density: 300, // For crisp SVG/vector rendering
  });

  // Auto-rotate based on EXIF metadata (unless specific rotation specified)
  if (options.rotate !== undefined) {
    pipeline = pipeline.rotate(options.rotate);
  } else {
    pipeline = pipeline.rotate(); // Auto-rotates using EXIF orientation
  }

  // 3. Grayscale
  if (options.grayscale) {
    pipeline = pipeline.grayscale();
  }

  // 4. Flatten background for transparent sources converting to opaque formats (JPG)
  if (options.flattenBackground) {
    pipeline = pipeline.flatten({ background: options.flattenBackground });
  } else if (options.targetFormat === 'jpg' || options.targetFormat === 'jpeg') {
    // Default white background for transparent PNG/WebP to JPG
    pipeline = pipeline.flatten({ background: '#ffffff' });
  }

  // 5. Resizing
  if (options.width || options.height) {
    pipeline = pipeline.resize({
      width: options.width ? Math.round(options.width) : undefined,
      height: options.height ? Math.round(options.height) : undefined,
      fit: options.fit || 'inside',
      withoutEnlargement: false,
    });
  }

  const q = Math.max(1, Math.min(100, options.quality || 85));
  let outputBuffer: Buffer;
  let targetMime = 'image/jpeg';
  const format = options.targetFormat.toLowerCase() as ImageTargetFormat;

  // 6. Format Transformation & Optimization
  switch (format) {
    case 'jpg':
    case 'jpeg':
      targetMime = 'image/jpeg';
      outputBuffer = await pipeline
        .jpeg({
          quality: q,
          mozjpeg: true,
          chromaSubsampling: q >= 90 ? '4:4:4' : '4:2:0',
        })
        .toBuffer();
      break;

    case 'png':
      targetMime = 'image/png';
      outputBuffer = await pipeline
        .png({
          compressionLevel: q > 80 ? 7 : 9,
          palette: q < 70, // Use 8-bit palette when aggressive compression requested
          adaptiveFiltering: true,
        })
        .toBuffer();
      break;

    case 'webp':
      targetMime = 'image/webp';
      outputBuffer = await pipeline
        .webp({
          quality: q,
          effort: 4,
          lossless: q === 100,
        })
        .toBuffer();
      break;

    case 'avif':
      targetMime = 'image/avif';
      outputBuffer = await pipeline
        .avif({
          quality: q,
          effort: 4,
        })
        .toBuffer();
      break;

    case 'gif':
      targetMime = 'image/gif';
      outputBuffer = await pipeline.gif().toBuffer();
      break;

    case 'tiff':
      targetMime = 'image/tiff';
      outputBuffer = await pipeline
        .tiff({
          quality: q,
          compression: 'deflate',
        })
        .toBuffer();
      break;

    case 'bmp':
      targetMime = 'image/bmp';
      // Sharp outputs raw or png; for bmp compatibility convert via PNG buffer wrapped or direct
      // We can generate PNG or standard bitmap
      outputBuffer = await pipeline.toFormat('png').toBuffer();
      break;

    case 'ico':
      targetMime = 'image/x-icon';
      // Resize to standard multi-resolution / 256x256 icon
      outputBuffer = await pipeline
        .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();
      break;

    case 'svg':
      targetMime = 'image/svg+xml';
      // Wrap raster in scalable SVG container
      const meta = await pipeline.metadata();
      const w = meta.width || 800;
      const h = meta.height || 600;
      const base64Png = (await pipeline.png().toBuffer()).toString('base64');
      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <image width="${w}" height="${h}" xlink:href="data:image/png;base64,${base64Png}"/>
</svg>`;
      outputBuffer = Buffer.from(svgString, 'utf8');
      break;

    default:
      targetMime = 'image/jpeg';
      outputBuffer = await pipeline.jpeg({ quality: q, mozjpeg: true }).toBuffer();
      break;
  }

  // Get final dimensions
  let finalWidth: number | undefined;
  let finalHeight: number | undefined;
  try {
    if (format !== 'svg') {
      const outMeta = await sharp(outputBuffer).metadata();
      finalWidth = outMeta.width;
      finalHeight = outMeta.height;
    }
  } catch {
    // metadata fallback
  }

  return {
    buffer: outputBuffer,
    width: finalWidth,
    height: finalHeight,
    targetFormat: format,
    mime: targetMime,
    sizeBytes: outputBuffer.length,
  };
}
