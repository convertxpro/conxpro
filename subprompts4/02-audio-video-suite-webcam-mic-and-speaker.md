# SUB-PROMPT 02: Audio & Video Diagnostic Suite (Webcam, Microphone & Speakers)

## 1. Context & Objective
This sub-prompt implements the core audio-visual diagnostic tools for ConvertX:
1. **Webcam & Camera Tester (`webcam-test`)**
2. **Microphone & Audio Input Tester (`mic-test`)**
3. **Speaker & Headphone Sound Tester (`speaker-test`)**

All testing runs entirely in the browser using HTML5 WebRTC `getUserMedia`, Web Audio API `AudioContext`, `AnalyserNode`, `StereoPannerNode`, and `MediaRecorder`.

---

## 2. Tool 1: Webcam & Camera Diagnostic Lab (`WebcamTesterComponent.tsx`)

File: `src/components/converters/hardware/WebcamTesterComponent.tsx`

### Technical Requirements:
1. **Device Enumeration & Switching**:
   - Query available video devices using `navigator.mediaDevices.enumerateDevices()`.
   - Filter `kind === 'videoinput'` and populate an active camera selector dropdown.
   - Gracefully switch stream tracks when the user changes cameras without leaking media streams.

2. **Stream Quality Telemetry Engine**:
   - **Live FPS Tracker**: Use `requestVideoFrameCallback` (with fallback to `requestAnimationFrame` + video `currentTime` deltas) to calculate real-time render FPS (e.g., 30 FPS, 60 FPS).
   - **Resolution Detection**: Detect `video.videoWidth` and `video.videoHeight` upon stream load (identifying 4K UHD `3840x2160`, 1080p Full HD `1920x1080`, 720p HD `1280x720`, or standard VGA).
   - **Aspect Ratio & Color Space**: Display native aspect ratio (16:9, 4:3, 1:1) and pixel format.

3. **Live Visual Adjustments**:
   - Horizontal Mirror toggle (`transform: scaleX(-1)`).
   - Real-time CSS filter sliders: Brightness (50% to 150%), Contrast (50% to 150%), Saturation (0% to 200%), Grayscale, and Invert.
   - Camera Zoom slider & Torch toggle using `track.applyConstraints({ advanced: [{ zoom, torch }] })` when supported by hardware capabilities.

4. **Snapshot & Photo Capture**:
   - 3-second countdown timer with shutter audio tone / visual flash animation.
   - Draw video frame to an off-screen `<canvas>` at full native video resolution.
   - Instant preview modal with photo download as PNG or JPEG.

---

## 3. Tool 2: Microphone & Audio Input Tester (`MicTesterComponent.tsx`)

File: `src/components/converters/hardware/MicTesterComponent.tsx`

### Technical Requirements:
1. **Audio Capture & Web Audio Graph**:
   - Request audio stream via `navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } })`.
   - Connect stream to `AudioContext` -> `MediaStreamAudioSourceNode` -> `AnalyserNode`.

2. **Real-Time VU Decibel (dBFS) Meter**:
   - Compute RMS (Root Mean Square) volume level from time-domain byte data.
   - Convert RMS to decibels: $\text{dBFS} = 20 \times \log_{10}(\text{RMS} / 128)$.
   - Display a responsive vertical/horizontal green-to-red LED meter with peak hold and clipping indicator.

3. **60 FPS FFT Spectrum & Waveform Visualizer**:
   - 32-band and 64-band logarithmic frequency spectrum analyzer.
   - Smooth animated canvas rendering using gradient colors with neon glow effects.
   - Toggle between Frequency Spectrum (Bar Chart) and Time-Domain Waveform (Oscilloscope Line).

4. **5-Second Echo / Loopback Playback Test**:
   - One-click button "Record & Playback Test (5s)".
   - Use `MediaRecorder` to record 5 seconds of audio into an in-memory `Blob`.
   - Auto-playback recorded audio immediately with playback progress bar, allowing users to verify their vocal clarity, tone, and background noise gating.

5. **Audio Hardware Telemetry**:
   - Display active sample rate (e.g. 44,100 Hz, 48,000 Hz, 96,000 Hz).
   - Channel count (Mono vs Stereo).
   - Estimated input latency and ambient noise floor (dB).

---

## 4. Tool 3: Speaker & Headphone Sound Tester (`SpeakerTesterComponent.tsx`)

File: `src/components/converters/hardware/SpeakerTesterComponent.tsx`

### Technical Requirements:
1. **Isolated Left / Right Stereo Channel Test**:
   - Use `StereoPannerNode` (or `ChannelSplitterNode` / `ChannelMergerNode`) to route audio 100% to Left channel (`pan = -1`) and Right channel (`pan = 1`).
   - Play spoken synthesized audio ("Left Channel" / "Right Channel") using Web Speech Synthesis API (`window.speechSynthesis`) or synthesized stereo tone beeps.
   - Play isolated 1 kHz reference calibration tones and pink noise bursts.

2. **Continuous Frequency Response Sweep (20 Hz - 20,000 Hz)**:
   - Web Audio `OscillatorNode` with real-time frequency modulation.
   - Waveform selector: Sine (clean tone), Triangle (warm tone), Square (rich harmonics), Sawtooth.
   - Interactive Logarithmic Frequency Slider spanning:
     - Sub-Bass (20 Hz - 60 Hz)
     - Bass (60 Hz - 250 Hz)
     - Midrange (250 Hz - 4,000 Hz)
     - High Treble (4,000 Hz - 20,000 Hz)
   - "Auto-Sweep" button: Sweeps from 20 Hz to 20,000 Hz over 10 seconds to test headphone driver balance and buzzing/distortion frequencies.

3. **Binaural 3D Spatial Audio Test**:
   - Use `PannerNode` with HRTF (Head-Related Transfer Function) panning model.
   - Interactive 2D sound radar where users drag an audio source node around a virtual listener's head in 360° space to test surround sound and spatial imaging.

---

## 5. Verification & Quality Checklist
- [ ] Webcam tester lists all available video input devices and switches streams seamlessly.
- [ ] Webcam FPS and resolution dynamically update when video feed starts.
- [ ] Mic tester displays active VU dBFS meter, responds to voice, and flags clipping.
- [ ] Mic 5-second echo test records and replays audio cleanly with no memory leaks.
- [ ] Speaker test successfully isolates left and right audio channels without bleed.
- [ ] Frequency sweep plays smooth sinusoidal tones from 20 Hz to 20 kHz without clicking artifacts.
- [ ] All media streams are properly stopped (`track.stop()`) on component unmount.
