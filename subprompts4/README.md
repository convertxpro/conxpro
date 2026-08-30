# ConvertHub / ConvertX — Hardware & Accessories Diagnostic Suite Sub-Prompts (subprompts4)

This directory contains **5 comprehensive, production-grade implementation sub-prompts** for adding the full in-browser Hardware & Device Accessories Diagnostic Suite to ConvertX.

Every tool in this suite runs **100% in-browser** using native HTML5 WebRTC, Web Audio API, Gamepad API, Fullscreen/Screen APIs, and Canvas rendering — ensuring zero server computing costs, zero privacy risks, and sub-millisecond local telemetry.

---

## Sub-Prompt Execution Index

| # | Sub-Prompt File | Phase & Focus Area | Tools & Core Technologies |
|---|---|---|---|
| **01** | [`01-hardware-architecture-metadata-and-audio-visual-core.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/subprompts4/01-hardware-architecture-metadata-and-audio-visual-core.md) | Core Architecture & Shared Primitives | `hardware` category metadata registry in `categories.ts`, site navigation in `site.ts`, permission handling prompts, telemetry cards, and 60 FPS canvas visualizer primitives |
| **02** | [`02-audio-video-suite-webcam-mic-and-speaker.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/subprompts4/02-audio-video-suite-webcam-mic-and-speaker.md) | Audio & Video Diagnostic Suite | `webcam-test` (Live FPS, 4K/1080p resolution, snapshot), `mic-test` (VU dBFS meter, 32-band FFT spectrum, 5s echo loopback), `speaker-test` (Left/Right stereo isolation, 20Hz-20kHz frequency sweep, 3D spatial sound) |
| **03** | [`03-input-peripherals-keyboard-mouse-and-gamepad.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/subprompts4/03-input-peripherals-keyboard-mouse-and-gamepad.md) | Input Peripherals & Gaming Hardware | `keyboard-test` (Interactive ANSI/TKL/60% keyboard, NKRO anti-ghosting, switch chatter detector), `mouse-test` (Multi-button, scroll velocity, double-click fault tester, polling rate), `gamepad-test` (Xbox/PS/Switch stick drift radar, trigger gauges, rumble motor test) |
| **04** | [`04-display-and-network-screen-refresh-and-call-readiness.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/subprompts4/04-display-and-network-screen-refresh-and-call-readiness.md) | Display Health & Video Call Readiness | `screen-test` (Fullscreen dead/stuck pixel cycle, precision Hz refresh rate detector, contrast/color banding), `call-readiness` (1-click 10s diagnostic testing camera, mic, speaker, WebRTC RTT latency for Zoom/Teams/Meet) |
| **05** | [`05-canvas-routing-seo-faqs-and-embed-widgets.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/subprompts4/05-canvas-routing-seo-faqs-and-embed-widgets.md) | Canvas Routing, SEO & Embed Widgets | Slug mapping in `ConverterCanvas.tsx`, structured FAQ schema in `faqData.ts`, embeddable `<iframe>` widget support, and end-to-end build verification |

---

## Execution Guidelines

1. **Sequential Execution:** Execute sub-prompts in order (`01` $\rightarrow$ `05`).
2. **Zero Server Load Tenet:** All 8 tools execute 100% in the user's browser memory (zero server costs, zero audio/video uploads).
3. **Browser Permission Safeguards:** Ensure clean fallback UIs when camera or microphone permissions are blocked or when gamepads are disconnected.
4. **Verification Step:** Run `npm run lint` and `npm run build` after completing each sub-prompt.
