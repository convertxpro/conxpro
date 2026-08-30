# SUB-PROMPT 03: Input Peripherals & Gaming Hardware Suite (Keyboard, Mouse & Gamepad)

## 1. Context & Objective
This sub-prompt implements the interactive hardware diagnostic tools for input peripherals and gaming controllers:
1. **Keyboard & Key Ghosting Tester (`keyboard-test`)**
2. **Mouse, Trackpad & Scroll Tester (`mouse-test`)**
3. **Gamepad & Controller Tester (`gamepad-test`)**

All testing runs client-side with native DOM event listeners (`keydown`, `keyup`, `mousedown`, `mouseup`, `wheel`, `pointermove`) and the HTML5 Gamepad API (`navigator.getGamepads`).

---

## 2. Tool 1: Interactive Keyboard & Anti-Ghosting Tester (`KeyboardTesterComponent.tsx`)

File: `src/components/converters/hardware/KeyboardTesterComponent.tsx`

### Technical Requirements:
1. **Interactive Visual Keyboard Grid**:
   - Comprehensive keyboard layouts: ANSI 104-key (Full Size with Numpad), 80% TKL (Tenkeyless), 60% Compact.
   - Dynamic key states:
     - **Default**: Slate border & muted dark background.
     - **Active (Key Pressed)**: Bright neon cyan/emerald highlight with depression animation.
     - **Tested (Pressed History)**: Subtly illuminated accent border indicating the key has been tested and works.
   - Suppress browser default actions (e.g. `F1`, `F3`, `F5`, `F7`, `Tab`, `Alt`, `Space`, `Backspace`) strictly inside the active test area with a "Focus Test Area" lock overlay.

2. **Anti-Ghosting & N-Key Rollover (NKRO) Benchmark**:
   - Track `activeKeysSet` in state.
   - Real-time counter: "Simultaneous Keys Pressed: X (Max Recorded: Y)".
   - Detects whether the keyboard supports 2-key, 6-key, or Full N-Key Rollover (NKRO).

3. **Key Event Telemetry Inspector**:
   - Display real-time event attributes: `event.key`, `event.code`, `event.keyCode`, `event.location` (Standard, Left, Right, Numpad), `event.repeat` status.
   - Latency & Repeat Speed Tracker: Measures interval (ms) between key repeat firings.

4. **Mechanical Switch Chatter / Bounce Fault Detector**:
   - Detects malfunctioning mechanical switches: If a key releases and re-presses in $< 30\text{ ms}$, flag it with an amber/red warning ("Possible Switch Chatter Detected on Key X").

5. **Test Controls**:
   - "Reset Keyboard History" button.
   - "Sound Feedback on Press" toggle (synthesized mechanical click sound using Web Audio API).
   - "Download Test Report" (generates summary of tested vs untested keys).

---

## 3. Tool 2: Mouse, Trackpad & Scroll Tester (`MouseTesterComponent.tsx`)

File: `src/components/converters/hardware/MouseTesterComponent.tsx`

### Technical Requirements:
1. **Multi-Button Visual Inspector**:
   - Visual 3D/2D mouse diagram highlighting buttons:
     - **Left Click** (Button 0)
     - **Middle Click / Wheel Press** (Button 1)
     - **Right Click** (Button 2) — suppress native context menu on the canvas.
     - **Side Back Button** (Button 3 / Browser Back)
     - **Side Forward Button** (Button 4 / Browser Forward)
   - Click counters and double-click registered counters for each button.

2. **Scroll Wheel Velocity & Direction Analyzer**:
   - Visual scroll wheel gauge indicating direction (Scroll Up vs Scroll Down).
   - Real-time `deltaY` and `deltaX` velocity speedometer.
   - Continuous scroll smoothness meter (detects skipping or jerky encoders).

3. **Microswitch Double-Click Fault Tester**:
   - Dedicated testing zone measuring the exact time interval between two consecutive clicks on the same button.
   - If interval is $< 80\text{ ms}$ on a single user click motion, identify potential switch debounce failure ("Worn Switch / Unintended Double-Click Warning").

4. **Polling Rate & Movement Smoothness Canvas**:
   - Track `pointermove` events per second inside a dedicated tracking arena.
   - Display estimated mouse polling rate (125 Hz, 250 Hz, 500 Hz, 1000 Hz, 4000 Hz, 8000 Hz).
   - Interactive drawing canvas showing cursor trajectory with speed-based color gradients.

---

## 4. Tool 3: Gamepad & Controller Calibration Lab (`GamepadTesterComponent.tsx`)

File: `src/components/converters/hardware/GamepadTesterComponent.tsx`

### Technical Requirements:
1. **Controller Detection & Connection Management**:
   - Listen to `gamepadconnected` and `gamepaddisconnected` window events.
   - Query `navigator.getGamepads()` in a 60 FPS `requestAnimationFrame` loop.
   - Support Xbox (XInput), PlayStation DualShock 4 / DualSense, Nintendo Switch Pro, and Generic HID Gamepads.
   - Display Controller ID, index, mapping type (standard / raw), and timestamp.

2. **Analog Thumbstick Drift & Deadzone Radar**:
   - 2D coordinate radar for Left Stick (Axes 0, 1) and Right Stick (Axes 2, 3).
   - Live $(X, Y)$ coordinate readouts from `-1.0000` to `+1.0000`.
   - Circular visual deadzone ring (adjustable from 0% to 20%).
   - Stick Drift Meter: Measures neutral position resting offset when untouched (e.g. if resting $(X, Y)$ is $> 0.05$, flag "Drift Detected").

3. **Trigger Pressure & Button Mapping Gauges**:
   - Digital buttons: A/B/X/Y (Cross/Circle/Square/Triangle), D-Pad (Up/Down/Left/Right), Bumpers (LB/RB / L1/R1), Stick Clicks (L3/R3), Start/Select/Home.
   - Analog Triggers (LT/RT / L2/R2): Live progressive gradient pressure bars (`0%` to `100%` / `0.00` to `1.00`).

4. **Dual-Motor Haptic Vibration / Rumble Test**:
   - Access `gamepad.vibrationActuator.playEffect('dual-rumble', { startDelay: 0, duration: 1000, weakMagnitude: 0.8, strongMagnitude: 1.0 })`.
   - Dedicated buttons: "Light Rumble (High Frequency)", "Heavy Rumble (Low Frequency)", "Left Motor Only", "Right Motor Only".

---

## 5. Verification & Quality Checklist
- [ ] Keyboard tester highlights pressed keys with zero noticeable input lag.
- [ ] Anti-ghosting counter accurately increments when pressing multiple keys simultaneously.
- [ ] Mouse tester intercepts Left, Right, Middle, and Side buttons without triggering browser defaults inside the test frame.
- [ ] Mouse polling rate meter calculates realistic Hz values during active movement.
- [ ] Gamepad tester detects plugged-in controller immediately upon any button press.
- [ ] Gamepad analog stick radar tracks 360° rotation smoothly and calculates resting drift error.
- [ ] Gamepad rumble triggers tactile vibration on supported browsers and controllers.
