# ConvertX / ConvertHub — Phase 5 Expansion Sub-Prompts (subprompt5)

This directory contains **5 comprehensive, production-grade implementation sub-prompts** for expanding ConvertX with high-traffic, privacy-first, client-side tools and regional search moats.

Every tool across these sub-prompts operates **100% in-browser** using native HTML5 Web Audio API, WebRTC, WebAssembly (ONNX Runtime, Tesseract.js), Web Cryptography, and Canvas rendering — delivering sub-millisecond responsiveness with zero server computing expenses.

---

## Sub-Prompt Execution Index

| # | Sub-Prompt File | Focus Area & Domain | Tools & Core Technologies |
|---|---|---|---|
| **01** | [`01-audio-studio-and-voice-processing-suite.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/subprompt5/01-audio-studio-and-voice-processing-suite.md) | In-Browser Audio Studio & Voice Processing | `audio-trimmer` (Waveform editor, fade in/out), `audio-joiner` (Crossfade merger), `voice-recorder` (48kHz mic capture & VU meter), `audio-speed-pitch-changer` (Pitch-lock tempo & semitone shift), `volume-booster` (300% loudness & limiter), Universal Audio Converters (MP3, WAV, M4A, FLAC) |
| **02** | [`02-video-creator-and-social-media-suite.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/subprompt5/02-video-creator-and-social-media-suite.md) | Video Creator, Social Resizer & Subtitles | `video-to-gif` (HQ palette generator), `gif-to-mp4` (90% size reduction), `video-aspect-ratio-resizer` (9:16 Reels/TikTok with blurred background), `compress-video` (Discord 8MB/25MB & WhatsApp presets), `subtitle-converter` (SRT/VTT/ASS time-shifter), `screen-recorder` (Browser & tab recorder) |
| **03** | [`03-ai-vision-ocr-and-image-privacy-suite.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/subprompt5/03-ai-vision-ocr-and-image-privacy-suite.md) | AI Vision, OCR & Image Privacy | `remove-background` (100% in-browser WASM neural net), `image-to-text-ocr` (English, Urdu, Arabic & 8+ languages), `exif-metadata-stripper` (GPS map viewer & EXIF cleaner), `svg-to-ico` (Favicon & PWA asset pack), `svg-optimizer` (SVGO minifier), `batch-watermark-images` (50+ photos) |
| **04** | [`04-developer-devops-and-security-utilities.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/subprompt5/04-developer-devops-and-security-utilities.md) | Full-Stack Developer & Cyber Security Utilities | `jwt-decoder` (Header/Payload claims & live expiry countdown), `hash-generator` (MD5/SHA-256/SHA-512 streaming checksums), `curl-to-code` (Fetch, Axios, Python, Go, Rust), `diff-checker` (Side-by-side split & inline diffs), `cron-expression-decoder` (Crontab builder), `css-unit-converter` (PX/REM/EM/clamp generator), `cidr-subnet-calculator` |
| **05** | [`05-pakistan-regional-and-financial-moat-suite.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/subprompt5/05-pakistan-regional-and-financial-moat-suite.md) | Pakistan Regional & South Asia Financial Moats | `pta-mobile-tax-calculator` (Official DIRBS iPhone/Samsung rates), `property-tax-calculator` (FBR Sec 236K/236C & e-Stamping), `freelance-tax-calculator` (PSEB 0.25% vs 1%), `vehicle-token-tax-calculator` (Excise schedules), `marla-to-square-feet` (Standard 225 vs Patwari 272.25 sq ft), `tola-to-grams` (Gold valuation), `electricity-bill-solar-calculator` |

---

## Execution Guidelines

1. **Order of Implementation:** Execute sub-prompts sequentially (`01` $\rightarrow$ `05`).
2. **Zero Server Load Tenet:** All audio, video, AI, and developer tools run 100% on the client side in WebAssembly / Web Audio / Canvas memory.
3. **Verification Step:** Run `npm run lint` and `npm run build` after completing each sub-prompt to ensure zero TypeScript and ESLint regressions.
