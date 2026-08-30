'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mouse,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Zap,
  Activity,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Sparkles,
  Gauge,
  Compass,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Move,
  Brush,
  Eraser,
  TrendingUp,
} from 'lucide-react';
import { ToolMetadata } from '@/config/categories';
import { HardwareTestLayout } from './common/HardwareTestLayout';
import { HardwareMetricCard } from './common/HardwareMetricCard';
import { cn } from '@/lib/utils';

export interface MouseTesterComponentProps {
  tool?: ToolMetadata | { name: string; description: string; slug?: string };
}

interface ButtonStats {
  clicks: number;
  doubleClicks: number;
  isPressed: boolean;
  lastClickTime: number;
}

interface ClickIntervalRecord {
  id: string;
  buttonName: string;
  intervalMs: number;
  isFault: boolean;
  timestamp: Date;
}

interface TrajectoryPoint {
  x: number;
  y: number;
  speed: number;
  time: number;
}

export const MouseTesterComponent: React.FC<MouseTesterComponentProps> = ({
  tool = {
    name: 'Mouse, Trackpad & Scroll Tester',
    description:
      'Test mouse buttons, scroll wheel speed, polling rate (Hz), movement smoothness, and detect microswitch double-click debounce faults 100% locally in your browser.',
    slug: 'mouse-test',
  },
}) => {
  // 1. Mouse Button State Map
  const [buttons, setButtons] = useState<{
    left: ButtonStats;
    middle: ButtonStats;
    right: ButtonStats;
    back: ButtonStats;
    forward: ButtonStats;
  }>({
    left: { clicks: 0, doubleClicks: 0, isPressed: false, lastClickTime: 0 },
    middle: { clicks: 0, doubleClicks: 0, isPressed: false, lastClickTime: 0 },
    right: { clicks: 0, doubleClicks: 0, isPressed: false, lastClickTime: 0 },
    back: { clicks: 0, doubleClicks: 0, isPressed: false, lastClickTime: 0 },
    forward: { clicks: 0, doubleClicks: 0, isPressed: false, lastClickTime: 0 },
  });

  // 2. Double-Click & Debounce Fault Tester (<80ms)
  const [clickRecords, setClickRecords] = useState<ClickIntervalRecord[]>([]);
  const [fastestClickMs, setFastestClickMs] = useState<number | null>(null);
  const [debounceFaultCount, setDebounceFaultCount] = useState<number>(0);

  // 3. Scroll Wheel State
  const [scrollDeltaY, setScrollDeltaY] = useState<number>(0);
  const [scrollDeltaX, setScrollDeltaX] = useState<number>(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | 'none'>('none');
  const [totalScrollNotches, setTotalScrollNotches] = useState<number>(0);
  const [scrollSpeedScore, setScrollSpeedScore] = useState<number>(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollSamplesRef = useRef<number[]>([]);

  // 4. Polling Rate & Tracking Arena State
  const [estimatedHz, setEstimatedHz] = useState<number>(0);
  const [maxHz, setMaxHz] = useState<number>(0);
  const [cursorSpeedPxSec, setCursorSpeedPxSec] = useState<number>(0);
  const [maxCursorSpeedPxSec, setMaxCursorSpeedPxSec] = useState<number>(0);
  const [isDrawingTrail, setIsDrawingTrail] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Canvas & Movement refs
  const arenaCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerEventTimestampsRef = useRef<number[]>([]);
  const lastPointerPosRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const trajectoryPointsRef = useRef<TrajectoryPoint[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Web Audio Context for synthesized microswitch click
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playClickSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2400, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.02);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.025);
    } catch {
      // Audio fallback
    }
  }, [soundEnabled]);

  // Button mapping helper
  const getButtonKey = (buttonNumber: number): 'left' | 'middle' | 'right' | 'back' | 'forward' | null => {
    switch (buttonNumber) {
      case 0:
        return 'left';
      case 1:
        return 'middle';
      case 2:
        return 'right';
      case 3:
        return 'back';
      case 4:
        return 'forward';
      default:
        return null;
    }
  };

  const getButtonName = (key: 'left' | 'middle' | 'right' | 'back' | 'forward'): string => {
    switch (key) {
      case 'left':
        return 'Left Click (Button 0)';
      case 'middle':
        return 'Middle Click / Wheel (Button 1)';
      case 'right':
        return 'Right Click (Button 2)';
      case 'back':
        return 'Side Back (Button 3)';
      case 'forward':
        return 'Side Forward (Button 4)';
    }
  };

  // Mouse Down Event Handler
  const handleMouseDown = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      e.preventDefault();
      const btnKey = getButtonKey(e.button);
      if (!btnKey) return;

      const now = performance.now();
      playClickSound();

      setButtons((prev) => {
        const curr = prev[btnKey];
        const delta = curr.lastClickTime > 0 ? now - curr.lastClickTime : null;
        const isDoubleClick = delta !== null && delta < 400;
        const isFault = delta !== null && delta > 0 && delta < 80;

        if (delta !== null && delta > 5) {
          const roundedDelta = Math.round(delta * 10) / 10;
          setFastestClickMs((prevFast) => (prevFast === null ? roundedDelta : Math.min(prevFast, roundedDelta)));

          if (isFault) {
            setDebounceFaultCount((f) => f + 1);
          }

          setClickRecords((records) => [
            {
              id: Math.random().toString(36).substring(2, 9),
              buttonName: getButtonName(btnKey),
              intervalMs: roundedDelta,
              isFault,
              timestamp: new Date(),
            },
            ...records.slice(0, 24),
          ]);
        }

        return {
          ...prev,
          [btnKey]: {
            clicks: curr.clicks + 1,
            doubleClicks: isDoubleClick ? curr.doubleClicks + 1 : curr.doubleClicks,
            isPressed: true,
            lastClickTime: now,
          },
        };
      });
    },
    [playClickSound]
  );

  // Mouse Up Event Handler
  const handleMouseUp = useCallback((e: React.MouseEvent | MouseEvent) => {
    e.preventDefault();
    const btnKey = getButtonKey(e.button);
    if (!btnKey) return;

    setButtons((prev) => ({
      ...prev,
      [btnKey]: {
        ...prev[btnKey],
        isPressed: false,
      },
    }));
  }, []);

  // Prevent Default Context Menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Wheel Event Handler
  const handleWheel = useCallback((e: React.WheelEvent | WheelEvent) => {
    e.preventDefault();

    const dY = e.deltaY;
    const dX = e.deltaX;

    setScrollDeltaY(Math.round(dY));
    setScrollDeltaX(Math.round(dX));
    setScrollDirection(dY < 0 ? 'up' : dY > 0 ? 'down' : 'none');
    setTotalScrollNotches((n) => n + 1);

    const absSpeed = Math.min(100, Math.round(Math.abs(dY) / 2));
    setScrollSpeedScore(absSpeed);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setScrollDirection('none');
      setScrollSpeedScore(0);
    }, 250);
  }, []);

  // Polling Rate & Arena Pointer Movement Handler
  const handleArenaPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const now = performance.now();
    const timestamps = pointerEventTimestampsRef.current;
    timestamps.push(now);

    // Keep timestamps in the last 1 second
    const oneSecAgo = now - 1000;
    while (timestamps.length > 0 && timestamps[0] < oneSecAgo) {
      timestamps.shift();
    }

    const currentHz = timestamps.length;
    setEstimatedHz(currentHz);
    setMaxHz((prevMax) => Math.max(prevMax, currentHz));

    // Calculate cursor velocity (pixels / second)
    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    if (lastPointerPosRef.current) {
      const dt = (now - lastPointerPosRef.current.time) / 1000; // seconds
      if (dt > 0.001) {
        const dx = currentX - lastPointerPosRef.current.x;
        const dy = currentY - lastPointerPosRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = Math.round(dist / dt);

        setCursorSpeedPxSec(speed);
        setMaxCursorSpeedPxSec((max) => Math.max(max, speed));

        trajectoryPointsRef.current.push({
          x: currentX,
          y: currentY,
          speed,
          time: now,
        });

        // Cap trajectory points
        if (trajectoryPointsRef.current.length > 150) {
          trajectoryPointsRef.current.shift();
        }
      }
    }

    lastPointerPosRef.current = { x: currentX, y: currentY, time: now };
  }, []);

  // Smooth Canvas Trajectory Render Loop
  useEffect(() => {
    const canvas = arenaCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      // Handle retina resolution
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      // Fade canvas slightly for motion trail
      ctx.fillStyle = 'rgba(10, 15, 30, 0.25)';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Trajectory Points
      const points = trajectoryPointsRef.current;
      if (points.length > 1 && isDrawingTrail) {
        for (let i = 1; i < points.length; i++) {
          const p1 = points[i - 1];
          const p2 = points[i];

          // Dynamic speed color gradient
          const normalizedSpeed = Math.min(1, p2.speed / 3000);
          const r = Math.round(6 + normalizedSpeed * 230);
          const g = Math.round(182 - normalizedSpeed * 80);
          const b = Math.round(212 + normalizedSpeed * 40);
          const alpha = (i / points.length) * 0.9;

          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.lineWidth = 2 + normalizedSpeed * 4;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }

        // Draw glowing leading cursor head
        const latest = points[points.length - 1];
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(latest.x, latest.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isDrawingTrail]);

  // Clear Canvas
  const handleClearCanvas = () => {
    trajectoryPointsRef.current = [];
    const canvas = arenaCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0a0f1e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  // Reset Test State
  const handleReset = () => {
    setButtons({
      left: { clicks: 0, doubleClicks: 0, isPressed: false, lastClickTime: 0 },
      middle: { clicks: 0, doubleClicks: 0, isPressed: false, lastClickTime: 0 },
      right: { clicks: 0, doubleClicks: 0, isPressed: false, lastClickTime: 0 },
      back: { clicks: 0, doubleClicks: 0, isPressed: false, lastClickTime: 0 },
      forward: { clicks: 0, doubleClicks: 0, isPressed: false, lastClickTime: 0 },
    });
    setClickRecords([]);
    setFastestClickMs(null);
    setDebounceFaultCount(0);
    setTotalScrollNotches(0);
    setScrollDeltaY(0);
    setScrollDeltaX(0);
    setEstimatedHz(0);
    setMaxHz(0);
    setCursorSpeedPxSec(0);
    setMaxCursorSpeedPxSec(0);
    handleClearCanvas();
  };

  // Export Diagnostic Report
  const handleExportReport = () => {
    const report = {
      test: 'ConvertHub Mouse, Scroll & Polling Rate Diagnostic Report',
      timestamp: new Date().toLocaleString(),
      buttonStats: {
        leftClicks: buttons.left.clicks,
        middleClicks: buttons.middle.clicks,
        rightClicks: buttons.right.clicks,
        sideBackClicks: buttons.back.clicks,
        sideForwardClicks: buttons.forward.clicks,
      },
      microswitchDiagnostics: {
        fastestIntervalMs: fastestClickMs ?? 'N/A',
        debounceFaultCount,
        verdict: debounceFaultCount === 0 ? 'Healthy Microswitches' : 'Debounce Chattering Fault Detected',
      },
      scrollDiagnostics: {
        totalNotches: totalScrollNotches,
        lastDeltaY: scrollDeltaY,
      },
      sensorTelemetry: {
        currentPollingRateHz: estimatedHz,
        peakPollingRateHz: maxHz,
        peakCursorSpeedPxSec: maxCursorSpeedPxSec,
      },
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mouse-test-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Polling Rate Tier Classification
  const getPollingRateGrade = (hz: number) => {
    if (hz >= 3500) return { label: '4000Hz - 8000Hz (Esports Elite)', status: 'optimal' as const };
    if (hz >= 900) return { label: '1000Hz (Gaming Standard)', status: 'optimal' as const };
    if (hz >= 450) return { label: '500Hz (High Performance)', status: 'good' as const };
    if (hz >= 220) return { label: '250Hz (Standard Desktop)', status: 'info' as const };
    if (hz >= 100) return { label: '125Hz (Office / Basic)', status: 'neutral' as const };
    return { label: 'Move Cursor in Arena to Test', status: 'neutral' as const };
  };

  const hzGrade = getPollingRateGrade(maxHz);

  return (
    <HardwareTestLayout
      tool={tool}
      isFullscreen={isFullscreen}
      onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
      onReset={handleReset}
      onExportReport={handleExportReport}
      reportData={{
        leftClicks: buttons.left.clicks,
        middleClicks: buttons.middle.clicks,
        rightClicks: buttons.right.clicks,
        backClicks: buttons.back.clicks,
        forwardClicks: buttons.forward.clicks,
        peakHz: maxHz,
        debounceFaultCount,
      }}
      statusBadge={{
        label: `Peak ${maxHz} Hz Sensor`,
        variant: maxHz > 450 ? 'success' : 'info',
      }}
      headerActions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold shadow-sm transition',
              soundEnabled
                ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-300'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
            )}
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-cyan-400" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span>{soundEnabled ? 'Click Sound ON' : 'Muted'}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* 1. Hardware Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <HardwareMetricCard
            title="Estimated Polling Rate"
            value={estimatedHz > 0 ? estimatedHz : 0}
            unit="Hz"
            status={hzGrade.status}
            statusLabel={hzGrade.label}
            icon={Gauge}
            subtext={`Peak Recorded: ${maxHz} Hz`}
            copyable
          />

          <HardwareMetricCard
            title="Total Clicks"
            value={
              buttons.left.clicks +
              buttons.middle.clicks +
              buttons.right.clicks +
              buttons.back.clicks +
              buttons.forward.clicks
            }
            unit="Clicks"
            status="neutral"
            statusLabel={`L: ${buttons.left.clicks} | R: ${buttons.right.clicks}`}
            icon={Mouse}
            subtext="Combined button actuation count."
            copyable
          />

          <HardwareMetricCard
            title="Fastest Click Interval"
            value={fastestClickMs !== null ? `${fastestClickMs}` : 'N/A'}
            unit="ms"
            status={
              fastestClickMs !== null && fastestClickMs < 80
                ? 'error'
                : fastestClickMs !== null
                ? 'optimal'
                : 'neutral'
            }
            statusLabel={
              debounceFaultCount > 0
                ? `${debounceFaultCount} Debounce Faults`
                : fastestClickMs !== null
                ? 'Normal Debounce'
                : 'Click to Test'
            }
            icon={Zap}
            subtext="Interval between consecutive clicks."
            copyable
          />

          <HardwareMetricCard
            title="Scroll Wheel Distance"
            value={totalScrollNotches}
            unit="Notches"
            status={totalScrollNotches > 0 ? 'optimal' : 'neutral'}
            statusLabel={scrollDirection !== 'none' ? `Scrolling ${scrollDirection.toUpperCase()}` : 'Ready'}
            icon={Compass}
            subtext={`Delta Y: ${scrollDeltaY}px`}
          />
        </div>

        {/* 2. Interactive Multi-Button 3D Mouse Diagram & Scroll Gauge */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Visual Mouse Tester Arena */}
          <div
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onContextMenu={handleContextMenu}
            onWheel={handleWheel}
            className="lg:col-span-6 relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl backdrop-blur-xl select-none flex flex-col items-center justify-between min-h-[460px] group cursor-pointer"
          >
            {/* Top Prompt */}
            <div className="w-full flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Mouse className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-200">Interactive Click & Scroll Zone</span>
              </div>
              <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
                Right-Click & Side Buttons Unlocked
              </span>
            </div>

            {/* SVG Visual 5-Button Mouse Graphic */}
            <div className="relative my-4 flex items-center justify-center">
              <svg width="220" height="340" viewBox="0 0 220 340" className="drop-shadow-2xl">
                {/* Mouse Chassis Base Glow */}
                <path
                  d="M 50 110 C 50 40, 170 40, 170 110 L 170 230 C 170 300, 50 300, 50 230 Z"
                  fill="#0f172a"
                  stroke="#1e293b"
                  strokeWidth="3"
                />

                {/* Left Button */}
                <path
                  d="M 53 105 C 53 45, 105 45, 105 105 L 105 145 L 53 145 Z"
                  fill={buttons.left.isPressed ? '#06b6d4' : buttons.left.clicks > 0 ? '#064e3b' : '#1e293b'}
                  stroke={buttons.left.isPressed ? '#67e8f9' : buttons.left.clicks > 0 ? '#10b981' : '#334155'}
                  strokeWidth="2"
                  className="transition-all duration-75"
                />
                <text
                  x="78"
                  y="100"
                  textAnchor="middle"
                  fill={buttons.left.isPressed ? '#020617' : '#e2e8f0'}
                  fontSize="12"
                  fontWeight="bold"
                >
                  LEFT
                </text>
                <text
                  x="78"
                  y="120"
                  textAnchor="middle"
                  fill={buttons.left.isPressed ? '#020617' : '#94a3b8'}
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {buttons.left.clicks}
                </text>

                {/* Right Button */}
                <path
                  d="M 115 105 C 115 45, 167 45, 167 105 L 167 145 L 115 145 Z"
                  fill={buttons.right.isPressed ? '#06b6d4' : buttons.right.clicks > 0 ? '#064e3b' : '#1e293b'}
                  stroke={buttons.right.isPressed ? '#67e8f9' : buttons.right.clicks > 0 ? '#10b981' : '#334155'}
                  strokeWidth="2"
                  className="transition-all duration-75"
                />
                <text
                  x="142"
                  y="100"
                  textAnchor="middle"
                  fill={buttons.right.isPressed ? '#020617' : '#e2e8f0'}
                  fontSize="12"
                  fontWeight="bold"
                >
                  RIGHT
                </text>
                <text
                  x="142"
                  y="120"
                  textAnchor="middle"
                  fill={buttons.right.isPressed ? '#020617' : '#94a3b8'}
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {buttons.right.clicks}
                </text>

                {/* Middle Wheel / Button 1 */}
                <rect
                  x="100"
                  y="70"
                  width="20"
                  height="46"
                  rx="6"
                  fill={buttons.middle.isPressed ? '#38bdf8' : scrollDirection !== 'none' ? '#0284c7' : '#334155'}
                  stroke={buttons.middle.isPressed ? '#bae6fd' : '#475569'}
                  strokeWidth="2"
                  className="transition-all duration-75"
                />
                {/* Scroll Tread lines */}
                <line x1="104" y1="80" x2="116" y2="80" stroke="#94a3b8" strokeWidth="1.5" />
                <line x1="104" y1="92" x2="116" y2="92" stroke="#94a3b8" strokeWidth="1.5" />
                <line x1="104" y1="104" x2="116" y2="104" stroke="#94a3b8" strokeWidth="1.5" />

                {/* Side Forward Button (Thumb) */}
                <path
                  d="M 46 160 C 42 160, 42 185, 46 185 L 50 185 L 50 160 Z"
                  fill={buttons.forward.isPressed ? '#06b6d4' : buttons.forward.clicks > 0 ? '#064e3b' : '#334155'}
                  stroke={buttons.forward.isPressed ? '#67e8f9' : '#475569'}
                  strokeWidth="1.5"
                />

                {/* Side Back Button (Thumb) */}
                <path
                  d="M 46 195 C 42 195, 42 220, 46 220 L 50 220 L 50 195 Z"
                  fill={buttons.back.isPressed ? '#06b6d4' : buttons.back.clicks > 0 ? '#064e3b' : '#334155'}
                  stroke={buttons.back.isPressed ? '#67e8f9' : '#475569'}
                  strokeWidth="1.5"
                />

                {/* Palm Rest RGB Logo Area */}
                <circle cx="110" cy="225" r="18" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
                <text x="110" y="230" textAnchor="middle" fill="#06b6d4" fontSize="14" fontWeight="black">
                  CX
                </text>
              </svg>

              {/* Live Scroll Direction Indicator Overlay */}
              {scrollDirection !== 'none' && (
                <div className="absolute top-10 flex flex-col items-center animate-bounce bg-slate-900/90 border border-cyan-500/50 px-3 py-1 rounded-full shadow-lg text-cyan-300 text-xs font-bold">
                  {scrollDirection === 'up' ? (
                    <div className="flex items-center gap-1">
                      <ArrowUp className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Scroll Up ({scrollDeltaY}px)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <ArrowDown className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Scroll Down (+{scrollDeltaY}px)</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Button Counters Strip */}
            <div className="w-full grid grid-cols-5 gap-2 pt-3 border-t border-slate-800/80 text-center">
              <div className="rounded-xl bg-slate-900/80 p-2 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">Left</span>
                <span className="font-mono text-xs font-bold text-white">{buttons.left.clicks}</span>
              </div>
              <div className="rounded-xl bg-slate-900/80 p-2 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">Middle</span>
                <span className="font-mono text-xs font-bold text-white">{buttons.middle.clicks}</span>
              </div>
              <div className="rounded-xl bg-slate-900/80 p-2 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">Right</span>
                <span className="font-mono text-xs font-bold text-white">{buttons.right.clicks}</span>
              </div>
              <div className="rounded-xl bg-slate-900/80 p-2 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">Back</span>
                <span className="font-mono text-xs font-bold text-white">{buttons.back.clicks}</span>
              </div>
              <div className="rounded-xl bg-slate-900/80 p-2 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">Forward</span>
                <span className="font-mono text-xs font-bold text-white">{buttons.forward.clicks}</span>
              </div>
            </div>
          </div>

          {/* Polling Rate & Movement Smoothness Tracking Arena */}
          <div className="lg:col-span-6 flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl backdrop-blur-xl">
            {/* Arena Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-400" />
                <h2 className="text-xs sm:text-sm font-bold text-white">Sensor Polling Rate & Drawing Arena</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDrawingTrail(!isDrawingTrail)}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition',
                    isDrawingTrail
                      ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-300'
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  )}
                >
                  <Brush className="h-3 w-3 inline mr-1" />
                  Trail
                </button>
                <button
                  type="button"
                  onClick={handleClearCanvas}
                  className="rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1 text-[11px] font-semibold text-slate-400 hover:text-white transition"
                >
                  <Eraser className="h-3 w-3 inline mr-1" />
                  Clear
                </button>
              </div>
            </div>

            {/* Interactive Canvas Area */}
            <div className="relative my-4 flex-1 min-h-[260px] rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950">
              <canvas
                ref={arenaCanvasRef}
                onPointerMove={handleArenaPointerMove}
                className="w-full h-full cursor-crosshair touch-none"
              />

              {/* Overlay telemetry badges */}
              <div className="pointer-events-none absolute top-3 left-3 flex flex-col gap-1.5">
                <div className="rounded-xl bg-slate-900/90 border border-slate-800 px-3 py-1.5 backdrop-blur-md">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Live Polling Rate</span>
                  <p className="font-mono text-base font-black text-cyan-400">{estimatedHz} Hz</p>
                </div>

                <div className="rounded-xl bg-slate-900/90 border border-slate-800 px-3 py-1.5 backdrop-blur-md">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Cursor Speed</span>
                  <p className="font-mono text-xs font-bold text-white">{cursorSpeedPxSec} px/s</p>
                </div>
              </div>

              {/* Arena Helper text */}
              {estimatedHz === 0 && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center p-4 text-slate-400">
                  <Move className="h-8 w-8 mb-2 text-cyan-500/50 animate-pulse" />
                  <p className="text-xs font-semibold text-slate-300">Move your mouse rapidly inside this arena</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Measures real-time Hz, jitter & trajectory</p>
                </div>
              )}
            </div>

            {/* Polling Rate Classification Tier Bar */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Peak: <strong className="text-cyan-400">{maxHz} Hz</strong></span>
              <span>Max Speed: <strong className="text-emerald-400">{maxCursorSpeedPxSec} px/s</strong></span>
            </div>
          </div>
        </div>

        {/* 3. Microswitch Double-Click Fault Diagnostics Log */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-lg">
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-800 gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white">Microswitch Double-Click & Debounce Fault Analyzer</h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Debounce Fault Threshold: &lt; 80 ms
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Explainer / Status Banner */}
            <div className="lg:col-span-5 space-y-3">
              <p className="text-xs text-slate-400 leading-relaxed">
                When copper spring leaves inside mouse switches (Omron, Kailh, Huano) wear out, a single physical click
                can chatter and send two rapid signals (&lt;80ms), causing unintended double-clicks in games or desktop tasks.
              </p>

              {debounceFaultCount > 0 ? (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-rose-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Potential Switch Fault Registered!</span>
                  </div>
                  <p className="text-[11px] text-rose-300/80">
                    {debounceFaultCount} click(s) registered below the 80ms threshold on a single stroke.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 text-emerald-300 text-xs">
                  <div className="flex items-center gap-2 font-bold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Microswitches Healthy</span>
                  </div>
                  <p className="text-[11px] text-emerald-400/80 mt-1">
                    No unintended rapid double-clicks registered under 80ms.
                  </p>
                </div>
              )}
            </div>

            {/* Interval History Table */}
            <div className="lg:col-span-7">
              <span className="block text-xs font-semibold text-slate-400 mb-2">
                Consecutive Click Speed Log (Last 25 Clicks):
              </span>
              <div className="h-44 overflow-y-auto rounded-2xl bg-slate-950/90 border border-slate-800 p-2 font-mono text-xs space-y-1">
                {clickRecords.length > 0 ? (
                  clickRecords.map((rec) => (
                    <div
                      key={rec.id}
                      className={cn(
                        'flex items-center justify-between px-3 py-1.5 rounded-xl border text-xs transition',
                        rec.isFault
                          ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{rec.buttonName}</span>
                        {rec.isFault && (
                          <span className="text-[10px] font-bold bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded">
                            FAULT &lt;80ms
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn('font-bold', rec.isFault ? 'text-rose-400' : 'text-cyan-400')}>
                          {rec.intervalMs} ms
                        </span>
                        <span className="text-slate-400 text-[10px]">{rec.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Perform rapid clicks in the test zone to log microswitch intervals.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </HardwareTestLayout>
  );
};
