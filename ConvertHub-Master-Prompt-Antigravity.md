# MASTER BUILD PROMPT — Antigravity
## Project: All-in-One Free Conversion Website ("ConvertHub" — working name)

You are building a production-grade, all-in-one online conversion platform under Lapvy Enterprises, targeting a global + Pakistan-first audience. All conversions are FREE at launch, rate-limited per day per IP/user, and monetized primarily through non-intrusive display ads. Follow this document as the single source of truth. Build in phases, confirm each phase compiles/runs, then proceed.

---

## 1. PROJECT OVERVIEW

**Goal:** A fast, clean, SEO-friendly web app offering every major category of file, unit, and data conversion in one place — positioned against tools like CloudConvert, iLovePDF, Convertio, and TinyWow, with added Pakistan-specific converters as a differentiator no global competitor offers.

**Business model:**
- 100% free to use at launch, gated by a daily conversion limit per IP address (and a higher limit for logged-in free accounts).
- Revenue from display ads (primary) + secondary monetization streams (Section 6).
- Architecture must support introducing a **paid tier later** (remove limits/ads, batch conversion, API access) without a rebuild — build the limit/entitlement system so a "plan" flag can gate features from day one, even though only a "free" plan exists initially.

**Non-negotiables:**
- Fast page loads (conversion tools are commodity — speed and lack of friction win/lose users).
- No forced sign-up to use the free daily quota.
- No malware-style ad networks, no pop-unders, no autoplay-audio video ads. Ads must never block or delay the *actual* conversion — only the surrounding UI takes a deliberate, honest wait (see Section 5).
- Mobile-first responsive design — most conversion traffic in Pakistan is mobile.

---

## 2. TECH STACK

- **Frontend:** Next.js (React) + TypeScript, Tailwind CSS — SSR/SSG required for SEO on every tool landing page.
- **Backend/API:** Next.js API routes or a separate Node.js (Express/Fastify) service for heavy file processing, so conversion jobs don't block the web server.
- **File processing:**
  - Documents: LibreOffice headless / unoconv (or a cloud conversion API fallback) for Word↔PDF↔Excel↔PPT.
  - Images: `sharp` (Node) for resize/compress/format conversion; `libheif` for HEIC.
  - PDFs: `pdf-lib` / `pdf.js` / Ghostscript for merge, split, compress, PDF↔image.
  - Video/Audio: `ffmpeg` (via `fluent-ffmpeg`) — this is the workhorse for nearly all media conversions.
  - Archives: `archiver` / `node-7z` for ZIP/RAR handling.
- **Database:** Supabase (Postgres) — consistent with your other projects (AttendX pattern). Stores: users, daily usage counters, ad config, conversion job logs (metadata only, not file contents).
- **File storage:** Temporary object storage (Supabase Storage or S3-compatible) — auto-delete converted files after 1–2 hours via a cron/scheduled function. Never retain user files longer than necessary (privacy + storage cost).
- **Rate limiting:** Redis (Upstash Redis works well on serverless) for fast per-IP/per-user daily counters.
- **Queue (for heavy jobs like video):** BullMQ + Redis, so large conversions process asynchronously and the user gets a progress indicator instead of a blocked request.
- **Ads:** Google AdSense as primary network (see Section 5 for alternatives).
- **Hosting:** Vercel (frontend) + a small VPS or Railway/Render instance for the ffmpeg/LibreOffice worker (these need a real filesystem and CPU, not a serverless function with tight time limits).

---

## 3. COMPLETE CONVERSION CATEGORIES (build all sections below)

Structure the site as a homepage grid of categories → category page listing tools → individual tool page per conversion (each tool page is its own SEO-indexable URL, e.g. `/convert/jpg-to-pdf`, `/convert/marla-to-square-feet`).

### 3.1 Document / File Converters
- PDF ↔ Word (DOCX)
- PDF ↔ Excel (XLSX)
- PDF ↔ PowerPoint (PPTX)
- PDF ↔ JPG/PNG (image)
- JPG/PNG → PDF (multi-image to single PDF)
- HTML → PDF
- EPUB ↔ PDF
- Word → TXT / TXT → Word
- Merge PDF / Split PDF / Compress PDF / Rotate PDF
- PDF password protect / remove password

### 3.2 Image Converters
- JPG ↔ PNG ↔ WebP ↔ GIF ↔ BMP ↔ TIFF ↔ SVG ↔ ICO
- HEIC → JPG/PNG (iPhone photos — high search volume)
- Image compressor (target size/quality slider)
- Image resizer (by pixels/percentage)
- Background remover
- Image to Base64 / Base64 to Image

### 3.3 Video Converters
- MP4 ↔ AVI ↔ MOV ↔ MKV ↔ WMV ↔ FLV ↔ WebM
- Video compressor (target size)
- Video → GIF
- Video → MP3 (audio extraction)
- Video trimmer/cutter
- Video resolution changer (1080p/720p/480p)

### 3.4 Audio Converters
- MP3 ↔ WAV ↔ AAC ↔ FLAC ↔ OGG ↔ M4A
- Audio compressor
- Audio trimmer/cutter
- Audio merger

### 3.5 Unit Converters (classic, evergreen SEO traffic)
- Length (m, km, ft, inch, mile, cm)
- Weight/Mass (kg, g, lb, oz, ton)
- Temperature (°C, °F, K)
- Area (sq ft, sq m, acre, hectare)
- Volume (liter, gallon, ml, cubic meter)
- Speed (km/h, mph, m/s, knot)
- Time (seconds, minutes, hours, days, years)
- Pressure (Pa, bar, psi, atm)
- Energy (joule, calorie, kWh, BTU)
- Power (watt, kW, horsepower)
- Data storage (bit, byte, KB, MB, GB, TB)
- Angle (degree, radian, gradian)
- Fuel consumption (km/L, MPG, L/100km)

### 3.6 Currency Converter
- Live exchange rates via a forex API (e.g., exchangerate.host, Open Exchange Rates, or CurrencyLayer — pick one with a free tier and cache rates hourly in Redis/DB to avoid hitting rate limits)
- PKR prioritized at the top of the currency list (default pairing), alongside USD/AED/SAR/GBP/EUR

### 3.7 Data / Developer Converters
- CSV ↔ Excel ↔ JSON ↔ XML
- Base64 encode/decode
- URL encode/decode
- Text case converter (UPPER/lower/Title/Sentence)
- Binary ↔ Decimal ↔ Hexadecimal ↔ Octal
- Markdown ↔ HTML
- JSON formatter/validator (bonus utility, high traffic)

### 3.8 Pakistan-Specific / Regional Converters (key differentiator vs. global competitors)
- Marla ↔ Square Feet ↔ Square Meters ↔ Kanal (real estate — very high local intent)
- Tola ↔ Masha ↔ Grams (gold/jewelry)
- Maund ↔ Seer ↔ Kilograms (agriculture/wholesale)
- Hijri (Islamic) ↔ Gregorian date converter

### 3.9 Date & Time Converters
- Timezone converter
- Unix timestamp ↔ human-readable date
- Age calculator (date of birth → age)
- Date format converter (DD/MM/YYYY ↔ MM/DD/YYYY ↔ ISO)

### 3.10 Color Converters
- HEX ↔ RGB ↔ HSL ↔ CMYK
- Color picker / palette generator

### 3.11 Archive/Compression
- ZIP ↔ RAR ↔ 7Z
- File/folder compressor

Build each tool page with: a short SEO description, the converter UI, an FAQ section (targets long-tail search queries like "how to convert marla to square feet"), and related-tools links to keep users on-site longer (reduces bounce, helps ad revenue per session).

---

## 4. FREE-TIER RATE LIMITING (per day, per IP/user)

Implement a tiered daily quota system, resettable at midnight (Pakistan Standard Time, UTC+5):

| Tier | Daily conversions | Max file size | Notes |
|---|---|---|---|
| Anonymous (IP-based) | 10/day | 25 MB | No sign-up required, tracked by IP in Redis |
| Free account (email verified, no cost) | 25/day | 100 MB | Incentivizes sign-up without paying |
| (Future) Paid plan | Unlimited or very high | 1 GB+ | Placeholder only — do not build payment flow yet, just leave the plan field and gating logic ready |

**Implementation notes:**
- Track usage as a Redis key like `usage:{date}:{ip}` and `usage:{date}:{userId}`, incrementing on each successful conversion, with TTL set to expire at next midnight PKT.
- When a logged-in user converts, count against their account limit, not their IP, so shared/office IPs don't unfairly throttle multiple legitimate users.
- Show a clear, friendly "X of 10 free conversions used today — sign up for more" message rather than a hard error, and use it as a sign-up conversion point.
- Basic abuse mitigation: flag IPs that hit the limit and immediately retry from a new session/incognito repeatedly; don't over-engineer VPN-blocking at launch, revisit if abuse becomes a real cost problem.

---

## 5. MONETIZATION: ADS (non-irritating, by design)

The ad strategy must respect the user's actual task — someone converting a file for work/school should never feel tricked or blocked. Follow these rules:

**Placements (all standard IAB sizes, responsive):**
- Header banner (leaderboard, 728×90 desktop / 320×50 mobile) — top of every page, above the fold but below the nav, never overlapping content.
- Sidebar rectangle (300×250) on desktop category/tool pages — hidden on mobile (no squeezing tools into a tiny column).
- In-content native ad — placed *below* the tool/converter UI, never above it or in the middle of the upload area.
- Footer banner — low-priority placement, good for filling inventory without disrupting the task.

**The "processing screen" ad (the deliberate wait you asked for):**
- When a file is converting, show a clean progress screen with a short, honest processing animation (2–5 seconds even if the actual conversion is faster — but never fake a wait longer than the real one for big files, that erodes trust).
- Display **one** ad unit on this screen (a native/display ad, not autoplay video with sound). Frame it neutrally: "Preparing your file..." with the ad quietly alongside, not blocking a countdown the user must sit through like a pop-up interstitial.
- Never use a "skip in 5...4...3" style forced-view ad — that pattern (common on shady converter sites) drives users away and gets sites flagged by ad networks and browsers. A calm, native ad next to a real progress bar performs better long-term for both UX and revenue.
- After conversion, the download page can carry one more ad placement (above or beside the download button, never disguised as the download button itself — deceptive "fake download button" ads violate AdSense policy and destroy trust).

**Ad network setup:**
- Primary: Google AdSense.
- Consider Ezoic or Media.net as a secondary/backup network if AdSense CPMs underperform for Pakistan-heavy traffic.
- Respect frequency capping — max ads per page as configured above, no stacking multiple ad units in the same viewport.
- Build the ad slots as a reusable `<AdSlot placement="header" />` component fed by a config table in the DB, so ad networks/placements can be swapped or A/B tested without redeploying.

---

## 6. OTHER MONETIZATION STREAMS TO CONSIDER

Beyond display ads, these are proven revenue paths for tools like this:

1. **Freemium subscription (natural next step from your "free now, paid later" plan)** — paid tier removes ads, unlocks batch conversion (convert 20 files at once), larger file size limits, and priority (faster) processing queue.
2. **API access (B2B)** — sell API access to developers/businesses who want to embed conversion into their own apps (e.g., a Pakistani real estate portal embedding your Marla↔sqft converter via API). This is a strong recurring-revenue stream with low support overhead.
3. **Affiliate marketing** — contextual, relevant affiliates only: cloud storage (Google Drive/Dropbox) on the "save your file" screen, PDF editing tools, VPN services (privacy-conscious users of file tools are a decent VPN affiliate audience).
4. **Direct local ad sales** — for Pakistani traffic specifically, direct-sold banner ads to local businesses (real estate agencies for the Marla/Kanal tool, jewelers for the Tola tool) often out-earn AdSense CPMs for PK geography. Worth pursuing once traffic is meaningful.
5. **White-label licensing** — license the converter widgets (embeddable iframe/JS widget) to other websites for a flat fee or rev-share — same idea you could reuse across your other ventures (e.g., embed the currency converter on a Lapvy.pk or PakMegaShop page).
6. **Sponsored/featured tool placement** — a "Sponsored" tag on a featured converter card on the homepage, sold to relevant advertisers (e.g., a cloud storage brand sponsoring the "compress & save" flow).
7. **Optional tip jar / "Buy me a chai" button** — low-effort, doesn't hurt UX, occasionally adds up on high-traffic free tools.

Recommended sequencing: launch on ads only → once you have consistent traffic data, layer in API-as-a-service and the paid tier → add local direct ad sales once you have real Pakistani traffic numbers to show advertisers.

---

## 7. CORE USER FLOW

1. User lands on homepage or a specific tool page (from Google search — SEO is the main acquisition channel for this category of site).
2. Selects/uploads file (drag-and-drop + click-to-browse), or enters values (for unit/currency/data converters — no upload needed, instant client-side or lightweight server calc).
3. For file conversions: file uploads → queued job → processing screen (with ad, Section 5) → download page (with ad) → auto-delete from storage after 1–2 hours.
4. Daily quota check happens before the job is accepted; if exceeded, show the friendly limit message with a sign-up CTA.
5. Logged-in users see a simple dashboard: today's usage, recent conversion history (metadata only), account tier.

---

## 8. DATABASE SCHEMA (high-level — Supabase/Postgres)

- `users` — id, email, plan (`free` default, `paid` placeholder), created_at
- `usage_daily` — user_id or ip_hash, date, conversions_count (mirrors Redis, persisted for analytics)
- `conversion_jobs` — id, user_id (nullable for anonymous), tool_type, source_format, target_format, file_size, status, created_at, expires_at
- `ad_config` — placement_key, network, ad_unit_id, enabled (drives the `<AdSlot>` component)
- Note: never store the actual uploaded/converted files in Postgres — object storage only, DB holds metadata.

---

## 9. ADMIN DASHBOARD (internal, not public)

- Toggle ad placements on/off per page without a redeploy.
- View daily conversion volume by category/tool (helps decide which tools to expand or which to gate behind the future paid tier).
- View usage-limit hit rate (how often free users hit the daily cap — a strong signal for pricing the paid tier later).
- Manage the Pakistan-specific converter content (update gold rate defaults, real estate unit definitions, etc.).

---

## 10. SEO & GROWTH STRATEGY

- Every tool gets its own static, indexable URL with a unique title/meta description (`Convert JPG to PDF Free Online | ConvertHub`).
- Target long-tail queries directly in FAQ blocks on each tool page ("how many square feet is 1 marla", "1 tola in grams").
- Fast Core Web Vitals matter more for this category than almost any other — a slow converter loses to a faster competitor instantly.
- Build category hub pages (`/image-converters`, `/pakistan-unit-converters`) that internally link to every tool in that group.
- Add a blog/guides section for content like "Complete Guide to Pakistani Property Measurement Units" — ranks well and funnels directly into your Marla/Kanal tool.

---

## 11. SECURITY & ABUSE PREVENTION

- Validate file types server-side (not just by extension — check MIME/magic bytes) before processing, to prevent malicious uploads.
- Sanitize all filenames on upload/download.
- Rate-limit the upload endpoint itself (separate from the daily conversion quota) to prevent abuse/DDoS via repeated large uploads.
- Auto-purge all files after their TTL — this is both a cost control and a privacy commitment worth stating on the site (builds trust: "your files are automatically deleted after 1 hour").
- HTTPS everywhere, no exceptions.

---

## 12. BUILD PHASES FOR ANTIGRAVITY

Build and verify in this order — don't attempt everything in one pass:

1. **Scaffold:** Next.js + TypeScript + Tailwind project, Supabase connection, base layout (header/footer/nav with ad slot placeholders).
2. **Unit + Data + Color + Date converters first** (Sections 3.5, 3.7, 3.9, 3.10) — these are client-side/lightweight-server, no ffmpeg/LibreOffice dependency, fastest to ship and start collecting SEO traffic.
3. **Pakistan-specific converters** (Section 3.8) — same lightweight pattern, high differentiation value, ship early.
4. **Currency converter** (Section 3.6) — integrate the forex API + hourly caching.
5. **Rate limiting system** (Section 4) — build this before launching file converters, since those are the expensive operations to protect.
6. **Image converters** (Section 3.2) — introduce the file upload/processing/download pipeline here first, since images are lighter than video.
7. **Document/PDF converters** (Section 3.1) — reuse the pipeline from step 6, add LibreOffice/pdf-lib processing.
8. **Video/Audio converters** (Sections 3.3, 3.4) — heaviest processing, needs the queue (BullMQ) — build last among conversion types.
9. **Archive converters** (Section 3.11).
10. **Ad system wiring** (Section 5) — implement `<AdSlot>` fully once real pages exist to place it on.
11. **Admin dashboard** (Section 9).
12. **SEO pass** (Section 10) — metadata, FAQ schema markup, sitemap generation across all tool pages.

Confirm each phase is functional before moving to the next. Flag any step where a third-party API (forex rates, ad network) needs a real account/API key from the project owner before it can be finished.
