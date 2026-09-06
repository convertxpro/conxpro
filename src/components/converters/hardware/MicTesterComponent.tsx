'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Download,
  Copy,
  Check,
  Activity,
  Radio,
  Sliders,
  Sparkles,
  Zap,
  Info,
  ShieldCheck,
  AlertTriangle,
  Music,
  BarChart3,
  Waves,
  Disc,
  Clock,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { ToolMetadata } from '@/config/categories';
import { HardwareTestLayout, HardwareTestDevice } from './common/HardwareTestLayout';
import { PermissionPrompt, HardwarePermissionState } from './common/PermissionPrompt';
import { HardwareMetricCard } from './common/HardwareMetricCard';
import { AudioSpectrumVisualizer, VisualizerMode, VisualizerColorTheme } from './common/AudioSpectrumVisualizer';
import { cn } from '@/lib/utils';

export interface MicTesterComponentProps {
  tool?: ToolMetadata | { name: string; description: string; slug?: string };
}

export const MicTesterComponent: React.FC<MicTesterComponentProps> = ({
  tool = {
    name: 'Microphone & Audio Input Tester',
    description:
      'Test microphone input with real-time decibel VU meter, FFT frequency spectrum visualizer, and 5-second echo loopback.',
    slug: 'mic-test',
  },
}) => {
  // 1. Permission & Stream States
  const [permissionState, setPermissionState] = useState<HardwarePermissionState>('idle');
  const [devices, setDevices] = useState<HardwareTestDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isMicActive, setIsMicActive] = useState<boolean>(false);

  // 2. Audio Processing Graph Options
  const [echoCancellation, setEchoCancellation] = useState<boolean>(false);
  const [noiseSuppression, setNoiseSuppression] = useState<boolean>(false);
  const [autoGainControl, setAutoGainControl] = useState<boolean>(false);
  const [inputGain, setInputGain] = useState<number>(100); // 10% - 300%
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);

  // 3. Real-Time Telemetry States
  const [currentDb, setCurrentDb] = useState<number>(-60);
  const [peakDb, setPeakDb] = useState<number>(-60);
  const [clipCount, setClipCount] = useState<number>(0);
  const [sampleRate, setSampleRate] = useState<number>(48000);
  const [channelCount, setChannelCount] = useState<number>(1);
  const [micLabel, setMicLabel] = useState<string>('Standard Microphone');
  const [ambientNoiseFloor, setAmbientNoiseFloor] = useState<number>(-55);
  const [detectedPitch, setDetectedPitch] = useState<{ freq: number; note: string } | null>(null);

  // 4. Visualizer Customization
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('bars');
  const [colorTheme, setColorTheme] = useState<VisualizerColorTheme>('cyan');

  // 5. 5-Second Echo / Loopback Playback Test
  const [isLoopbackRecording, setIsLoopbackRecording] = useState<boolean>(false);
  const [loopbackCountdown, setLoopbackCountdown] = useState<number>(5);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState<boolean>(false);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const [loopbackQualityScore, setLoopbackQualityScore] = useState<string>('');

  // 6. Layout
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Audio Graph Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const [analyserInstance, setAnalyserInstance] = useState<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Recorder Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const loopbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Noise floor measurement buffer
  const noiseFloorSamplesRef = useRef<number[]>([]);

  // Pitch Detection (YIN / Auto-correlation algorithm)
  const detectPitchFromBuffer = (buffer: Float32Array, currentSampleRate: number) => {
    const SIZE = buffer.length;
    let sumOfSquares = 0;
    for (let i = 0; i < SIZE; i++) {
      sumOfSquares += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sumOfSquares / SIZE);
    if (rms < 0.015) return null; // Signal too weak

    // Autocorrelation
    let r1 = 0;
    let r2 = SIZE - 1;
    const thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buffer[i]) < thres) {
        r1 = i;
        break;
      }
    }
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buffer[SIZE - i]) < thres) {
        r2 = SIZE - i;
        break;
      }
    }

    const trimmed = buffer.slice(r1, r2);
    const c = new Array(trimmed.length).fill(0);
    for (let i = 0; i < trimmed.length; i++) {
      for (let j = 0; j < trimmed.length - i; j++) {
        c[i] = c[i] + trimmed[j] * trimmed[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1;
    let maxpos = -1;
    for (let i = d; i < trimmed.length; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }

    let T0 = maxpos;
    if (T0 === 0) return null;

    const freq = Math.round(currentSampleRate / T0);
    if (freq < 50 || freq > 1500) return null;

    // Convert frequency to musical note
    const noteStrings = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const midiNum = Math.round(69 + 12 * Math.log2(freq / 440));
    const noteIndex = (midiNum % 12 + 12) % 12;
    const octave = Math.floor(midiNum / 12) - 1;
    const note = `${noteStrings[noteIndex]}${octave}`;

    return { freq, note };
  };

  // Stop active microphone stream & audio nodes cleanly
  const stopMic = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {}
      });
      streamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    sourceNodeRef.current = null;
    gainNodeRef.current = null;
    analyserNodeRef.current = null;
    setAnalyserInstance(null);
    setIsMicActive(false);
    setCurrentDb(-60);
  }, []);

  // Enumerate input devices
  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = allDevices
        .filter((d) => d.kind === 'audioinput')
        .map((d, index) => ({
          deviceId: d.deviceId,
          label: d.label || `Microphone ${index + 1} (${d.deviceId.slice(0, 5)}...)`,
          kind: d.kind,
        }));

      setDevices(audioInputs);
      if (audioInputs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(audioInputs[0].deviceId);
      }
    } catch {}
  }, [selectedDeviceId]);

  // Start microphone capture & construct Web Audio graph
  const startMic = useCallback(
    async (deviceId?: string) => {
      stopMic();
      setPermissionState('requesting');
      setErrorMessage('');

      if (!navigator.mediaDevices?.getUserMedia) {
        setPermissionState('unsupported');
        return;
      }

      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: deviceId || selectedDeviceId ? { exact: deviceId || selectedDeviceId } : undefined,
          echoCancellation,
          noiseSuppression,
          autoGainControl,
          channelCount: { ideal: 2 },
        },
        video: false,
      };

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
          setMicLabel(audioTrack.label || 'Microphone');
          const settings = audioTrack.getSettings();
          if (settings.sampleRate) setSampleRate(settings.sampleRate);
          if (settings.channelCount) setChannelCount(settings.channelCount);
        }

        // Initialize AudioContext
        const AudioCtx =
          window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        if (ctx.sampleRate) setSampleRate(ctx.sampleRate);

        const source = ctx.createMediaStreamSource(stream);
        sourceNodeRef.current = source;

        const gainNode = ctx.createGain();
        gainNode.gain.value = inputGain / 100;
        gainNodeRef.current = gainNode;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.8;
        analyserNodeRef.current = analyser;
        setAnalyserInstance(analyser);

        // Connect graph (Stream -> Gain -> Analyser). Note: DO NOT connect to ctx.destination to avoid feedback squeal!
        source.connect(gainNode);
        gainNode.connect(analyser);

        setPermissionState('granted');
        setIsMicActive(true);
        await refreshDevices();

        // Start Telemetry & VU meter loop
        const timeData = new Uint8Array(analyser.fftSize);
        const floatData = new Float32Array(analyser.fftSize);
        noiseFloorSamplesRef.current = [];

        const telemetryLoop = () => {
          if (!analyserNodeRef.current) return;
          try {
            analyser.getByteTimeDomainData(timeData);
            analyser.getFloatTimeDomainData(floatData);

            // 1. Calculate RMS Level & dBFS
            let sumSquares = 0;
            for (let i = 0; i < timeData.length; i++) {
              const normalized = (timeData[i] - 128) / 128;
              sumSquares += normalized * normalized;
            }
            const rms = Math.sqrt(sumSquares / timeData.length);

            // Compute dBFS (0 dBFS is digital maximum, -60 is baseline silence)
            const dbVal = rms > 0.0001 ? Math.max(-60, Math.min(0, Math.round(20 * Math.log10(rms)))) : -60;
            setCurrentDb(dbVal);

            // Peak Hold & Clip Detection
            setPeakDb((prev) => Math.max(prev, dbVal));
            if (dbVal >= -0.5) {
              setClipCount((prev) => prev + 1);
            }

            // Ambient Noise Floor estimation (accumulate baseline low samples)
            if (dbVal < -35) {
              noiseFloorSamplesRef.current.push(dbVal);
              if (noiseFloorSamplesRef.current.length > 60) {
                const avgFloor = Math.round(
                  noiseFloorSamplesRef.current.reduce((a, b) => a + b, 0) / noiseFloorSamplesRef.current.length
                );
                setAmbientNoiseFloor(avgFloor);
                noiseFloorSamplesRef.current.shift();
              }
            }

            // Pitch & Musical Note Detection
            const pitch = detectPitchFromBuffer(floatData, ctx.sampleRate);
            if (pitch) {
              setDetectedPitch(pitch);
            }
          } catch {}

          animationFrameRef.current = requestAnimationFrame(telemetryLoop);
        };

        animationFrameRef.current = requestAnimationFrame(telemetryLoop);
      } catch (err: unknown) {
        const error = err as { name?: string; message?: string };
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setPermissionState('denied');
          setErrorMessage('Microphone access was blocked by your browser or operating system.');
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          setPermissionState('not-found');
          setErrorMessage('No microphone or audio input hardware detected on this machine.');
        } else {
          setPermissionState('error');
          setErrorMessage(error.message || 'Failed to connect to audio input device.');
        }
      }
    },
    [autoGainControl, echoCancellation, inputGain, noiseSuppression, refreshDevices, selectedDeviceId, stopMic]
  );

  // Update input gain node in real-time
  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(inputGain / 100, audioContextRef.current.currentTime, 0.05);
    }
  }, [inputGain]);

  // Switch device
  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    startMic(deviceId);
  };

  // 5-Second Loopback Echo Test Trigger
  const startLoopbackTest = () => {
    if (!streamRef.current) return;
    try {
      recordedChunksRef.current = [];
      const options: MediaRecorderOptions = { mimeType: 'audio/webm' };
      let recorder: MediaRecorder;
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        recorder = new MediaRecorder(streamRef.current, options);
      } else {
        recorder = new MediaRecorder(streamRef.current);
      }

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
        setIsLoopbackRecording(false);
        setLoopbackCountdown(5);

        // Analyze test result
        if (clipCount > 3) {
          setLoopbackQualityScore('⚠️ High Clipping Detected — Lower Input Gain');
        } else if (peakDb > -20) {
          setLoopbackQualityScore('✅ Optimal Vocal Clarity & Volume');
        } else {
          setLoopbackQualityScore('ℹ️ Low Volume — Move closer or boost gain');
        }

        // Auto-play the recorded clip so user hears their voice immediately
        setTimeout(() => {
          if (audioElementRef.current) {
            audioElementRef.current.src = url;
            audioElementRef.current.play().then(() => setIsPlayingRecorded(true)).catch(() => {});
          }
        }, 300);
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsLoopbackRecording(true);
      setLoopbackCountdown(5);

      if (loopbackTimerRef.current) clearInterval(loopbackTimerRef.current);
      loopbackTimerRef.current = setInterval(() => {
        setLoopbackCountdown((prev) => {
          if (prev <= 1) {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
              mediaRecorderRef.current.stop();
            }
            if (loopbackTimerRef.current) clearInterval(loopbackTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      // MediaRecorder failure
    }
  };

  // Recorded Audio Playback Controls
  const toggleRecordedPlayback = () => {
    if (!audioElementRef.current) return;
    if (isPlayingRecorded) {
      audioElementRef.current.pause();
      setIsPlayingRecorded(false);
    } else {
      audioElementRef.current.play();
      setIsPlayingRecorded(true);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMic();
      if (loopbackTimerRef.current) clearInterval(loopbackTimerRef.current);
    };
  }, [stopMic]);

  // Compute Signal-to-Noise Ratio (SNR)
  const estimatedSnr = Math.max(0, peakDb - ambientNoiseFloor);

  // Full Telemetry Report Data
  const telemetryReport = {
    microphoneDevice: micLabel,
    sampleRate: `${sampleRate} Hz`,
    channelCount: channelCount === 2 ? 'Stereo (2-channel)' : 'Mono (1-channel)',
    peakVolumeDbfs: `${peakDb} dBFS`,
    ambientNoiseFloor: `${ambientNoiseFloor} dBFS`,
    estimatedSnr: `${estimatedSnr} dB`,
    clippingEvents: clipCount,
    detectedPitchNote: detectedPitch ? `${detectedPitch.note} (${detectedPitch.freq} Hz)` : 'None',
    processingConstraints: { echoCancellation, noiseSuppression, autoGainControl, inputGain: `${inputGain}%` },
  };

  return (
    <HardwareTestLayout
      tool={tool}
      activeDeviceId={selectedDeviceId}
      devices={devices}
      onDeviceChange={handleDeviceChange}
      onRefreshDevices={refreshDevices}
      statusBadge={isMicActive ? { label: `${currentDb} dBFS • ${sampleRate} Hz`, variant: 'success' } : undefined}
      reportData={isMicActive ? telemetryReport : undefined}
      onReset={() => {
        setPeakDb(-60);
        setClipCount(0);
        if (isMicActive) startMic(selectedDeviceId);
      }}
      onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
      isFullscreen={isFullscreen}
    >
      {/* 1. Standby / Permission Prompt */}
      {!isMicActive ? (
        <PermissionPrompt
          type="microphone"
          state={permissionState}
          errorMessage={errorMessage}
          onRequestAccess={() => startMic()}
          onRetry={() => startMic()}
          buttonText="Start Microphone & Decibel Test"
          description="Test your microphone input in real-time with responsive VU decibel meters, 60 FPS FFT frequency visualizers, pitch detection, and a 5-second echo loopback test."
        />
      ) : (
        <div className="space-y-6">
          {/* 2. Main Live Visualizer & VU Decibel HUD */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-6">
            {/* Top Toolbar (Visualizer Modes & Colors) */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Live Audio Input Graph
                </h3>
              </div>

              {/* Mode & Theme Selector Buttons */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Visualizer Mode Toggle */}
                <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-0.5">
                  <button
                    type="button"
                    onClick={() => setVisualizerMode('bars')}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition',
                      visualizerMode === 'bars' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
                    )}
                  >
                    <BarChart3 className="h-3.5 w-3.5" />
                    <span>Spectrum</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisualizerMode('waveform')}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition',
                      visualizerMode === 'waveform' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
                    )}
                  >
                    <Waves className="h-3.5 w-3.5" />
                    <span>Waveform</span>
                  </button>
                </div>

                {/* Color Palette Toggle */}
                <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-0.5">
                  {(['cyan', 'purple', 'emerald', 'rainbow'] as VisualizerColorTheme[]).map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => setColorTheme(theme)}
                      className={cn(
                        'rounded-lg px-2 py-1 text-[11px] font-bold capitalize transition',
                        colorTheme === theme ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                      )}
                    >
                      {theme}
                    </button>
                  ))}
                </div>

                {/* Advanced Audio DSP Settings Toggle */}
                <button
                  type="button"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 font-semibold transition border border-slate-800',
                    showAdvancedSettings ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-slate-900 text-slate-400 hover:text-white'
                  )}
                >
                  <Sliders className="h-3.5 w-3.5" />
                  <span>DSP Settings</span>
                </button>
              </div>
            </div>

            {/* Main Canvas FFT Visualizer */}
            <AudioSpectrumVisualizer
              analyserNode={analyserInstance}
              mode={visualizerMode}
              colorTheme={colorTheme}
              height={180}
              barCount={64}
              showDecibels={false}
              showPeakMeter={false}
              isActive={isMicActive}
            />

            {/* 3. Real-Time Multi-Segment LED VU Meter */}
            <div className="space-y-2 rounded-2xl bg-slate-900/80 p-4 border border-slate-800 font-mono">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-300 uppercase tracking-wider">VU Decibel (dBFS) Meter</span>
                  {currentDb >= -1 && (
                    <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-400 animate-pulse border border-rose-500/30">
                      CLIPPING!
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400">
                    Live: <strong className="text-white">{currentDb > -60 ? `${currentDb} dBFS` : 'Silence'}</strong>
                  </span>
                  <span className="text-slate-400">
                    Peak: <strong className="text-cyan-400">{peakDb > -60 ? `${peakDb} dBFS` : '-∞'}</strong>
                  </span>
                </div>
              </div>

              {/* Multi-Segment Horizontal LED Bar */}
              <div className="relative h-5 w-full overflow-hidden rounded-xl bg-slate-950 p-1 flex items-center gap-0.5 border border-slate-800">
                {Array.from({ length: 40 }).map((_, idx) => {
                  // Map 40 segments from -60 dBFS to 0 dBFS
                  const segDb = -60 + (idx / 39) * 60;
                  const isLit = currentDb >= segDb;
                  const isPeak = Math.abs(peakDb - segDb) < 1.5;

                  let segColor = 'bg-slate-800/60';
                  if (isLit) {
                    if (segDb > -3) segColor = 'bg-rose-500 shadow-sm shadow-rose-500/50';
                    else if (segDb > -18) segColor = 'bg-amber-400 shadow-sm shadow-amber-400/50';
                    else segColor = 'bg-emerald-400 shadow-sm shadow-emerald-400/50';
                  } else if (isPeak) {
                    segColor = 'bg-cyan-400 shadow-sm shadow-cyan-400/50';
                  }

                  return (
                    <div
                      key={idx}
                      className={cn('h-full flex-1 rounded-sm transition-all duration-75', segColor)}
                    />
                  );
                })}
              </div>

              {/* VU Scale Calibration Labels */}
              <div className="flex justify-between text-[10px] text-slate-500 font-mono px-0.5">
                <span>-60 dB (Silence)</span>
                <span>-36 dB</span>
                <span className="text-emerald-400">-18 dB (Ideal Voice)</span>
                <span className="text-amber-400">-6 dB</span>
                <span className="text-rose-400">0 dB (Clip)</span>
              </div>
            </div>

            {/* 4. Advanced DSP Settings Drawer */}
            {showAdvancedSettings && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 space-y-4 animate-in slide-in-from-top-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Browser Audio DSP & Sensitivity</h4>
                  <span className="text-[11px] text-slate-400 font-mono">Real-time Web Audio API</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-300">
                  {/* Gain multiplier */}
                  <div className="space-y-1.5 rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                    <div className="flex justify-between font-mono">
                      <span>Software Input Gain</span>
                      <span className="text-cyan-400">{inputGain}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="300"
                      value={inputGain}
                      onChange={(e) => setInputGain(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  {/* Echo Cancellation toggle */}
                  <div className="flex items-center justify-between rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                    <div>
                      <span className="block font-semibold text-white">Echo Cancellation</span>
                      <span className="text-[10px] text-slate-400">Suppress speaker feedback</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={echoCancellation}
                      onChange={(e) => {
                        setEchoCancellation(e.target.checked);
                        startMic(selectedDeviceId);
                      }}
                      className="h-4 w-4 rounded accent-cyan-400"
                    />
                  </div>

                  {/* Noise Suppression toggle */}
                  <div className="flex items-center justify-between rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                    <div>
                      <span className="block font-semibold text-white">Noise Suppression</span>
                      <span className="text-[10px] text-slate-400">Filter background hum</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={noiseSuppression}
                      onChange={(e) => {
                        setNoiseSuppression(e.target.checked);
                        startMic(selectedDeviceId);
                      }}
                      className="h-4 w-4 rounded accent-cyan-400"
                    />
                  </div>

                  {/* Auto Gain Control toggle */}
                  <div className="flex items-center justify-between rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                    <div>
                      <span className="block font-semibold text-white">Auto Gain (AGC)</span>
                      <span className="text-[10px] text-slate-400">Auto volume leveler</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoGainControl}
                      onChange={(e) => {
                        setAutoGainControl(e.target.checked);
                        startMic(selectedDeviceId);
                      }}
                      className="h-4 w-4 rounded accent-cyan-400"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. 5-Second Echo / Loopback Playback Test Section */}
          <div className="rounded-3xl border border-violet-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-purple-950/30 p-6 shadow-2xl backdrop-blur-xl space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-violet-400 font-bold text-xs uppercase tracking-wider font-mono">
                  <Radio className="h-4 w-4" />
                  <span>Vocal Echo & Tone Clarity Test</span>
                </div>
                <h3 className="mt-1 text-lg sm:text-xl font-extrabold text-white">
                  5-Second Loopback Playback
                </h3>
                <p className="text-xs text-slate-300 max-w-xl">
                  Record a 5-second vocal sample into local browser memory. The tool immediately plays it back to let you hear your real audio tone, background room noise, and clarity.
                </p>
              </div>

              {/* Loopback Action Button */}
              <button
                type="button"
                onClick={startLoopbackTest}
                disabled={isLoopbackRecording}
                className={cn(
                  'inline-flex items-center gap-2.5 rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50',
                  isLoopbackRecording
                    ? 'bg-rose-600 animate-pulse'
                    : 'bg-gradient-to-r from-violet-500 to-purple-600 shadow-violet-500/25'
                )}
              >
                {isLoopbackRecording ? (
                  <>
                    <Disc className="h-4 w-4 animate-spin" />
                    <span>Recording... {loopbackCountdown}s</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    <span>Record & Playback Test (5s)</span>
                  </>
                )}
              </button>
            </div>

            {/* Loopback Playback Player Card (if recorded) */}
            {recordedAudioUrl && (
              <div className="rounded-2xl border border-violet-500/20 bg-slate-900/90 p-4 sm:p-5 space-y-3">
                <audio
                  ref={audioElementRef}
                  onEnded={() => setIsPlayingRecorded(false)}
                  onTimeUpdate={() => {
                    if (audioElementRef.current) {
                      const cur = audioElementRef.current.currentTime;
                      const dur = audioElementRef.current.duration || 5;
                      setPlaybackProgress((cur / dur) * 100);
                    }
                  }}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleRecordedPlayback}
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500 text-white shadow-lg hover:scale-105 transition"
                    >
                      {isPlayingRecorded ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
                    </button>
                    <div>
                      <span className="text-xs font-bold text-white block">Recorded 5s Vocal Sample</span>
                      <span className="text-[11px] text-violet-300 font-medium">{loopbackQualityScore}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={recordedAudioUrl}
                      download="apextools-mic-test.webm"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white transition"
                    >
                      <Download className="h-3.5 w-3.5 text-violet-400" />
                      <span>Download Clip</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setRecordedAudioUrl(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-100"
                    style={{ width: `${playbackProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 6. Hardware Telemetry Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <HardwareMetricCard
              title="Active Input Level"
              value={currentDb > -60 ? currentDb : 'Silence'}
              unit={currentDb > -60 ? 'dBFS' : ''}
              subtext={currentDb > -18 ? 'Strong, clear voice signal' : currentDb > -35 ? 'Moderate room level' : 'Ambient background'}
              status={currentDb > -18 ? 'optimal' : currentDb > -35 ? 'good' : 'neutral'}
              icon={Mic}
              copyable
            />

            <HardwareMetricCard
              title="Peak Volume & Clipping"
              value={`${peakDb} dB`}
              subtext={clipCount > 0 ? `⚠️ ${clipCount} Digital Clip Events` : 'No clipping distortion'}
              status={clipCount > 0 ? 'warning' : 'optimal'}
              icon={Activity}
              copyable
            />

            <HardwareMetricCard
              title="Sample Rate & Channels"
              value={`${(sampleRate / 1000).toFixed(1)} kHz`}
              unit={channelCount === 2 ? 'Stereo' : 'Mono'}
              subtext="Studio Quality Web Audio"
              status="optimal"
              icon={Music}
              copyable
            />

            <HardwareMetricCard
              title="Pitch & Fundamental Freq"
              value={detectedPitch ? detectedPitch.note : '...'}
              unit={detectedPitch ? `${detectedPitch.freq} Hz` : ''}
              subtext={detectedPitch ? `Fundamental: ${detectedPitch.freq} Hz` : 'Speak to detect pitch'}
              status="optimal"
              icon={Music}
            />
          </div>
        </div>
      )}
    </HardwareTestLayout>
  );
};
