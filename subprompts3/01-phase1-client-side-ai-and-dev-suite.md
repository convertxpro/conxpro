# SUB-PROMPT 01: Client-Side AI & Smart Developer Utilities (Phase 1)

## 1. Context & Objective
This sub-prompt guides the complete implementation of **Phase 1** from [`ConvertHub-NextGen-Master-Prompt.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/ConvertHub-NextGen-Master-Prompt.md).
All tools in this phase must execute **100% in-browser** using WebAssembly, Web Workers, Web Crypto, and HTML5 Media APIs — ensuring instant feedback, complete user data privacy, and zero server computing costs.

---

## 2. Tools in Scope

1. **Tool 1.1: WebAssembly In-Browser OCR Scanner (`image-to-text-ocr`, `scanned-pdf-to-text`)**
   - Extracts text from PNG, JPG, WebP, TIFF, and multi-page PDFs using `tesseract.js`.
   - Multi-language pack selector: English (`eng`), Urdu (`urd`), Arabic (`ara`), Spanish, French, German, Chinese, Hindi.
   - Dual output tabs: Plain Text, Markdown (preserves headings/lists), and JSON (confidence & bounding boxes).
2. **Tool 1.2: Client-Side AI Background Remover (`remove-background`)**
   - Automatically removes image backgrounds using `@imgly/background-removal` or ONNX web runtime in browser memory.
   - Interactive split comparison slider (Original vs Isolated Subject).
   - Canvas background options: Transparent PNG, White/Custom solid color, Blurred original photo, Custom background upload.
3. **Tool 1.3: Interactive Visual Text & Code Diff Checker (`diff-checker`)**
   - Dual-pane comparison editor supporting Split (Side-by-Side) and Unified (Inline) modes.
   - Word, character, and line-level diff highlighting with additions/deletions statistics.
   - Export as unified `.patch` file or styled HTML copy.
4. **Tool 1.4: Universal cURL to Multi-Language Code Generator (`curl-to-code`)**
   - Parses raw cURL commands and outputs production-ready snippets in 10+ languages (JS Fetch, Axios, Python Requests/HTTPX, Go, Rust Reqwest, PHP Guzzle, Java 11+, C#).
5. **Tool 1.5: In-Browser Screen & Webcam Recorder (`screen-recorder`)**
   - Native `navigator.mediaDevices` capture of Full Screen, Window, Tab, or Webcam.
   - Optional microphone/system audio mixing and PiP (Screen + Camera circle).
   - In-browser playback trim and export to MP4 (H.264), WebM, or Animated GIF.

---

## 3. Required Packages

Install necessary dependencies for client-side processing:
```bash
npm install tesseract.js @imgly/background-removal diff
npm install --save-dev @types/diff
```

---

## 4. Metadata Registration (`src/config/categories.ts`)

Add the following tool metadata entries under the `developer`, `image`, `document`, and `media` categories:

```typescript
// Add to developer / document / image / media categories in src/config/categories.ts:
{
  id: 'image-to-text-ocr',
  name: 'Image & PDF to Text OCR',
  slug: 'image-to-text-ocr',
  categorySlug: 'developer',
  categoryName: 'Developer & Data Utilities',
  description: 'Extract editable text from scanned documents, receipts, and images using client-side WebAssembly OCR in English, Urdu, and 8+ languages.',
  iconName: 'ScanText',
  popular: true,
  badge: '100% Private (WASM)',
},
{
  id: 'remove-background',
  name: 'AI Background Remover',
  slug: 'remove-background',
  categorySlug: 'image',
  categoryName: 'Image Converters',
  description: 'Instantly isolate subjects and remove image backgrounds 100% in your browser using client-side AI neural networks.',
  iconName: 'ImageMinus',
  popular: true,
  badge: 'Free AI',
},
{
  id: 'diff-checker',
  name: 'Text & Code Diff Checker',
  slug: 'diff-checker',
  categorySlug: 'developer',
  categoryName: 'Developer & Data Utilities',
  description: 'Compare text and code files side-by-side with character-level diff highlighting, whitespace ignoring, and patch generation.',
  iconName: 'GitCompare',
  popular: true,
},
{
  id: 'curl-to-code',
  name: 'cURL to Code Converter',
  slug: 'curl-to-code',
  categorySlug: 'developer',
  categoryName: 'Developer & Data Utilities',
  description: 'Convert cURL commands into clean, idiomatic code for JavaScript, Python, Go, Rust, PHP, Java, and C#.',
  iconName: 'Terminal',
  popular: true,
},
{
  id: 'screen-recorder',
  name: 'Screen & Webcam Recorder',
  slug: 'screen-recorder',
  categorySlug: 'media',
  categoryName: 'Video & Audio Converters',
  description: 'Record your screen, browser tabs, or webcam with audio directly in browser memory and export to MP4 or GIF.',
  iconName: 'Video',
  popular: true,
  badge: 'No Install Needed',
},
```

---

## 5. Component Construction Plan

### 5.1 OCR Scanner Component (`src/components/converters/dev/OcrScannerComponent.tsx`)
- Implement worker initialization with `tesseract.js`:
  ```typescript
  import { createWorker } from 'tesseract.js';
  // Dynamic progress callback updating loading/recognition percentage
  // Language selector supporting 'eng', 'urd', 'ara', 'spa', 'fra', 'deu', 'chi_sim'
  ```
- Support drag-and-drop file upload for images and multi-page PDFs (rendering PDF pages to canvas using `pdfjs-dist`).
- Output formatting with tabs: Plain Text, Markdown, and JSON word-level coordinates.

### 5.2 AI Background Remover (`src/components/converters/image/BackgroundRemoverComponent.tsx`)
- Implement client-side inference using `@imgly/background-removal`:
  ```typescript
  import imglyRemoveBackground from '@imgly/background-removal';
  // const blob = await imglyRemoveBackground(imageFile, { progress: (p) => setProgress(p) });
  ```
- Interactive before/after split slider (`ImageComparisonSlider.tsx`).
- Color swatch picker for background replacement (transparent, `#FFFFFF`, `#000000`, custom hex, or uploaded background image).

### 5.3 Diff Checker (`src/components/converters/dev/DiffCheckerComponent.tsx`)
- Dual-pane textarea inputs with line numbering and sample presets ("Load Code Sample", "Load JSON Diff").
- Use `diff` (`diffLines`, `diffWordsWithSpace`, `diffChars`) to compute differences.
- Render split view (Side-by-Side) and unified inline view with green/red background highlights and `+`/`-` line indicators.

### 5.4 cURL to Code Converter (`src/components/converters/dev/CurlToCodeComponent.tsx`)
- Robust cURL parser extracting Method, URL, Headers (`-H`), Data/Body (`-d`, `--data-raw`), Form-Data (`-F`), and Basic Auth (`-u`).
- Generators for:
  - JS (Fetch & Axios)
  - Python (Requests & HTTPX async)
  - Go (`net/http`)
  - Rust (`reqwest`)
  - PHP (`Guzzle`)
- Syntax-highlighted code output box with one-click copy and language switcher tabs.

### 5.5 Screen & Webcam Recorder (`src/components/converters/media/ScreenRecorderComponent.tsx`)
- Interface with `navigator.mediaDevices.getDisplayMedia` and `navigator.mediaDevices.getUserMedia`.
- Live visualizer for audio input levels and recording elapsed timer.
- Controls: Start, Pause, Resume, Stop.
- Playback canvas with trimming sliders and instant download buttons for `.mp4`, `.webm`, and `.gif`.

---

## 6. Canvas Integration & Routing (`src/components/converters/ConverterCanvas.tsx`)

Map the new slugs to their respective components:
```typescript
case 'image-to-text-ocr':
case 'scanned-pdf-to-text':
  return <OcrScannerComponent tool={tool} />;
case 'remove-background':
  return <BackgroundRemoverComponent tool={tool} />;
case 'diff-checker':
  return <DiffCheckerComponent tool={tool} />;
case 'curl-to-code':
  return <CurlToCodeComponent tool={tool} />;
case 'screen-recorder':
  return <ScreenRecorderComponent tool={tool} />;
```

---

## 7. Verification & Quality Checklist

- [ ] OCR correctly detects English and Urdu text from uploaded sample images and extracts clean text.
- [ ] Background remover isolates foreground subjects and outputs transparent PNG with 0 server uploads.
- [ ] Diff checker highlights additions/deletions accurately in both Split and Unified modes.
- [ ] cURL generator parses complex headers and POST payloads into valid Python, JS, and Go snippets.
- [ ] Screen recorder captures display audio and microphone, providing valid MP4/WebM video exports.
- [ ] Run `npm run lint` and verify 0 TypeScript/ESLint warnings.
- [ ] Run `npm run build` and ensure static generation compiles without errors.
