# ConvertHub / ConvertX — Next-Gen Feature Expansion Sub-Prompts (subprompts3)

This folder contains 5 comprehensive, production-grade implementation sub-prompts distilled directly from [`ConvertHub-NextGen-Master-Prompt.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/ConvertHub-NextGen-Master-Prompt.md). Each sub-prompt is engineered for zero-latency in-browser computing, high-authority regional financial formulas, professional document suites, creator media workflows, and organic growth flywheels.

---

## Sub-Prompt Execution Index

| # | Sub-Prompt File | Phase & Focus Area | Tools & Core Technologies |
|---|---|---|---|
| **01** | [`01-phase1-client-side-ai-and-dev-suite.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/subprompts3/01-phase1-client-side-ai-and-dev-suite.md) | Phase 1: Client-Side AI & Dev Suite | `image-to-text-ocr` (`tesseract.js` WASM), `remove-background` (`@imgly/background-removal`), `diff-checker` (Split & Unified diff), `curl-to-code` (10+ languages), `screen-recorder` (`MediaRecorder` API) |
| **02** | [`02-phase2-pakistan-regional-financial-moats.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/subprompts3/02-phase2-pakistan-regional-financial-moats.md) | Phase 2: Pakistan Financial & Tax Moat | `pta-mobile-tax-calculator` (DIRBS Passport vs CNIC), `property-tax-calculator` (FBR 236K/236C, e-Stamping), `freelance-tax-calculator` (0.25% PSEB vs 1% vs Payoneer/Wise), `vehicle-token-tax-calculator` (Excise CC/EV), `cnic-ntn-decoder` |
| **03** | [`03-phase3-advanced-pdf-suite-and-data-wrangling.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/subprompts3/03-phase3-advanced-pdf-suite-and-data-wrangling.md) | Phase 3: Advanced PDF & Data Suite | `organize-pdf` (`@hello-pangea/dnd` page thumbnail grid & reorder), `redact-pdf` (Vector blackout & text flattening), `sign-pdf` (Draw/Type/Upload signatures & date stamps), `csv-deduplicator-splitter` (500k+ row streaming) |
| **04** | [`04-phase4-content-creator-media-pipeline.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/subprompts3/04-phase4-content-creator-media-pipeline.md) | Phase 4: Creator Media Pipeline | `burn-subtitles-to-video` (FFmpeg hardcoded subtitles for Reels/TikTok), `mute-video-replace-audio` (Instant `-c:v copy` <2s processing), `batch-watermark-images` (Canvas multi-threading 50+ batch images to ZIP) |
| **05** | [`05-phase5-growth-embed-widgets-and-pwa.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/subprompts3/05-phase5-growth-embed-widgets-and-pwa.md) | Phase 5: Growth, Embeds & PWA | Contextual "Next Best Action" recommendation cards, Embeddable responsive calculator `<iframe>` widgets with backlink attribution, Offline PWA Manifest & Service Worker, Public REST API Scaffolding |

---

## Execution Guidelines

1. **Sequential Execution:** Execute sub-prompts in order (`01` $\rightarrow$ `05`).
2. **Zero Server Load Tenet:** Sub-prompts 01, 02, and 03 execute 100% in the user's browser memory (0 cloud computing cost, 100% privacy).
3. **Worker Pipeline:** Ensure the Redis BullMQ worker (`npm run worker`) is active when validating Sub-prompt 04.
4. **Verification Step:** Run `npm run lint` and `npm run build` after completing each sub-prompt.
