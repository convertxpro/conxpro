# ConvertHub / ConvertX — Sub-Prompts Suite

This folder contains 10 sequentially structured, production-ready sub-prompts distilled from `ConvertHub-Master-Prompt-Antigravity.md`. Each sub-prompt is self-contained and engineered to build a high-performance, monetizable, and search-engine-dominant conversion platform.

---

## Sub-Prompt Execution Index

| # | Sub-Prompt File | Focus Area | Key Technologies, SEO & Core Features |
|---|---|---|---|
| **01** | [`01-project-scaffold-design-system-and-ads.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/subprompts/01-project-scaffold-design-system-and-ads.md) | Scaffold, Design System, SEO Foundation & Ad Architecture | Next.js App Router, Tailwind CSS, Lucide Icons, CLS-safe `<AdSlot />`, 10-part Programmatic SEO `<ToolLayout />`, Dynamic `@vercel/og` Generator, `robots.ts` |
| **02** | [`02-database-supabase-auth-and-user-dashboard.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/subprompts/02-database-supabase-auth-and-user-dashboard.md) | Supabase DB Schema, Auth, Dashboard & Crawl Budget Guards | Supabase Postgres, Migrations, Magic Links, Quota tracking schema, User Dashboard, `noindex/nofollow` crawl budget protection on private pages |
| **03** | [`03-rate-limiting-redis-and-abuse-prevention.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/subprompts/03-rate-limiting-redis-and-abuse-prevention.md) | Redis Rate Limiting, Abuse Prevention & Search Bot Whitelist | Upstash Redis, Midnight PKT reset, IP/User daily counters, Limit Modals, Route Guards, Verified Search Engine Crawler Bypass (Googlebot, Bingbot) |
| **04** | [`04-client-side-converters-units-data-date-color.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/subprompts/04-client-side-converters-units-data-date-color.md) | Client-Side Instant Converters & Programmatic Lookup Tables | 13 Unit Converters, 40+ Exact-Match Pair URLs, Pre-Calculated Conversion Matrices (1 to 1000 units), Dev/Data, Date/Time, Color (HEX/RGB/CMYK), `HowTo` + `FAQPage` JSON-LD |
| **05** | [`05-pakistan-regional-converters.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/subprompts/05-pakistan-regional-converters.md) | Pakistan Regional Converters & Localized SEO Moat | Marla/Kanal/SqFt (225 vs 272.25 vs 250 sqft), Tola/Masha/Grams, Maund/Seer/Kg, Hijri/Gregorian, Urdu + English bilingual metadata & WhatsApp sharing |
| **06** | [`06-currency-converter-and-forex-cache.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/subprompts/06-currency-converter-and-forex-cache.md) | Live Forex Converter, Cache & Remittance Programmatic SEO | Live Forex API, Hourly Redis/DB Caching, PKR Prioritization, Remittance Exact-Match Pages (USD/PKR, SAR/PKR, AED/PKR), Pre-Calculated Denomination Tables, 7/30-day Trend Charts |
| **07** | [`07-file-pipeline-storage-and-image-converters.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/subprompts/07-file-pipeline-storage-and-image-converters.md) | File Upload Pipeline, Image Converters & Format SEO | Supabase/S3 Temp Storage, Sharp, Libheif, HEIC->JPG, Compress, Resize, BG Remover, Auto-purge, Format Comparison Tables, `HowTo` structured data |
| **08** | [`08-document-pdf-and-archive-converters.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/subprompts/08-document-pdf-and-archive-converters.md) | Document, PDF & Archive Engine with High-Authority SEO | LibreOffice headless, `pdf-lib`, Merge/Split/Compress PDF, Docx/Excel/PPTX, Zip/Tar/7z, Compression Benchmark Matrices, Bank-grade privacy badges |
| **09** | [`09-async-video-audio-queue-and-ffmpeg.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/subprompts/09-async-video-audio-queue-and-ffmpeg.md) | Async Media Queue, FFmpeg Conversion & Media SEO | BullMQ + Redis, Fluent-FFmpeg Worker, Video/Audio conversion, Progress UI, Codec & Bitrate Lookup Tables, Honest Processing Screen Ad |
| **10** | [`10-admin-dashboard-seo-ads-and-deployment.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/subprompts/10-admin-dashboard-seo-ads-and-deployment.md) | Admin Console, Master SEO Engine, Guides Hub & Deployment | Admin Dashboard, AdSense live injection, Full Schema.org Suite (`SoftwareApplication`, `FAQPage`, `HowTo`, `BreadcrumbList`), Multi-Segment `sitemap.xml`, Topical Authority Guides Hub (`/guides/*`), Production Docker Runbook |

---

## The Organic SEO & Growth Moat

The sub-prompts incorporate an end-to-end Programmatic SEO (pSEO) and technical optimization framework:
1. **Exact-Match Dynamic Routing:** Every converter pair (e.g. `/convert/image/heic-to-jpg`, `/convert/pakistan/marla-to-square-feet`, `/convert/currency/usd-to-pkr`) is an indexable SSG/ISR landing page.
2. **Comprehensive Schema.org Suite:** `WebApplication`, `SoftwareApplication`, `FAQPage`, `HowTo`, `BreadcrumbList`, and `Article` structured data embedded via automated JSON-LD generators.
3. **Pre-Calculated Reference Lookup Tables:** Tabular calculation matrices (e.g., 1 to 1000 units, currency denominations, PDF compression levels, audio bitrates) indexed as rich textual content by search engine crawlers.
4. **Zero Cumulative Layout Shift (CLS = 0):** Pre-reserved ad slots, aspect-ratio containers, and `next/font` zero-swap typography ensuring top Core Web Vitals scores.
5. **Dynamic Social Graph Cards (`@vercel/og`):** Pixel-perfect 1200×630 share banners generated dynamically on edge routes for social and search sharing.
6. **Topical Authority Guides Hub (`/guides`):** Long-form evergreen informational articles with embedded interactive converter widgets.
7. **Localized & Bilingual SEO (Pakistan Focus):** Urdu script and English search query optimization (`مرلہ`, `تولہ`, `من`, `ڈالر ریٹ`).
8. **Crawl Budget & Search Bot Protection:** Strict `noindex` on private auth/dashboard routes, automated multi-segment sitemaps, and search crawler rate-limit bypass.

---

## Recommended Build Workflow

1. Execute prompts strictly in numerical order from **01** to **10**.
2. Verify compilation, linting, and automated/manual tests at the end of each sub-prompt before moving forward.
3. Keep third-party secrets (Supabase, Upstash Redis, Forex API, Google AdSense) in `.env.local` / `.env` files with sample variables documented in `.env.example`.
