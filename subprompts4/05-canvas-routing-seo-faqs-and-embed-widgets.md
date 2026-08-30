# SUB-PROMPT 05: Canvas Routing, SEO Authority, Dynamic FAQs & Embeddable Testing Widgets

## 1. Context & Objective
This sub-prompt connects all 8 hardware diagnostic components to the ConvertX application canvas, establishes high-authority programmatic SEO metadata and FAQ structured data (JSON-LD), and adds support for embeddable testing widgets.

---

## 2. Canvas Integration (`src/components/converters/ConverterCanvas.tsx`)

Import the 8 hardware diagnostic components and map their slugs in the main tool switch statement in `src/components/converters/ConverterCanvas.tsx`:

```typescript
// Hardware & Device Accessory Diagnostics
import { WebcamTesterComponent } from '@/components/converters/hardware/WebcamTesterComponent';
import { MicTesterComponent } from '@/components/converters/hardware/MicTesterComponent';
import { SpeakerTesterComponent } from '@/components/converters/hardware/SpeakerTesterComponent';
import { ScreenTesterComponent } from '@/components/converters/hardware/ScreenTesterComponent';
import { KeyboardTesterComponent } from '@/components/converters/hardware/KeyboardTesterComponent';
import { MouseTesterComponent } from '@/components/converters/hardware/MouseTesterComponent';
import { GamepadTesterComponent } from '@/components/converters/hardware/GamepadTesterComponent';
import { CallReadinessComponent } from '@/components/converters/hardware/CallReadinessComponent';

// Inside ConverterCanvas switch(tool.slug):
case 'webcam-test':
  return <WebcamTesterComponent tool={tool} />;
case 'mic-test':
  return <MicTesterComponent tool={tool} />;
case 'speaker-test':
  return <SpeakerTesterComponent tool={tool} />;
case 'screen-test':
  return <ScreenTesterComponent tool={tool} />;
case 'keyboard-test':
  return <KeyboardTesterComponent tool={tool} />;
case 'mouse-test':
  return <MouseTesterComponent tool={tool} />;
case 'gamepad-test':
  return <GamepadTesterComponent tool={tool} />;
case 'call-readiness':
  return <CallReadinessComponent tool={tool} />;
```

---

## 3. SEO Metadata & Structured FAQs (`src/lib/seo/faqData.ts`)

Add comprehensive FAQ entries for all 8 hardware tools in `src/lib/seo/faqData.ts`:

### 3.1 FAQ Data Matrix
1. **`webcam-test`**:
   - *Q: Is my webcam video recorded or sent to a server?*
     - *A: No. ConvertX operates 100% client-side in your browser. Video feeds never leave your device or touch any remote server.*
   - *Q: Why is my webcam resolution lower than advertised?*
     - *A: Web browsers negotiate resolution based on lighting, USB bandwidth, and browser permissions. Ensure you select the maximum resolution in the test dropdown.*
2. **`mic-test`**:
   - *Q: How does the mic echo/loopback test work?*
     - *A: The tool temporarily records a 5-second audio clip into local browser memory and plays it back to let you hear your real audio output, clarity, and background noise.*
3. **`speaker-test`**:
   - *Q: What should I listen for during the frequency sweep?*
     - *A: Listen for smooth, continuous sound without rattling, distortion, buzzing, or sudden volume drop-offs across bass (20-250Hz) and treble (4kHz-20kHz).*
4. **`screen-test`**:
   - *Q: What is the difference between a dead pixel and a stuck pixel?*
     - *A: A dead pixel is permanently off (black dot on white background), while a stuck pixel has subpixels stuck on (bright red, green, or blue dot on black background).*
5. **`keyboard-test`**:
   - *Q: What is keyboard ghosting and N-Key Rollover (NKRO)?*
     - *A: Ghosting occurs when multiple simultaneous key presses fail to register. NKRO keyboards can register unlimited simultaneous key presses without locking up.*
6. **`mouse-test`**:
   - *Q: How do I know if my mouse switch is failing?*
     - *A: If the Double-Click Fault Tester detects click intervals under 80ms during a single physical click, the microswitch spring is bouncing and likely needs replacement.*
7. **`gamepad-test`**:
   - *Q: What causes analog stick drift on controllers?*
     - *A: Potentiometer wear or dust buildup causes analog sticks to report non-zero coordinates when resting. Our Stick Drift Radar calculates the exact drift percentage.*
8. **`call-readiness`**:
   - *Q: How does the readiness test verify Zoom and Teams compatibility?*
     - *A: It tests camera resolution (720p+), microphone volume and noise floor, speaker audio path, and WebRTC network ping to ensure seamless conferencing performance.*

---

## 4. Embeddable Testing Widgets Support

Support standalone embedded testing mode so educational portals, HR/interview platforms, and remote hiring teams can embed ConvertX hardware tests:

1. Support URL query parameter `?embed=true` or route `/embed/hardware/[tool]`:
   - Strips headers, footers, and ads.
   - Renders a clean, compact testing container with a branded attribution badge: *"Powered by ConvertX Hardware Diagnostics"*.
2. Provide an "Embed This Tool" modal button on the tool page with a copyable `<iframe>` snippet:
   ```html
   <iframe src="https://converthub.com/embed/hardware/mic-test" width="100%" height="600" frameborder="0" allow="camera; microphone"></iframe>
   ```

---

## 5. Verification & Quality Checklist
- [ ] Every hardware tool URL resolves properly at `/convert/hardware/[tool]` (e.g. `/convert/hardware/webcam-test`).
- [ ] `generateStaticParams` in `src/app/convert/[category]/[tool]/page.tsx` includes all 8 new hardware tool routes.
- [ ] Structured FAQ Schema (JSON-LD) is rendered in page HTML for all 8 tools.
- [ ] Embed routes `/embed/hardware/[tool]` load with zero console errors and proper permissions allowed.
- [ ] Run `npm run lint` — verify 0 errors and 0 warnings.
- [ ] Run `npm run build` — ensure all static pages generate successfully.
