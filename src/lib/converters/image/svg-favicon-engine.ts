import sharp from 'sharp';
import pngToIco from 'png-to-ico';

export interface SvgRasterOptions {
  width?: number;
  height?: number;
  dpi?: number;
  backgroundColor?: string; // transparent or hex
  tintColor?: string; // Replace fill color in SVG
}

/**
 * High-definition vector SVG rasterizer to PNG
 * Preserves vector geometry and text rendering crispness up to 8K resolutions
 */
export async function rasterizeSvgToPng(svgBuffer: Buffer, options: SvgRasterOptions = {}): Promise<Buffer> {
  let svgContent = svgBuffer.toString('utf8');

  // Optional SVG fill tinting
  if (options.tintColor) {
    // If SVG doesn't have explicit fill or has fill="...", replace / augment
    svgContent = svgContent.replace(/fill="([^"]*)"/g, `fill="${options.tintColor}"`);
    svgContent = svgContent.replace(/style="([^"]*fill:\s*[^;"]+;?[^"]*)"/g, `style="fill:${options.tintColor};"`);
  }

  const targetWidth = options.width || 1024;
  const targetHeight = options.height || targetWidth;
  const dpi = options.dpi || 300;

  let pipeline = sharp(Buffer.from(svgContent, 'utf8'), {
    density: dpi,
    failOn: 'none',
  });

  const bg = options.backgroundColor && options.backgroundColor !== 'transparent'
    ? options.backgroundColor
    : { r: 0, g: 0, b: 0, alpha: 0 };

  pipeline = pipeline.resize(targetWidth, targetHeight, {
    fit: 'contain',
    background: bg,
  });

  return pipeline.png({ compressionLevel: 9 }).toBuffer();
}

/**
 * Generate a multi-resolution Windows Favicon `.ico` container
 * Encodes 16x16, 32x32, 48x48, and 64x64 icons into a single multi-layered ICO
 */
export async function generateMultiResolutionIco(svgOrPngBuffer: Buffer): Promise<Buffer> {
  // Generate 4 standard favicon sizes: 16x16, 32x32, 48x48, 64x64
  const sizes = [16, 32, 48, 64];

  // If input is SVG, specify high density for crisp rasterization
  const isSvg = svgOrPngBuffer.toString('utf8', 0, 100).includes('<svg');
  const sharpOptions = isSvg ? { density: 300 } : {};

  const pngBuffers = await Promise.all(
    sizes.map((size) =>
      sharp(svgOrPngBuffer, sharpOptions)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer()
    )
  );

  // Pack into a single multi-resolution .ico binary container
  return pngToIco(pngBuffers);
}
