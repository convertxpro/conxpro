# ApexTools (apextools.app) — Complete Feature Specification Document

ApexTools (apextools.app) is a production-grade, universal conversion and regional utility platform engineered by Lapvy Enterprises. Built with Next.js 14 App Router, TypeScript, Tailwind CSS, and Framer Motion, it delivers high-speed, secure, and privacy-first conversions spanning **14 distinct categories and over 160 specialized tools**.

---

## 📑 Table of Contents

1. [Executive Summary & Platform Tenets](#1-executive-summary--platform-tenets)
2. [Platform Statistics & Key Highlights](#2-platform-statistics--key-highlights)
3. [Dual-Engine Execution Architecture](#3-dual-engine-execution-architecture)
4. [Comprehensive Category & Tool Directory](#4-comprehensive-category--tool-directory)
   - [Category 1: Developer & Data Utilities (25 Tools)](#category-1-developer--data-utilities-25-tools)
   - [Category 2: Document & PDF Suite (18 Tools)](#category-2-document--pdf-suite-18-tools)
   - [Category 3: Image Converters & Creative Suite (26 Tools)](#category-3-image-converters--creative-suite-26-tools)
   - [Category 4: Video Converters & Social Creator Engine (18 Tools)](#category-4-video-converters--social-creator-engine-18-tools)
   - [Category 5: Audio Converters & Studio Tools (16 Tools)](#category-5-audio-converters--studio-tools-16-tools)
   - [Category 6: Media & Subtitle Converters (6 Tools)](#category-6-media--subtitle-converters-6-tools)
   - [Category 7: Physical & Regional Unit Converters (14 Tools)](#category-7-physical--regional-unit-converters-14-tools)
   - [Category 8: Currency & Financial Calculators (13 Tools)](#category-8-currency--financial-calculators-13-tools)
   - [Category 9: Date & Time Tools (5 Tools)](#category-9-date--time-tools-5-tools)
   - [Category 10: Color Converters & Palette Studio (3 Tools)](#category-10-color-converters--palette-studio-3-tools)
   - [Category 11: Archive & Compression Suite (3 Tools)](#category-11-archive--compression-suite-3-tools)
   - [Category 12: Pakistan Regional Moat & Legal Utilities (5 Tools)](#category-12-pakistan-regional-moat--legal-utilities-5-tools)
   - [Category 13: Hardware & Device Diagnostic Testers (8 Tools)](#category-13-hardware--device-diagnostic-testers-8-tools)
5. [Privacy, Security & Data Lifecycle Management](#5-privacy-security--data-lifecycle-management)
6. [Public Developer REST API & Embeddable Widgets](#6-public-developer-rest-api--embeddable-widgets)
7. [Programmatic SEO & Knowledge Hub Engine](#7-programmatic-seo--knowledge-hub-engine)
8. [User Accounts, History & Dashboard](#8-user-accounts-history--dashboard)
9. [Admin Analytics & Operational Control Center](#9-admin-analytics--operational-control-center)
10. [Technical Stack & Infrastructure Reference](#10-technical-stack--infrastructure-reference)

---

## 1. Executive Summary & Platform Tenets

ConvertX is architected to eliminate the friction, security vulnerabilities, and bloated user experience associated with traditional conversion websites.

### Core Architectural Pillars

- **Zero-Friction Free Tier:** All tools are immediately accessible without mandatory account registration or paywalls.
- **Privacy-First (100% In-Browser Execution where possible):** Sensitive developer data, tokens, CNICs, hardware checks, and lightweight transformations execute entirely inside the client's browser using WebAssembly, Web Audio API, Canvas API, and WebRTC. Files never leave the user's machine unless complex server transcoding is explicitly needed.
- **Automated Ephemeral Lifecycle (Auto-Purge TTL):** When files require server-side conversion, they are processed in memory or ephemeral disks, delivered via secure single-use tokens, and purged automatically on a strict time-to-live (TTL) schedule.
- **Dual Audience Optimization (Global + Pakistan Regional Moat):** While offering top-tier global tools (PDF, Video, Dev, Image), ConvertX features an exclusive Pakistan-specific utility suite (FBR Tax, PTA DIRBS, Marla/Kanal land systems, Tola gold purity, Maund commodity weights, and Discos utility billing).
- **High-Converting, Award-Winning UI/UX:** Clean, responsive glassmorphic aesthetic supporting high-contrast dark and light modes, smooth micro-interactions via Framer Motion, and dedicated mobile optimization with PWA support.

---

## 2. Platform Statistics & Key Highlights

| Dimension | Metric / Coverage |
| :--- | :--- |
| **Total Tool Categories** | **14 Specialized Domains** |
| **Total Functional Tools** | **160+ Production Tools** |
| **Execution Engines** | Dual-Engine: In-Browser WASM/HTML5 + BullMQ Redis Worker Cluster |
| **Supported File Formats** | 40+ Formats (PDF, DOCX, XLSX, PPTX, MP4, WebM, MKV, MP3, WAV, FLAC, AVIF, HEIC, WebP, SVG, ZIP, etc.) |
| **Hardware Diagnostic Tests** | 8 Full-Suite Browser Diagnostics (Camera, Mic, Speaker, Screen, Keys, Mouse, Gamepad, Call Readiness) |
| **Developer Data Transforms** | 25 Formats & Standards (JSON, YAML, TOML, SQL, CSV, XML, Base64, JWT, Cron, CIDR, Hashes) |
| **Regional Taxation Engines** | FBR Income Tax (2024–2026), Freelance IT PSEB 0.25%, PTA Mobile DIRBS, Provincial Property e-Stamping |
| **SEO Coverage** | 160+ Programmatic Dynamic Landing Pages with JSON-LD Schemas & Auto-Generated Sitemaps |

---

## 3. Dual-Engine Execution Architecture

ConvertX utilizes a split execution architecture to maximize client privacy, minimize server operating costs, and deliver instantaneous conversions:

```
                                  [ User File / Input ]
                                             │
                                             ▼
                             [ Tool Type Classification ]
                                  /                     \
        [ Client-Side Engine (WASM / JS) ]      [ Server / Worker Queue Engine ]
        ├─ Developer & Data Tools               ├─ Heavy Video Transcoding (FFmpeg)
        ├─ Hardware Diagnostic Testers          ├─ Audio Pitch / Modulations
        ├─ In-Browser OCR (Tesseract.js)        ├─ LibreOffice Document Bridge
        ├─ AI Background Removal (@imgly)       ├─ Multi-page PDF Compression / Merge
        ├─ Audio Trimming & Waveforms           └─ BullMQ Redis Job Pipeline
        ├─ Local Land & Tax Calculators                     │
        └─ EXIF Metadata Stripping                          ▼
                                                [ Ephemeral Storage & Single-Use Token ]
                                                            │
                                                            ▼
                                                [ Automated TTL Cron Purge ]
```

1. **Client-Side WASM / Web API Engine:**
   - Powered by WebAssembly, Web Audio API, WebRTC, HTML5 Canvas, and modern Web APIs.
   - Zero byte transfer to servers: eliminates bandwidth costs and guarantees bank-grade data confidentiality.
2. **Server / BullMQ Asynchronous Processing Cluster:**
   - Powered by Redis and BullMQ workers (`media-worker.ts`).
   - Handles multi-pass video transcoding (`fluent-ffmpeg`), high-bitrate audio joiners, and LibreOffice document conversions (`libreoffice-convert`).
   - Offers real-time job progress polling (`/api/jobs/[id]/progress`) with step-by-step progress bars and download expiration tokens.

---

## 4. Comprehensive Category & Tool Directory

### Category 1: Developer & Data Utilities (25 Tools)
*Instant, client-side encoding, formatting, parsing, token inspection, and data serialization.*

| Tool Name | Route Slug | Key Features & Technical Details |
| :--- | :--- | :--- |
| **YAML to JSON Converter** | `/convert/developer/yaml-to-json` | Live YAML syntax parser, multi-document parsing, indent controls, and key sorting. |
| **JSON to YAML Converter** | `/convert/developer/json-to-yaml` | Formats JSON into indented YAML documents for Kubernetes, Docker Compose, and CI/CD pipelines. |
| **TOML to JSON / YAML** | `/convert/developer/toml-to-json` | Parses `Cargo.toml`, `pyproject.toml`, and TOML configs into JSON and YAML structures. |
| **YAML to TOML Converter** | `/convert/developer/yaml-to-toml` | Generates standard TOML 1.0 tables and keys from YAML documents. |
| **SQL to JSON / CSV** | `/convert/developer/sql-to-json` | Parses SQL `INSERT INTO` statements and table dumps into structured JSON arrays and CSV tables. |
| **JSON to SQL INSERT Generator** | `/convert/developer/json-to-sql` | Converts JSON records into bulk SQL `INSERT` statements with configurable table names and SQL dialect escaping. |
| **CSV to SQL INSERT Converter** | `/convert/developer/csv-to-sql` | Converts tabular CSV files into bulk SQL inserts compatible with PostgreSQL, MySQL, and SQLite. |
| **JWT Inspector & Decoder** | `/convert/developer/jwt-decoder` | Decodes JWT headers and payload claims, verifies signature algorithms, and checks expiration in real time. 100% private. |
| **Cryptographic Hash Generator** | `/convert/developer/hash-generator` | Computes MD5, SHA-1, SHA-256, SHA-512, and Keccak-256 hashes in parallel with streaming file checksum support. |
| **CSS Units Converter** | `/convert/developer/css-unit-converter` | Bi-directional matrix between PX, REM, EM, VW, VH, PT. Generates responsive `clamp()` CSS formulas and Tailwind classes. |
| **Smart QR Code Generator** | `/convert/developer/qr-code-generator` | Custom QR codes with color palettes, embedded center logos, Wi-Fi auto-connect, vCard contacts, and WhatsApp links in SVG/PNG. |
| **Cron Expression Translator** | `/convert/developer/cron-expression-decoder`| Translates 5/6-field crontabs into human English using `cronstrue`, with an interactive visual builder and next run times. |
| **JSON Formatter & Validator** | `/convert/developer/json-formatter` | Prettifies, minifies, validates JSON syntax, and provides interactive tree browsing with character-accurate error indicators. |
| **CSV to JSON & XML** | `/convert/developer/csv-to-json` | Transforms CSV sheets into structured JSON objects/arrays or standard XML trees with custom delimiters. |
| **JSON to CSV Converter** | `/convert/developer/json-to-csv` | Flattens nested JSON hierarchies into tabular CSV spreadsheets with customizable column mapping. |
| **Base64 Encoder & Decoder** | `/convert/developer/base64-encode-decode` | High-speed Base64 text string and binary file encoder/decoder supporting UTF-8 and URL-safe Base64 modes. |
| **URL Encoder & Decoder** | `/convert/developer/url-encode-decode` | Percent-encodes/decodes URI query parameters and full URLs with RFC 3986 compliance. |
| **Text Case Converter** | `/convert/developer/text-case-converter` | Instant transformations: camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, Title Case, Sentence case. |
| **Binary / Hex / Octal Converter**| `/convert/developer/binary-to-decimal` | Bi-directional base conversion (Base 2, 8, 10, 16, ASCII) with an interactive 8-bit switchboard. |
| **Markdown to HTML Live Editor** | `/convert/developer/markdown-to-html` | Dual-pane live markdown editor with real-time rendered preview, GitHub Flavored Markdown (GFM), and HTML export. |
| **Image & PDF OCR Scanner** | `/convert/developer/image-to-text-ocr` | In-browser WebAssembly OCR (Tesseract.js) extracting editable text from receipts, documents, and screenshots in 8+ languages. |
| **Text & Code Diff Checker** | `/convert/developer/diff-checker` | Side-by-side and inline syntax-aware diffing with character-level additions, deletions, whitespace toggles, and patch output. |
| **cURL to Code Generator** | `/convert/developer/curl-to-code` | Converts cURL commands into idiomatic code for JavaScript (fetch/axios), Python (requests), Go, PHP, Rust, and Java. |
| **CSV Deduplicator & Splitter** | `/convert/developer/csv-deduplicator-splitter`| Deduplicates massive CSV/Excel datasets on chosen columns and splits large files into smaller chunks entirely in-browser. |
| **CIDR & Subnet IP Calculator** | `/convert/developer/cidr-subnet-calculator` | Calculates IPv4/IPv6 subnets, network masks, usable host ranges, broadcast addresses, and wildcard masks. |

---

### Category 2: Document & PDF Suite (18 Tools)
*Transform, merge, split, compress, and secure documents and PDF files with bank-grade confidentiality.*

| Tool Name | Route Slug | Key Features & Technical Details |
| :--- | :--- | :--- |
| **PDF to Word (DOCX)** | `/convert/document/pdf-to-word` | Converts read-only PDFs into editable Microsoft Word documents with preserved font styling and table layouts. |
| **Word (DOCX) to PDF** | `/convert/document/word-to-pdf` | High-fidelity conversion from DOCX/DOC to standard PDF using headless LibreOffice engine. |
| **PDF to Excel (XLSX)** | `/convert/document/pdf-to-excel` | Detects grid tables within PDF documents and extracts structured tabular data into native Excel spreadsheets. |
| **Excel (XLSX) to PDF** | `/convert/document/excel-to-pdf` | Renders multi-sheet workbooks into cleanly paginated, printable PDF reports. |
| **PDF to PowerPoint (PPTX)** | `/convert/document/pdf-to-powerpoint` | Converts slide decks stored in PDF format into editable PowerPoint presentation slides. |
| **PowerPoint (PPTX) to PDF** | `/convert/document/powerpoint-to-pdf` | Converts PPTX slide presentations into universal, vector-sharp PDF decks. |
| **JPG to PDF** | `/convert/document/jpg-to-pdf` | Combines multiple JPG, PNG, and WebP images into a single multi-page PDF with margin and orientation controls. |
| **PDF to JPG / PNG** | `/convert/document/pdf-to-jpg` | Rasterizes PDF pages into high-resolution JPG or PNG images with custom DPI settings (72, 150, 300 DPI). |
| **Merge PDF** | `/convert/document/merge-pdf` | Combines multiple PDF files into one master document with drag-and-drop file reordering. |
| **Split PDF** | `/convert/document/split-pdf` | Extracts individual pages, custom page ranges, or splits every page into separate files packaged in a ZIP. |
| **Compress PDF** | `/convert/document/compress-pdf` | Reduces PDF file size by up to 80% through image downsampling, font subsetting, and stream compression. |
| **Rotate PDF** | `/convert/document/rotate-pdf` | Rotates individual or all PDF pages by 90°, 180°, or 270° clockwise with visual page previews. |
| **Protect PDF (Password)** | `/convert/document/protect-pdf` | Encrypts PDF documents with 256-bit AES encryption to restrict opening, printing, or copying. |
| **Unlock PDF** | `/convert/document/unlock-pdf` | Strips security restrictions and passwords from authorized PDF documents for unrestricted editing. |
| **Scanned PDF to Text (OCR)** | `/convert/document/scanned-pdf-to-text` | Extracts text from non-searchable scanned PDFs directly in browser memory using WebAssembly OCR. |
| **Visual PDF Page Organizer** | `/convert/document/organize-pdf` | Drag-and-drop thumbnail organizer to reorder, delete, duplicate, or extract pages with live canvas previews. |
| **PDF Redaction & Blackout Tool** | `/convert/document/redact-pdf` | Irreversibly blackouts sensitive PII, CNIC numbers, and bank details with true vector flattening. |
| **Digital PDF Signer & Stamp** | `/convert/document/sign-pdf` | Draw, type, or upload digital signatures and position official stamps directly onto contracts and forms. |

---

### Category 3: Image Converters & Creative Suite (26 Tools)
*High-performance raster/vector conversion, AI segmentation, optimization, and privacy cleaning.*

| Tool Name | Route Slug | Key Features & Technical Details |
| :--- | :--- | :--- |
| **AI Background Remover** | `/convert/image/remove-background` | 100% in-browser AI segmentation powered by `@imgly/background-removal`. Isolates foregrounds without server uploads. |
| **Photo EXIF Inspector & Stripper**| `/convert/image/exif-metadata-stripper`| Inspects GPS tags, camera model, lens metadata, and strips EXIF data permanently for social privacy. |
| **SVG to Multi-Pack .ICO Favicon** | `/convert/image/svg-to-ico` | Rasterizes vector SVG into standard Windows `.ico` packs (16x16, 32x32, 48x48) plus high-res Apple Touch icons. |
| **SVG Optimizer & Minifier** | `/convert/image/svg-optimizer` | Cleans redundant paths, removes editor metadata, minifies XML attributes, reducing vector sizes up to 70%. |
| **Image Color Palette Extractor** | `/convert/image/color-palette-generator` | Extracts dominant color palettes and CSS gradient values from uploaded photos with one-click HEX/RGB copy. |
| **Batch Image Watermarker** | `/convert/image/batch-watermark-images` | Applies customized text or logo watermarks across 50+ images simultaneously with opacity and tiling controls. |
| **Image Redact & Face Blur** | `/convert/image/image-blur-redact` | Selectively blurs, pixelates, or blacks out faces, license plates, and sensitive documents on screenshots and photos. |
| **Next-Gen AVIF Converters** | `/convert/image/avif-to-jpg`, `/convert/image/jpg-to-avif`, `/convert/image/avif-to-png`, `/convert/image/png-to-avif`, `/convert/image/webp-to-avif` | Complete next-gen AVIF suite offering superior compression (up to 70% smaller than JPG) with alpha transparency support. |
| **Apple HEIC to JPG / PNG** | `/convert/image/heic-to-jpg`, `/convert/image/heic-to-png` | Converts iPhone/iPad HEIC and HEIF photos to universal high-resolution JPG or PNG format. |
| **WebP ↔ JPG / PNG Converters** | `/convert/image/webp-to-jpg`, `/convert/image/jpg-to-webp`, `/convert/image/webp-to-png`, `/convert/image/png-to-webp` | Lossy and lossless Google WebP conversions with configurable quality sliders and transparency preservation. |
| **PNG ↔ JPG Converters** | `/convert/image/png-to-jpg`, `/convert/image/jpg-to-png` | High-speed format inter-conversion with background fill options for transparent PNGs. |
| **SVG to High-Res PNG** | `/convert/image/svg-to-png` | Renders scalable vector graphics into crystal-clear PNG images up to 8K resolution with transparent backgrounds. |
| **PNG to SVG Vector Wrapper** | `/convert/image/png-to-svg` | Embeds raster graphics into scalable SVG containers with responsive viewboxes. |
| **PNG to ICO Favicon** | `/convert/image/png-to-ico` | Converts square PNG graphics into standard `.ico` icons for website browsers and Windows applications. |
| **Image Compressor** | `/convert/image/compress-image` | Intelligently compresses JPG, PNG, and WebP images with adjustable compression ratios and visual preview sliders. |
| **Image Resizer** | `/convert/image/resize-image` | Resizes dimensions by exact pixel dimensions, percentage scaling, or standard aspect ratio presets (16:9, 4:3, 1:1). |

---

### Category 4: Video Converters & Social Creator Engine (18 Tools)
*Transcode, compress, reformat, and subtitle video files with FFmpeg native speed.*

| Tool Name | Route Slug | Key Features & Technical Details |
| :--- | :--- | :--- |
| **GIF to MP4 / WebM** | `/convert/video/gif-to-mp4` | Converts heavy animated GIFs into smooth, lightweight looping MP4/WebM videos with 90%+ file size reduction. |
| **Social Canvas & Aspect Resizer** | `/convert/video/video-aspect-ratio-resizer`| Resizes video canvas to 9:16 (TikTok/Reels/Shorts), 16:9 (YouTube), and 1:1 with intelligent blurred letterbox borders. |
| **Video to MP3 (Audio Extraction)**| `/convert/video/video-to-mp3`, `/convert/video/mp4-to-mp3` | Extracts high-bitrate audio tracks (128kbps to 320kbps MP3) directly from MP4, MOV, MKV, AVI, and WebM videos. |
| **Video to GIF Maker** | `/convert/video/video-to-gif` | Converts video clips into smooth animated GIFs using two-pass Lanczos palette generation for crisp colors. |
| **Compress for Discord (8MB/25MB)** | `/convert/video/compress-video-for-discord` | Auto-calculates two-pass target bitrates to compress video under Discord free (8MB) and Nitro (25MB) limits. |
| **Compress for WhatsApp (16MB)** | `/convert/video/compress-video-for-whatsapp`| Compresses videos under 16MB with H.264 FastStart flags for instant playback within WhatsApp chat threads. |
| **Video Compressor & Optimizer** | `/convert/video/compress-video` | General CRF and bitrate optimizer reducing file size while preserving 1080p/720p visual fidelity. |
| **Subtitle Converter & Time-Shifter**| `/convert/video/subtitle-converter` | Bi-directional converter for SRT, WebVTT, ASS, and SubViewer with millisecond timestamp shifting and tag stripping. |
| **Hardcode / Burn Subtitles** | `/convert/video/burn-subtitles-to-video`| Permanently burns SRT/VTT subtitle tracks into video frames with custom fonts, colors, and positioning for social clips. |
| **Lossless Video Muter & Audio Replacer**| `/convert/video/mute-video-replace-audio` | Strips audio streams or merges a new audio track into MP4/MOV in under 2 seconds without re-encoding video. |
| **Screen & Webcam Recorder** | `/convert/video/screen-recorder` | Records browser tabs, full desktop, or webcam feeds with microphone audio directly in memory, exporting to MP4/GIF. |
| **Format Transcoders** | `/convert/video/mp4-to-webm`, `/convert/video/webm-to-mp4`, `/convert/video/mov-to-mp4`, `/convert/video/mkv-to-mp4`, `/convert/video/avi-to-mp4` | High-compatibility format bridges handling H.264, H.265/HEVC, VP9, and AV1 video codecs with stereo AAC/Opus audio. |
| **Video Trimmer & Cutter** | `/convert/video/video-trim` | Trims video clips with frame-accurate start/end timestamps and instant in-browser playback preview. |

---

### Category 5: Audio Converters & Studio Tools (16 Tools)
*Bitrate conversion, waveform editing, voice recording, pitch modulation, and multi-track joining.*

| Tool Name | Route Slug | Key Features & Technical Details |
| :--- | :--- | :--- |
| **Audio Trimmer & Ringtone Cutter** | `/convert/audio/audio-trimmer` | Zoomable interactive waveform cutter with millisecond markers, fade-in/fade-out curves, and MP3/WAV export. |
| **Multi-Track Audio Joiner** | `/convert/audio/audio-joiner` | Merges multiple MP3, WAV, M4A, and FLAC tracks into a single seamless audio file with crossfade transitions. |
| **Voice & Studio Mic Recorder** | `/convert/audio/voice-recorder` | Browser-based microphone studio with real-time waveform visualizer, pause/resume, and direct MP3/WAV downloads. |
| **Audio Speed & Pitch Modulator** | `/convert/audio/audio-speed-pitch-changer` | Adjusts playback speed (0.5x to 2.5x) with pitch-lock or shifts musical semitones (-12 to +12) with live preview. |
| **Audio Volume Booster (300%)** | `/convert/audio/volume-booster` | Boosts quiet recordings up to 300% loudness with soft-clipping protection and peak limiters to prevent distortion. |
| **WAV to MP3 Converter** | `/convert/audio/wav-to-mp3` | Compresses uncompressed studio WAV files into 320kbps MP3s, reducing file size by up to 90%. |
| **MP3 to WAV Converter** | `/convert/audio/mp3-to-wav` | Decompresses MP3 files into uncompressed 16-bit 44.1kHz PCM WAV for digital audio workstations (DAWs). |
| **M4A to MP3 Converter** | `/convert/audio/m4a-to-mp3` | Converts Apple Voice Memos, AAC, and iTunes M4A tracks into universal MP3 files. |
| **FLAC to MP3 Converter** | `/convert/audio/flac-to-mp3` | Converts lossless FLAC audiophile files into high-bitrate MP3s suitable for mobile playback. |
| **Audio Compressor** | `/convert/audio/audio-compress` | Optimizes spoken audio (podcasts, lectures, audiobooks) to reduce file sizes without sacrificing vocal clarity. |

---

### Category 6: Media & Subtitle Converters (6 Tools)
*Specialized quick-action media utilities for subtitle syncing, video compression, and audio extraction.*

- **Universal Subtitles Converter & Time-Shifter** (`/convert/media/subtitle-converter`)
- **MP4 to MP3 (Audio Extraction)** (`/convert/media/mp4-to-mp3`)
- **Video to GIF Maker** (`/convert/media/video-to-gif`)
- **Universal Video Compressor** (`/convert/media/compress-video`)
- **WAV to MP3 Quick Converter** (`/convert/media/wav-to-mp3`)
- **In-Memory Screen & Webcam Recorder** (`/convert/media/screen-recorder`)

---

### Category 7: Physical & Regional Unit Converters (14 Tools)
*Zero-latency conversion matrix spanning standard SI units, agricultural land, and utility billing.*

| Tool Name | Route Slug | Key Features & Technical Details |
| :--- | :--- | :--- |
| **Length & Distance Converter** | `/convert/unit/length-converter` | Instant conversions: Meters, Kilometers, Miles, Feet, Inches, Yards, Centimeters, Millimeters. |
| **Weight & Mass Converter** | `/convert/unit/weight-converter` | Inter-converts Metric Tons, Kilograms, Grams, Milligrams, Pounds (lbs), and Ounces (oz). |
| **Temperature Converter** | `/convert/unit/temperature-converter` | Accurate multi-directional formulas for Celsius (°C), Fahrenheit (°F), and Kelvin (K). |
| **Area Converter** | `/convert/unit/area-converter` | Metric and imperial area: Square Meters, Square Kilometers, Square Feet, Acres, and Hectares. |
| **Marla to Square Feet** | `/convert/unit/marla-to-square-feet` | Regional real estate converter supporting Urban/LDA (225 sq ft), Revenue/Patwari (272.25 sq ft), and CDA (250 sq ft) standards with interactive plot visualization. |
| **Square Feet to Marla** | `/convert/unit/square-feet-to-marla` | Calculates Marla, Kanal, Square Yards (Gazz), and Sarsahi from raw square footage across all regional standards. |
| **Murabba & Bigha to Acre / Kanal** | `/convert/unit/murabba-bigha-to-acre` | Agricultural land area converter across Murabba, Bigha, Acre, Kanal, Marla, Biswa, and Square Feet. |
| **Tola to Grams & Gold Purity** | `/convert/unit/tola-to-grams` | Bullion converter between Tola, Grams, Masha, Ratti with real-time valuation for 24K, 22K, 21K, and 18K gold. |
| **Maund (Mann) to Kilograms** | `/convert/unit/maund-to-kg` | Agricultural commodity converter from Maund (40 kg), Seer, and Chhatak to Kilograms with batch pricing calculations. |
| **Lakhs & Crores to Millions & Billions** | `/convert/unit/lakh-crore-to-million-billion` | Translates South Asian numbering (Lakh, Crore, Arab, Kharab) to Western numbering with Urdu and English words. |
| **Electricity Bill & Solar Net-Metering** | `/convert/unit/electricity-bill-solar-calculator` | Calculates residential/commercial bills across Pakistani Discos (IESCO, LESCO, KE, etc.) with protected/unprotected tariff slabs, fuel adjustments, taxes, and Solar Net-Metering ROI. |
| **Gas Bill Units Calculator** | `/convert/unit/gas-bill-calculator` | Converts gas meter HM³ readings to MMBTU and calculates monthly domestic gas bills for SSGC and SNGPL slabs. |
| **Speed Converter** | `/convert/unit/speed-converter` | Multi-unit speed calculations: km/h, mph, m/s, knots, and Mach. |
| **Data Storage Converter** | `/convert/unit/data-storage-converter` | Decimal (KB, MB, GB, TB, PB) and Binary (KiB, MiB, GiB, TiB, PiB) storage unit conversions. |

---

### Category 8: Currency & Financial Calculators (13 Tools)
*Real-time global forex pairs, diaspora remittances, and Islamic finance calculators.*

| Tool Name | Route Slug | Key Features & Technical Details |
| :--- | :--- | :--- |
| **Global Live Forex Converter** | `/convert/currency/currency-converter` | Real-time foreign exchange engine supporting 150+ global currencies with live interbank exchange rates. |
| **Salary & Income Tax Calculator** | `/convert/currency/fbr-salary-tax-calculator` | Calculates monthly/annual FBR income tax, tax brackets, take-home pay, and surcharge for Tax Year 2024–2026. |
| **Islamic Zakat & Nisab Calculator** | `/convert/currency/zakat-calculator` | Computes accurate 2.5% Zakat on Gold, Silver, Cash, and trade assets based on dynamic Gold and Silver Nisab thresholds. |
| **Regional Forex & Remittance Pairs** | `/convert/currency/usd-to-pkr`, `/convert/currency/sar-to-pkr`, `/convert/currency/aed-to-pkr`, `/convert/currency/gbp-to-pkr`, `/convert/currency/eur-to-pkr`, `/convert/currency/cad-to-pkr`, `/convert/currency/aud-to-pkr`, `/convert/currency/qar-to-pkr`, `/convert/currency/kwd-to-pkr`, `/convert/currency/omr-to-pkr` | Real-time exchange rate trackers comparing interbank rates against diaspora remittance providers (Wise, Remitly, Western Union, Payoneer, Bank Wire) with historical interactive trend charts. |

---

### Category 9: Date & Time Tools (5 Tools)
*Timezone comparisons, Unix timestamps, and lunar calendar alignments.*

| Tool Name | Route Slug | Key Features & Technical Details |
| :--- | :--- | :--- |
| **Hijri to Gregorian Calendar** | `/convert/datetime/hijri-to-gregorian` | Bi-directional Islamic lunar Hijri to Gregorian solar converter with configurable ±1 or ±2 day moon sighting offsets. |
| **World Clock & Timezone Converter** | `/convert/datetime/timezone-converter` | Multi-city world clock comparison with interactive time slider and daylight saving time (DST) calculations. |
| **Unix Timestamp Converter** | `/convert/datetime/unix-timestamp-converter` | Converts epoch seconds and milliseconds to human-readable UTC and local time strings with a live updating clock. |
| **Age Calculator & Birthday Countdown** | `/convert/datetime/age-calculator` | Calculates exact age in years, months, weeks, days, hours, and seconds with milestone countdowns. |
| **Date Format Converter** | `/convert/datetime/date-format-converter` | Converts date strings across ISO 8601, RFC 2822, US (MM/DD/YYYY), UK (DD/MM/YYYY), and SQL datetime formats. |

---

### Category 10: Color Converters & Palette Studio (3 Tools)
*Color spaces, harmony generators, and accessibility contrast checkers.*

| Tool Name | Route Slug | Key Features & Technical Details |
| :--- | :--- | :--- |
| **HEX to RGB / HSL / CMYK** | `/convert/color/hex-to-rgb` | Converts color values across HEX, RGB, HSL, CMYK, and HSV with built-in WCAG 2.1 AA/AAA contrast ratio analysis. |
| **Color Palette Generator** | `/convert/color/color-palette-generator` | Generates harmonious palettes (Monochromatic, Analogous, Triadic, Complementary) with CSS, SCSS, and Tailwind exports. |
| **RGB to CMYK (Print Color)** | `/convert/color/rgb-to-cmyk` | Converts screen RGB colors to CMYK ink percentages for professional offset printing. |

---

### Category 11: Archive & Compression Suite (3 Tools)
*In-browser archive inspection and streaming ZIP compression.*

| Tool Name | Route Slug | Key Features & Technical Details |
| :--- | :--- | :--- |
| **Create ZIP Archive** | `/convert/archive/create-zip` | Bundles and compresses multiple uploaded files into a single high-efficiency ZIP archive stream. |
| **Extract ZIP Archive** | `/convert/archive/extract-zip` | Inspects, previews directory trees, and extracts contents of ZIP, 7Z, and TAR archives without uploading to a server. |
| **ZIP File Creator & Extractor** | `/convert/archive/zip-compressor` | Dual-mode tool allowing instant creation of encrypted/unencrypted ZIP files or extraction of existing packages. |

---

### Category 12: Pakistan Regional Moat & Legal Utilities (5 Tools)
*High-intent regional utilities providing defensible SEO moats and localization.*

| Tool Name | Route Slug | Key Features & Technical Details |
| :--- | :--- | :--- |
| **PTA Mobile Phone Tax Calculator** | `/convert/pakistan/pta-mobile-tax-calculator` | Official PTA DIRBS duty and customs tax breakdown on imported phones (iPhone, Samsung, Pixel) with Passport vs CNIC rates. |
| **Property Transfer & Tax Calculator** | `/convert/pakistan/property-tax-calculator` | Computes FBR Section 236K/236C advance withholding tax, provincial stamp duty, TMA mutation fees for Filers vs Non-Filers. |
| **Freelancer IT Export Tax Calculator**| `/convert/pakistan/freelance-tax-calculator` | Calculates Income Tax Section 154A 0.25% PSEB registered tax vs 1% standard rate, with Payoneer/Wise remittance fee matrices. |
| **Vehicle Token Tax & Registration** | `/convert/pakistan/vehicle-token-tax-calculator` | Estimates annual token tax, lifetime registration fees, and transfer taxes for cars, bikes, and EVs in Punjab, Sindh, and ICT. |
| **Pakistani CNIC & NTN Decoder** | `/convert/pakistan/cnic-ntn-decoder` | Validates 13-digit CNIC and NTN formats, decoding province, administrative division, district, and gender parity 100% in browser. |

---

### Category 13: Hardware & Device Diagnostic Testers (8 Tools)
*100% client-side hardware testing suite with zero video or audio stream transmission.*

| Tool Name | Route Slug | Key Features & Technical Details |
| :--- | :--- | :--- |
| **Webcam & Camera Tester** | `/convert/hardware/webcam-test` | Detects camera resolution (up to 4K), live video FPS, aspect ratio, color fidelity, and captures test snapshots. |
| **Microphone & Audio Input Tester** | `/convert/hardware/mic-test` | Visualizes mic input with real-time decibel VU meters, FFT frequency spectrums, and a 5-second echo loopback test. |
| **Speaker & Headphone Tester** | `/convert/hardware/speaker-test` | Tests stereo Left/Right channel separation, 3D spatial surround sound, and 20Hz–20kHz frequency sweeps. |
| **Screen Display & Dead Pixel Checker**| `/convert/hardware/screen-test` | Identifies dead/stuck pixels via full-screen color cycles, checks screen refresh rate (Hz), and measures contrast gradient banding. |
| **Keyboard & Ghosting Tester** | `/convert/hardware/keyboard-test` | Interactive virtual keyboard layout testing multi-key rollover anti-ghosting and mechanical switch chatter. |
| **Mouse & Trackpad Tester** | `/convert/hardware/mouse-test` | Checks left/right/middle buttons, scroll wheel speed, polling rate, and detects intermittent microswitch double-click faults. |
| **Gamepad & Controller Tester** | `/convert/hardware/gamepad-test` | Calibrates Xbox, PlayStation, and Switch gamepads with an interactive stick-drift radar, trigger pressure gauges, and rumble test. |
| **Video Call Readiness Test** | `/convert/hardware/call-readiness` | 10-second automated diagnostic testing camera, mic, audio output, and WebRTC network latency for Zoom, Teams, and Google Meet. |

---

## 5. Privacy, Security & Data Lifecycle Management

ConvertX enforces rigorous security controls to ensure user privacy across all processing modalities:

### 1. In-Browser Isolation
- High-risk operations (JWT inspection, hash generation, EXIF stripping, hardware testing, and document redaction) run exclusively within the client's V8/JavaScript execution context.
- No network requests containing user file contents or hardware streams are dispatched.

### 2. Ephemeral Server Storage & Automated Purge
- Conversions requiring server-side compute (LibreOffice, FFmpeg, multi-file merging) utilize isolated temporary storage.
- An automated cron endpoint (`/api/cron/purge-files`) continuously executes lifecycle sweeps, unlinking processed files older than 60 minutes.
- Download links are issued as cryptographically random single-use tokens (`/api/download/[token]`), preventing URL guessing or unauthorized indexing.

### 3. Rate Limiting & Bot Defense
- Edge middleware integration with `@upstash/ratelimit` and Redis (`bot-guard.ts`, `burst-limiter.ts`).
- Applies dynamic sliding-window rate limits per IP address and API key.
- Daily quota counters reset automatically at midnight Pakistan Standard Time (PKT / UTC+5).

---

## 6. Public Developer REST API & Embeddable Widgets

ConvertX provides programmatic access to its core conversion engines for developers, webmasters, and enterprise integrations.

### Public REST API (`/api/v1/convert`)

- **Authentication:** Bearer API key or `x-api-key` header with tier-based quota allocation (Free, Pro, Enterprise).
- **Rate Limit Headers:** Returns standard RFC rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`).
- **Unified POST Payload:**
  ```json
  POST /api/v1/convert
  Content-Type: application/json
  Authorization: Bearer <API_KEY>

  {
    "tool": "fbr-tax",
    "params": {
      "monthlySalary": 250000
    }
  }
  ```
- **Supported API Tools:** Physical units, FBR Income Tax, Freelance PSEB Tax, Islamic Zakat, Marla Land Area, Live Currency/Forex, JSON to YAML, YAML to JSON, Cryptographic Hashing, and Base64.

### Embeddable Interactive Widgets (`/embed/[tool]`)

Third-party blogs, real estate portals, and news websites can embed ConvertX tools using clean responsive iframes:
```html
<iframe 
  src="https://apextools.app/embed/fbr-salary-tax-calculator" 
  width="100%" 
  height="600" 
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
</iframe>
```
- Includes 1-click modal code generator with configurable height, border radius, and theme preset (light/dark).

---

## 7. Programmatic SEO & Knowledge Hub Engine

To achieve sustainable organic search acquisition, ConvertX implements an automated programmatic SEO architecture:

- **160+ High-Intent Landing Pages:** Each tool features a dedicated landing page (`/convert/[category]/[tool]`) tailored to high-volume user search queries (e.g., "compress video for discord", "tola to grams gold", "marla to sqft").
- **Structured JSON-LD Schemas:** Every page injects dynamic Schema.org structured metadata:
  - `SoftwareApplication` & `WebApplication`
  - `FAQPage` with pre-indexed accordions
  - `HowTo` step-by-step conversion guides
  - `BreadcrumbList` for clean Google Search snippet hierarchies
- **Dynamic OpenGraph Images:** Automated OpenGraph social card generation at `/og?title=...` with tool branding, category badges, and dynamic gradients.
- **Dynamic Sitemap & Robots:** Automated XML sitemap generation (`/sitemap.xml`) indexing all tool endpoints and knowledge guides (`/guides/[slug]`).

---

## 8. User Accounts, History & Dashboard

ConvertX supports both guest users and authenticated members through Supabase Authentication:

- **Guest Experience:** Zero-friction access with instant conversions and client-side quota indicators (`QuotaIndicator.tsx`).
- **Authenticated Accounts:** Secure login via Email Magic Links and Google OAuth (`/auth/login`, `/auth/signup`).
- **User Dashboard (`/dashboard`):**
  - Live view of daily remaining conversion quota.
  - Historical log of completed conversions with download recovery options.
  - Developer API key creation and management.
- **Social Sharing:** Native 1-tap WhatsApp sharing (`WhatsAppShareButton.tsx`) for instant distribution of tax, land, and currency calculations.

---

## 9. Admin Analytics & Operational Control Center

A dedicated administrative suite (`/admin`) provides real-time operational oversight:

- **System Health & Conversion Throughput (`/admin/analytics`):** Real-time monitoring of conversion volumes, success rates, failure logs, and Redis worker queue health.
- **Advertising Management (`/admin/ads`):** Controls Google AdSense script injection, ad placement density, responsive leaderboard/sidebar slots, and ad-blocking revenue impact metrics.
- **Regional Config & Tax Schedules (`/admin/regional-config`):** Live editing and updates for FBR tax slabs, PTA mobile duty brackets, gold benchmark prices, and interbank forex spreads without code redeployment.

---

## 10. Technical Stack & Infrastructure Reference

### Core Architecture
- **Framework:** Next.js 14.2 (App Router, Server Components, Route Handlers)
- **Language:** TypeScript 5.7 (Strict mode enabled)
- **Styling:** Tailwind CSS 3.4, PostCSS, Autoprefixer
- **UI Components & Icons:** Lucide React, Framer Motion, Radix UI primitives
- **Theming:** `next-themes` (Dark / Light / System auto-detect)

### Backend & Queue Processing
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security, SSR cookies)
- **Job Queue:** BullMQ 6.3 + Redis (ioredis)
- **Media Transcoding:** FFmpeg (`fluent-ffmpeg`, `@ffmpeg-installer/ffmpeg`)
- **Document Processing:** Headless LibreOffice (`libreoffice-convert`), `pdf-lib`, `pdfjs-dist`
- **Image Processing:** Sharp 0.35, `@imgly/background-removal`, `heic-convert`, `png-to-ico`
- **Text & OCR:** Tesseract.js 7.0 (WebAssembly engine)
- **Compression & Archives:** `archiver`, `adm-zip`, `jszip`

### Rate Limiting & Network
- **Edge Rate Limiter:** `@upstash/ratelimit`, `@upstash/redis`
- **Timezone Sync:** Pakistan Standard Time (`PKT` / `UTC+5`) midnight reset logic
- **Deployment Platform:** Vercel (Edge Functions & Next.js Serverless runtime) + Docker worker container for background media tasks

---

*Document maintained by the ApexTools (apextools.app) Engineering Team. Last updated: September 2026.*
