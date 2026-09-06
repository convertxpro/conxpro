'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Monitor,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Eye,
  Sliders,
  Activity,
  Download,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  Grid,
  ShieldCheck,
  Gauge,
  Tv,
  Type,
  SunMedium,
  Palette,
} from 'lucide-react';
import { ToolMetadata } from '@/config/categories';
import { HardwareTestLayout } from './common/HardwareTestLayout';
import { HardwareMetricCard } from './common/HardwareMetricCard';
import { cn } from '@/lib/utils';

export interface ScreenTesterComponentProps {
  tool?: ToolMetadata | { name: string; description: string; slug?: string };
}

interface TestColor {
  id: string;
  name: string;
  hex: string;
  textColor: string;
  targetCheck: string;
  description: string;
  isPattern?: boolean;
}

const TEST_COLORS: TestColor[] = [
  {
    id: 'black',
    name: 'Pure Black',
    hex: '#000000',
    textColor: '#FFFFFF',
    targetCheck: 'Stuck / Bright Pixels',
    description: 'Highlights subpixels permanently stuck ON in Red, Green, or Blue.',
  },
  {
    id: 'white',
    name: 'Pure White',
    hex: '#FFFFFF',
    textColor: '#000000',
    targetCheck: 'Dead / Dark Pixels',
    description: 'Highlights subpixels permanently stuck OFF or completely dead.',
  },
  {
    id: 'red',
    name: 'Pure Red',
    hex: '#FF0000',
    textColor: '#FFFFFF',
    targetCheck: 'Red Subpixel Faults',
    description: 'Tests red OLED/LCD subpixel health and uniform brightness.',
  },
  {
    id: 'green',
    name: 'Pure Green',
    hex: '#00FF00',
    textColor: '#000000',
    targetCheck: 'Green Subpixel Faults',
    description: 'The human eye is most sensitive to green luminance anomalies.',
  },
  {
    id: 'blue',
    name: 'Pure Blue',
    hex: '#0000FF',
    textColor: '#FFFFFF',
    targetCheck: 'Blue Subpixel Faults',
    description: 'Tests blue subpixels, which experience the highest OLED wear.',
  },
  {
    id: 'yellow',
    name: 'Pure Yellow',
    hex: '#FFFF00',
    textColor: '#000000',
    targetCheck: 'Red + Green Convergence',
    description: 'Verifies dual subpixel blending without chromatic fringing.',
  },
  {
    id: 'cyan',
    name: 'Pure Cyan',
    hex: '#00FFFF',
    textColor: '#000000',
    targetCheck: 'Green + Blue Convergence',
    description: 'Tests mid-spectrum color saturation and backlight bleed.',
  },
  {
    id: 'magenta',
    name: 'Pure Magenta',
    hex: '#FF00FF',
    textColor: '#FFFFFF',
    targetCheck: 'Red + Blue Convergence',
    description: 'Checks extreme primary color blending and panel uniformity.',
  },
  {
    id: 'gray',
    name: '50% Neutral Gray',
    hex: '#808080',
    textColor: '#FFFFFF',
    targetCheck: 'Dirty Screen Effect (DSE)',
    description: 'Reveals backlight bleeding, IPS glow, and uniformity banding.',
  },
  {
    id: 'checkered',
    name: 'ANSI Contrast Checkerboard',
    hex: 'checkered',
    textColor: '#FFFFFF',
    targetCheck: 'Local Dimming & Blooming',
    description: 'Evaluates mini-LED zone blooming and ANSI contrast ratio.',
    isPattern: true,
  },
];

type ActiveTab = 'pixel' | 'refresh' | 'calibration' | 'clarity' | 'ufo';

export const ScreenTesterComponent: React.FC<ScreenTesterComponentProps> = ({
  tool = {
    name: 'Screen Display & Dead Pixel Checker',
    description:
      'Check screen refresh rate (Hz), detect dead pixels with fullscreen color cycles, and test contrast gradient banding.',
    slug: 'screen-test',
  },
}) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('pixel');

  // Fullscreen Dead Pixel State
  const [isDeadPixelFullscreen, setIsDeadPixelFullscreen] = useState<boolean>(false);
  const [activeColorIndex, setActiveColorIndex] = useState<number>(0);
  const [isAutoCycling, setIsAutoCycling] = useState<boolean>(false);
  const [cycleIntervalSec, setCycleIntervalSec] = useState<number>(3);
  const [dockVisible, setDockVisible] = useState<boolean>(true);
  const dockTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Refresh Rate (Hz) State
  const [detectedHz, setDetectedHz] = useState<number>(60);
  const [medianFrameTimeMs, setMedianFrameTimeMs] = useState<number>(16.67);
  const [minFrameTimeMs, setMinFrameTimeMs] = useState<number>(16.0);
  const [maxFrameTimeMs, setMaxFrameTimeMs] = useState<number>(17.2);
  const [jitterMs, setJitterMs] = useState<number>(0.15);
  const [droppedFrames, setDroppedFrames] = useState<number>(0);
  const [low1PctFps, setLow1PctFps] = useState<number>(59);
  const [isBenchmarkingHz, setIsBenchmarkingHz] = useState<boolean>(true);
  const [frameHistory, setFrameHistory] = useState<number[]>([]);

  // UFO Motion State
  const [ufoSpeed, setUfoSpeed] = useState<number>(960); // pixels per second

  // Display Specs / Telemetry State
  const [displaySpecs, setDisplaySpecs] = useState({
    screenWidth: 1920,
    screenHeight: 1080,
    availWidth: 1920,
    availHeight: 1040,
    windowWidth: 1920,
    windowHeight: 1080,
    devicePixelRatio: 1,
    colorDepth: 24,
    orientation: 'landscape-primary',
    isHdr: false,
    aspectRatio: '16:9',
  });

  // Copied State
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  // Fullscreen Container Ref
  const fullscreenContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasPacingRef = useRef<HTMLCanvasElement | null>(null);
  const ufoCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animation Frame References
  const hzRafIdRef = useRef<number | null>(null);
  const ufoRafIdRef = useRef<number | null>(null);
  const frameDeltasBufferRef = useRef<number[]>([]);
  const lastTimestampRef = useRef<number | null>(null);

  // Initialize Display Telemetry
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateSpecs = () => {
      const w = window.screen.width || 1920;
      const h = window.screen.height || 1080;
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const divisor = gcd(w, h);
      const ratio = `${w / divisor}:${h / divisor}`;

      const hdrCheck = window.matchMedia && window.matchMedia('(dynamic-range: high)').matches;

      setDisplaySpecs({
        screenWidth: w,
        screenHeight: h,
        availWidth: window.screen.availWidth || w,
        availHeight: window.screen.availHeight || h,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1,
        colorDepth: window.screen.colorDepth || 24,
        orientation: (window.screen.orientation && window.screen.orientation.type) || 'landscape-primary',
        isHdr: !!hdrCheck,
        aspectRatio: ratio === '8:5' ? '16:10' : ratio,
      });
    };

    updateSpecs();
    window.addEventListener('resize', updateSpecs);
    return () => window.removeEventListener('resize', updateSpecs);
  }, []);

  // -------------------------------------------------------------
  // 1. High-Precision Refresh Rate (Hz) Engine via requestAnimationFrame
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isBenchmarkingHz) return;

    frameDeltasBufferRef.current = [];
    lastTimestampRef.current = null;

    const sampleFrame = (timestamp: number) => {
      if (lastTimestampRef.current !== null) {
        const delta = timestamp - lastTimestampRef.current;
        // Filter out suspended tab pauses (> 200ms)
        if (delta > 1 && delta < 200) {
          frameDeltasBufferRef.current.push(delta);
          if (frameDeltasBufferRef.current.length > 120) {
            frameDeltasBufferRef.current.shift();
          }

          // Calculate running metrics periodically every 15 frames
          if (frameDeltasBufferRef.current.length >= 30 && frameDeltasBufferRef.current.length % 15 === 0) {
            const deltas = [...frameDeltasBufferRef.current];
            deltas.sort((a, b) => a - b);

            const mid = Math.floor(deltas.length / 2);
            const medianDelta = deltas.length % 2 !== 0 ? deltas[mid] : (deltas[mid - 1] + deltas[mid]) / 2;

            if (medianDelta > 0) {
              const hz = 1000 / medianDelta;
              const roundedHz = Math.round(hz * 10) / 10;
              setDetectedHz(roundedHz);
              setMedianFrameTimeMs(Math.round(medianDelta * 100) / 100);
              setMinFrameTimeMs(Math.round(deltas[0] * 100) / 100);
              setMaxFrameTimeMs(Math.round(deltas[deltas.length - 1] * 100) / 100);

              // Standard deviation (Jitter)
              const avg = deltas.reduce((acc, v) => acc + v, 0) / deltas.length;
              const variance = deltas.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / deltas.length;
              setJitterMs(Math.round(Math.sqrt(variance) * 100) / 100);

              // Dropped frames (> 1.5x expected frame time)
              const dropped = deltas.filter((d) => d > medianDelta * 1.5).length;
              setDroppedFrames(dropped);

              // 1% Low FPS (99th percentile frame time)
              const p99Index = Math.floor(deltas.length * 0.99);
              const p99Delta = deltas[p99Index] || medianDelta;
              setLow1PctFps(Math.max(1, Math.round(1000 / p99Delta)));

              setFrameHistory([...frameDeltasBufferRef.current]);
            }
          }
        }
      }

      lastTimestampRef.current = timestamp;
      hzRafIdRef.current = requestAnimationFrame(sampleFrame);
    };

    hzRafIdRef.current = requestAnimationFrame(sampleFrame);

    return () => {
      if (hzRafIdRef.current) cancelAnimationFrame(hzRafIdRef.current);
    };
  }, [isBenchmarkingHz]);

  // Draw Frame Pacing Canvas Waveform
  useEffect(() => {
    const canvas = canvasPacingRef.current;
    if (!canvas || frameHistory.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1) || 600;
    canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1) || 160;
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

    const logicalWidth = canvas.offsetWidth || 600;
    const logicalHeight = canvas.offsetHeight || 160;

    ctx.clearRect(0, 0, logicalWidth, logicalHeight);

    // Target Frame Line
    const targetDelta = medianFrameTimeMs || 16.67;
    const maxScaleMs = Math.max(35, targetDelta * 2.2);
    const targetY = logicalHeight - (targetDelta / maxScaleMs) * (logicalHeight - 20) - 10;

    // Draw Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    [0, 8.33, 16.67, 33.33].forEach((ms) => {
      const y = logicalHeight - (ms / maxScaleMs) * (logicalHeight - 20) - 10;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(logicalWidth, y);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '9px monospace';
      ctx.fillText(`${ms.toFixed(1)}ms`, 4, y - 2);
    });

    // Draw Target Baseline
    ctx.strokeStyle = '#06b6d4';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, targetY);
    ctx.lineTo(logicalWidth, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Frame Intervals Line Chart
    const stepX = logicalWidth / Math.max(frameHistory.length - 1, 1);
    ctx.beginPath();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;

    frameHistory.forEach((delta, idx) => {
      const x = idx * stepX;
      const y = logicalHeight - (Math.min(delta, maxScaleMs) / maxScaleMs) * (logicalHeight - 20) - 10;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw Highlight Dots for Jitter / Drops
    frameHistory.forEach((delta, idx) => {
      const x = idx * stepX;
      const y = logicalHeight - (Math.min(delta, maxScaleMs) / maxScaleMs) * (logicalHeight - 20) - 10;
      const isDrop = delta > targetDelta * 1.4;
      const isFast = delta < targetDelta * 0.7;

      if (isDrop || isFast) {
        ctx.fillStyle = isDrop ? '#ef4444' : '#f59e0b';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }, [frameHistory, medianFrameTimeMs]);

  // -------------------------------------------------------------
  // 2. UFO Motion Blur & Ghosting Canvas
  // -------------------------------------------------------------
  useEffect(() => {
    if (activeTab !== 'ufo') return;

    const canvas = ufoCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let posX = 0;
    let lastUfoTime = performance.now();

    const drawUfo = (x: number, y: number, trackSpeed: number, label: string) => {
      // Background lane
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, y - 30, canvas.width, 60);

      // Starfield / Grid lines on lane
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < canvas.width; gx += 40) {
        ctx.beginPath();
        ctx.moveTo(gx, y - 30);
        ctx.lineTo(gx, y + 30);
        ctx.stroke();
      }

      // UFO Body
      const ufoWidth = 64;
      const ufoHeight = 24;
      const cx = (x * (trackSpeed / ufoSpeed)) % (canvas.width + ufoWidth * 2) - ufoWidth;

      // Glow Dome
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.ellipse(cx, y - 6, 16, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Saucer Ring
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.ellipse(cx, y + 2, ufoWidth / 2, ufoHeight / 2 - 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Saucer Lights
      const lightColors = ['#ef4444', '#10b981', '#f59e0b', '#3b82f6'];
      for (let i = -2; i <= 2; i++) {
        ctx.fillStyle = lightColors[(Math.abs(i) + 1) % lightColors.length];
        ctx.beginPath();
        ctx.arc(cx + i * 11, y + 3, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Track Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText(label, 12, y - 12);
    };

    const renderUfoLoop = (timestamp: number) => {
      const dt = (timestamp - lastUfoTime) / 1000;
      lastUfoTime = timestamp;

      posX += ufoSpeed * dt;

      canvas.width = canvas.offsetWidth || 800;
      canvas.height = 240;

      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawUfo(posX, 45, ufoSpeed, `${ufoSpeed} px/s (${Math.round(detectedHz)} FPS Target)`);
      drawUfo(posX, 125, ufoSpeed / 2, `${ufoSpeed / 2} px/s (Half Speed)`);
      drawUfo(posX, 200, ufoSpeed / 4, `${ufoSpeed / 4} px/s (Quarter Speed)`);

      ufoRafIdRef.current = requestAnimationFrame(renderUfoLoop);
    };

    ufoRafIdRef.current = requestAnimationFrame(renderUfoLoop);

    return () => {
      if (ufoRafIdRef.current) cancelAnimationFrame(ufoRafIdRef.current);
    };
  }, [activeTab, ufoSpeed, detectedHz]);

  // -------------------------------------------------------------
  // 3. Fullscreen Dead Pixel Mode & Keyboard Navigation
  // -------------------------------------------------------------
  const enterDeadPixelFullscreen = useCallback(async () => {
    try {
      if (fullscreenContainerRef.current) {
        if (fullscreenContainerRef.current.requestFullscreen) {
          await fullscreenContainerRef.current.requestFullscreen();
        }
      }
      setIsDeadPixelFullscreen(true);
      setDockVisible(true);
    } catch (e) {
      console.warn('Fullscreen request failed, continuing in-window mode:', e);
      setIsDeadPixelFullscreen(true);
    }
  }, []);

  const exitDeadPixelFullscreen = useCallback(() => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    setIsDeadPixelFullscreen(false);
    setIsAutoCycling(false);
  }, []);

  // Listen to native fullscreen change events
  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement) {
        setIsDeadPixelFullscreen(false);
        setIsAutoCycling(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Auto-Cycle Timer
  useEffect(() => {
    if (!isAutoCycling || !isDeadPixelFullscreen) return;

    const timer = setInterval(() => {
      setActiveColorIndex((prev) => (prev + 1) % TEST_COLORS.length);
    }, cycleIntervalSec * 1000);

    return () => clearInterval(timer);
  }, [isAutoCycling, isDeadPixelFullscreen, cycleIntervalSec]);

  // Fullscreen Keyboard Controls & Mouse Dock Auto-hide
  useEffect(() => {
    if (!isDeadPixelFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        setActiveColorIndex((prev) => (prev + 1) % TEST_COLORS.length);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setActiveColorIndex((prev) => (prev - 1 + TEST_COLORS.length) % TEST_COLORS.length);
      } else if (e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAutoCycling((prev) => !prev);
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'x') {
        exitDeadPixelFullscreen();
      }
    };

    const handleMouseMove = () => {
      setDockVisible(true);
      if (dockTimeoutRef.current) clearTimeout(dockTimeoutRef.current);
      dockTimeoutRef.current = setTimeout(() => {
        setDockVisible(false);
      }, 2500);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
      if (dockTimeoutRef.current) clearTimeout(dockTimeoutRef.current);
    };
  }, [isDeadPixelFullscreen, exitDeadPixelFullscreen]);

  // Standard Refresh Rate Classification
  const classifyHzStandard = (hz: number) => {
    if (hz >= 340) return { label: '360 Hz Ultra Esports', badge: 'Ultra High-End', status: 'optimal' as const };
    if (hz >= 230) return { label: '240 Hz Esports Pro', badge: 'Competitive Gaming', status: 'optimal' as const };
    if (hz >= 160) return { label: '165 Hz Fast Gaming', badge: 'High-End Gaming', status: 'optimal' as const };
    if (hz >= 135) return { label: '144 Hz Gaming Standard', badge: 'Smooth Gaming', status: 'optimal' as const };
    if (hz >= 110) return { label: '120 Hz ProMotion / Console', badge: 'High Refresh', status: 'optimal' as const };
    if (hz >= 85) return { label: '90 Hz Mobile / Fast Office', badge: 'Smooth Desktop', status: 'good' as const };
    if (hz >= 70) return { label: '75 Hz Enhanced Desktop', badge: 'Entry Smooth', status: 'good' as const };
    if (hz >= 55) return { label: '60 Hz Standard Desktop', badge: 'Standard 60Hz', status: 'neutral' as const };
    return { label: `${hz} Hz Custom Display`, badge: 'Custom Panel', status: 'warning' as const };
  };

  const hzClassification = classifyHzStandard(detectedHz);

  // Export JSON Telemetry Report
  const handleExportReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      displaySpecs: {
        ...displaySpecs,
      },
      refreshRateBenchmark: {
        detectedHz,
        medianFrameTimeMs,
        minFrameTimeMs,
        maxFrameTimeMs,
        jitterMs,
        droppedFrames,
        low1PctFps,
        classification: hzClassification.label,
      },
      testCompleted: {
        deadPixelCheck: true,
        gradientContrastCheck: true,
        textClarityMatrix: true,
      },
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apextools-screen-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyTelemetry = () => {
    const text = `ApexTools Screen Diagnostic Report:
- Resolution: ${displaySpecs.screenWidth}x${displaySpecs.screenHeight} (${displaySpecs.aspectRatio})
- Refresh Rate: ${detectedHz} Hz (${hzClassification.label})
- Frame Time: ${medianFrameTimeMs} ms (Jitter: ${jitterMs} ms)
- 1% Low FPS: ${low1PctFps} FPS
- Pixel Ratio: ${displaySpecs.devicePixelRatio}x | Color Depth: ${displaySpecs.colorDepth}-bit
- HDR Support: ${displaySpecs.isHdr ? 'Yes (Wide Dynamic Range)' : 'No (Standard SDR)'}`;

    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const currentColor = TEST_COLORS[activeColorIndex];

  return (
    <>
      {/* ========================================================================= */}
      {/* FULLSCREEN DEAD PIXEL ARENA OVERLAY                                       */}
      {/* ========================================================================= */}
      {isDeadPixelFullscreen && (
        <div
          ref={fullscreenContainerRef}
          className="fixed inset-0 z-[999999] flex flex-col justify-between cursor-none select-none overflow-hidden transition-colors duration-200"
          style={{
            backgroundColor: currentColor.isPattern ? '#000000' : currentColor.hex,
            backgroundImage: currentColor.isPattern
              ? 'linear-gradient(45deg, #222 25%, transparent 25%), linear-gradient(-45deg, #222 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #222 75%), linear-gradient(-45deg, transparent 75%, #222 75%)'
              : 'none',
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px',
          }}
          onClick={() => setActiveColorIndex((prev) => (prev + 1) % TEST_COLORS.length)}
          onContextMenu={(e) => {
            e.preventDefault();
            setActiveColorIndex((prev) => (prev - 1 + TEST_COLORS.length) % TEST_COLORS.length);
          }}
        >
          {/* Floating Auto-Hiding Control Dock */}
          <div
            className={cn(
              'absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/20 shadow-2xl text-white transition-all duration-300 pointer-events-auto cursor-auto',
              dockVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Color Swatch Dots */}
            <div className="flex items-center gap-1.5 pr-2 border-r border-white/20">
              {TEST_COLORS.map((c, idx) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveColorIndex(idx)}
                  className={cn(
                    'w-6 h-6 rounded-full border-2 transition-all duration-150 relative flex items-center justify-center',
                    activeColorIndex === idx
                      ? 'border-cyan-400 scale-110 shadow-[0_0_10px_rgba(6,182,212,0.8)] ring-2 ring-white/50'
                      : 'border-white/30 hover:border-white/80 opacity-70 hover:opacity-100'
                  )}
                  style={{
                    backgroundColor: c.isPattern ? '#475569' : c.hex,
                  }}
                  title={`${c.name} - ${c.targetCheck}`}
                >
                  {activeColorIndex === idx && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
                </button>
              ))}
            </div>

            {/* Prev / Next */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveColorIndex((prev) => (prev - 1 + TEST_COLORS.length) % TEST_COLORS.length)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                title="Previous Color (Arrow Left)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono px-1">
                {activeColorIndex + 1}/{TEST_COLORS.length}
              </span>
              <button
                type="button"
                onClick={() => setActiveColorIndex((prev) => (prev + 1) % TEST_COLORS.length)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                title="Next Color (Space / Arrow Right)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Auto Cycle Toggle */}
            <button
              type="button"
              onClick={() => setIsAutoCycling(!isAutoCycling)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
                isAutoCycling
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                  : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10 hover:text-white'
              )}
              title="Toggle Auto Cycle (Press A)"
            >
              {isAutoCycling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isAutoCycling ? 'Cycling (3s)' : 'Auto'}</span>
            </button>

            {/* Current Target Info */}
            <div className="hidden sm:flex flex-col text-left pl-2 border-l border-white/20">
              <span className="text-xs font-semibold text-white">{currentColor.name}</span>
              <span className="text-[10px] text-white/60">{currentColor.targetCheck}</span>
            </div>

            {/* Exit Fullscreen */}
            <button
              type="button"
              onClick={exitDeadPixelFullscreen}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-medium ml-1 transition-colors"
              title="Exit Fullscreen (Escape or X)"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Exit (Esc)</span>
            </button>
          </div>

          {/* Bottom Transient Quick Hint */}
          <div
            className={cn(
              'absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-[11px] text-white/70 pointer-events-none transition-opacity duration-300',
              dockVisible ? 'opacity-100' : 'opacity-0'
            )}
          >
            Click screen or press Space to advance • Move mouse to reveal controls
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN HARDWARE TEST LAYOUT                                                 */}
      {/* ========================================================================= */}
      <HardwareTestLayout
        tool={tool}
        onReset={() => {
          frameDeltasBufferRef.current = [];
          setFrameHistory([]);
        }}
        onExportReport={handleExportReport}
        reportData={{
          detectedHz,
          medianFrameTimeMs,
          displaySpecs,
          jitterMs,
        }}
        statusBadge={{
          label: `${Math.round(detectedHz)} Hz • ${displaySpecs.screenWidth}×${displaySpecs.screenHeight}`,
          variant: detectedHz >= 115 ? 'success' : detectedHz >= 70 ? 'info' : 'warning',
        }}
        headerActions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyTelemetry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 transition-colors"
            >
              {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedReport ? 'Copied' : 'Copy Specs'}</span>
            </button>
            <button
              type="button"
              onClick={enterDeadPixelFullscreen}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/25 transition-all"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Fullscreen Check</span>
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Diagnostic Suite Tab Navigation */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
            {[
              { id: 'pixel', label: 'Dead Pixel Diagnostic', icon: Eye, badge: '8 Colors' },
              { id: 'refresh', label: 'Refresh Rate (Hz) Detector', icon: Gauge, badge: `${Math.round(detectedHz)} Hz` },
              { id: 'calibration', label: 'Contrast & Bit-Depth', icon: Palette, badge: '256 Steps' },
              { id: 'clarity', label: 'Subpixel & Text Clarity', icon: Type, badge: 'Anti-Aliasing' },
              { id: 'ufo', label: 'UFO Motion Ghosting', icon: Activity, badge: 'Motion Blur' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all',
                    isActive
                      ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full font-mono',
                      isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                    )}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Real-Time Metric Telemetry Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <HardwareMetricCard
              title="Refresh Rate"
              value={detectedHz.toFixed(1)}
              unit="Hz"
              subtext={hzClassification.label}
              status={hzClassification.status}
              icon={Gauge}
              copyable
            />
            <HardwareMetricCard
              title="Frame Delivery"
              value={medianFrameTimeMs.toFixed(2)}
              unit="ms"
              subtext={`Jitter: ±${jitterMs.toFixed(2)}ms`}
              status={jitterMs < 0.5 ? 'optimal' : jitterMs < 1.5 ? 'good' : 'warning'}
              icon={Activity}
              copyable
            />
            <HardwareMetricCard
              title="Display Geometry"
              value={`${displaySpecs.screenWidth}×${displaySpecs.screenHeight}`}
              unit={`(${displaySpecs.aspectRatio})`}
              subtext={`Scale: ${displaySpecs.devicePixelRatio}x | ${displaySpecs.colorDepth}-bit`}
              status="optimal"
              icon={Monitor}
              copyable
            />
            <HardwareMetricCard
              title="1% Low Stability"
              value={low1PctFps}
              unit="FPS"
              subtext={droppedFrames === 0 ? '0 Dropped Frames' : `${droppedFrames} Frame Spikes`}
              status={droppedFrames === 0 ? 'optimal' : 'good'}
              icon={Zap}
              copyable
            />
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: DEAD PIXEL CHECKER                                                 */}
          {/* ========================================================================= */}
          {activeTab === 'pixel' && (
            <div className="space-y-6">
              {/* Hero Fullscreen Launch Card */}
              <div className="relative rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/30 via-slate-900/90 to-slate-950 p-6 shadow-xl overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-xl">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Zero-Distraction Fullscreen Diagnostic</span>
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      Find Stuck & Dead Pixels in Pure Fullscreen
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Launches an edge-to-edge solid color field with zero UI elements to detect defective subpixels,
                      backlight bleed, and OLED burn-in with maximum visual contrast.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={enterDeadPixelFullscreen}
                    className="flex-shrink-0 flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>Launch Fullscreen Test</span>
                  </button>
                </div>
              </div>

              {/* Color Matrix Inspection Grid */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <span>Test Color Sequence & Fault Targets</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Click any color below to preview its specific diagnostic purpose:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {TEST_COLORS.map((c, idx) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setActiveColorIndex(idx);
                        enterDeadPixelFullscreen();
                      }}
                      className="group relative flex flex-col p-3 rounded-xl border border-slate-800 hover:border-cyan-500/50 bg-slate-950/60 hover:bg-slate-900/80 transition-all text-left"
                    >
                      <div
                        className="w-full h-12 rounded-lg border border-white/10 mb-2.5 shadow-inner transition-transform group-hover:scale-[1.02]"
                        style={{
                          backgroundColor: c.isPattern ? '#1e293b' : c.hex,
                        }}
                      />
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                        {c.name}
                      </span>
                      <span className="text-[11px] text-cyan-400/90 font-medium">{c.targetCheck}</span>
                      <span className="text-[10px] text-slate-500 mt-1 line-clamp-2">{c.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Diagnostic Guide Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Dead Pixels (Black Dot on White)</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    A dead pixel is completely unpowered and will show as a tiny black square on pure white and bright
                    primary backgrounds.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Stuck Pixels (Bright Dot on Black)</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    A stuck pixel has one or more subpixels stuck in the ON state. It shows up as a bright red, green, or
                    blue dot against pure black.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>IPS Glow & Backlight Bleed</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Best observed on 50% gray and black in a dim room. Uneven bright patches at screen corners indicate
                    backlight bleed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: REFRESH RATE (HZ) DETECTOR                                         */}
          {/* ========================================================================= */}
          {activeTab === 'refresh' && (
            <div className="space-y-6">
              {/* Hero Refresh Rate Gauge */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-5 h-5 text-cyan-400" />
                      <h3 className="text-base font-bold text-white">Live Display Frame Interval & Pacing Engine</h3>
                    </div>
                    <p className="text-xs text-slate-400">
                      Calculates high-precision screen refresh rate using high-resolution performance.now() timestamps
                      over rolling frames.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsBenchmarkingHz(!isBenchmarkingHz)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                        isBenchmarkingHz
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      )}
                    >
                      {isBenchmarkingHz ? <Activity className="w-3.5 h-3.5 animate-pulse" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isBenchmarkingHz ? 'Live Sampling Active' : 'Resume Benchmark'}</span>
                    </button>
                  </div>
                </div>

                {/* Hero Meter Display */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-5 flex flex-col justify-between">
                    <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Detected Refresh Rate</span>
                    <div className="my-3 flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono">
                        {Math.round(detectedHz)}
                      </span>
                      <span className="text-xl font-bold text-cyan-400">Hz</span>
                      <span className="text-xs font-mono text-slate-400 ml-auto">
                        ({detectedHz.toFixed(2)} Hz exact)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-cyan-300 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      <span>{hzClassification.label}</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Frame Interval (Δt)</span>
                    <div className="my-3 flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono">
                        {medianFrameTimeMs.toFixed(2)}
                      </span>
                      <span className="text-xl font-bold text-slate-400">ms</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Min: {minFrameTimeMs.toFixed(1)}ms</span>
                      <span>Max: {maxFrameTimeMs.toFixed(1)}ms</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Frame Pacing & Jitter</span>
                    <div className="my-3 flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono">
                        ±{jitterMs.toFixed(2)}
                      </span>
                      <span className="text-xl font-bold text-slate-400">ms</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full font-medium',
                          jitterMs < 0.4
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        )}
                      >
                        {jitterMs < 0.4 ? 'Ultra-Consistent Pacing' : 'Normal Desktop Jitter'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Real-time Frame Pacing Waveform Canvas */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Live Frame Delivery Stability Waveform</span>
                    <span>Target: {medianFrameTimeMs.toFixed(2)} ms / frame</span>
                  </div>
                  <div className="h-40 w-full rounded-xl border border-slate-800 bg-slate-950 relative overflow-hidden">
                    <canvas ref={canvasPacingRef} className="w-full h-full block" />
                  </div>
                </div>
              </div>

              {/* Standard Refresh Rate Tier Comparison Table */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
                <h4 className="text-sm font-semibold text-white">Display Standard Frequencies & Ideal Frame Times</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                  {[
                    { hz: 60, ms: '16.67ms', label: 'Standard' },
                    { hz: 75, ms: '13.33ms', label: 'Office' },
                    { hz: 90, ms: '11.11ms', label: 'Mobile' },
                    { hz: 120, ms: '8.33ms', label: 'ProMotion' },
                    { hz: 144, ms: '6.94ms', label: 'Gaming' },
                    { hz: 165, ms: '6.06ms', label: 'Fast Game' },
                    { hz: 240, ms: '4.17ms', label: 'Esports' },
                    { hz: 360, ms: '2.78ms', label: 'Ultra Pro' },
                  ].map((tier) => {
                    const isCurrent = Math.abs(detectedHz - tier.hz) < 3;
                    return (
                      <div
                        key={tier.hz}
                        className={cn(
                          'p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all',
                          isCurrent
                            ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 ring-2 ring-cyan-500/30'
                            : 'border-slate-800 bg-slate-950/40 text-slate-400'
                        )}
                      >
                        <span className="text-base font-bold font-mono">{tier.hz} Hz</span>
                        <span className="text-[11px] font-mono text-slate-400">{tier.ms}</span>
                        <span className="text-[10px] mt-1 opacity-80">{tier.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CONTRAST, GAMMA & 10-BIT COLOR BANDING MATRIX                      */}
          {/* ========================================================================= */}
          {activeTab === 'calibration' && (
            <div className="space-y-6">
              {/* 256-Step Grayscale Dynamic Range Ramp */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <SunMedium className="w-4 h-4 text-cyan-400" />
                      <span>256-Step Linear Grayscale Dynamic Range Ramp</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Tests continuous luminance progression from pure black (0) to pure white (255) without crushing.
                    </p>
                  </div>
                </div>

                {/* 256 Bars Visualization */}
                <div className="h-14 w-full rounded-xl border border-slate-700 overflow-hidden flex shadow-inner">
                  {Array.from({ length: 64 }).map((_, i) => {
                    const val = Math.floor((i / 63) * 255);
                    return (
                      <div
                        key={i}
                        className="flex-1 h-full transition-opacity hover:opacity-80"
                        style={{ backgroundColor: `rgb(${val}, ${val}, ${val})` }}
                        title={`Luminance Level: ${val}/255 (${Math.round((val / 255) * 100)}%)`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Shadow (0-15) and Highlight (240-255) Detail Inspectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Shadow Detail */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Shadow Detail Inspector (Levels 0 to 15)</span>
                    <span className="text-[10px] text-slate-400">Detects Black Crush</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    You should be able to distinguish box #1 or #2 from box #0 in a dark viewing environment:
                  </p>
                  <div className="grid grid-cols-8 gap-1.5 pt-1">
                    {Array.from({ length: 16 }).map((_, i) => {
                      const level = i * 2; // 0, 2, 4, ... 30
                      return (
                        <div
                          key={i}
                          className="h-12 rounded-lg border border-slate-800 flex flex-col items-center justify-end p-1 text-[9px] font-mono font-bold"
                          style={{ backgroundColor: `rgb(${level}, ${level}, ${level})`, color: level > 14 ? '#fff' : '#666' }}
                        >
                          <span>{level}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Highlight Detail */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Highlight Detail Inspector (Levels 225 to 255)</span>
                    <span className="text-[10px] text-slate-400">Detects White Clipping</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    You should distinguish box #254 from pure white box #255 without contrast blowout:
                  </p>
                  <div className="grid grid-cols-8 gap-1.5 pt-1">
                    {Array.from({ length: 16 }).map((_, i) => {
                      const level = 225 + i * 2; // 225 to 255
                      return (
                        <div
                          key={i}
                          className="h-12 rounded-lg border border-slate-700 flex flex-col items-center justify-end p-1 text-[9px] font-mono font-bold text-slate-900"
                          style={{ backgroundColor: `rgb(${level}, ${level}, ${level})` }}
                        >
                          <span>{level}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RGB 8-Bit vs 10-Bit Color Banding Gradient Matrix */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Palette className="w-4 h-4 text-cyan-400" />
                    <span>Linear RGB Color Banding & Bit-Depth Evaluation</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Observe the smooth gradients below. Stepping or vertical stripes indicate 6-bit panel dithering or
                    color banding.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Full Spectrum */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-slate-400">Visible Light Spectrum</span>
                    <div className="h-8 w-full rounded-lg bg-gradient-to-r from-red-600 via-yellow-500 via-green-500 via-cyan-500 via-blue-600 to-magenta-600 shadow-inner" />
                  </div>

                  {/* Red Ramp */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-slate-400">Red Channel (0 - 255)</span>
                    <div className="h-7 w-full rounded-lg bg-gradient-to-r from-black to-red-600 shadow-inner" />
                  </div>

                  {/* Green Ramp */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-slate-400">Green Channel (0 - 255)</span>
                    <div className="h-7 w-full rounded-lg bg-gradient-to-r from-black to-green-600 shadow-inner" />
                  </div>

                  {/* Blue Ramp */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-slate-400">Blue Channel (0 - 255)</span>
                    <div className="h-7 w-full rounded-lg bg-gradient-to-r from-black to-blue-600 shadow-inner" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: SUBPIXEL & TEXT CLARITY MATRIX                                     */}
          {/* ========================================================================= */}
          {activeTab === 'clarity' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Type className="w-4 h-4 text-cyan-400" />
                    <span>Subpixel Font Rendering & Text Sharpness Matrix</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Checks font legibility, Windows ClearType subpixel RGB alignment, and chromatic text fringing.
                  </p>
                </div>

                {/* Dark Background Matrix */}
                <div className="rounded-xl border border-slate-800 bg-black p-5 space-y-4 text-white">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-semibold text-slate-400">Light on Pure Black (#000000)</span>
                    <span className="text-[10px] text-cyan-400 font-mono">100 to 900 Weight Range</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { size: '8px', text: 'The quick brown fox jumps over the lazy dog (8px Tiny)' },
                      { size: '11px', text: 'ApexTools display diagnostic benchmark evaluates edge sharpness (11px Small)' },
                      { size: '14px', text: 'Subpixel text rendering should have crisp edges without color halo (14px Standard)' },
                      { size: '20px', text: 'High DPI & 4K Resolution Clarity Inspection (20px Large)' },
                      { size: '28px', text: 'PERFECT 240HZ CLARITY (28px Title)' },
                    ].map((row, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                        <span className="text-[10px] font-mono text-slate-500 w-12 flex-shrink-0">{row.size}</span>
                        <span style={{ fontSize: row.size }} className="leading-snug">
                          {row.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Light Background Matrix */}
                <div className="rounded-xl border border-slate-300 bg-white p-5 space-y-4 text-slate-950">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-semibold text-slate-600">Dark on Pure White (#FFFFFF)</span>
                    <span className="text-[10px] text-blue-600 font-mono">Anti-Aliasing Test</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { size: '9px', weight: 400, text: 'Micro-font legibility test for dense code & documents (9px Regular)' },
                      { size: '13px', weight: 600, text: 'Anti-aliased curved letterforms (O, S, e, g) without jagged pixels (13px SemiBold)' },
                      { size: '18px', weight: 800, text: 'Ultra-Bold Font Edge Smoothness & Contrast (18px ExtraBold)' },
                    ].map((row, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                        <span className="text-[10px] font-mono text-slate-400 w-12 flex-shrink-0">{row.size}</span>
                        <span style={{ fontSize: row.size, fontWeight: row.weight }} className="leading-snug">
                          {row.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: UFO MOTION BLUR & GHOSTING SIMULATOR                               */}
          {/* ========================================================================= */}
          {activeTab === 'ufo' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-cyan-400" />
                      <span>UFO Motion Blur, Response Time & Ghosting Simulator</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Pursue the moving UFO with your eyes. Ghost trails or inverted colors indicate slow pixel response
                      (IPS/VA) or aggressive overdrive overshoot (inverse ghosting).
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">Speed:</span>
                    {[480, 960, 1440].map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => setUfoSpeed(spd)}
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors',
                          ufoSpeed === spd
                            ? 'bg-cyan-500 text-white font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        )}
                      >
                        {spd} px/s
                      </button>
                    ))}
                  </div>
                </div>

                {/* UFO Canvas */}
                <div className="rounded-xl border border-slate-800 bg-black overflow-hidden shadow-2xl">
                  <canvas ref={ufoCanvasRef} className="w-full h-60 block" />
                </div>

                {/* UFO Guide */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/40 space-y-1">
                    <span className="font-semibold text-slate-300">Smooth Track</span>
                    <p className="text-slate-400 text-[11px]">
                      At {Math.round(detectedHz)}Hz, motion is synced with the panel refresh rate for minimal micro-stutter.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/40 space-y-1">
                    <span className="font-semibold text-slate-300">Trail Behind UFO</span>
                    <p className="text-slate-400 text-[11px]">
                      Dark trails indicate pixel transition response time latency (common on VA gaming panels).
                    </p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/40 space-y-1">
                    <span className="font-semibold text-slate-300">Bright Halo Ahead</span>
                    <p className="text-slate-400 text-[11px]">
                      White halos (coronas) indicate display overdrive is set too high (reduce monitor Response Time setting).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </HardwareTestLayout>
    </>
  );
};
