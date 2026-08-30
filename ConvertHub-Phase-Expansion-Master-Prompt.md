# MASTER BUILD PROMPT: ConvertHub 3-Phase Expansion
## Target Platform: ConvertHub / ConvertX (Next.js 14 App Router + TypeScript + Tailwind CSS)
### Scope: 3 Comprehensive Expansion Phases (Phase A: Developer Tools, Phase B: Pakistan Local Moat, Phase C: High-Scale Media & Modern Converters)

---

## 1. EXECUTIVE OVERVIEW & ARCHITECTURE PRINCIPLES

You are tasked with expanding **ConvertHub / ConvertX** by implementing all conversion tools across **Three Strategic Phases**. 

### Architectural Tenets:
1. **Zero-Friction & Instant Client Computation:**
   - Tools in **Phase A** and **Phase B** must execute 100% client-side whenever possible (zero server latency, zero cloud computing cost, complete data privacy).
2. **Industrial-Grade Media Pipeline:**
   - Tools in **Phase C** integrate seamlessly with the existing `sharp` and `ffmpeg` worker pipeline (`src/workers/start-worker.ts` and `src/app/api/convert`).
3. **SEO-First Engineering:**
   - Every single new tool must have a unique metadata definition, rich keywords, dynamic breadcrumbs, interactive FAQs with structured data (`JSON-LD` schema `FAQPage` + `SoftwareApplication`), and related tool internal linking.
4. **Pakistan-First Regional Moat:**
   - All Pakistani tools must feature Urdu transliteration, English/Urdu bilingual output, official tax year formulas (FBR 2024–2026), and local standard toggles (e.g. Lahore/LDA vs CDA vs Patwari; Filer vs Non-Filer; SNGPL vs SSGC).
5. **Aesthetics & UI Standards:**
   - Premium dark/light mode responsive cards, glassmorphic accents, Lucide-React icons, one-click copy with toast notifications, batch sample presets, dual-pane live preview layouts, and clean download triggers.

---

## 2. REPOSITORY INTEGRATION MAP

When adding tools, you must update the following core files systematically:
- `src/config/categories.ts`: Add `ToolMetadata` objects into corresponding categories (`developer`, `pakistan`, `image`, `video`, `audio`, etc.).
- `src/components/converters/ConverterCanvas.tsx`: Add routing conditions to render the dedicated component for each tool slug.
- `src/components/converters/[category]/[ToolComponent].tsx`: Create the dedicated, interactive React converter component.
- `src/app/convert/[category]/[tool]/page.tsx`: Verify SEO metadata generation, OpenGraph tags, and FAQ schema injection.
- `src/lib/seo/metadata.ts` & `src/lib/seo/faqData.ts`: Expand FAQ answers and metadata defaults.

---

## 3. DETAILED IMPLEMENTATION PHASES

```
========================================================================================
PHASE A: DEVELOPER & DATA UTILITIES (100% Client-Side, Zero Server Cost, High Organic Dev Traffic)
========================================================================================
```

### Tool A1: YAML ↔ JSON ↔ TOML Multi-Converter
- **Slugs:** `yaml-to-json`, `json-to-yaml`, `toml-to-json`, `yaml-to-toml`
- **Category:** `developer`
- **Features:**
  - Dual-pane Monaco-style code editor with syntax highlighting and line numbers.
  - Auto-detection of pasted syntax (YAML vs JSON vs TOML).
  - Validation error markers with line and column indicators.
  - Options: Indentation size (2 spaces, 4 spaces, tabs), sort object keys alphabetically, minify JSON output.
  - Quick actions: "Load Sample Kubernetes YAML", "Load Sample Package JSON", "Copy Output", "Download File (.yaml/.json/.toml)".

### Tool A2: SQL Query ↔ JSON / CSV Converter
- **Slugs:** `sql-to-json`, `json-to-sql`, `csv-to-sql`
- **Category:** `developer`
- **Features:**
  - Generate clean ANSI SQL `INSERT INTO [table_name] ([columns...]) VALUES (...)` statements from JSON arrays or CSV data.
  - Convert raw SQL `INSERT INTO` or `SELECT` table dumps back into structured JSON arrays and CSV sheets.
  - Controls: Target table name input, batch size chunking (e.g. 500 rows per `INSERT` statement for Postgres/MySQL performance), quote identifier type (`"col"` for Postgres, `` `col` `` for MySQL), NULL handling.

### Tool A3: JWT (JSON Web Token) Inspector & Decoder
- **Slug:** `jwt-decoder`
- **Category:** `developer`
- **Features:**
  - Live client-side parsing of Header (algorithm & token type) and Payload (claims: `sub`, `iat`, `exp`, `iss`, custom claims).
  - Humanized token status:
    - Expiration badge: "Active (Expires in 2 hours, 14 mins)" or "Expired (Expired 3 days ago)".
    - Real-time countdown timer to token expiration.
    - Formatted ISO UTC & local time for `iat` (Issued At) and `exp` (Expires At).
  - Signature verification simulator (optional secret key check using Web Crypto API HMAC-SHA256).
  - Privacy promise badge: "Decoded entirely in your browser — tokens are never transmitted to any server."

### Tool A4: Cryptographic Hash Generator & Checksum Verifier
- **Slug:** `hash-generator`
- **Category:** `developer`
- **Features:**
  - Computes all major hashes in parallel as the user types: **MD5, SHA-1, SHA-256, SHA-384, SHA-512, Keccak-256**.
  - HMAC mode: Optional secret key input to generate HMAC-SHA256 / HMAC-SHA512.
  - File Checksum Mode: Drag & drop any file (up to 2GB+) to stream-calculate its SHA-256 / MD5 hash using browser `crypto.subtle`.
  - Checksum Comparator: Paste an expected hash (e.g., from an ISO download page) to instantly get a green "MATCH" or red "MISMATCH" badge.

### Tool A5: CSS Units Converter (PX ↔ REM ↔ EM ↔ VW/VH ↔ PT)
- **Slug:** `css-unit-converter`
- **Category:** `developer`
- **Features:**
  - Real-time bi-directional conversion matrix across `px`, `rem`, `em`, `vw`, `vh`, `pt`, `%`, `ch`.
  - Adjustable baseline settings: Root font size (default 16px), Parent element font size (default 16px), Viewport Width (default 1920px), Viewport Height (default 1080px).
  - CSS Snippet Generator: Instant `clamp(min, preferred, max)` responsive typography generator.
  - Tailwind CSS helper: Shows matching Tailwind class (e.g., `16px` / `1rem` $\rightarrow$ `text-base` / `p-4`).

### Tool A6: Smart QR Code & Barcode Generator
- **Slug:** `qr-code-generator`
- **Category:** `developer`
- **Features:**
  - Modes: URL / Website, Wi-Fi Auto-Connect (SSID, WPA/WPA2/WEP, Password, Hidden), vCard (Contact details), WhatsApp Direct Message (+92 phone number pre-fill), Plain Text, Email, SMS.
  - Customization: Foreground & Background color pickers, error correction level (L: 7%, M: 15%, Q: 25%, H: 30%), logo image overlay in center.
  - Instant high-res export in PNG, SVG (vector), and WebP formats with custom pixel width slider (256px to 2048px).

### Tool A7: Cron Expression Translator & Builder
- **Slug:** `cron-expression-decoder`
- **Category:** `developer`
- **Features:**
  - Plain English explanation of 5-field and 6-field cron expressions (e.g. `*/15 * * * *` $\rightarrow$ "Every 15 minutes").
  - Visual Crontab Builder: Pickers for Minutes, Hours, Days of Month, Months, Days of Week.
  - Next Execution Times: Calculates and renders the next 10 exact upcoming run dates & times in UTC and Pakistan Standard Time (PKT).

---

```
========================================================================================
PHASE B: PAKISTAN REGIONAL MOAT & HIGH-INTENT CALCULATORS (Local Monopoly & Search Traffic)
========================================================================================
```

### Tool B1: FBR Salary & Income Tax Calculator (Tax Year 2024–2026)
- **Slug:** `fbr-salary-tax-calculator`
- **Category:** `pakistan`
- **Features:**
  - Updated with official Government of Pakistan Finance Act income tax slabs for Salaried and Non-Salaried individuals.
  - Inputs: Gross monthly salary or annual salary, allowances, tax deductions.
  - Status switches: **Active Taxpayer (Filer) vs Non-Filer**, Salaried vs Business Individual.
  - Calculation outputs:
    - Monthly Income Tax vs Annual Income Tax.
    - Monthly Net Take-Home Salary.
    - Effective Tax Rate (%) and Marginal Tax Bracket.
    - Visual breakdown chart (Gross Salary vs Income Tax vs Net Pay).
  - Tax Slab Explorer table showing all current FBR tax brackets (0% up to Rs. 600,000, 5%, 15%, 25%, 35% + surcharges).

### Tool B2: Zakat Calculator (PKR / Gold / Silver Nisab)
- **Slug:** `zakat-calculator`
- **Category:** `pakistan`
- **Features:**
  - Dynamic Nisab calculation: Fetches live Gold price (7.5 Tolas = 87.48g) and Silver price (52.5 Tolas = 612.36g) in PKR to calculate the current Nisab threshold.
  - Asset category inputs:
    - Cash in hand & bank accounts (Current/Savings).
    - Gold jewelry and bullion (Tolas or Grams, 24K / 22K / 21K / 18K purity).
    - Silver ornaments and coins.
    - Value of trade inventory / business merchandise.
    - Mutual funds, shares, prize bonds, receivables.
  - Liabilities deduction: Immediate loans, unpaid bills, upcoming expenses due.
  - Net Zakat Due: Exact 2.5% calculation on net zakatable wealth exceeding Nisab.
  - Print/PDF summary for Zakat distribution records.

### Tool B3: South Asian Numeral Converter (Lakhs & Crores ↔ Millions & Billions)
- **Slug:** `lakh-crore-to-million-billion`
- **Category:** `pakistan`
- **Features:**
  - Bi-directional conversion between South Asian numbering (Unit, Ten, Hundred, Hazaar, Lakh, Crore, Arab, Kharab) and Western international numbering (Thousands, Millions, Billions, Trillions).
  - Number-to-Words generator in both English and Urdu:
    - Input: `55,000,000` $\rightarrow$ Output: `5.5 Crore` | `Fifty-Five Million` | `پانچ کروڑ پچاس لاکھ روپے`.
  - Cheque Writer mode: Generates standard banking format ("Fifty-Five Million Rupees Only").
  - Quick reference lookup table for standard real estate and business transaction sizes.

### Tool B4: Extended Land Measurement (Murabba & Bigha ↔ Kanal ↔ Acre ↔ Sq Ft)
- **Slug:** `murabba-bigha-to-acre`
- **Category:** `pakistan`
- **Features:**
  - Complete agricultural and revenue land units: **Murabba, Bigha, Acre (Qila / Killa), Kanal, Marla, Sarsahi, Biswa, Karam, Square Yards (Gazz), Square Feet, Square Meters**.
  - Regional variations:
    - Punjab / Haryana standard (1 Murabba = 25 Killa = 200 Kanals; 1 Acre = 8 Kanals).
    - Sindh standard (1 Bigha = 2 Kanals = 20 Ghunta).
    - KPK / Patwari standard.
  - Interactive plot dimension estimator and land cost calculator (e.g. Price per Acre $\rightarrow$ Price per Kanal / Marla).

### Tool B5: WAPDA / DISCOs Electricity Bill & Solar Net-Metering Estimator
- **Slug:** `electricity-bill-solar-calculator`
- **Category:** `pakistan`
- **Features:**
  - Supports all major distribution companies: **LESCO, IESCO, MEPCO, GEPCO, FESCO, PESCO, HESCO, SEPCO, QESCO, K-Electric**.
  - Tariff brackets: Protected Consumer (1–100, 101–200 units) vs Unprotected Consumer (1–100, 101–200, 201–300, 301–700, 700+ units), Single Phase vs Three Phase ToU (Peak / Off-Peak).
  - Comprehensive tax breakdown: Fuel Price Adjustment (FPA), Financing Cost (FC) Surcharge, Electricity Duty, General Sales Tax (GST), TV Fee (Rs. 35), Further Tax.
  - **Solar Net-Metering Mode:** Calculates exported vs imported kWh units, peak/off-peak unit billing offset, and estimated credit balance / bill savings.

### Tool B6: Gas Billing Units Converter (MMBTU ↔ SCM / HM³ ↔ PKR)
- **Slug:** `gas-bill-calculator`
- **Category:** `pakistan`
- **Features:**
  - Conversion between Meter Reading (HM³ / Hundred Cubic Meters), SCM (Standard Cubic Meters), and MMBTU (Million British Thermal Units).
  - SNGPL (Sui Northern) and SSGC (Sui Southern) domestic tariff slab calculation.
  - Protected vs Non-Protected domestic consumer slab comparison and seasonal winter surcharge estimation.

---

```
========================================================================================
PHASE C: HIGH-SCALE MEDIA & MODERN FORMAT CONVERTERS (Rich Media, Audio/Video, Web-Ready)
========================================================================================
```

### Tool C1: AVIF ↔ JPG / PNG / WebP Converter
- **Slugs:** `avif-to-jpg`, `avif-to-png`, `jpg-to-avif`, `png-to-avif`, `webp-to-avif`
- **Category:** `image`
- **Pipeline:** Node.js `sharp` with AVIF encoder (`libheif` / `libaom`).
- **Features:**
  - High-efficiency compression slider (Quality 1–100, Effort 1–9, Chroma subsampling 4:2:0 / 4:4:4).
  - Stripping EXIF metadata for maximum file size reduction and privacy.
  - Side-by-side visual comparison preview before downloading.

### Tool C2: Vector SVG ↔ PNG / ICO with DPI & Multi-Resolution Scaling
- **Slugs:** `svg-to-png`, `svg-to-ico`, `png-to-svg`
- **Category:** `image`
- **Features:**
  - Custom pixel dimension scaling (e.g. 512×512, 1024×1024, 2048×2048, 4K) with preserved transparency and anti-aliasing.
  - **Favicon Multi-Pack (.ico):** Generates single `.ico` container containing bundled 16x16, 32x32, 48x48, and 64x64 icons for web developers.
  - Color tinting: Ability to change fill/stroke colors on monochromatic SVGs before rasterization.

### Tool C3: High-Efficiency GIF ↔ MP4 / WebM Converter
- **Slugs:** `gif-to-mp4`, `gif-to-webm`
- **Category:** `video`
- **Pipeline:** `ffmpeg` with H.264 (`libx264`) and VP9/AV1 codecs.
- **Features:**
  - Shrinks large 50MB animated GIFs down to 2–4MB high-quality looping MP4/WebM videos (90%+ size reduction).
  - Seamless loop optimization (`-movflags faststart`, even-dimension pixel padding `pad=ceil(iw/2)*2:ceil(ih/2)*2`).
  - Playback preview with HTML5 video player and download button.

### Tool C4: Video Aspect Ratio & Social Canvas Resizer
- **Slug:** `video-aspect-ratio-resizer`
- **Category:** `video`
- **Pipeline:** `ffmpeg` scale & pad filter graphs.
- **Features:**
  - Canvas presets:
    - **9:16 Vertical** (TikTok, Instagram Reels, YouTube Shorts)
    - **16:9 Landscape** (YouTube, TV, Desktop)
    - **1:1 Square** (Instagram Feed, Facebook)
    - **4:5 Portrait** (Instagram Post)
  - Background styling options for padded areas:
    - Blurred mirrored video background (`[0:v]boxblur=20:20...`).
    - Solid black, white, or custom brand color background.
    - Center crop (no padding, fills entire frame).

### Tool C5: Universal Subtitles Converter & Time-Shifter
- **Slug:** `subtitle-converter`
- **Category:** `media`
- **Features:**
  - Formats supported: **SRT (.srt), WebVTT (.vtt), ASS/SSA (.ass), SubViewer (.sbv), Plain Transcript (.txt)**.
  - Real-time timestamp shifting: Offset all cues forward or backward by `+X` or `-X` milliseconds/seconds to synchronize out-of-sync movie subtitles.
  - Clean formatting: Remove HTML formatting tags (`<i>`, `<b>`, `<font>`), remove speaker tags or sound effect brackets `[Music]`.
  - Preview transcript box with search & replace capability.

### Tool C6: Audio Speed & Pitch Modulator
- **Slug:** `audio-speed-pitch-changer`
- **Category:** `audio`
- **Pipeline:** `ffmpeg` with `atempo` and `asetrate` audio filters.
- **Features:**
  - Speed modifier slider: **0.5x, 0.75x, 1.0x, 1.25x, 1.5x, 1.75x, 2.0x, 2.5x**.
  - Pitch lock toggle: Speed up or slow down voice lectures/audiobooks without chipmunk or demon voice distortion (preserves original pitch).
  - Pitch shift mode: Shift musical pitch up/down by semitones (-12 to +12 semitones) for musicians and karaoke practice.
  - In-browser instant Web Audio API preview prior to final export.

### Tool C7: Multi-Track Audio Joiner & Merger
- **Slug:** `audio-joiner`
- **Category:** `audio`
- **Pipeline:** `ffmpeg` audio concat filter graph with crossfade options.
- **Features:**
  - Drag-and-drop multiple MP3, WAV, M4A, AAC, FLAC audio files.
  - Re-order tracks with drag-and-drop handles.
  - Optional crossfade transition slider (0 to 5 seconds between consecutive songs/recordings).
  - Export to 320kbps high-bitrate MP3 or lossless WAV.

---

## 4. STEP-BY-STEP EXECUTION PLAYBOOK

Follow these steps sequentially to build, test, and release each phase:

### Step 1: Configuration & Metadata Registration
1. Open `src/config/categories.ts`.
2. Register every new tool under its respective category.
3. Ensure each tool has:
   - `id`, `name`, `slug`, `categorySlug`, `categoryName`, `description`, `iconName`.
   - `popular?: boolean`, `pakistanSpecific?: boolean`, `badge?: string`.

### Step 2: Component Construction
1. For Phase A: Create `src/components/converters/dev/*` components.
2. For Phase B: Create `src/components/converters/pakistan/*` components.
3. For Phase C: Create `src/components/converters/media/*` and `image/*` components.
4. Integrate the components into `src/components/converters/ConverterCanvas.tsx`.

### Step 3: SEO, FAQ & Schema Verification
1. Add tailored SEO titles, descriptions, and keyword clusters in `src/app/convert/[category]/[tool]/page.tsx`.
2. Ensure FAQ items answer specific high-volume queries with structured data markup.

### Step 4: Quality Assurance & Build Verification
1. Run `npm run lint` and verify zero TypeScript or ESLint errors.
2. Run `npm run build` to verify Next.js static page generation (`generateStaticParams`) compiles all new routes.
3. Manually test key conversion edge cases (e.g. invalid JSON, FBR tax slab thresholds, large file uploads).

---

## 5. COMPLETE VERIFICATION CHECKLIST

- [ ] All Phase A developer tools run client-side with 0 server roundtrips and instant feedback.
- [ ] FBR Tax Calculator reflects latest 2024–2026 finance act tax slabs accurately.
- [ ] Zakat Calculator calculates Nisab accurately based on 7.5 Tola Gold / 52.5 Tola Silver values.
- [ ] Lakh/Crore converter outputs both English words and Urdu script without formatting bugs.
- [ ] AVIF, SVG favicon, and GIF to MP4 conversions run without memory leaks.
- [ ] Social video resizer handles 9:16 TikTok and 16:9 landscape aspect ratios with blur padding.
- [ ] All URLs compile statically under `/convert/[category]/[tool]` with proper OpenGraph meta tags.
