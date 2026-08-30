# SUB-PROMPT 01: Expansion Architecture, Tool Metadata Registry & Shared Layout Components

## 1. Context & Objective
ConvertHub / ConvertX is expanding its platform across **Three Strategic Phases**:
- **Phase A: Developer & Data Utilities** (100% client-side, zero latency, privacy-first)
- **Phase B: Pakistan Regional Moat & High-Intent Calculators** (Local monopoly, Urdu/English bilingual, FBR/Zakat/Utility formulas)
- **Phase C: High-Scale Media & Modern Converters** (Next-gen Sharp & FFmpeg pipelines, AVIF, SVG icons, GIF->MP4, Subtitles, Audio modulator/joiner)

Your objective in this first expansion sub-prompt is to establish the unified architectural scaffolding:
1. Register all 20+ new tool definitions and category configurations into `src/config/categories.ts`.
2. Expand `src/components/converters/ConverterCanvas.tsx` to route every new tool slug to its dedicated interactive canvas.
3. Build shared developer and calculator UI building blocks (DualPaneEditor, SyntaxHighlighting, CodeActionToolbar, PrivacyBadges, CopyToast, PresetsSelector).
4. Establish dynamic breadcrumbs, category navigators, and Programmatic SEO metadata mapping for the expansion tool suite.

---

## 2. Technical Stack & Dependencies

- **Framework:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Icons:** `lucide-react`
- **Animation & Transitions:** `framer-motion`
- **Syntax Highlighting & Formatting:** `prismjs` or `@monaco-editor/react` (lightweight fallback)
- **Typography & Aesthetics:** Inter & Noto Sans / Noto Nastaliq Urdu

Install required baseline packages if not already present:
```bash
npm install lucide-react framer-motion clsx tailwind-merge
```

---

## 3. Metadata Registration (`src/config/categories.ts`)

Update `src/config/categories.ts` to include all 20+ tools across Phase A, Phase B, and Phase C with complete SEO tags, category links, icons, and badges:

```typescript
// Add or expand the following ToolMetadata objects:

// PHASE A: DEVELOPER TOOLS
{
  id: 'yaml-to-json',
  name: 'YAML to JSON Converter',
  slug: 'yaml-to-json',
  categorySlug: 'developer',
  categoryName: 'Developer Tools',
  description: 'Convert YAML syntax to formatted or minified JSON with live validation, indentation controls, and key sorting.',
  iconName: 'FileCode2',
  popular: true,
  badge: 'Instant Client-Side',
},
{
  id: 'json-to-yaml',
  name: 'JSON to YAML Converter',
  slug: 'json-to-yaml',
  categorySlug: 'developer',
  categoryName: 'Developer Tools',
  description: 'Convert JSON data into clean, indented YAML configuration files for Kubernetes, CI/CD, and Docker Compose.',
  iconName: 'FileCode',
  popular: true,
},
{
  id: 'toml-to-json',
  name: 'TOML to JSON / YAML Converter',
  slug: 'toml-to-json',
  categorySlug: 'developer',
  categoryName: 'Developer Tools',
  description: 'Parse Cargo.toml, pyproject.toml, and TOML configs into JSON and YAML structures.',
  iconName: 'Settings',
},
{
  id: 'sql-to-json',
  name: 'SQL Query to JSON / CSV Converter',
  slug: 'sql-to-json',
  categorySlug: 'developer',
  categoryName: 'Developer Tools',
  description: 'Convert SQL INSERT statements and table dumps into structured JSON arrays and CSV tables.',
  iconName: 'Database',
  popular: true,
},
{
  id: 'json-to-sql',
  name: 'JSON to SQL INSERT Generator',
  slug: 'json-to-sql',
  categorySlug: 'developer',
  categoryName: 'Developer Tools',
  description: 'Generate bulk ANSI SQL INSERT INTO statements from JSON arrays with custom table names and dialect quotes.',
  iconName: 'DatabaseBackup',
},
{
  id: 'jwt-decoder',
  name: 'JWT (JSON Web Token) Inspector & Decoder',
  slug: 'jwt-decoder',
  categorySlug: 'developer',
  categoryName: 'Developer Tools',
  description: 'Inspect JWT headers, decode payload claims, verify expiration with live countdown, and validate HMAC signatures.',
  iconName: 'KeyRound',
  popular: true,
  badge: '100% Private (Browser-Only)',
},
{
  id: 'hash-generator',
  name: 'Cryptographic Hash & File Checksum Generator',
  slug: 'hash-generator',
  categorySlug: 'developer',
  categoryName: 'Developer Tools',
  description: 'Compute MD5, SHA-1, SHA-256, SHA-512, Keccak-256 hashes in parallel and verify large file checksums streamingly.',
  iconName: 'ShieldCheck',
  popular: true,
},
{
  id: 'css-unit-converter',
  name: 'CSS Units Converter (PX ↔ REM ↔ EM ↔ VW ↔ PT)',
  slug: 'css-unit-converter',
  categorySlug: 'developer',
  categoryName: 'Developer Tools',
  description: 'Bi-directional CSS unit conversion matrix with responsive clamp() generator and Tailwind CSS class mapper.',
  iconName: 'LayoutGrid',
},
{
  id: 'qr-code-generator',
  name: 'Smart QR Code & Barcode Generator',
  slug: 'qr-code-generator',
  categorySlug: 'developer',
  categoryName: 'Developer Tools',
  description: 'Generate high-res QR codes for URLs, Wi-Fi auto-connect, vCards, and WhatsApp chats in SVG, PNG, and WebP.',
  iconName: 'QrCode',
  popular: true,
},
{
  id: 'cron-expression-decoder',
  name: 'Cron Expression Translator & Crontab Builder',
  slug: 'cron-expression-decoder',
  categorySlug: 'developer',
  categoryName: 'Developer Tools',
  description: 'Translate 5-field and 6-field cron expressions into plain English with visual schedule builder and upcoming run times.',
  iconName: 'Clock',
},

// PHASE B: PAKISTAN REGIONAL CALCULATORS
{
  id: 'fbr-salary-tax-calculator',
  name: 'FBR Salary Tax Calculator (2024–2026)',
  slug: 'fbr-salary-tax-calculator',
  categorySlug: 'pakistan',
  categoryName: 'Pakistan Regional',
  description: 'Calculate monthly and annual Pakistan income tax, net take-home salary, Filer vs Non-Filer deductions, and FBR slabs.',
  iconName: 'Receipt',
  popular: true,
  pakistanSpecific: true,
  badge: 'Tax Year 2024-2026',
},
{
  id: 'zakat-calculator',
  name: 'Zakat Calculator (PKR / Gold & Silver Nisab)',
  slug: 'zakat-calculator',
  categorySlug: 'pakistan',
  categoryName: 'Pakistan Regional',
  description: 'Accurate Islamic Zakat calculator with dynamic 7.5 Tola Gold and 52.5 Tola Silver Nisab thresholds in PKR.',
  iconName: 'HeartHandshake',
  popular: true,
  pakistanSpecific: true,
  badge: 'Islamic Finance',
},
{
  id: 'lakh-crore-to-million-billion',
  name: 'Lakhs & Crores to Millions & Billions Converter',
  slug: 'lakh-crore-to-million-billion',
  categorySlug: 'pakistan',
  categoryName: 'Pakistan Regional',
  description: 'Convert South Asian numbering (Lakh, Crore, Arab, Kharab) to Western (Million, Billion, Trillion) with English and Urdu words.',
  iconName: 'Coins',
  popular: true,
  pakistanSpecific: true,
  badge: 'English + اردو',
},
{
  id: 'murabba-bigha-to-acre',
  name: 'Murabba & Bigha to Acre / Kanal Land Converter',
  slug: 'murabba-bigha-to-acre',
  categorySlug: 'pakistan',
  categoryName: 'Pakistan Regional',
  description: 'Convert agricultural land units across Murabba, Bigha, Acre, Kanal, Marla, Biswa, and Sq Feet for Punjab, Sindh & KPK.',
  iconName: 'MapPin',
  pakistanSpecific: true,
},
{
  id: 'electricity-bill-solar-calculator',
  name: 'WAPDA Electricity Bill & Solar Net-Metering Estimator',
  slug: 'electricity-bill-solar-calculator',
  categorySlug: 'pakistan',
  categoryName: 'Pakistan Regional',
  description: 'Estimate electricity bills for LESCO, IESCO, MEPCO, K-Electric with Protected/Unprotected slabs, FPA taxes, and Solar ROI.',
  iconName: 'Zap',
  popular: true,
  pakistanSpecific: true,
  badge: 'Solar Net-Metering',
},
{
  id: 'gas-bill-calculator',
  name: 'Gas Bill Units Calculator (MMBTU ↔ SCM ↔ HM³ ↔ PKR)',
  slug: 'gas-bill-calculator',
  categorySlug: 'pakistan',
  categoryName: 'Pakistan Regional',
  description: 'Convert gas meter HM3 readings to MMBTU and calculate SNGPL / SSGC domestic monthly gas bills with slab rates.',
  iconName: 'Flame',
  pakistanSpecific: true,
},

// PHASE C: HIGH-SCALE MEDIA & MODERN CONVERTERS
{
  id: 'avif-to-jpg',
  name: 'AVIF to JPG / PNG / WebP Converter',
  slug: 'avif-to-jpg',
  categorySlug: 'image',
  categoryName: 'Image Converters',
  description: 'Convert next-generation AVIF images to universally compatible JPG, PNG, and WebP formats with quality sliders.',
  iconName: 'Image',
  popular: true,
  badge: 'Next-Gen Format',
},
{
  id: 'svg-to-ico',
  name: 'SVG to Multi-Resolution Favicon (.ICO) & PNG',
  slug: 'svg-to-ico',
  categorySlug: 'image',
  categoryName: 'Image Converters',
  description: 'Rasterize SVG vector graphics into multi-pack Windows .ico favicons (16, 32, 48, 64px) and high-res PNGs.',
  iconName: 'Sparkles',
},
{
  id: 'gif-to-mp4',
  name: 'GIF to MP4 / WebM Converter',
  slug: 'gif-to-mp4',
  categorySlug: 'video',
  categoryName: 'Video Converters',
  description: 'Convert heavy animated GIFs into smooth, lightweight looping MP4 and WebM videos with 90%+ file size reduction.',
  iconName: 'Video',
  popular: true,
  badge: '90% Size Reduction',
},
{
  id: 'video-aspect-ratio-resizer',
  name: 'Video Aspect Ratio & Social Canvas Resizer',
  slug: 'video-aspect-ratio-resizer',
  categorySlug: 'video',
  categoryName: 'Video Converters',
  description: 'Resize videos to 9:16 (TikTok, Reels, Shorts), 16:9 (YouTube), and 1:1 with intelligent blurred backgrounds.',
  iconName: 'Maximize2',
  popular: true,
},
{
  id: 'subtitle-converter',
  name: 'Universal Subtitles Converter & Time-Shifter',
  slug: 'subtitle-converter',
  categorySlug: 'media',
  categoryName: 'Media Tools',
  description: 'Convert SRT, WebVTT, ASS, SubViewer subtitles, offset timestamps in milliseconds, and clean formatting tags.',
  iconName: 'Subtitles',
},
{
  id: 'audio-speed-pitch-changer',
  name: 'Audio Speed & Pitch Modulator',
  slug: 'audio-speed-pitch-changer',
  categorySlug: 'audio',
  categoryName: 'Audio Tools',
  description: 'Change audio playback speed (0.5x to 2.5x) with pitch-lock or shift musical semitones with live preview.',
  iconName: 'Gauge',
},
{
  id: 'audio-joiner',
  name: 'Multi-Track Audio Joiner & Merger',
  slug: 'audio-joiner',
  categorySlug: 'audio',
  categoryName: 'Audio Tools',
  description: 'Combine and crossfade multiple MP3, WAV, M4A, FLAC audio files into a single seamless audio track.',
  iconName: 'Layers',
}
```

---

## 4. Shared UI Layout Components

Create the following reusable components in `src/components/converters/common/`:

### 4.1 Dual Pane Code / Data Editor (`DualPaneEditor.tsx`)
Features:
- Left pane: Input editor with syntax type indicator, line numbers, clear button, and file upload dropzone.
- Right pane: Output view with copy button, download button, minification toggle, and character/byte count stats.
- Responsive split screen (stacked on mobile, side-by-side on `lg` screens).

### 4.2 Localized Pakistani Metric Card (`PakistaniMetricCard.tsx`)
Features:
- Dual-language header (English + Urdu Nastaliq font).
- Informational tooltip explaining statutory / regulatory basis (e.g., FBR Finance Act 2024–2025, Central Ruet-e-Hilal Committee).
- South Asian number formatting badge (Lakhs / Crores).

### 4.3 Client Privacy Assurance Banner (`PrivacyAssuranceBadge.tsx`)
- Displays: "🔒 100% Client-Side Privacy: Your data is computed entirely inside your browser's JavaScript engine and is never sent to our servers."

---

## 5. ConverterCanvas Dispatcher Integration

Update `src/components/converters/ConverterCanvas.tsx` to import and mount all 20+ specialized converter components conditionally based on `tool.slug`.

---

## 6. Acceptance Criteria & Verification Checklist

- [ ] All 20+ new tools are correctly mapped in `src/config/categories.ts` with valid icon names, descriptions, and category associations.
- [ ] `ConverterCanvas.tsx` handles every new slug without falling back to a generic unhandled state.
- [ ] Shared components (`DualPaneEditor`, `PakistaniMetricCard`, `PrivacyAssuranceBadge`) render cleanly with zero CSS layout shifts (CLS = 0).
- [ ] TypeScript compiles cleanly with zero type errors (`npm run build` or `npx tsc --noEmit`).
