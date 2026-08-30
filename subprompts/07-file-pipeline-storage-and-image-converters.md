# SUB-PROMPT 07: File Upload Pipeline, Image Conversion Engine & Format Programmatic SEO

## 1. Context & Objective
Image conversion represents the highest volume of binary file conversion traffic on the web. A modern image pipeline must be ultra-fast, support modern mobile formats (specifically Apple’s `.heic` photos), provide precise compression controls, and enforce strict security guardrails with automated file lifecycle cleanup (1–2 hour auto-delete).

Your objective in this prompt is to:
1. Construct the core file upload and temporary storage lifecycle.
2. Integrate high-speed Node.js image processing via `sharp` and `heic-convert` / `libheif`.
3. Build image transformation tools (format conversion, compressor, resizer, background remover).
4. Construct **Programmatic Landing Pages** for all major image pairs (`heic-to-jpg`, `png-to-jpg`, `webp-to-jpg`, `png-to-webp`) equipped with format comparison tables, 3-step visual How-To guides, and Schema.org structured data.
5. Wire the complete conversion UI workflow (Upload → Processing with Ad → Download).

---

## 2. Technical Stack & Dependencies

- **Image Processing:** `sharp` (High performance Node.js image pipeline), `heic-convert` (HEIC decoding)
- **File Validation & Security:** `file-type` (magic bytes detection), `uuid`
- **Storage:** Supabase Storage / S3-compatible temporary spooler
- **SEO & Structured Data:** `schema-dts`, Next.js Dynamic Metadata

Install dependencies:
```bash
npm install sharp heic-convert file-type uuid schema-dts
npm install @types/uuid --save-dev
```

---

## 3. Storage Architecture & 1-Hour Auto-Purge Lifecycle

### 3.1 File Lifecycle State Machine
```
[User Uploads Image (HEIC/PNG/JPG/WebP)]
       │
       ▼
[Server Validation: Magic Bytes + Size Guard + Quota Check]
       │
       ▼
[Save to Temp Storage: /tmp/uploads/{jobId}-{filename}]
       │
       ▼
[Sharp / Heic Pipeline Executes in Worker / API Route]
       │
       ▼
[Save Output: /tmp/converted/{jobId}-{targetFilename}]
       │
       ▼
[Generate Secure 1-Time Download Token (Expires in 2 Hours)]
       │
       ▼
[Auto-Purge Cron Deletes Files from Disk/Storage after 1-2 Hours]
```

---

### 3.2 File Validation & Sanitization Helper (`src/lib/storage/file-security.ts`)
```typescript
import { fileTypeFromBuffer } from 'file-type';
import path from 'path';

export const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'image/svg+xml',
  'image/x-icon',
  'image/heic',
  'image/heif',
];

export async function validateAndSanitizeFile(buffer: Buffer, originalFilename: string) {
  // 1. Detect True MIME from Magic Bytes
  const detected = await fileTypeFromBuffer(buffer);
  
  // Allow SVG fallback (SVGs don't always have binary magic bytes)
  const isSvg = originalFilename.toLowerCase().endsWith('.svg') && buffer.toString('utf8', 0, 100).includes('<svg');
  
  const mime = isSvg ? 'image/svg+xml' : detected?.mime;
  if (!mime || !ALLOWED_IMAGE_MIMES.includes(mime)) {
    throw new Error(`Unsupported or disguised file format: ${mime || 'unknown'}`);
  }

  // 2. Sanitize Filename (Prevent Path Traversal)
  const cleanExt = path.extname(originalFilename).replace(/[^a-zA-Z0-9.]/g, '').toLowerCase();
  const baseName = path.basename(originalFilename, cleanExt).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);

  return {
    cleanFilename: `${baseName}${cleanExt}`,
    mime,
    ext: detected?.ext || (isSvg ? 'svg' : 'bin'),
  };
}
```

---

## 4. Image Conversion Engine (`src/lib/converters/image-engine.ts`)

```typescript
import sharp from 'sharp';
import heicConvert from 'heic-convert';

export interface ImageConvertOptions {
  targetFormat: 'jpg' | 'jpeg' | 'png' | 'webp' | 'gif' | 'bmp' | 'tiff' | 'ico' | 'svg';
  quality?: number; // 1-100
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export async function processImage(inputBuffer: Buffer, options: ImageConvertOptions): Promise<Buffer> {
  let workingBuffer = inputBuffer;

  // 1. Handle HEIC/HEIF Decoding First
  if (options.targetFormat !== 'ico') {
    try {
      const isHeic = inputBuffer.toString('utf8', 4, 12).includes('ftypheic') || 
                     inputBuffer.toString('utf8', 4, 12).includes('ftypmif1');
      if (isHeic) {
        workingBuffer = Buffer.from(
          await heicConvert({
            buffer: inputBuffer,
            format: 'PNG',
            quality: 1,
          })
        );
      }
    } catch {
      // Continue with sharp if not HEIC
    }
  }

  let pipeline = sharp(workingBuffer, { failOnError: false }).rotate(); // Auto-rotates based on EXIF

  // 2. Handle Resizing
  if (options.width || options.height) {
    pipeline = pipeline.resize({
      width: options.width,
      height: options.height,
      fit: options.fit || 'inside',
      withoutEnlargement: true,
    });
  }

  const q = options.quality || 85;

  // 3. Format Transformation
  switch (options.targetFormat) {
    case 'jpg':
    case 'jpeg':
      return await pipeline.jpeg({ quality: q, mozjpeg: true }).toBuffer();
    case 'png':
      return await pipeline.png({ compressionLevel: 8 }).toBuffer();
    case 'webp':
      return await pipeline.webp({ quality: q, effort: 4 }).toBuffer();
    case 'gif':
      return await pipeline.gif().toBuffer();
    case 'tiff':
      return await pipeline.tiff({ quality: q }).toBuffer();
    case 'ico':
      return await pipeline.resize(256, 256, { fit: 'contain' }).png().toBuffer();
    default:
      return await pipeline.toBuffer();
  }
}
```

---

## 5. Programmatic Image SEO Landing Pages & Feature Comparison Matrices

### 5.1 Programmatic Format Pairs (`src/app/(converters)/image/[slug]/page.tsx`)
Build dedicated SSG landing pages for high-traffic search terms:
- `/convert/image/heic-to-jpg` (Primary iPhone photo conversion query)
- `/convert/image/heic-to-png`
- `/convert/image/png-to-jpg`, `/convert/image/jpg-to-png`
- `/convert/image/webp-to-jpg`, `/convert/image/jpg-to-webp`
- `/convert/image/png-to-webp`, `/convert/image/webp-to-png`
- `/convert/image/png-to-svg`, `/convert/image/png-to-ico`
- `/convert/image/compress-image`, `/convert/image/resize-image`, `/convert/image/remove-background`

### 5.2 Format Comparison Reference Table
Every image tool page includes a pre-computed format comparison table for search engines:

| Format | Transparency | Typical Compression | Best For | Browser Support |
|---|---|---|---|---|
| **WebP** | Yes (Alpha) | 25–35% smaller than JPG | Web images, fast page speed | 97%+ modern browsers |
| **JPG / JPEG** | No | High lossy compression | Photographs, realistic artwork | 100% universal |
| **PNG** | Yes (Lossless) | Minimal compression | Logos, icons, UI graphics | 100% universal |
| **HEIC** | Yes | 50% smaller than JPG | Apple iPhone / iOS camera photos | Safari / iOS / macOS |

---

## 6. The Conversion UX Flow (Upload → Processing → Download)

1. **Upload Stage:**
   - Dropzone with drag & drop, file type verification, size display, and quota warning.
2. **Processing Stage (`src/components/conversion/ProcessingScreen.tsx`):**
   - Clean, honest progress bar (2–4 seconds).
   - Display `AdSlot` (`placement="processing_screen"`) directly adjacent to the progress indicator.
   - Neutral messaging: *"Converting your image with high-definition rendering..."* (No deceptive countdowns).
3. **Download Stage (`src/components/conversion/DownloadScreen.tsx`):**
   - Large, clear download button with file format badge and size saved metric.
   - "Convert Another File" button.
   - Prominent privacy note: *"Your file will be automatically deleted from our server in 2 hours."*
   - Display `AdSlot` (`placement="download_page"`).

---

## 7. Auto-Purge Cron (`/api/cron/purge-files`)
Create an endpoint triggered every 30 minutes that queries `conversion_jobs` where `expires_at < NOW()` and removes the associated files from temporary disk/Supabase storage.

---

## 8. Acceptance Criteria & Verification Checklist

- [ ] Sharp image conversion handles JPG, PNG, WebP, GIF, BMP, TIFF, and ICO.
- [ ] HEIC iPhone photos convert to JPG/PNG with proper EXIF orientation preserved.
- [ ] Programmatic landing pages for HEIC to JPG, PNG to JPG, WebP to JPG compile with valid SSG metadata.
- [ ] Format comparison reference tables render on all image tool pages.
- [ ] Magic byte verification rejects renamed executable/dangerous files.
- [ ] Processing screen displays `<AdSlot placement="processing_screen" />` without blocking user download.
- [ ] Auto-purge cron deletes expired temporary files and updates job status to `expired`.
- [ ] Valid `HowTo`, `SoftwareApplication`, and `FAQPage` JSON-LD structured data is injected on all routes.
