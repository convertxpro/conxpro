# SUB-PROMPT 01: Core Architecture, Metadata & Audio-Visual Foundation (Hardware Suite)

## 1. Context & Objective
This sub-prompt establishes the architectural foundation for the **Hardware & Device Accessory Diagnostic Suite** in ConvertX.
All tools in this suite operate **100% in-browser** using native HTML5 WebRTC (`navigator.mediaDevices`), Web Audio API (`AudioContext`, `AnalyserNode`, `OscillatorNode`), Gamepad API (`navigator.getGamepads`), Canvas, Screen, and DOM Event APIs.

### Core Guarantees:
- **100% Client-Side Privacy**: Zero audio, video, keyboard events, or hardware data are transmitted to any server.
- **Zero-Latency Real-Time Telemetry**: 60 FPS hardware telemetry loops with dynamic visualizers.
- **Graceful Fallbacks & Permission Handling**: Clear UX for permission denied, device disconnected, or unsupported browser states.

---

## 2. Metadata Registration (`src/config/categories.ts`)

Add the `hardware` category to `CATEGORIES` in `src/config/categories.ts`:

```typescript
{
  id: 'hardware',
  name: 'Hardware & Device Testers',
  slug: 'hardware',
  description: '100% in-browser hardware diagnostic tools to test webcams, microphones, speakers, keyboards, mice, screens, and gamepads with zero server uploads.',
  iconName: 'Cpu',
  color: '#06b6d4',
  gradient: 'from-cyan-500 to-blue-600',
  badge: '100% In-Browser',
  tools: [
    {
      id: 'webcam-test',
      name: 'Webcam & Camera Tester',
      slug: 'webcam-test',
      categorySlug: 'hardware',
      categoryName: 'Hardware Testers',
      description: 'Test webcam video feed, detect live FPS, resolution (up to 4K), aspect ratio, color balance, and capture test photos.',
      iconName: 'Camera',
      popular: true,
      badge: 'Live FPS & Res',
    },
    {
      id: 'mic-test',
      name: 'Microphone & Audio Input Tester',
      slug: 'mic-test',
      categorySlug: 'hardware',
      categoryName: 'Hardware Testers',
      description: 'Test microphone input with real-time decibel VU meter, FFT frequency spectrum visualizer, and 5-second echo loopback.',
      iconName: 'Mic',
      popular: true,
      badge: 'FFT Visualizer',
    },
    {
      id: 'speaker-test',
      name: 'Speaker & Headphone Sound Tester',
      slug: 'speaker-test',
      categorySlug: 'hardware',
      categoryName: 'Hardware Testers',
      description: 'Test stereo Left/Right audio channels, frequency response sweep (20Hz-20kHz), and 3D spatial surround sound.',
      iconName: 'Volume2',
      popular: true,
    },
    {
      id: 'screen-test',
      name: 'Screen Display & Dead Pixel Checker',
      slug: 'screen-test',
      categorySlug: 'hardware',
      categoryName: 'Hardware Testers',
      description: 'Check screen refresh rate (Hz), detect dead pixels with fullscreen color cycles, and test contrast gradient banding.',
      iconName: 'Monitor',
      popular: true,
      badge: 'Refresh Rate (Hz)',
    },
    {
      id: 'keyboard-test',
      name: 'Keyboard & Key Ghosting Tester',
      slug: 'keyboard-test',
      categorySlug: 'hardware',
      categoryName: 'Hardware Testers',
      description: 'Interactive virtual keyboard tester with anti-ghosting multi-key rollover benchmark and mechanical switch chatter detection.',
      iconName: 'Keyboard',
      popular: true,
    },
    {
      id: 'mouse-test',
      name: 'Mouse, Trackpad & Scroll Tester',
      slug: 'mouse-test',
      categorySlug: 'hardware',
      categoryName: 'Hardware Testers',
      description: 'Test mouse buttons, scroll wheel speed, polling rate, and identify microswitch double-click faults.',
      iconName: 'Mouse',
      popular: true,
    },
    {
      id: 'gamepad-test',
      name: 'Gamepad & Controller Tester',
      slug: 'gamepad-test',
      categorySlug: 'hardware',
      categoryName: 'Hardware Testers',
      description: 'Calibrate Xbox, PlayStation, and Switch controllers with live stick drift radar, trigger pressure gauges, and rumble test.',
      iconName: 'Gamepad2',
      popular: true,
      badge: 'Stick Drift Radar',
    },
    {
      id: 'call-readiness',
      name: 'Video Call & Meeting Readiness Test',
      slug: 'call-readiness',
      categorySlug: 'hardware',
      categoryName: 'Hardware Testers',
      description: 'All-in-one 10-second diagnostic for Zoom, Google Meet, and Teams testing camera, mic, speaker, and WebRTC latency.',
      iconName: 'Video',
      popular: true,
      badge: '1-Click Scorecard',
    },
  ],
}
```

Update `getToolBySlug` and `getCategoryBySlug` helper functions in `src/config/categories.ts` to ensure `hardware` is properly indexed.

---

## 3. Site Navigation & Config (`src/config/site.ts`)

Add the Hardware category item to `navItems` in `src/config/site.ts`:

```typescript
{ label: 'Hardware Tests', href: '/convert/hardware' }
```

Also add relevant keywords to `siteConfig.keywords`:
```typescript
'webcam test online',
'microphone test online',
'mic visualizer',
'speaker stereo sound test',
'dead pixel tester',
'screen refresh rate tester hz',
'keyboard ghosting test',
'mouse double click tester',
'gamepad controller stick drift test',
'video call readiness check'
```

---

## 4. Shared Hardware Diagnostics Primitives (`src/components/converters/hardware/common/`)

Create reusable diagnostic hooks and layout components in `src/components/converters/hardware/common/`:

### 4.1 Permission & Status Handler (`PermissionPrompt.tsx`)
```typescript
// Component to display intuitive state when:
// 1. Initial prompt ("Click 'Start Test' to allow access")
// 2. Permission Denied ("Camera / Mic access was blocked. Please click the lock icon in your address bar to enable.")
// 3. Device Not Found ("No compatible device detected. Please connect your hardware.")
```

### 4.2 Hardware Telemetry Card (`HardwareMetricCard.tsx`)
Standardized metric display card with title, value, unit, status indicator badge (green: optimal, amber: warning, red: error), and subtext.

### 4.3 Real-Time Canvas Oscilloscope / Spectrum Visualizer (`AudioSpectrumVisualizer.tsx`)
60 FPS canvas visualizer accepting an `AnalyserNode` and rendering either:
- **Bar Spectrum**: 32 or 64 frequency bars with glowing neon gradients (`cyan` to `purple`).
- **Waveform Line**: Smooth oscilloscope sinusoidal line.

### 4.4 Hardware Test Frame Wrapper (`HardwareTestLayout.tsx`)
Standardized dark glassmorphic container with:
- Tool Header & Description
- Privacy Assurance Badge ("🔒 100% In-Browser • Zero Video/Audio Sent to Server")
- Active Device Selector & Refresh Button
- Action Toolbar (Reset Test, Export Report, Fullscreen)

---

## 5. Verification & Quality Checklist
- [ ] `src/config/categories.ts` exports `hardware` category with all 8 tools properly typed.
- [ ] `src/config/site.ts` reflects updated navigation and SEO keywords.
- [ ] Shared primitives in `src/components/converters/hardware/common/` compile with 0 TypeScript warnings.
- [ ] Run `npm run lint` and verify no ESLint issues.
