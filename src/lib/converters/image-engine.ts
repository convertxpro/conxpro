import sharp from 'sharp';
import heicConvert from 'heic-convert';
import { processAvifConversion, AvifConvertOptions } from './image/avif-engine';
import { rasterizeSvgToPng, generateMultiResolutionIco, SvgRasterOptions } from './image/svg-favicon-engine';

export { processAvifConversion, rasterizeSvgToPng, generateMultiResolutionIco };
export type { AvifConvertOptions, SvgRasterOptions };

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
  effort?: number; // 1-9 (default: 4)
  chromaSubsampling?: '4:2:0' | '4:4:4'; // 4:4:4 for maximum edge crispness
  stripExif?: boolean; // default: true
  width?: number;
  height?: number;
  dpi?: number; // 72, 150, 300, 600 (default: 300 for vector/SVG)
  tintColor?: string; // Optional hex fill override for SVGs
  multiResolutionIco?: boolean; // For packing 16x16, 32x32, 48x48, 64x64 into a single .ico
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
 * High-performance image conversion, rasterization, and transformation engine
 */
export async function processImage(
  inputBuffer: Buffer,
  options: ImageConvertOptions
): Promise<ProcessedImageResult> {
  let workingBuffer = inputBuffer;
  const format = options.targetFormat.toLowerCase() as ImageTargetFormat;

  // 1. Check if input is SVG
  const isInputSvg =
    inputBuffer.toString('utf8', 0, 200).includes('<svg') ||
    inputBuffer.toString('utf8', 0, 200).includes('<?xml');

  // 2. Special Case: Multi-Resolution Favicon Pack (.ico)
  if (format === 'ico' || options.multiResolutionIco) {
    try {
      const icoBuffer = await generateMultiResolutionIco(workingBuffer);
      return {
        buffer: icoBuffer,
        width: 64,
        height: 64,
        targetFormat: 'ico',
        mime: 'image/x-icon',
        sizeBytes: icoBuffer.length,
      };
    } catch (icoErr) {
      console.warn('Multi-resolution ICO pack fallback to standard sharp resize:', icoErr);
    }
  }

  // 3. Special Case: SVG Vector to Raster (with custom DPI, tint, dimensions)
  if (isInputSvg && (format === 'png' || format === 'jpg' || format === 'jpeg' || format === 'webp' || format === 'avif')) {
    const rasterPng = await rasterizeSvgToPng(workingBuffer, {
      width: options.width,
      height: options.height,
      dpi: options.dpi || 300,
      backgroundColor: options.flattenBackground,
      tintColor: options.tintColor,
    });

    if (format === 'png') {
      const meta = await sharp(rasterPng).metadata();
      return {
        buffer: rasterPng,
        width: meta.width,
        height: meta.height,
        targetFormat: 'png',
        mime: 'image/png',
        sizeBytes: rasterPng.length,
      };
    }
    // For other formats from SVG, pass the high-res raster PNG to Sharp pipeline below
    workingBuffer = rasterPng;
  }

  // 4. HEIC / HEIF Decoding
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
    } catch (heicErr) {
      console.warn('HEIC decode attempt with heic-convert encountered issue, passing to Sharp:', heicErr);
    }
  }

  // 5. Special Case: AVIF Next-Gen Engine Direct Pipeline
  if (format === 'avif' || (!isInputSvg && options.targetFormat === 'avif')) {
    const avifResult = await processAvifConversion(workingBuffer, {
      targetFormat: 'avif',
      quality: options.quality,
      effort: options.effort,
      chromaSubsampling: options.chromaSubsampling,
      stripExif: options.stripExif !== false,
      width: options.width,
      height: options.height,
      fit: options.fit,
    });

    let w: number | undefined;
    let h: number | undefined;
    try {
      const meta = await sharp(avifResult.buffer).metadata();
      w = meta.width;
      h = meta.height;
    } catch {
      // ignore
    }

    return {
      buffer: avifResult.buffer,
      width: w,
      height: h,
      targetFormat: 'avif',
      mime: avifResult.mime,
      sizeBytes: avifResult.buffer.length,
    };
  }

  // 6. Initialize General Sharp Pipeline
  let pipeline = sharp(workingBuffer, {
    failOn: 'none',
    density: options.dpi || 300, // For crisp SVG/vector rendering
  });

  // Auto-rotate based on EXIF metadata
  if (options.rotate !== undefined) {
    pipeline = pipeline.rotate(options.rotate);
  } else if (options.stripExif !== false) {
    pipeline = pipeline.rotate(); // Auto-rotates using EXIF orientation
  }

  // Grayscale filter
  if (options.grayscale) {
    pipeline = pipeline.grayscale();
  }

  // Flatten background for transparent sources converting to opaque formats (JPG)
  if (options.flattenBackground) {
    pipeline = pipeline.flatten({ background: options.flattenBackground });
  } else if (format === 'jpg' || format === 'jpeg') {
    pipeline = pipeline.flatten({ background: '#ffffff' });
  }

  // Resizing
  if (options.width || options.height) {
    pipeline = pipeline.resize({
      width: options.width ? Math.round(options.width) : undefined,
      height: options.height ? Math.round(options.height) : undefined,
      fit: options.fit || 'inside',
      withoutEnlargement: false,
    });
  }

  const q = Math.max(1, Math.min(100, options.quality || 85));
  const effort = Math.max(1, Math.min(9, options.effort || 4));
  let outputBuffer: Buffer;
  let targetMime = 'image/jpeg';

  // 7. Format Transformation & Optimization
  switch (format) {
    case 'jpg':
    case 'jpeg':
      targetMime = 'image/jpeg';
      outputBuffer = await pipeline
        .jpeg({
          quality: q,
          mozjpeg: true,
          chromaSubsampling: options.chromaSubsampling || (q >= 90 ? '4:4:4' : '4:2:0'),
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
          effort: Math.min(6, effort),
          lossless: q === 100,
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
      outputBuffer = await pipeline.toFormat('png').toBuffer();
      break;

    case 'ico':
      targetMime = 'image/x-icon';
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
