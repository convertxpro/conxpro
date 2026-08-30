# SUB-PROMPT 04: Display Health & Video Call Readiness Suite

## 1. Context & Objective
This sub-prompt implements the visual display diagnostic tools and the all-in-one meeting readiness orchestrator:
1. **Screen Display & Dead Pixel Checker (`screen-test`)**
2. **Video Call & Meeting Readiness Test (`call-readiness`)**

All testing executes 100% in-browser using HTML5 Fullscreen API, `requestAnimationFrame` frame interval calculations, WebRTC PeerConnection stats, and concurrent audio/video device checks.

---

## 2. Tool 1: Screen Display & Dead Pixel Checker (`ScreenTesterComponent.tsx`)

File: `src/components/converters/hardware/ScreenTesterComponent.tsx`

### Technical Requirements:
1. **Fullscreen Dead Pixel Diagnostic**:
   - Fullscreen mode via `element.requestFullscreen()` with graceful escape handling (`Escape` key, double click, or floating control dock).
   - Solid full-screen color sequence:
     - **Pure Black** (`#000000`): Detects stuck/bright pixels (subpixels stuck ON in Red, Green, or Blue).
     - **Pure White** (`#FFFFFF`): Detects dead/dark pixels (subpixels stuck OFF).
     - **Primary Colors**: Pure Red (`#FF0000`), Pure Green (`#00FF00`), Pure Blue (`#0000FF`).
     - **Secondary Colors**: Pure Yellow (`#FFFF00`), Cyan (`#00FFFF`), Magenta (`#FF00FF`).
   - Navigation: Click screen or press `Space` / `ArrowRight` to advance colors; `ArrowLeft` to go back.
   - Auto-Cycle Mode: Automatically transitions colors every 3 seconds.

2. **Ultra-Precise Refresh Rate (Hz) Detector**:
   - Benchmark screen refresh rate using a high-precision `requestAnimationFrame` timestamp delta sampler over 120 consecutive frames.
   - Calculate median frame time $\Delta t$ in milliseconds and compute frequency: $\text{Hz} = \frac{1000}{\Delta t}$.
   - Classify display standard: **60 Hz**, **75 Hz**, **90 Hz**, **120 Hz**, **144 Hz**, **165 Hz**, **240 Hz**, or **360 Hz**.
   - Display frame pacing stability graph (jitter & frame drops).

3. **Display Calibration & Color Banding Matrices**:
   - **256-Step Contrast Gradient Ramp**: Black-to-White 256 grayscale blocks to test dynamic range and gamma clipping.
   - **Color Banding Gradients**: Linear RGB smooth ramps to evaluate 8-bit vs 10-bit color depth.
   - **Text & Subpixel Clarity Matrix**: Font rendering sharpness test across multiple font weights (100 to 900) and sizes (8px to 32px) to detect subpixel text fringing.

---

## 3. Tool 2: Video Call & Meeting Readiness Test (`CallReadinessComponent.tsx`)

File: `src/components/converters/hardware/CallReadinessComponent.tsx`

### Technical Requirements:
1. **Automated 1-Click 10-Second Test Pipeline**:
   - Sequential & concurrent multi-phase diagnostic:
     - **Phase 1: Camera Check** (0s - 3s): Verifies camera stream acquisition, resolution ($\ge 720\text{p}$ = Pass), frame rate ($\ge 24\text{ FPS}$ = Pass).
     - **Phase 2: Microphone Check** (3s - 6s): Checks audio stream, evaluates input gain and noise floor, records 3-second audio snippet.
     - **Phase 3: Speaker / Audio Check** (6s - 8s): Plays audio chime, user clicks "Yes, I hear sound" to verify playback path.
     - **Phase 4: WebRTC Network & Latency Check** (8s - 10s): Establishes a local WebRTC `RTCPeerConnection` with loopback data channel; measures ICE candidate gathering time, roundtrip time (RTT ping), and estimated packet jitter.

2. **Call Readiness Scorecard (0–100%)**:
   - Weighted scoring algorithm:
     - Camera Quality & Resolution (25%)
     - Microphone Input Level & Clarity (25%)
     - Speaker Audio Output (20%)
     - WebRTC Latency & Network Stability (30%)
   - Overall grade: **Excellent (90-100%)**, **Good (75-89%)**, **Fair (50-74%)**, **Action Needed (<50%)**.

3. **Platform Compatibility Badges**:
   - Visual badges for major conference apps:
     - 🟢 **Zoom Ready**
     - 🟢 **Google Meet Ready**
     - 🟢 **Microsoft Teams Ready**
     - 🟢 **Discord / Slack Ready**

4. **Automated Troubleshooting & Issue Resolution Recommendations**:
   - If Camera blocked $\rightarrow$ provide browser permission reset instructions.
   - If Mic volume too low $\rightarrow$ recommend increasing OS mic boost / gain.
   - If WebRTC RTT $> 150\text{ ms}$ $\rightarrow$ suggest switching from Wi-Fi to Ethernet or closing bandwidth-heavy apps.
   - "Download Test Certificate" (clean printable PDF / PNG summary of the hardware check for remote jobs, exams, or interviews).

---

## 4. Verification & Quality Checklist
- [ ] Screen dead pixel test enters true fullscreen and cycles through all 8 test colors smoothly.
- [ ] Screen refresh rate detector correctly identifies 60Hz vs 120Hz/144Hz monitors.
- [ ] Call readiness orchestrator runs all 4 phases sequentially without hanging.
- [ ] Local WebRTC peer connection measures latency and closes peer connection cleanly.
- [ ] Readiness scorecard calculates dynamic score and renders clear troubleshooting cards for any failed step.
