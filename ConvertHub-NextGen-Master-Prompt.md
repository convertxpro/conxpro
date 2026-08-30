# MASTER BUILD PROMPT: ConvertHub Next-Gen Feature & Moat Expansion
## Target Platform: ConvertHub / ConvertX (Next.js 14 App Router + TypeScript + Tailwind CSS)
### Scope: 5 Strategic Implementation Phases (AI & Client-Side Suite, Pakistan Regional Moats, Advanced PDF Suite, Media Creator Engine, Growth & Monetization Flywheels)

---

## 1. EXECUTIVE OVERVIEW & ARCHITECTURAL TENETS

You are building the **Next-Gen Expansion** for **ConvertHub / ConvertX** under Lapvy Enterprises. This master prompt defines the complete technical blueprint for implementing high-demand AI tools, regional financial calculators, advanced document workflows, media engines, and growth flywheels.

### Architectural Tenets:
1. **Zero-Latency Client-First Execution:**
   - AI OCR, Background Removal, Text Diff, cURL conversion, PDF page manipulation, and regional calculators execute **100% in-browser** using WebAssembly, Web Crypto, Web Workers, and HTML5 APIs. Zero server load, zero computing cost, 100% privacy.
2. **Industrial-Grade Media Pipeline:**
   - Server-side video subtitle burn-in and audio stream manipulation leverage the existing BullMQ + Redis + FFmpeg worker architecture (`src/workers/start-worker.ts` and `src/app/api/convert`).
3. **Pakistan & Regional SEO Dominance:**
   - Regional tools must feature bilingual English/Urdu output, official FBR/PTA/Excise schedules, Filer vs Non-Filer dynamics, and social sharing optimizations (WhatsApp direct share).
4. **Strict Type Safety & Aesthetic Standards:**
   - Full TypeScript strict mode, responsive cards with Tailwind CSS, Lucide-React icons, Framer Motion animations, accessible keyboard navigation, and dark/light theme support.
5. **SEO & Structured Data:**
   - Every tool page must define OpenGraph metadata, dynamic breadcrumbs, related tools internal linking, and `FAQPage` + `SoftwareApplication` JSON-LD schema.

---

## 2. REPOSITORY INTEGRATION MAP

When building each tool, update and integrate across these standard files:
- **Registry & Metadata:** `src/config/categories.ts` (Register `ToolMetadata` in category definitions)
- **Canvas Switcher:** `src/components/converters/ConverterCanvas.tsx` (Route slug to dedicated component)
- **Tool Components:**
  - `src/components/converters/ai/*` (OCR, Background Remover)
  - `src/components/converters/dev/*` (Diff Checker, cURL Generator)
  - `src/components/converters/pakistan/*` (PTA Tax, Property Tax, Freelancer Tax, Vehicle Tax, CNIC Decoder)
  - `src/components/converters/pdf/*` (PDF Organizer, PDF Redactor, PDF Signer)
  - `src/components/converters/media/*` (Subtitle Burner, Screen Recorder, Batch Watermarker)
  - `src/components/converters/data/*` (CSV/Excel Deduplicator & Splitter)
- **Platform Features:**
  - `src/components/conversion/NextActionRecommendations.tsx` (Post-conversion suggestions)
  - `src/components/widgets/EmbedWidgetModal.tsx` (Embeddable iframe generator)
  - `public/manifest.json` & `public/sw.js` (PWA offline caching)
- **SEO & FAQs:** `src/lib/seo/metadata.ts` and `src/lib/seo/faqData.ts`

---

## 3. DETAILED IMPLEMENTATION PHASES

```
========================================================================================
PHASE 1: CLIENT-SIDE AI & SMART DEVELOPER UTILITIES (100% In-Browser, Zero Server Cost)
========================================================================================
```

### Tool 1.1: WebAssembly In-Browser OCR Scanner (Image & Scanned PDF to Text)
- **Slugs:** `image-to-text-ocr`, `scanned-pdf-to-text`
- **Category:** `developer` / `document`
- **Engine:** `tesseract.js` (Client-side WebAssembly worker).
- **Features:**
  - Drag & drop images (PNG, JPG, WebP, TIFF) or single/multi-page PDFs.
  - Multi-language pack selector: **English, Urdu, Arabic, Spanish, French, German, Chinese, Hindi**.
  - Live OCR progress bar (Initializing WebAssembly $\rightarrow$ Loading traineddata $\rightarrow$ Recognizing text $\rightarrow$ Complete).
  - Output display with three tabs:
    1. **Formatted Plain Text** (with one-click copy and download `.txt`).
    2. **Markdown View** (preserves detected headings, lists, and line breaks).
    3. **JSON Structure** (contains word-level confidence scores and bounding boxes).
  - Search & replace and text formatting toolbar directly above output.

### Tool 1.2: Client-Side AI Background Remover
- **Slug:** `remove-background`
- **Category:** `image`
- **Engine:** `@imgly/background-removal` or ONNX Web Runtime (client-side neural network).
- **Features:**
  - Instant automatic subject isolation (people, products, animals, cars) without server uploads.
  - Interactive comparison slider: Original photo vs Transparent cut-out.
  - Background customization before export:
    - Transparent (PNG)
    - Solid color picker (pure white for Amazon/eBay e-commerce presets, brand colors)
    - Blur original background
    - Custom background image upload
  - Export options: Full-resolution PNG, WebP with alpha channel, or JPG with white background.

### Tool 1.3: Interactive Visual Text & Code Diff Checker
- **Slug:** `diff-checker`
- **Category:** `developer`
- **Features:**
  - Dual-pane Monaco-style comparison editor (Original Text vs Modified Text).
  - Modes: **Side-by-Side (Split)** and **Unified (Inline)** diff.
  - Granularity controls: Word-level diff, Character-level diff, Line-level diff.
  - Toggles: Ignore whitespace changes, Ignore case sensitivity, Strip empty lines.
  - Summary stats badge: `+X additions`, `-Y deletions`, `Z unchanged lines`.
  - Export diff as standard unified `.patch` file or copy HTML formatted report.

### Tool 1.4: Universal cURL to Multi-Language Code Generator
- **Slug:** `curl-to-code`
- **Category:** `developer`
- **Features:**
  - Parses standard cURL commands (`-X`, `-H`, `-d`, `--data-raw`, `-F`, `-u`, `--cookie`, etc.).
  - Generates idiomatic code in 10+ languages:
    - **JavaScript:** `fetch()`, `axios`
    - **TypeScript:** Typed `fetch()` with request interfaces
    - **Python:** `requests`, `httpx` (async)
    - **Node.js:** Native `fetch()`, `axios`, `got`
    - **Go:** `net/http` standard library
    - **PHP:** `cURL`, `Guzzle`
    - **Rust:** `reqwest`
    - **Java:** `HttpClient` (Java 11+)
    - **Dart / Flutter:** `http` package
    - **C# / .NET:** `HttpClient`
  - Auto-formats headers, query parameters, and JSON payloads cleanly with syntax highlighting.

### Tool 1.5: In-Browser Screen & Webcam Recorder to MP4 / GIF
- **Slug:** `screen-recorder`
- **Category:** `media`
- **Engine:** Browser `MediaRecorder` API + HTML5 Canvas.
- **Features:**
  - Capture sources: Full Screen, Specific Application Window, Browser Tab, Webcam only, Picture-in-Picture (Screen + Webcam circle).
  - Audio selector: System Audio, Microphone, Both, or Mute.
  - Controls: Record, Pause, Resume, Stop with live recording timer and audio visualizer.
  - In-browser instant trimming prior to saving.
  - Export formats: **MP4 (H.264), WebM, Looping Animated GIF**.

---

```
========================================================================================
PHASE 2: PAKISTAN REGIONAL MOAT & HIGH-INTENT FINANCIAL CALCULATORS
========================================================================================
```

### Tool 2.1: PTA Mobile Phone Duty & DIRBS Tax Calculator
- **Slug:** `pta-mobile-tax-calculator`
- **Category:** `pakistan`
- **Features:**
  - Updated with official Pakistan Telecommunication Authority (PTA) & FBR DIRBS Customs valuation formulas.
  - Registration Category Toggle: **Apply via Passport (Overseas Traveler)** vs **Apply via CNIC (Local Purchase/Import)**.
  - Smart Presets for flagship devices:
    - iPhone 16 / 16 Pro / 16 Pro Max
    - iPhone 15 / 14 / 13 series
    - Samsung Galaxy S24 Ultra / Z Fold 6
    - Custom C&F Value Input ($USD or PKR).
  - Complete Tax Breakdown:
    - Customs Duty
    - Regulatory Duty (RD)
    - Sales Tax (Standard + Tiered)
    - Withholding Tax (WHT)
    - Mobile Levy
    - Total Estimated PTA Registration Fee in PKR.
  - Step-by-step guide to generating PSID on `dirbs.pta.gov.pk` and payment via 1Link/ATM/Easypaisa.

### Tool 2.2: Pakistan Property Transfer & Stamp Duty Calculator
- **Slug:** `property-tax-calculator`
- **Category:** `pakistan`
- **Features:**
  - Provincial jurisdiction selector: **Punjab (e-Stamping), Sindh, Islamabad Capital Territory (CDA), KPK**.
  - Property type: Residential Plot, Commercial Plot, Built House, High-Rise Apartment, Agricultural Land.
  - Input: Declared Value / DC Rate Value / FBR Valuation Table Rate.
  - Buyer & Seller Status:
    - **Buyer:** Active Taxpayer (Filer) vs Non-Filer vs Late Filer
    - **Seller:** Active Taxpayer (Filer) vs Non-Filer
  - Calculation outputs:
    - **FBR Section 236K Advance Tax (Buyer)**: 3% (Filer) vs 6%–10.5% (Non-Filer).
    - **FBR Section 236C Advance Tax (Seller)**: 3% (Filer) vs 6%–10.5% (Non-Filer) based on holding period.
    - **Provincial Stamp Duty**: Official provincial % (e.g. 1%–2% in Punjab/Sindh).
    - **TMA / Local Government Transfer Fee**: 1%.
    - **Mutation (Intiqal) & Registration Fees**.
    - Total Grand Transfer Cost Breakdown.

### Tool 2.3: Freelancer IT Export Tax & Remittance Calculator
- **Slug:** `freelance-tax-calculator`
- **Category:** `pakistan`
- **Features:**
  - IT / ITES Export Classification:
    - **PSEB Registered Filer:** Final tax liability at 0.25% under Section 154A.
    - **Non-Registered Filer:** 1.0% under Section 154A.
    - **Non-Filer:** Normal corporate/individual slab rates up to 35%.
  - Monthly / Annual foreign earnings input ($USD, £GBP, €EUR, AED).
  - Platform & Remittance Channel Fee Comparison:
    - Direct Bank Wire (Home Remittance - PRC certificate).
    - Payoneer $\rightarrow$ Local Bank (JazzCash / Nayapay / Standard Chartered).
    - Wise $\rightarrow$ Local Bank.
    - Upwork / Fiverr withdrawal fees.
  - Outputs: Net PKR realized in bank account, total tax withheld at source, and Form 114 return filing checklist.

### Tool 2.4: Vehicle Token Tax & Registration Estimator
- **Slug:** `vehicle-token-tax-calculator`
- **Category:** `pakistan`
- **Features:**
  - Excise Departments: **Punjab, Sindh, Islamabad (ICT), KPK**.
  - Vehicle Classes: Private Car, Commercial, Electric Vehicle (EV), Motorcycle.
  - Engine Displacement brackets:
    - Up to 1000cc (e.g., Alto, Cultus, WagonR)
    - 1001cc to 1300cc (e.g., Yaris, City)
    - 1301cc to 1500cc
    - 1501cc to 2000cc (e.g., Civic, Elantra, Sportage)
    - 2000cc+ / Luxury SUVs (e.g., Fortuner, Prado, Land Cruiser)
    - EV battery capacity (kWh).
  - Calculates: Initial Registration Fee + Number Plate + Annual Token Tax + Income Tax (Filer vs Non-Filer) + Transfer of Ownership Fee.

### Tool 2.5: Pakistani CNIC & NTN Validator & Region Decoder
- **Slug:** `cnic-ntn-decoder`
- **Category:** `pakistan`
- **Features:**
  - Client-side 13-digit CNIC syntax and Luhn/checksum verification (`XXXXX-XXXXXXX-X`).
  - Region decoding based on NADRA administrative hierarchy:
    - Digit 1: Province / Territory (1: KPK, 2: FATA, 3: Punjab, 4: Sindh, 5: Balochistan, 6: Islamabad, 7: GB, 8: AJK).
    - Digit 2: Division code.
    - Digit 3–5: District and Tehsil identifiers.
    - Last Digit: Gender parity indicator (Odd = Male, Even = Female/Transgender).
  - NTN (National Tax Number) 7+1 digit validation with official format verification.
  - Absolute privacy notice: Evaluated 100% offline in browser memory; zero logs saved.

---

```
========================================================================================
PHASE 3: ADVANCED PDF POWER SUITE & DATA WRANGLING
========================================================================================
```

### Tool 3.1: Visual PDF Page Organizer (Reorder, Rotate, Delete, Extract)
- **Slug:** `organize-pdf`
- **Category:** `document`
- **Engine:** `pdf-lib` + `pdfjs-dist` (In-Browser Rendering).
- **Features:**
  - Interactive grid rendering high-res thumbnail previews of every single page.
  - Drag-and-drop page reordering using `@hello-pangea/dnd`.
  - Per-page quick action buttons:
    - Rotate 90° Clockwise / Counter-Clockwise.
    - Duplicate page.
    - Delete page (with undo support).
    - Insert blank page.
  - "Extract Selected Pages" into a new separate PDF.
  - Download newly reorganized and optimized PDF instantly.

### Tool 3.2: PDF Redaction & Privacy Blackout Tool
- **Slug:** `redact-pdf`
- **Category:** `document`
- **Engine:** HTML5 Canvas overlay + `pdf-lib` vector masking.
- **Features:**
  - Visual drawing tool to draw black redaction boxes over sensitive text, signatures, CNIC numbers, or bank details.
  - Redaction options: Solid Black Box, Whiteout Mask, or "REDACTED" stamped box.
  - Flattens the canvas on download to ensure redacted text cannot be highlighted or extracted from the underlying PDF text layer.
  - Strips document metadata (Author, Producer, Creation Date) for privacy.

### Tool 3.3: Digital PDF Signer & Stamp Applier
- **Slug:** `sign-pdf`
- **Category:** `document`
- **Features:**
  - 3 Signature Creation Modes:
    1. **Draw:** Touch/Mouse digital signature pad with stroke thickness and color controls.
    2. **Type:** Type name with curated cursive script typography styles.
    3. **Upload:** Upload transparent PNG signature image with automatic background cleanup.
  - Drag, resize, and place signature onto any page.
  - Add optional verifiable metadata stamp: "Digitally Signed on [Date/Time] via ConvertHub".

### Tool 3.4: CSV & Excel Deduplicator, Filter & Chunk Splitter
- **Slug:** `csv-deduplicator-splitter`
- **Category:** `developer` / `document`
- **Engine:** `papaparse` + client-side chunk streaming.
- **Features:**
  - Upload CSV or XLSX files (tested up to 500,000+ rows).
  - Mode A: **Deduplication Engine**:
    - Select specific primary key columns to check for duplicates (e.g. Email, Phone, ID) or compare full rows.
    - Choose retain strategy: Keep first occurrence, Keep last occurrence, or Remove all duplicates.
    - Download Cleaned CSV + Download Duplicate Rows separately.
  - Mode B: **Chunk Splitter**:
    - Split large CSV into multiple files by: Maximum Row Count (e.g. 5,000 rows per file) or Maximum File Size (e.g. 10MB per file).
    - Downloads all split chunks bundled in a single `.zip` file.

---

```
========================================================================================
PHASE 4: CONTENT CREATOR MEDIA PIPELINE
========================================================================================
```

### Tool 4.1: Video Subtitle Hardcoder & Burn-in Engine
- **Slug:** `burn-subtitles-to-video`
- **Category:** `video`
- **Engine:** `ffmpeg` (`-vf subtitles=...`) via worker pipeline.
- **Features:**
  - Upload video (MP4, MOV, WebM) + Subtitle file (`.srt`, `.vtt`, `.ass`).
  - Styling presets for Social Media Creators:
    - **TikTok / Reels Modern:** Bold yellow/white font with heavy black stroke and bottom-center placement.
    - **Cinematic:** Classic serif font with subtle drop shadow.
    - **Boxed:** Translucent black pill background behind subtitles.
  - Custom font size, margin vertical position, and font family selector.
  - Real-time video preview player before server processing.

### Tool 4.2: Lossless Video Muter & Audio Stream Replacer
- **Slug:** `mute-video-replace-audio`
- **Category:** `video`
- **Engine:** `ffmpeg` stream copying (`-c:v copy`).
- **Features:**
  - Mode A: **Instant Mute:** Strips all audio tracks without re-encoding video. Processes full 4K video files in under 2 seconds.
  - Mode B: **Audio Replacer:** Replace original audio with an uploaded MP3/WAV music track, with loop and volume normalization.

### Tool 4.3: Batch Image Watermarking Engine
- **Slug:** `batch-watermark-images`
- **Category:** `image`
- **Engine:** HTML5 Canvas multi-threading in Web Workers.
- **Features:**
  - Process up to 50+ images simultaneously.
  - Watermark Type: **Text Watermark** (custom font, color, opacity, rotation angle) or **Logo Watermark** (transparent PNG).
  - Position Grid: 9-point anchor selector (Top-Left, Center, Bottom-Right, etc.) or Full Tiled Diagonal Pattern across entire image.
  - Batch export: Download all watermarked images in a single ZIP.

---

```
========================================================================================
PHASE 5: GROWTH, EMBEDDABLE WIDGETS & PLATFORM FLYWHEELS
========================================================================================
```

### Feature 5.1: Contextual "Next Best Action" Recommendation Engine
- **Component:** `src/components/conversion/NextActionRecommendations.tsx`
- **Features:**
  - On the completion screen of any conversion, analyze the source and target formats to display 2–3 relevant follow-up actions:
    - After *Merge PDF* $\rightarrow$ Suggest *Compress PDF* and *Protect PDF*.
    - After *Video to MP3* $\rightarrow$ Suggest *Audio Speed Changer* and *Audio Joiner*.
    - After *SVG to PNG* $\rightarrow$ Suggest *Favicon Multi-Pack (.ico)* and *Image Compressor*.
    - After *FBR Tax Calculator* $\rightarrow$ Suggest *Freelancer Tax* and *Zakat Calculator*.
  - Increases session duration, page views per user, and ad impressions.

### Feature 5.2: Embeddable Responsive Widgets (Backlink Engine)
- **Component:** `src/components/widgets/EmbedWidgetModal.tsx`
- **Features:**
  - "Embed This Calculator" button on high-traffic tools (FBR Tax, Zakat, Marla Converter, Currency Converter, PTA Tax).
  - Generates responsive `<iframe>` code snippet with customizable width, height, and light/dark theme parameters.
  - Includes clean "Powered by ConvertHub" attribution backlink to build organic domain authority.

### Feature 5.3: Offline-Ready Progressive Web App (PWA)
- **Files:** `public/manifest.json`, `public/sw.js`, `src/components/common/PwaInstallPrompt.tsx`
- **Features:**
  - Service Worker caching all static assets, WebAssembly modules, and client-side calculators.
  - Installable on Android, iOS, Windows, and macOS with standalone window experience.
  - Full offline functionality for unit converters, dev tools, color pickers, and cached forex rates.

---

## 4. SYSTEMATIC EXECUTION & VERIFICATION PLAYBOOK

Follow this step-by-step procedure to implement each phase:

### Step 1: Metadata & Registry Setup
1. Register tool objects in `src/config/categories.ts` with accurate slugs, titles, descriptions, Lucide icon names, and tags.
2. Verify all icons exist in `lucide-react`.

### Step 2: Component Development & Canvas Integration
1. Build modular components in the appropriate `src/components/converters/[category]/` folder.
2. Connect tool slugs to their respective components inside `src/components/converters/ConverterCanvas.tsx`.
3. Adhere to the established UI design system: Glassmorphic cards, crisp borders, responsive padding, one-click copy, download buttons, and toast notifications.

### Step 3: SEO, Schemas & FAQs
1. Add structured FAQ data in `src/lib/seo/faqData.ts`.
2. Verify that `/convert/[category]/[tool]` generates appropriate OpenGraph images, meta descriptions, and JSON-LD structured schemas (`FAQPage` + `SoftwareApplication`).

### Step 4: Build Verification & Quality Assurance
1. Run `npm run lint` — confirm 0 TypeScript or ESLint errors.
2. Run `npm run build` — confirm all dynamic and static pages compile without hydration mismatches.
3. Test key edge cases (e.g. invalid cURL syntax, corrupted PDF files, extreme numbers in tax calculators).

---

## 5. COMPLETE VERIFICATION CHECKLIST

- [ ] All Phase 1 AI & Dev tools execute 100% client-side with zero server roundtrips.
- [ ] PTA Tax Calculator reflects latest 2024–2026 customs duty and C&F valuation slabs.
- [ ] Property Tax Calculator accurately differentiates between Filer (3%) and Non-Filer (6%–10.5%) withholding taxes under Section 236K/236C.
- [ ] Visual PDF Organizer supports smooth drag-and-drop page reordering and downloads valid PDFs.
- [ ] Subtitle Burner and Lossless Mute worker routes execute reliably without memory leaks.
- [ ] "Next Best Action" suggestions render dynamically on all download screens.
- [ ] Embed widget modal produces valid `<iframe>` snippets with backlink attribution.
- [ ] `npm run build` succeeds cleanly across all routes.
