'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  Volume1,
  Play,
  Pause,
  RotateCcw,
  Headphones,
  Radio,
  Sliders,
  Sparkles,
  Zap,
  Info,
  ShieldCheck,
  AlertTriangle,
  Music,
  Activity,
  Compass,
  Repeat,
  Layers,
  CheckCircle2,
  Disc,
  ArrowRight,
  Maximize2,
} from 'lucide-react';
import { ToolMetadata } from '@/config/categories';
import { HardwareTestLayout } from './common/HardwareTestLayout';
import { PermissionPrompt, HardwarePermissionState } from './common/PermissionPrompt';
import { HardwareMetricCard } from './common/HardwareMetricCard';
import { cn } from '@/lib/utils';

export interface SpeakerTesterComponentProps {
  tool?: ToolMetadata | { name: string; description: string; slug?: string };
}

type SoundType = 'speech' | 'tone1k' | 'tone440' | 'pinkNoise' | 'whiteNoise' | 'pulse';
type WaveformType = 'sine' | 'triangle' | 'square' | 'sawtooth';
type SpatialPreset = 'manual' | 'orbit' | 'flyby';

export const SpeakerTesterComponent: React.FC<SpeakerTesterComponentProps> = ({
  tool = {
    name: 'Speaker & Headphone Sound Tester',
    description:
      'Test stereo Left/Right audio channels, frequency response sweep (20Hz-20kHz), and 3D spatial surround sound 100% locally in your browser.',
    slug: 'speaker-test',
  },
}) => {
  // 1. Audio Engine State
  const [isAudioInitialized, setIsAudioInitialized] = useState<boolean>(false);
  const [masterVolume, setMasterVolume] = useState<number>(50); // 0 - 100%
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // 2. Stereo Channel Test State
  const [activeChannelMode, setActiveChannelMode] = useState<'both' | 'left' | 'right' | 'off'>('off');
  const [stereoSoundType, setStereoSoundType] = useState<SoundType>('speech');
  const [isAutoCyclingStereo, setIsAutoCyclingStereo] = useState<boolean>(false);
  const [channelPhaseMode, setChannelPhaseMode] = useState<'in-phase' | 'out-of-phase'>('in-phase');

  // 3. Continuous Frequency Sweep State
  const [frequency, setFrequency] = useState<number>(440); // 20 - 20,000 Hz
  const [waveform, setWaveform] = useState<WaveformType>('sine');
  const [isSweepOscillatorPlaying, setIsSweepOscillatorPlaying] = useState<boolean>(false);
  const [isAutoSweeping, setIsAutoSweeping] = useState<boolean>(false);
  const [sweepDuration, setSweepDuration] = useState<number>(10); // 5, 10, 20s
  const [sweepProgress, setSweepProgress] = useState<number>(0); // 0 - 100%

  // 4. Binaural 3D Spatial Audio Radar
  const [isSpatialPlaying, setIsSpatialPlaying] = useState<boolean>(false);
  const [spatialPosition, setSpatialPosition] = useState<{ x: number; y: number }>({ x: 0, y: -1 }); // normalized -1 to 1
  const [spatialPreset, setSpatialPreset] = useState<SpatialPreset>('manual');

  // 5. Layout
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Web Audio Graph Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  // Stereo Test Node Refs
  const stereoPannerRef = useRef<StereoPannerNode | null>(null);
  const stereoOscillatorRef = useRef<OscillatorNode | null>(null);
  const stereoGainRef = useRef<GainNode | null>(null);
  const autoCycleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sweep Node Refs
  const sweepOscillatorRef = useRef<OscillatorNode | null>(null);
  const sweepGainRef = useRef<GainNode | null>(null);
  const sweepIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 3D Spatial Node Refs
  const spatialPannerRef = useRef<PannerNode | null>(null);
  const spatialSourceRef = useRef<OscillatorNode | null>(null);
  const spatialGainRef = useRef<GainNode | null>(null);
  const spatialAnimFrameRef = useRef<number | null>(null);
  const spatialAngleRef = useRef<number>(0);

  // Initialize Web Audio Context on first user gesture
  const initAudio = useCallback(() => {
    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      return audioContextRef.current;
    }

    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    audioContextRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.value = isMuted ? 0 : masterVolume / 100;
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    setIsAudioInitialized(true);
    return ctx;
  }, [isMuted, masterVolume]);

  // Update Master Volume
  useEffect(() => {
    if (masterGainRef.current && audioContextRef.current) {
      const vol = isMuted ? 0 : masterVolume / 100;
      masterGainRef.current.gain.setTargetAtTime(vol, audioContextRef.current.currentTime, 0.05);
    }
  }, [masterVolume, isMuted]);

  // =========================================================================
  // 1. STEREO CHANNEL TEST ENGINE
  // =========================================================================

  // Generate White / Pink Noise Buffer
  const createNoiseBuffer = (ctx: AudioContext, type: 'white' | 'pink'): AudioBuffer => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } else {
      // Pink Noise (Paul Kellet's filter)
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    }
    return buffer;
  };

  // Stop stereo channel test
  const stopStereoTest = useCallback(() => {
    if (stereoGainRef.current && audioContextRef.current) {
      try {
        stereoGainRef.current.gain.setValueAtTime(stereoGainRef.current.gain.value, audioContextRef.current.currentTime);
        stereoGainRef.current.gain.exponentialRampToValueAtTime(0.0001, audioContextRef.current.currentTime + 0.05);
      } catch {}
    }

    setTimeout(() => {
      if (stereoOscillatorRef.current) {
        try {
          stereoOscillatorRef.current.stop();
          stereoOscillatorRef.current.disconnect();
        } catch {}
        stereoOscillatorRef.current = null;
      }
      setActiveChannelMode('off');
    }, 60);
  }, []);

  // Play short pleasant chime on isolated channel
  const playStereoChime = (ctx: AudioContext, pan: number) => {
    if (!masterGainRef.current) return;
    const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (panner) panner.pan.setValueAtTime(pan, ctx.currentTime);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pan < 0 ? 523.25 : pan > 0 ? 659.25 : 440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    if (panner) {
      osc.connect(gain);
      gain.connect(panner);
      panner.connect(masterGainRef.current);
    } else {
      osc.connect(gain);
      gain.connect(masterGainRef.current);
    }

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  };

  // Play Isolated Stereo Channel Tone / Speech
  const playStereoChannel = useCallback(
    (channel: 'left' | 'right' | 'both') => {
      const ctx = initAudio();
      if (!ctx || !masterGainRef.current) return;

      // Stop previous stereo tone
      stopStereoTest();
      setActiveChannelMode(channel);

      const panValue = channel === 'left' ? -1 : channel === 'right' ? 1 : 0;

      // 1. Spoken Synthesized Audio (SpeechSynthesis API)
      if (stereoSoundType === 'speech') {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utteranceText =
            channel === 'left' ? 'Left Channel' : channel === 'right' ? 'Right Channel' : 'Center Channel';
          const utterance = new SpeechSynthesisUtterance(utteranceText);
          utterance.rate = 1.0;
          utterance.pitch = channel === 'left' ? 1.1 : channel === 'right' ? 0.9 : 1.0;

          // For speech panning, play tone chime on the isolated channel
          playStereoChime(ctx, panValue);
          window.speechSynthesis.speak(utterance);
          return;
        }
      }

      // 2. Synthesized Audio Nodes
      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (panner) {
        panner.pan.setValueAtTime(panValue, ctx.currentTime);
        stereoPannerRef.current = panner;
      }

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.05);
      stereoGainRef.current = gain;

      if (stereoSoundType === 'tone1k' || stereoSoundType === 'tone440') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(stereoSoundType === 'tone1k' ? 1000 : 440, ctx.currentTime);

        if (panner) {
          osc.connect(gain);
          gain.connect(panner);
          panner.connect(masterGainRef.current);
        } else {
          osc.connect(gain);
          gain.connect(masterGainRef.current);
        }

        osc.start();
        stereoOscillatorRef.current = osc;
      } else if (stereoSoundType === 'pinkNoise' || stereoSoundType === 'whiteNoise') {
        const noiseBuf = createNoiseBuffer(ctx, stereoSoundType === 'pinkNoise' ? 'pink' : 'white');
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuf;
        noiseSource.loop = true;

        if (panner) {
          noiseSource.connect(gain);
          gain.connect(panner);
          panner.connect(masterGainRef.current);
        } else {
          noiseSource.connect(gain);
          gain.connect(masterGainRef.current);
        }

        noiseSource.start();
      }
    },
    [initAudio, stereoSoundType, stopStereoTest]
  );


  // Auto-Cycle Stereo Alternator (Left -> Center -> Right -> Left)
  const toggleAutoStereoCycle = () => {
    if (isAutoCyclingStereo) {
      if (autoCycleTimerRef.current) clearInterval(autoCycleTimerRef.current);
      stopStereoTest();
      setIsAutoCyclingStereo(false);
    } else {
      setIsAutoCyclingStereo(true);
      const sequence: ('left' | 'both' | 'right')[] = ['left', 'both', 'right'];
      let step = 0;

      playStereoChannel(sequence[0]);
      autoCycleTimerRef.current = setInterval(() => {
        step = (step + 1) % sequence.length;
        playStereoChannel(sequence[step]);
      }, 1600);
    }
  };

  // =========================================================================
  // 2. CONTINUOUS FREQUENCY SWEEP ENGINE (20 Hz - 20,000 Hz)
  // =========================================================================

  // Start / Stop Single Frequency Generator
  const toggleSweepOscillator = () => {
    if (isSweepOscillatorPlaying) {
      stopSweepOscillator();
    } else {
      startSweepOscillator(frequency);
    }
  };

  const startSweepOscillator = (freq: number) => {
    const ctx = initAudio();
    if (!ctx || !masterGainRef.current) return;

    stopSweepOscillator();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = waveform;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Smooth gain fade-in to prevent pops
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(masterGainRef.current);

    osc.start();
    sweepOscillatorRef.current = osc;
    sweepGainRef.current = gain;
    setIsSweepOscillatorPlaying(true);
  };

  const stopSweepOscillator = useCallback(() => {
    if (sweepGainRef.current && audioContextRef.current) {
      try {
        sweepGainRef.current.gain.setValueAtTime(sweepGainRef.current.gain.value, audioContextRef.current.currentTime);
        sweepGainRef.current.gain.exponentialRampToValueAtTime(0.0001, audioContextRef.current.currentTime + 0.05);
      } catch {}
    }

    setTimeout(() => {
      if (sweepOscillatorRef.current) {
        try {
          sweepOscillatorRef.current.stop();
          sweepOscillatorRef.current.disconnect();
        } catch {}
        sweepOscillatorRef.current = null;
      }
      setIsSweepOscillatorPlaying(false);
    }, 60);
  }, []);

  // Frequency slider handler (Logarithmic mapping)
  const handleFrequencyChange = (newFreq: number) => {
    setFrequency(newFreq);
    if (sweepOscillatorRef.current && audioContextRef.current) {
      sweepOscillatorRef.current.frequency.setTargetAtTime(newFreq, audioContextRef.current.currentTime, 0.03);
    }
  };

  // Auto-Sweep from 20 Hz to 20,000 Hz
  const toggleAutoSweep = () => {
    if (isAutoSweeping) {
      if (sweepIntervalRef.current) clearInterval(sweepIntervalRef.current);
      stopSweepOscillator();
      setIsAutoSweeping(false);
      setSweepProgress(0);
    } else {
      setIsAutoSweeping(true);
      setSweepProgress(0);
      startSweepOscillator(20);

      const startTime = performance.now();
      const totalDurationMs = sweepDuration * 1000;
      const minLog = Math.log(20);
      const maxLog = Math.log(20000);

      sweepIntervalRef.current = setInterval(() => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1, elapsed / totalDurationMs);
        setSweepProgress(progress * 100);

        // Exponential frequency growth
        const currentFreq = Math.round(Math.exp(minLog + progress * (maxLog - minLog)));
        handleFrequencyChange(currentFreq);

        if (progress >= 1) {
          if (sweepIntervalRef.current) clearInterval(sweepIntervalRef.current);
          stopSweepOscillator();
          setIsAutoSweeping(false);
          setSweepProgress(0);
        }
      }, 50);
    }
  };

  // =========================================================================
  // 3. BINAURAL 3D SPATIAL AUDIO RADAR
  // =========================================================================

  const stopSpatialTest = useCallback(() => {
    if (spatialAnimFrameRef.current) {
      cancelAnimationFrame(spatialAnimFrameRef.current);
      spatialAnimFrameRef.current = null;
    }

    if (spatialGainRef.current && audioContextRef.current) {
      try {
        spatialGainRef.current.gain.setValueAtTime(spatialGainRef.current.gain.value, audioContextRef.current.currentTime);
        spatialGainRef.current.gain.exponentialRampToValueAtTime(0.0001, audioContextRef.current.currentTime + 0.05);
      } catch {}
    }

    setTimeout(() => {
      if (spatialSourceRef.current) {
        try {
          spatialSourceRef.current.stop();
          spatialSourceRef.current.disconnect();
        } catch {}
        spatialSourceRef.current = null;
      }
      setIsSpatialPlaying(false);
    }, 60);
  }, []);

  const startSpatialTest = () => {
    const ctx = initAudio();
    if (!ctx || !masterGainRef.current) return;

    stopSpatialTest();

    // Create 3D Panner with HRTF
    const panner = ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 10000;
    panner.rolloffFactor = 1;
    panner.positionX.setValueAtTime(spatialPosition.x * 2, ctx.currentTime);
    panner.positionY.setValueAtTime(0, ctx.currentTime);
    panner.positionZ.setValueAtTime(spatialPosition.y * 2, ctx.currentTime);
    spatialPannerRef.current = panner;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(panner);
    panner.connect(masterGainRef.current);

    osc.start();
    spatialSourceRef.current = osc;
    spatialGainRef.current = gain;
    setIsSpatialPlaying(true);
  };


  // Update Spatial Coordinate
  const updateSpatialPosition = (x: number, y: number) => {
    setSpatialPosition({ x, y });
    if (spatialPannerRef.current && audioContextRef.current) {
      spatialPannerRef.current.positionX.setTargetAtTime(x * 2, audioContextRef.current.currentTime, 0.04);
      spatialPannerRef.current.positionZ.setTargetAtTime(y * 2, audioContextRef.current.currentTime, 0.04);
    }
  };

  // Spatial Orbit Loop
  useEffect(() => {
    if (!isSpatialPlaying || spatialPreset !== 'orbit') return;

    let isRunning = true;
    const orbitLoop = () => {
      if (!isRunning) return;
      spatialAngleRef.current += 0.025;
      const x = Math.cos(spatialAngleRef.current);
      const y = Math.sin(spatialAngleRef.current);
      updateSpatialPosition(x, y);
      spatialAnimFrameRef.current = requestAnimationFrame(orbitLoop);
    };

    spatialAnimFrameRef.current = requestAnimationFrame(orbitLoop);
    return () => {
      isRunning = false;
      if (spatialAnimFrameRef.current) cancelAnimationFrame(spatialAnimFrameRef.current);
    };
  }, [isSpatialPlaying, spatialPreset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStereoTest();
      stopSweepOscillator();
      stopSpatialTest();
      if (autoCycleTimerRef.current) clearInterval(autoCycleTimerRef.current);
      if (sweepIntervalRef.current) clearInterval(sweepIntervalRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [stopSpatialTest, stopStereoTest, stopSweepOscillator]);

  // Frequency range classifier
  const getFrequencyBand = (f: number): { band: string; desc: string } => {
    if (f < 60) return { band: 'Sub-Bass (20-60 Hz)', desc: 'Rumble & Subwoofers' };
    if (f < 250) return { band: 'Bass (60-250 Hz)', desc: 'Kick drums & Basslines' };
    if (f < 500) return { band: 'Low-Mid (250-500 Hz)', desc: 'Warmth & Body' };
    if (f < 2000) return { band: 'Midrange (500-2,000 Hz)', desc: 'Vocal core presence' };
    if (f < 4000) return { band: 'High-Mid (2-4 kHz)', desc: 'Speech intelligibility' };
    if (f < 8000) return { band: 'Presence (4-8 kHz)', desc: 'Clarity & Detail' };
    return { band: 'Brilliance & Air (8-20 kHz)', desc: 'High harmonics & hearing ceiling' };
  };

  const currentFreqBand = getFrequencyBand(frequency);

  // Full Telemetry Report Data
  const telemetryReport = {
    stereoTestChannel: activeChannelMode,
    stereoSoundType,
    sweepFrequencyHz: `${frequency} Hz`,
    frequencyBand: currentFreqBand.band,
    waveform,
    masterVolume: `${masterVolume}%`,
    is3DSpatialActive: isSpatialPlaying,
    spatialCoords: `X: ${spatialPosition.x.toFixed(2)}, Y: ${spatialPosition.y.toFixed(2)}`,
  };

  return (
    <HardwareTestLayout
      tool={tool}
      statusBadge={
        isAudioInitialized
          ? {
              label: isSweepOscillatorPlaying
                ? `${frequency} Hz Tone`
                : activeChannelMode !== 'off'
                ? `Stereo ${activeChannelMode.toUpperCase()}`
                : isSpatialPlaying
                ? '3D Spatial Surround'
                : 'Audio Engine Ready',
              variant: 'success',
            }
          : undefined
      }
      reportData={isAudioInitialized ? telemetryReport : undefined}
      onReset={() => {
        stopStereoTest();
        stopSweepOscillator();
        stopSpatialTest();
        setFrequency(440);
        setMasterVolume(50);
      }}
      onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
      isFullscreen={isFullscreen}
    >
      <div className="space-y-6">
        {/* Master Volume & Audio Engine Activation Banner */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4 sm:p-6 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 ring-4 ring-cyan-500/10">
              <Volume2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Web Audio Synthesizer Engine
              </h3>
              <p className="text-xs text-slate-400">
                100% In-Browser 32-bit floating point precision audio graph
              </p>
            </div>
          </div>

          {/* Master Volume Slider */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'Unmute Master' : 'Mute Master'}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
            </button>

            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : masterVolume}
                onChange={(e) => {
                  setMasterVolume(Number(e.target.value));
                  setIsMuted(false);
                }}
                className="w-28 sm:w-36 accent-cyan-400"
              />
              <span className="font-mono text-xs font-bold text-white w-8">{isMuted ? '0%' : `${masterVolume}%`}</span>
            </div>
          </div>
        </div>

        {/* 1. Stereo Channel Test Section */}
        <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-blue-950/20 p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider font-mono">
                <Headphones className="h-4 w-4" />
                <span>Isolated Channel Routing</span>
              </div>
              <h3 className="mt-1 text-lg sm:text-xl font-extrabold text-white">
                Left / Right Stereo Channel Diagnostics
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Isolate individual speaker drivers or headphone channels to detect channel bleed, loose wiring, or inverted balance.
              </p>
            </div>

            {/* Sound Profile Selector */}
            <div className="flex items-center gap-2">
              <select
                value={stereoSoundType}
                onChange={(e) => setStereoSoundType(e.target.value as SoundType)}
                className="rounded-xl bg-slate-900 border border-slate-800 py-1.5 px-3 text-xs font-bold text-white focus:outline-none"
              >
                <option value="speech">Voice Synthesis (&ldquo;Left&rdquo; / &ldquo;Right&rdquo;)</option>
                <option value="tone1k">1,000 Hz Reference Studio Tone</option>
                <option value="tone440">440 Hz Musical A4 Standard</option>
                <option value="pinkNoise">Pink Noise Full Acoustic Burst</option>
                <option value="whiteNoise">White Noise Calibration</option>
              </select>
            </div>
          </div>

          {/* Interactive Visual Stereo Headphone / Speaker Stage */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Left Channel Button / Indicator */}
            <button
              type="button"
              onClick={() => (activeChannelMode === 'left' ? stopStereoTest() : playStereoChannel('left'))}
              className={cn(
                'group relative flex flex-col items-center justify-center rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.02]',
                activeChannelMode === 'left'
                  ? 'border-cyan-500 bg-cyan-500/15 shadow-xl shadow-cyan-500/20'
                  : 'border-slate-800 bg-slate-950 hover:border-slate-700'
              )}
            >
              <div
                className={cn(
                  'flex h-16 w-16 items-center justify-center rounded-2xl transition shadow-lg',
                  activeChannelMode === 'left' ? 'bg-cyan-500 text-white animate-bounce' : 'bg-slate-900 text-slate-400'
                )}
              >
                <Headphones className="h-8 w-8" />
              </div>
              <span className="mt-3 text-base font-extrabold text-white">Left Channel (100% L)</span>
              <span className="text-xs text-slate-400 font-mono">Panned -1.0 • Isolated</span>
            </button>

            {/* Center / Both Channels Button */}
            <div className="flex flex-col items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => (activeChannelMode === 'both' ? stopStereoTest() : playStereoChannel('both'))}
                className={cn(
                  'w-full flex flex-col items-center justify-center rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.02]',
                  activeChannelMode === 'both'
                    ? 'border-emerald-500 bg-emerald-500/15 shadow-xl shadow-emerald-500/20'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                )}
              >
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl transition',
                    activeChannelMode === 'both' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-slate-400'
                  )}
                >
                  <Activity className="h-6 w-6" />
                </div>
                <span className="mt-2 text-sm font-extrabold text-white">Both Channels (Center)</span>
                <span className="text-[11px] text-slate-400 font-mono">Pan 0.0 • Balanced</span>
              </button>

              <button
                type="button"
                onClick={toggleAutoStereoCycle}
                className={cn(
                  'w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-bold transition',
                  isAutoCyclingStereo
                    ? 'bg-amber-500 text-slate-950 animate-pulse'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                )}
              >
                <Repeat className="h-3.5 w-3.5" />
                <span>{isAutoCyclingStereo ? 'Stop Auto-Cycle' : 'Auto-Cycle Left ↔ Right'}</span>
              </button>
            </div>

            {/* Right Channel Button / Indicator */}
            <button
              type="button"
              onClick={() => (activeChannelMode === 'right' ? stopStereoTest() : playStereoChannel('right'))}
              className={cn(
                'group relative flex flex-col items-center justify-center rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.02]',
                activeChannelMode === 'right'
                  ? 'border-purple-500 bg-purple-500/15 shadow-xl shadow-purple-500/20'
                  : 'border-slate-800 bg-slate-950 hover:border-slate-700'
              )}
            >
              <div
                className={cn(
                  'flex h-16 w-16 items-center justify-center rounded-2xl transition shadow-lg',
                  activeChannelMode === 'right' ? 'bg-purple-500 text-white animate-bounce' : 'bg-slate-900 text-slate-400'
                )}
              >
                <Headphones className="h-8 w-8" />
              </div>
              <span className="mt-3 text-base font-extrabold text-white">Right Channel (100% R)</span>
              <span className="text-xs text-slate-400 font-mono">Panned +1.0 • Isolated</span>
            </button>
          </div>
        </div>

        {/* 2. Continuous Frequency Response Sweep (20 Hz - 20,000 Hz) */}
        <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-cyan-950/20 p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider font-mono">
                <Music className="h-4 w-4" />
                <span>Full Acoustic Spectrum Sweep</span>
              </div>
              <h3 className="mt-1 text-lg sm:text-xl font-extrabold text-white">
                Frequency Response Sweep (20 Hz – 20,000 Hz)
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Generate smooth synthesized acoustic waves to test bass extension, hearing thresholds, speaker driver buzzing, and crossover distortion.
              </p>
            </div>

            {/* Waveform Selector */}
            <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-0.5 text-xs font-bold text-slate-400">
              {(['sine', 'triangle', 'square', 'sawtooth'] as WaveformType[]).map((wf) => (
                <button
                  key={wf}
                  type="button"
                  onClick={() => {
                    setWaveform(wf);
                    if (sweepOscillatorRef.current) sweepOscillatorRef.current.type = wf;
                  }}
                  className={cn(
                    'rounded-lg px-2.5 py-1.5 capitalize transition',
                    waveform === wf ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'hover:text-white'
                  )}
                >
                  {wf}
                </button>
              ))}
            </div>
          </div>

          {/* Big Frequency Display & Play Controls */}
          <div className="rounded-2xl bg-slate-950 p-6 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 font-mono">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-6xl font-black text-white tracking-tight">{frequency.toLocaleString()}</span>
              <span className="text-xl sm:text-2xl font-bold text-cyan-400">Hz</span>
              <span className="ml-2 rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-bold text-cyan-300 border border-cyan-500/30">
                {currentFreqBand.band}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={toggleSweepOscillator}
                className={cn(
                  'flex-1 md:flex-none inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-xl transition hover:scale-105 active:scale-95',
                  isSweepOscillatorPlaying ? 'bg-rose-600' : 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-500/25'
                )}
              >
                {isSweepOscillatorPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                <span>{isSweepOscillatorPlaying ? 'Stop Tone' : 'Play Tone'}</span>
              </button>

              <button
                type="button"
                onClick={toggleAutoSweep}
                className={cn(
                  'inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold transition border',
                  isAutoSweeping
                    ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                    : 'bg-slate-900 text-white border-slate-800 hover:bg-slate-800'
                )}
              >
                <Zap className="h-4 w-4" />
                <span>{isAutoSweeping ? 'Stop Sweep' : 'Auto-Sweep 20Hz-20kHz'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Logarithmic Frequency Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>20 Hz (Sub-Bass)</span>
              <span>100 Hz</span>
              <span>1 kHz (Mid)</span>
              <span>5 kHz</span>
              <span>20 kHz (Air)</span>
            </div>

            <input
              type="range"
              min="20"
              max="20000"
              value={frequency}
              onChange={(e) => handleFrequencyChange(Number(e.target.value))}
              className="w-full h-3 rounded-lg bg-slate-950 accent-cyan-400 cursor-pointer"
            />

            {/* Auto-Sweep Progress Bar */}
            {isAutoSweeping && (
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-950">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-amber-400 to-rose-500 transition-all duration-75"
                  style={{ width: `${sweepProgress}%` }}
                />
              </div>
            )}
          </div>

          {/* Preset Quick-Jump Frequency Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
            <span className="text-xs text-slate-400 font-semibold mr-1">Quick Presets:</span>
            {[
              { label: '20 Hz', f: 20 },
              { label: '60 Hz (Sub)', f: 60 },
              { label: '120 Hz (Bass)', f: 120 },
              { label: '440 Hz (A4)', f: 440 },
              { label: '1 kHz (Ref)', f: 1000 },
              { label: '3.5 kHz (Presence)', f: 3500 },
              { label: '8 kHz (Treble)', f: 8000 },
              { label: '15 kHz (Air)', f: 15000 },
              { label: '20 kHz (Ceiling)', f: 20000 },
            ].map((p) => (
              <button
                key={p.f}
                type="button"
                onClick={() => handleFrequencyChange(p.f)}
                className={cn(
                  'rounded-xl border px-3 py-1.5 text-xs font-mono font-bold transition',
                  frequency === p.f
                    ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-700'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Binaural 3D Spatial Audio Radar Section */}
        <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-purple-950/20 p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider font-mono">
                <Compass className="h-4 w-4" />
                <span>Binaural HRTF Engine</span>
              </div>
              <h3 className="mt-1 text-lg sm:text-xl font-extrabold text-white">
                360° 3D Spatial Surround Audio Radar
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Drag the sound puck around the virtual listener in 360° space to evaluate surround sound depth, panning resolution, and HRTF head staging. (Headphones recommended).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSpatialPreset(spatialPreset === 'orbit' ? 'manual' : 'orbit')}
                className={cn(
                  'rounded-xl border px-3 py-1.5 text-xs font-bold transition',
                  spatialPreset === 'orbit'
                    ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                )}
              >
                {spatialPreset === 'orbit' ? 'Orbiting 360°' : 'Auto 360° Orbit'}
              </button>

              <button
                type="button"
                onClick={isSpatialPlaying ? stopSpatialTest : startSpatialTest}
                className={cn(
                  'inline-flex items-center gap-2 rounded-2xl px-5 py-2 text-xs font-bold text-white shadow-xl transition hover:scale-105',
                  isSpatialPlaying ? 'bg-rose-600' : 'bg-gradient-to-r from-purple-500 to-indigo-600 shadow-purple-500/25'
                )}
              >
                {isSpatialPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                <span>{isSpatialPlaying ? 'Stop 3D Audio' : 'Start 3D Audio'}</span>
              </button>
            </div>
          </div>

          {/* Interactive 2D Sound Radar Arena */}
          <div className="relative aspect-square max-w-md mx-auto rounded-full border-2 border-dashed border-purple-500/30 bg-slate-950 flex items-center justify-center p-6 shadow-inner">
            {/* Concentric distance rings */}
            <div className="absolute inset-8 rounded-full border border-purple-500/10 pointer-events-none" />
            <div className="absolute inset-20 rounded-full border border-purple-500/15 pointer-events-none" />
            <div className="absolute inset-32 rounded-full border border-purple-500/20 pointer-events-none" />

            {/* Radar Crosshair lines */}
            <div className="absolute inset-x-0 h-[1px] bg-purple-500/20 pointer-events-none" />
            <div className="absolute inset-y-0 w-[1px] bg-purple-500/20 pointer-events-none" />

            {/* Directional Labels */}
            <span className="absolute top-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">FRONT</span>
            <span className="absolute bottom-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">BACK</span>
            <span className="absolute left-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">LEFT</span>
            <span className="absolute right-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">RIGHT</span>

            {/* Center Listener Head */}
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 border border-slate-700 shadow-lg text-white">
              <Headphones className="h-7 w-7 text-cyan-400" />
            </div>

            {/* Draggable Sound Puck */}
            <div
              style={{
                transform: `translate(${spatialPosition.x * 120}px, ${spatialPosition.y * 120}px)`,
                transition: spatialPreset === 'orbit' ? 'none' : 'transform 0.1s ease-out',
              }}
              className="absolute flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-white shadow-xl shadow-purple-500/50 cursor-pointer animate-pulse"
              onClick={() => {
                // Interactive reposition
                if (spatialPreset === 'manual') {
                  updateSpatialPosition(-spatialPosition.x || 0.8, -spatialPosition.y || 0.8);
                }
              }}
            >
              <Volume2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* 4. Hardware Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <HardwareMetricCard
            title="Frequency Output"
            value={isSweepOscillatorPlaying || isAutoSweeping ? `${frequency} Hz` : 'Standby'}
            subtext={currentFreqBand.band}
            status="optimal"
            icon={Music}
            copyable
          />

          <HardwareMetricCard
            title="Stereo Balance"
            value={activeChannelMode === 'off' ? 'Center (Pan 0)' : activeChannelMode.toUpperCase()}
            subtext="Isolated Web Audio Route"
            status="optimal"
            icon={Headphones}
            copyable
          />

          <HardwareMetricCard
            title="Waveform Mode"
            value={waveform.toUpperCase()}
            subtext="Harmonic Synthesis"
            status="good"
            icon={Activity}
          />

          <HardwareMetricCard
            title="Master Level"
            value={isMuted ? 'Muted' : `${masterVolume}%`}
            subtext="Safety Guard Enabled"
            status={masterVolume > 85 ? 'warning' : 'optimal'}
            icon={Volume2}
          />
        </div>
      </div>
    </HardwareTestLayout>
  );
};
