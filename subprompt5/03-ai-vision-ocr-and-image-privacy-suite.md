# SUB-PROMPT 03: AI Vision, Multi-Language OCR & Image Privacy Suite

## 1. Context & Architectural Overview
This sub-prompt details the implementation of the **AI Vision, Multi-Language OCR & Image Privacy Suite** for ConvertX.
This suite leverages modern client-side WebAssembly, ONNX Runtime Web for browser-based neural network execution, Tesseract.js WebAssembly OCR, ExifReader for metadata extraction, and SVGO for in-browser vector minification.

### Core Guarantees:
- **100% On-Device AI Execution:** Neural network background isolation and OCR text recognition run completely inside the user's browser WebAssembly / WebGPU sandbox.
- **Zero Privacy Leakage:** Confidential IDs, passport scans, personal photographs, and receipts are never uploaded to any remote server.
- **Multi-Language OCR:** Full character recognition support for English, Urdu, Arabic, Spanish, French, German, and 10+ international languages.
- **Instant Vector Optimization:** Client-side SVG tree parsing and AST optimization with real-time visual before/after size comparisons.

---

## 2. Tools Included in this Sub-Prompt

| Tool Name | Slug | Primary Capabilities | Core Technologies |
|---|---|---|---|
| **AI Background Remover** | `remove-background` | 1-click subject isolation, transparent PNG/WebP download, mask feathering, background color replacement | ONNX Runtime Web / Transformers.js / Canvas 2D |
| **Image & Scanned PDF OCR** | `image-to-text-ocr` | Extract editable text, tables, and Markdown from scanned photos and multi-page PDFs in English, Urdu, & 8+ languages | Tesseract.js (WASM), PDF.js, Web Worker |
| **Photo EXIF & Privacy Stripper** | `exif-metadata-stripper` | View camera model, lens, ISO, shutter, GPS map coordinates, and permanently strip metadata for secure sharing | ExifReader, Canvas Blob Cleaner |
| **Multi-Resolution Favicon & PWA Pack** | `svg-to-ico` | Convert SVG & PNG into multi-layer Windows `.ico` (16, 32, 48, 64px), Apple Touch icons, Android PWA assets, & `manifest.json` | Canvas Resizer, Binary ICO pack encoder |
| **SVG Vector Optimizer & Minifier** | `svg-optimizer` | Clean and minify raw SVG code, remove unwanted namespaces/comments, optimize path coordinates | SVGO In-Browser Engine, Prism code highlighter |
| **Image Color Palette & Gradient Extractor** | `color-palette-generator` | Extract top 6 dominant colors, generate matching gradients, WCAG contrast score, and copy HEX/RGB/Tailwind values | ColorThief / Canvas color quantization |
| **Batch Photo Watermarker** | `batch-watermark-images` | Watermark 50+ photos at once with text/logo, position grid (9 anchors), opacity, angle, and ZIP batch download | JSZip, Canvas 2D Batch Worker |
| **Image Redactor & Face Blurring Tool** | `image-blur-redact` | Selectively blur or pixelate sensitive text, faces, license plates, and credit card numbers on screenshots | Canvas 2D Pixelate / Gaussian Blur filters |

---

## 3. Metadata Registration (`src/config/categories.ts`)

Ensure the `image` category contains these tools in `src/config/categories.ts`:

```typescript
{
  id: 'image',
  name: 'Image Converters & Tools',
  slug: 'image',
  description: 'Convert, compress, resize, rasterize SVG, remove backgrounds with AI, and extract OCR text.',
  iconName: 'Image',
  color: '#8b5cf6',
  gradient: 'from-purple-600 to-indigo-500',
  badge: 'Fast & Private',
  tools: [
    {
      id: 'remove-background',
      name: 'AI Background Remover',
      slug: 'remove-background',
      categorySlug: 'image',
      categoryName: 'Image Converters',
      description: 'Instantly isolate subjects and remove image backgrounds 100% in your browser using client-side AI neural networks.',
      iconName: 'ImageMinus',
      popular: true,
      badge: 'Free AI (WASM)',
    },
    {
      id: 'image-to-text-ocr',
      name: 'Image & Scanned PDF to Text (OCR)',
      slug: 'image-to-text-ocr',
      categorySlug: 'image',
      categoryName: 'Image Converters',
      description: 'Extract editable text from scanned documents, receipts, and images using client-side WebAssembly OCR in English, Urdu, and 8+ languages.',
      iconName: 'ScanText',
      popular: true,
      badge: 'WASM OCR',
    },
    {
      id: 'exif-metadata-stripper',
      name: 'Photo EXIF Inspector & Privacy Stripper',
      slug: 'exif-metadata-stripper',
      categorySlug: 'image',
      categoryName: 'Image Tools',
      description: 'View GPS coordinates, camera specs, exposure settings, and permanently erase EXIF privacy tags from photos.',
      iconName: 'ShieldAlert',
      popular: true,
      badge: 'Privacy Tool',
    },
    {
      id: 'svg-to-ico',
      name: 'SVG to Multi-Resolution Favicon (.ICO) & PNG',
      slug: 'svg-to-ico',
      categorySlug: 'image',
      categoryName: 'Image Converters',
      description: 'Rasterize SVG vector graphics into multi-pack Windows .ico favicons (16, 32, 48, 64px) and high-res PNGs.',
      iconName: 'Sparkles',
      popular: true,
      badge: 'Favicon Generator',
    },
    {
      id: 'svg-optimizer',
      name: 'SVG Optimizer & Code Minifier',
      slug: 'svg-optimizer',
      categorySlug: 'image',
      categoryName: 'Image Tools',
      description: 'Minify SVG markup, strip bloated metadata and comments, and reduce vector file sizes by up to 70%.',
      iconName: 'FileCode2',
      popular: true,
    },
    {
      id: 'color-palette-generator',
      name: 'Image Color Palette & Gradient Extractor',
      slug: 'color-palette-generator',
      categorySlug: 'image',
      categoryName: 'Color Tools',
      description: 'Extract dominant color palettes and CSS gradients from uploaded photos with 1-click HEX/RGB copy.',
      iconName: 'Palette',
      popular: true,
    },
    {
      id: 'batch-watermark-images',
      name: 'Batch Image Watermarker',
      slug: 'batch-watermark-images',
      categorySlug: 'image',
      categoryName: 'Image Converters',
      description: 'Apply text or logo watermarks to 50+ photos simultaneously with customizable opacity, rotation, and position grid in your browser.',
      iconName: 'Stamp',
      popular: true,
      badge: 'Batch (50+ files)',
    },
    {
      id: 'image-blur-redact',
      name: 'Image Redactor & Face Blurring Tool',
      slug: 'image-blur-redact',
      categorySlug: 'image',
      categoryName: 'Image Tools',
      description: 'Selectively blur, pixelate, or black out sensitive text, faces, and private details on photos and screenshots.',
      iconName: 'EyeOff',
      popular: true,
      badge: 'Redact & Blur',
    },
  ],
}
```

---

## 4. Component Implementation Specs

### 4.1 AI Background Remover (`src/components/converters/image/BackgroundRemoverComponent.tsx`)
- **Features:**
  - Drag-and-drop image dropzone with instant preview.
  - Interactive split-screen / slider comparison (Original vs Background Removed).
  - Background replacement options:
    - Transparent Alpha (Checkerboard pattern)
    - Solid Color Palette (White, Black, Aesthetic Pastels, Custom HEX)
    - Gradient Backgrounds
  - 1-click High-Resolution PNG & WebP download.

### 4.2 Multi-Language Image & PDF OCR (`src/components/converters/image/ImageOcrComponent.tsx`)
- **Features:**
  - Language selector dropdown: `English (eng)`, `Urdu (urd)`, `Arabic (ara)`, `Spanish (spa)`, `French (fra)`, `German (deu)`.
  - Progress indicator with real-time recognition status (`Loading Model` $\rightarrow$ `Recognizing Text (65%)` $\rightarrow$ `Done`).
  - Dual pane UI: Image preview with highlighted bounding boxes alongside an editable text editor.
  - Export actions: **Copy Text**, **Download .TXT**, **Download Markdown (.md)**.

### 4.3 Photo EXIF Inspector & Privacy Stripper (`src/components/converters/image/ExifCleanerComponent.tsx`)
- **Features:**
  - Reads EXIF tags: Camera Make & Model, Lens, ISO, Focal Length, Aperture, Shutter Speed, Date Taken.
  - GPS Location card with embedded OpenStreetMap view showing exact photo coordinates.
  - "Erase All Privacy & GPS Metadata" button that exports a clean, sanitized JPEG/PNG.

### 4.4 Multi-Resolution Favicon & PWA Pack Generator (`src/components/converters/image/FaviconGeneratorComponent.tsx`)
- **Outputs generated in ZIP package:**
  - `favicon.ico` (Multi-layered 16x16, 32x32, 48x48 binary format)
  - `favicon-16x16.png`, `favicon-32x32.png`
  - `apple-touch-icon.png` (180x180)
  - `android-chrome-192x192.png`, `android-chrome-512x512.png`
  - Ready-to-copy HTML `<link>` snippet for `<head>` injection.

---

## 5. Wiring in `ConverterCanvas.tsx`
```tsx
case 'remove-background':
  return <BackgroundRemoverComponent tool={tool} />;
case 'image-to-text-ocr':
case 'scanned-pdf-to-text':
  return <ImageOcrComponent tool={tool} />;
case 'exif-metadata-stripper':
  return <ExifCleanerComponent tool={tool} />;
case 'svg-to-ico':
case 'favicon-generator':
  return <FaviconGeneratorComponent tool={tool} />;
case 'svg-optimizer':
  return <SvgOptimizerComponent tool={tool} />;
case 'color-palette-generator':
  return <ImagePaletteComponent tool={tool} />;
case 'batch-watermark-images':
  return <BatchWatermarkComponent tool={tool} />;
case 'image-blur-redact':
  return <ImageRedactComponent tool={tool} />;
```

---

## 6. Verification & Quality Assurance Checklist
1. [ ] Test uploading a portrait photo to `remove-background`; verify subject is extracted with transparent background.
2. [ ] Test OCR on a scanned receipt in `image-to-text-ocr`; verify text is recognized and exportable to Markdown.
3. [ ] Test uploading an iPhone photo containing GPS metadata to `exif-metadata-stripper`; verify stripped image contains zero EXIF tags.
4. [ ] Run `npm run lint` and verify zero TypeScript/lint issues.
