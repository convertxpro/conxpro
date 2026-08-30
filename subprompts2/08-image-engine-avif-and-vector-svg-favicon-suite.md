# SUB-PROMPT 08: Modern Image Engine — AVIF Next-Gen & Vector SVG Multi-Pack Favicon Suite

## 1. Context & Objective
Modern web applications and mobile ecosystems require next-generation image formats:
- **AVIF (AV1 Image File Format):** Offers up to 50% better compression than WebP and 70% better than JPEG. Web developers, photographers, and e-commerce stores search heavily for *"AVIF to JPG"*, *"Convert JPG to AVIF"*, *"AVIF to PNG with transparency"*.
- **Vector SVG & Favicon Suite:** Developers need to rasterize SVGs into crisp high-resolution PNGs at custom pixel sizes (512px, 1024px, 4K) and generate bundled multi-resolution **Favicon `.ico` packs** (containing 16x16, 32x32, 48x48, 64x64 in a single container).

Your objective in this sub-prompt is to build:
1. **Tool C1: AVIF ↔ JPG / PNG / WebP Converter** (`avif-to-jpg`, `avif-to-png`, `jpg-to-avif`, `png-to-avif`, `webp-to-avif`).
2. **Tool C2: Vector SVG ↔ PNG / ICO with DPI & Multi-Resolution Favicon Pack** (`svg-to-png`, `svg-to-ico`, `png-to-svg`).
3. Backend image processing pipeline using `sharp` in `src/app/api/convert/route.ts` and `src/lib/converters/image/`.
4. Dedicated interactive components with side-by-side comparison sliders and high-res download options.

---

## 2. Technical Stack & Dependencies

- **Server-Side Image Pipeline:** `sharp` (built with AVIF / libheif / SVG librsvg support)
- **Favicon Multi-Pack Encoding:** `png-to-ico` or `sharp` buffer packing
- **Client-Side Comparison & Preview:** `framer-motion`, `lucide-react`
- **File Validation & Mime Security:** `file-type`

Install dependencies:
```bash
npm install sharp png-to-ico file-type
npm install @types/sharp --save-dev
```

---

## 3. Tool C1: AVIF ↔ JPG / PNG / WebP Transformation Engine

### 3.1 Backend Processing Engine (`src/lib/converters/image/avif-engine.ts`)
```typescript
import sharp from 'sharp';

export interface AvifConvertOptions {
  targetFormat: 'jpeg' | 'png' | 'webp' | 'avif';
  quality?: number; // 1 - 100 (Default: 80)
  effort?: number; // 1 - 9 (CPU effort, Default: 4)
  chromaSubsampling?: '4:2:0' | '4:4:4'; // 4:4:4 preserves sharp edges in graphics
  stripExif?: boolean; // Default: true for privacy and file size reduction
}

export async function processAvifConversion(
  inputBuffer: Buffer,
  options: AvifConvertOptions
): Promise<{ buffer: Buffer; mime: string; ext: string }> {
  let pipeline = sharp(inputBuffer);

  if (options.stripExif !== false) {
    pipeline = pipeline.rotate(); // Auto-rotates based on EXIF then strips metadata
  }

  const quality = Math.min(100, Math.max(1, options.quality || 80));
  const effort = Math.min(9, Math.max(1, options.effort || 4));

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
      pipeline = pipeline.webp({ quality, effort: Math.min(6, effort) });
      return {
        buffer: await pipeline.toBuffer(),
        mime: 'image/webp',
        ext: 'webp',
      };

    case 'png':
      pipeline = pipeline.png({ compressionLevel: 9 });
      return {
        buffer: await pipeline.toBuffer(),
        mime: 'image/png',
        ext: 'png',
      };

    case 'jpeg':
    default:
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
      return {
        buffer: await pipeline.toBuffer(),
        mime: 'image/jpeg',
        ext: 'jpg',
      };
  }
}
```

---

## 4. Tool C2: Vector SVG ↔ PNG / ICO Multi-Resolution Favicon Engine

### 4.1 SVG to Multi-Resolution Favicon & Raster Engine (`src/lib/converters/image/svg-favicon-engine.ts`)
```typescript
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

export interface SvgRasterOptions {
  width?: number;
  height?: number;
  dpi?: number;
  backgroundColor?: string; // transparent or hex
  tintColor?: string; // Replace fill color in SVG
}

export async function rasterizeSvgToPng(svgBuffer: Buffer, options: SvgRasterOptions): Promise<Buffer> {
  let svgContent = svgBuffer.toString('utf8');

  // Optional SVG fill tinting
  if (options.tintColor) {
    svgContent = svgContent.replace(/fill="([^"]*)"/g, `fill="${options.tintColor}"`);
    svgContent = svgContent.replace(/style="([^"]*fill:\s*[^;"]+;?[^"]*)"/g, `style="fill:${options.tintColor};"`);
  }

  const targetWidth = options.width || 1024;
  const targetHeight = options.height || targetWidth;

  return sharp(Buffer.from(svgContent), { density: options.dpi || 300 })
    .resize(targetWidth, targetHeight, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

export async function generateMultiResolutionIco(svgOrPngBuffer: Buffer): Promise<Buffer> {
  // Generate 4 standard favicon sizes: 16x16, 32x32, 48x48, 64x64
  const sizes = [16, 32, 48, 64];
  const pngBuffers = await Promise.all(
    sizes.map(size =>
      sharp(svgOrPngBuffer)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer()
    )
  );

  // Pack into a single multi-resolution .ico binary container
  return pngToIco(pngBuffers);
}
```

---

## 5. UI Components & Conversion Workflow

### 5.1 Image Canvas UI (`src/components/converters/image/ImageConverter.tsx`)
- **Interactive Controls:**
  - Target format dropdown: `AVIF`, `JPG`, `PNG`, `WebP`, `ICO (Favicon)`.
  - Quality Slider (1% to 100%) with live size estimation.
  - Custom Dimension Pickers for SVGs: `512×512`, `1024×1024`, `2048×2048`, `4096×4096 (4K)`.
- **Side-by-Side Comparison Slider:** Split visual comparison handle to inspect compression artifacts vs original before downloading.
- **Batch Processing Support:** Queue up to 10 images with single "Download All as ZIP" trigger.

---

## 6. Programmatic SEO & Structured Data

Add FAQ schemas for:
- *"What is AVIF and why is it smaller than WebP and JPEG?"*
- *"How to create a multi-resolution favicon.ico containing 16x16 and 32x32 icons from an SVG?"*
- *"Does converting SVG to PNG maintain transparent background?"*

---

## 7. Acceptance Criteria & Verification Checklist

- [ ] AVIF converter successfully encodes and decodes `.avif` files without memory leaks.
- [ ] Compression quality slider and EXIF stripping produce measurable file size reductions.
- [ ] SVG rasterizer renders sharp text and vectors without pixelation or anti-aliasing flaws.
- [ ] Multi-resolution `.ico` generator produces valid Windows favicon files verified to contain 16x16, 32x32, 48x48, and 64x64 layers.
- [ ] Side-by-side comparison slider allows visual inspection before downloading.
