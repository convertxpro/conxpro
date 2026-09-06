'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Keyboard,
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
  ShieldCheck,
  CheckCircle2,
  Layers,
  Sparkles,
  Sliders,
  Flame,
  Info,
  Clock,
  Gauge,
  Lock,
  Unlock,
  CornerDownLeft,
} from 'lucide-react';
import { ToolMetadata } from '@/config/categories';
import { HardwareTestLayout } from './common/HardwareTestLayout';
import { HardwareMetricCard } from './common/HardwareMetricCard';
import { cn } from '@/lib/utils';

export interface KeyboardTesterComponentProps {
  tool?: ToolMetadata | { name: string; description: string; slug?: string };
}

// Supported Key Layout Formats
type KeyboardLayout = '104' | '80' | '60';
type SoundProfile = 'clicky' | 'tactile' | 'linear' | 'bubble' | 'none';

interface KeyEventLog {
  id: string;
  key: string;
  code: string;
  keyCode: number;
  location: number;
  locationName: string;
  repeat: boolean;
  timestamp: number;
  interval?: number;
}

interface ChatterIncident {
  id: string;
  code: string;
  key: string;
  intervalMs: number;
  timestamp: Date;
}

interface KeyDefinition {
  code: string;
  label: string;
  subLabel?: string;
  width?: string; // Tailwind class e.g. 'w-12' or 'w-16' or flex grow
  flexGrow?: number;
  isSpecial?: boolean;
}

// Layout definitions
const ROW_ESC_FUNCTION: KeyDefinition[] = [
  { code: 'Escape', label: 'Esc', width: 'w-10 sm:w-12', isSpecial: true },
  { code: 'F1', label: 'F1' },
  { code: 'F2', label: 'F2' },
  { code: 'F3', label: 'F3' },
  { code: 'F4', label: 'F4' },
  { code: 'F5', label: 'F5' },
  { code: 'F6', label: 'F6' },
  { code: 'F7', label: 'F7' },
  { code: 'F8', label: 'F8' },
  { code: 'F9', label: 'F9' },
  { code: 'F10', label: 'F10' },
  { code: 'F11', label: 'F11' },
  { code: 'F12', label: 'F12' },
];

const ROW_NAV_TOP: KeyDefinition[] = [
  { code: 'PrintScreen', label: 'PrtSc', isSpecial: true },
  { code: 'ScrollLock', label: 'ScrLk', isSpecial: true },
  { code: 'Pause', label: 'Pause', isSpecial: true },
];

const ROW_1_MAIN: KeyDefinition[] = [
  { code: 'Backquote', label: '~', subLabel: '`' },
  { code: 'Digit1', label: '!', subLabel: '1' },
  { code: 'Digit2', label: '@', subLabel: '2' },
  { code: 'Digit3', label: '#', subLabel: '3' },
  { code: 'Digit4', label: '$', subLabel: '4' },
  { code: 'Digit5', label: '%', subLabel: '5' },
  { code: 'Digit6', label: '^', subLabel: '6' },
  { code: 'Digit7', label: '&', subLabel: '7' },
  { code: 'Digit8', label: '*', subLabel: '8' },
  { code: 'Digit9', label: '(', subLabel: '9' },
  { code: 'Digit0', label: ')', subLabel: '0' },
  { code: 'Minus', label: '_', subLabel: '-' },
  { code: 'Equal', label: '+', subLabel: '=' },
  { code: 'Backspace', label: 'Backspace', width: 'w-16 sm:w-20', isSpecial: true },
];

const ROW_1_NAV: KeyDefinition[] = [
  { code: 'Insert', label: 'Ins', isSpecial: true },
  { code: 'Home', label: 'Home', isSpecial: true },
  { code: 'PageUp', label: 'PgUp', isSpecial: true },
];

const ROW_1_NUM: KeyDefinition[] = [
  { code: 'NumLock', label: 'Num', isSpecial: true },
  { code: 'NumpadDivide', label: '/' },
  { code: 'NumpadMultiply', label: '*' },
  { code: 'NumpadSubtract', label: '-' },
];

const ROW_2_MAIN: KeyDefinition[] = [
  { code: 'Tab', label: 'Tab', width: 'w-14 sm:w-16', isSpecial: true },
  { code: 'KeyQ', label: 'Q' },
  { code: 'KeyW', label: 'W' },
  { code: 'KeyE', label: 'E' },
  { code: 'KeyR', label: 'R' },
  { code: 'KeyT', label: 'T' },
  { code: 'KeyY', label: 'Y' },
  { code: 'KeyU', label: 'U' },
  { code: 'KeyI', label: 'I' },
  { code: 'KeyO', label: 'O' },
  { code: 'KeyP', label: 'P' },
  { code: 'BracketLeft', label: '{', subLabel: '[' },
  { code: 'BracketRight', label: '}', subLabel: ']' },
  { code: 'Backslash', label: '|', subLabel: '\\', width: 'w-12 sm:w-14' },
];

const ROW_2_NAV: KeyDefinition[] = [
  { code: 'Delete', label: 'Del', isSpecial: true },
  { code: 'End', label: 'End', isSpecial: true },
  { code: 'PageDown', label: 'PgDn', isSpecial: true },
];

const ROW_2_NUM: KeyDefinition[] = [
  { code: 'Numpad7', label: '7', subLabel: 'Home' },
  { code: 'Numpad8', label: '8', subLabel: '▲' },
  { code: 'Numpad9', label: '9', subLabel: 'PgUp' },
  { code: 'NumpadAdd', label: '+', width: 'w-9 sm:w-10' },
];

const ROW_3_MAIN: KeyDefinition[] = [
  { code: 'CapsLock', label: 'Caps', width: 'w-16 sm:w-20', isSpecial: true },
  { code: 'KeyA', label: 'A' },
  { code: 'KeyS', label: 'S' },
  { code: 'KeyD', label: 'D' },
  { code: 'KeyF', label: 'F' },
  { code: 'KeyG', label: 'G' },
  { code: 'KeyH', label: 'H' },
  { code: 'KeyJ', label: 'J' },
  { code: 'KeyK', label: 'K' },
  { code: 'KeyL', label: 'L' },
  { code: 'Semicolon', label: ':', subLabel: ';' },
  { code: 'Quote', label: '"', subLabel: "'" },
  { code: 'Enter', label: 'Enter', width: 'w-16 sm:w-20', isSpecial: true },
];

const ROW_3_NUM: KeyDefinition[] = [
  { code: 'Numpad4', label: '4', subLabel: '◀' },
  { code: 'Numpad5', label: '5' },
  { code: 'Numpad6', label: '6', subLabel: '▶' },
];

const ROW_4_MAIN: KeyDefinition[] = [
  { code: 'ShiftLeft', label: 'Shift', width: 'w-20 sm:w-24', isSpecial: true },
  { code: 'KeyZ', label: 'Z' },
  { code: 'KeyX', label: 'X' },
  { code: 'KeyC', label: 'C' },
  { code: 'KeyV', label: 'V' },
  { code: 'KeyB', label: 'B' },
  { code: 'KeyN', label: 'N' },
  { code: 'KeyM', label: 'M' },
  { code: 'Comma', label: '<', subLabel: ',' },
  { code: 'Period', label: '>', subLabel: '.' },
  { code: 'Slash', label: '?', subLabel: '/' },
  { code: 'ShiftRight', label: 'Shift', width: 'w-20 sm:w-24', isSpecial: true },
];

const ROW_4_NAV: KeyDefinition[] = [
  { code: 'ArrowUp', label: '▲', isSpecial: true },
];

const ROW_4_NUM: KeyDefinition[] = [
  { code: 'Numpad1', label: '1', subLabel: 'End' },
  { code: 'Numpad2', label: '2', subLabel: '▼' },
  { code: 'Numpad3', label: '3', subLabel: 'PgDn' },
  { code: 'NumpadEnter', label: 'Enter', width: 'w-9 sm:w-10', isSpecial: true },
];

const ROW_5_MAIN: KeyDefinition[] = [
  { code: 'ControlLeft', label: 'Ctrl', width: 'w-12 sm:w-14', isSpecial: true },
  { code: 'MetaLeft', label: 'Win', width: 'w-10 sm:w-12', isSpecial: true },
  { code: 'AltLeft', label: 'Alt', width: 'w-10 sm:w-12', isSpecial: true },
  { code: 'Space', label: 'Space', width: 'w-52 sm:w-64', isSpecial: true },
  { code: 'AltRight', label: 'Alt', width: 'w-10 sm:w-12', isSpecial: true },
  { code: 'MetaRight', label: 'Win', width: 'w-10 sm:w-12', isSpecial: true },
  { code: 'ContextMenu', label: 'Menu', width: 'w-10 sm:w-12', isSpecial: true },
  { code: 'ControlRight', label: 'Ctrl', width: 'w-12 sm:w-14', isSpecial: true },
];

const ROW_5_NAV: KeyDefinition[] = [
  { code: 'ArrowLeft', label: '◀', isSpecial: true },
  { code: 'ArrowDown', label: '▼', isSpecial: true },
  { code: 'ArrowRight', label: '▶', isSpecial: true },
];

const ROW_5_NUM: KeyDefinition[] = [
  { code: 'Numpad0', label: '0', subLabel: 'Ins', width: 'w-20 sm:w-22' },
  { code: 'NumpadDecimal', label: '.', subLabel: 'Del' },
];

// Map location number to human string
const getLocationName = (loc: number): string => {
  switch (loc) {
    case 1:
      return 'Left';
    case 2:
      return 'Right';
    case 3:
      return 'Numpad';
    default:
      return 'Standard';
  }
};

export const KeyboardTesterComponent: React.FC<KeyboardTesterComponentProps> = ({
  tool = {
    name: 'Keyboard & Key Ghosting Tester',
    description:
      'Interactive virtual keyboard tester with anti-ghosting multi-key rollover benchmark, key repeat latency, and mechanical switch chatter fault detection.',
    slug: 'keyboard-test',
  },
}) => {
  // 1. Layout & View Options
  const [layout, setLayout] = useState<KeyboardLayout>('104');
  const [isTestAreaFocused, setIsTestAreaFocused] = useState<boolean>(true);
  const [soundProfile, setSoundProfile] = useState<SoundProfile>('clicky');
  const [soundVolume, setSoundVolume] = useState<number>(40);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // 2. Key States (Active & Tested History)
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [testedKeys, setTestedKeys] = useState<Set<string>>(new Set());
  const [totalKeypressCount, setTotalKeypressCount] = useState<number>(0);
  const [maxSimultaneousKeys, setMaxSimultaneousKeys] = useState<number>(0);

  // 3. Telemetry & Latency
  const [latestEvent, setLatestEvent] = useState<KeyEventLog | null>(null);
  const [eventHistory, setEventHistory] = useState<KeyEventLog[]>([]);
  const [keyRepeatInterval, setKeyRepeatInterval] = useState<number | null>(null);
  const [lastEventTime, setLastEventTime] = useState<number>(0);

  // 4. Switch Chatter Fault Detection (<30ms release & repress)
  const [chatterIncidents, setChatterIncidents] = useState<ChatterIncident[]>([]);
  const keyReleaseTimestampsRef = useRef<Map<string, number>>(new Map());

  // Web Audio Context for Synthesizing Mechanical Switch Sounds
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play synthesized click
  const playKeySound = useCallback(
    (profile: SoundProfile) => {
      if (profile === 'none') return;
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            audioCtxRef.current = new AudioContextClass();
          }
        }
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const now = ctx.currentTime;
        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);
        const vol = (soundVolume / 100) * 0.4;

        if (profile === 'clicky') {
          // Sharp snap + high frequency click
          const osc = ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1800, now);
          osc.frequency.exponentialRampToValueAtTime(120, now + 0.035);

          gainNode.gain.setValueAtTime(vol, now);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

          osc.connect(gainNode);
          osc.start(now);
          osc.stop(now + 0.04);
        } else if (profile === 'tactile') {
          // Thumpy tactile sound
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(650, now);
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.045);

          gainNode.gain.setValueAtTime(vol * 0.9, now);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

          osc.connect(gainNode);
          osc.start(now);
          osc.stop(now + 0.05);
        } else if (profile === 'linear') {
          // Soft muted thud
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(60, now + 0.05);

          gainNode.gain.setValueAtTime(vol * 0.7, now);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

          osc.connect(gainNode);
          osc.start(now);
          osc.stop(now + 0.06);
        } else if (profile === 'bubble') {
          // Playful popping bubble
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400 + Math.random() * 300, now);
          osc.frequency.exponentialRampToValueAtTime(1200, now + 0.06);

          gainNode.gain.setValueAtTime(vol, now);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

          osc.connect(gainNode);
          osc.start(now);
          osc.stop(now + 0.07);
        }
      } catch {
        // Ignore audio failure
      }
    },
    [soundVolume]
  );

  // Key Down Handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // If user isn't in test mode, ignore
      if (!isTestAreaFocused) return;

      // Prevent standard browser shortcuts inside the testing zone (e.g. Tab, Alt, F1-F12, Backspace, Space, Arrow keys)
      const suppressKeys = [
        'Tab',
        'Alt',
        'F1',
        'F2',
        'F3',
        'F4',
        'F5',
        'F6',
        'F7',
        'F8',
        'F9',
        'F10',
        'F11',
        'F12',
        'Backspace',
        'Space',
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'ContextMenu',
        'PageUp',
        'PageDown',
        'Home',
        'End',
        'Insert',
        'Delete',
      ];
      if (suppressKeys.includes(e.key) || suppressKeys.includes(e.code) || e.code === 'Space') {
        e.preventDefault();
      }

      const now = performance.now();
      const code = e.code || e.key;

      // Check for Switch Chatter / Debounce Fault (< 30ms re-press after release)
      if (!e.repeat) {
        const lastRelease = keyReleaseTimestampsRef.current.get(code);
        if (lastRelease) {
          const delta = now - lastRelease;
          if (delta > 0 && delta < 30) {
            setChatterIncidents((prev) => [
              {
                id: Math.random().toString(36).substring(2, 9),
                code,
                key: e.key || code,
                intervalMs: Math.round(delta * 10) / 10,
                timestamp: new Date(),
              },
              ...prev.slice(0, 19),
            ]);
          }
        }
      }

      // Calculate repeat interval
      if (e.repeat && lastEventTime > 0) {
        const interval = Math.round(now - lastEventTime);
        if (interval > 5 && interval < 500) {
          setKeyRepeatInterval(interval);
        }
      }
      setLastEventTime(now);

      // Play Sound
      if (!e.repeat && soundProfile !== 'none') {
        playKeySound(soundProfile);
      }

      // Update Active & Tested Sets
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.add(code);
        setMaxSimultaneousKeys((max) => Math.max(max, next.size));
        return next;
      });

      setTestedKeys((prev) => {
        const next = new Set(prev);
        next.add(code);
        return next;
      });

      setTotalKeypressCount((c) => c + 1);

      // Log Telemetry
      const eventLog: KeyEventLog = {
        id: Math.random().toString(36).substring(2, 9),
        key: e.key === ' ' ? 'Space' : e.key,
        code: e.code,
        keyCode: e.keyCode || e.which,
        location: e.location,
        locationName: getLocationName(e.location),
        repeat: e.repeat,
        timestamp: Date.now(),
        interval: keyRepeatInterval || undefined,
      };

      setLatestEvent(eventLog);
      setEventHistory((prev) => [eventLog, ...prev.slice(0, 29)]);
    },
    [isTestAreaFocused, lastEventTime, keyRepeatInterval, soundProfile, playKeySound]
  );

  // Key Up Handler
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const code = e.code || e.key;
    const now = performance.now();

    // Record release timestamp for chatter detector
    keyReleaseTimestampsRef.current.set(code, now);

    setActiveKeys((prev) => {
      const next = new Set(prev);
      next.delete(code);
      return next;
    });
  }, []);

  // Global window listeners when focused
  useEffect(() => {
    if (!isTestAreaFocused) return;

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isTestAreaFocused, handleKeyDown, handleKeyUp]);

  // Window Blur Handler (Clear active stuck keys if window loses focus)
  useEffect(() => {
    const handleBlur = () => {
      setActiveKeys(new Set());
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, []);

  // Reset test history
  const handleReset = () => {
    setActiveKeys(new Set());
    setTestedKeys(new Set());
    setTotalKeypressCount(0);
    setMaxSimultaneousKeys(0);
    setLatestEvent(null);
    setEventHistory([]);
    setKeyRepeatInterval(null);
    setChatterIncidents([]);
    keyReleaseTimestampsRef.current.clear();
  };

  // Rollover Classification
  const getRolloverBadge = () => {
    if (maxSimultaneousKeys >= 10) {
      return { label: 'Full NKRO (N-Key Rollover)', status: 'optimal' as const };
    }
    if (maxSimultaneousKeys >= 6) {
      return { label: '6-Key Rollover (6KRO Gaming)', status: 'good' as const };
    }
    if (maxSimultaneousKeys >= 3) {
      return { label: `${maxSimultaneousKeys}-Key Rollover`, status: 'info' as const };
    }
    return { label: '2-Key Rollover (Standard)', status: 'neutral' as const };
  };

  const rolloverInfo = getRolloverBadge();

  // Export report
  const handleExportReport = () => {
    const report = {
      test: 'ApexTools Interactive Keyboard & Anti-Ghosting Diagnostic',
      date: new Date().toLocaleString(),
      layoutTested: `${layout}% ANSI`,
      totalKeysTested: testedKeys.size,
      totalKeypressCount,
      maxSimultaneousKeys,
      rolloverGrade: rolloverInfo.label,
      repeatIntervalEstimateMs: keyRepeatInterval || 'N/A',
      switchChatterIncidents: chatterIncidents.length,
      testedKeyCodes: Array.from(testedKeys),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keyboard-test-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper renderer for a single key button
  const renderKey = (keyDef: KeyDefinition) => {
    const isActive = activeKeys.has(keyDef.code);
    const isTested = testedKeys.has(keyDef.code);

    return (
      <div
        key={keyDef.code}
        id={`key-${keyDef.code}`}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-xl border select-none transition-all duration-75 text-center p-1 sm:p-1.5 shadow-sm',
          keyDef.width || 'flex-1 min-w-[2rem] sm:min-w-[2.5rem] h-10 sm:h-12',
          // Key State Colors
          isActive
            ? 'bg-gradient-to-b from-cyan-400 to-cyan-600 border-cyan-300 text-slate-950 font-black shadow-lg shadow-cyan-500/50 scale-95 translate-y-0.5'
            : isTested
            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-500/10'
            : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
        )}
      >
        {/* Sublabel for shifted character e.g. ! or @ */}
        {keyDef.subLabel && (
          <span
            className={cn(
              'text-[9px] sm:text-[10px] leading-tight font-medium opacity-70',
              isActive ? 'text-slate-900 font-bold' : isTested ? 'text-emerald-400' : 'text-slate-400'
            )}
          >
            {keyDef.label}
          </span>
        )}

        <span
          className={cn(
            'text-[11px] sm:text-xs font-bold leading-tight tracking-tight',
            isActive ? 'text-slate-950' : isTested ? 'text-emerald-200' : 'text-slate-200'
          )}
        >
          {keyDef.subLabel ? keyDef.subLabel : keyDef.label}
        </span>

        {/* Small Tested Dot Indicator */}
        {isTested && !isActive && (
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
        )}
      </div>
    );
  };

  return (
    <HardwareTestLayout
      tool={tool}
      isFullscreen={isFullscreen}
      onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
      onReset={handleReset}
      onExportReport={handleExportReport}
      reportData={{
        testedKeysCount: testedKeys.size,
        totalKeypressCount,
        maxSimultaneousKeys,
        rolloverGrade: rolloverInfo.label,
        chatterIncidentsCount: chatterIncidents.length,
      }}
      statusBadge={{
        label: isTestAreaFocused ? 'Live Test Armed' : 'Test Area Paused',
        variant: isTestAreaFocused ? 'success' : 'warning',
      }}
      headerActions={
        <div className="flex items-center gap-2">
          {/* Focus Toggle Lock */}
          <button
            type="button"
            onClick={() => setIsTestAreaFocused(!isTestAreaFocused)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold shadow-sm transition',
              isTestAreaFocused
                ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-300'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
            )}
          >
            {isTestAreaFocused ? <Lock className="h-3.5 w-3.5 text-cyan-400" /> : <Unlock className="h-3.5 w-3.5" />}
            <span>{isTestAreaFocused ? 'Key Capture ON' : 'Paused'}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* 1. Metric Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <HardwareMetricCard
            title="Keys Tested"
            value={`${testedKeys.size}`}
            unit={layout === '104' ? '/ 104' : layout === '80' ? '/ 87' : '/ 61'}
            status={testedKeys.size > 20 ? 'optimal' : 'neutral'}
            statusLabel={`${Math.round((testedKeys.size / (layout === '104' ? 104 : layout === '80' ? 87 : 61)) * 100)}% Complete`}
            icon={Keyboard}
            subtext="Unique keys registered and verified."
            copyable
          />

          <HardwareMetricCard
            title="Simultaneous Keys"
            value={activeKeys.size}
            unit={`(Max: ${maxSimultaneousKeys})`}
            status={rolloverInfo.status}
            statusLabel={rolloverInfo.label}
            icon={Flame}
            subtext="Multi-key anti-ghosting rollover index."
            copyable
          />

          <HardwareMetricCard
            title="Repeat Latency"
            value={keyRepeatInterval ? `${keyRepeatInterval}` : 'N/A'}
            unit="ms"
            status={keyRepeatInterval && keyRepeatInterval < 40 ? 'optimal' : 'neutral'}
            statusLabel={keyRepeatInterval ? 'Active Polling' : 'Hold Key to Test'}
            icon={Zap}
            subtext="Key repeat interval clock speed."
            copyable
          />

          <HardwareMetricCard
            title="Switch Chatter"
            value={chatterIncidents.length}
            unit="Faults"
            status={chatterIncidents.length === 0 ? 'optimal' : 'error'}
            statusLabel={chatterIncidents.length === 0 ? 'No Bounces' : `${chatterIncidents.length} Detected`}
            icon={AlertTriangle}
            subtext="Mechanical debounce fault detection (<30ms)."
          />
        </div>

        {/* 2. Interactive Keyboard Testing Board */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
          {/* Top Control Bar for Keyboard */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
            {/* Layout Switcher */}
            <div className="flex items-center gap-1.5 rounded-2xl bg-slate-900/90 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setLayout('104')}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-xs font-bold transition',
                  layout === '104'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                100% Full ANSI (104-Key)
              </button>
              <button
                type="button"
                onClick={() => setLayout('80')}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-xs font-bold transition',
                  layout === '80'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                80% TKL (87-Key)
              </button>
              <button
                type="button"
                onClick={() => setLayout('60')}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-xs font-bold transition',
                  layout === '60'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                60% Compact (61-Key)
              </button>
            </div>

            {/* Sound Profile Selector */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-medium text-slate-400">Audio Feedback:</span>
                <select
                  value={soundProfile}
                  onChange={(e) => setSoundProfile(e.target.value as SoundProfile)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="clicky">Cherry Blue (Clicky)</option>
                  <option value="tactile">Cherry Brown (Tactile)</option>
                  <option value="linear">Cherry Red (Linear)</option>
                  <option value="bubble">Popping Bubble</option>
                  <option value="none">Mute (No Sound)</option>
                </select>
              </div>

              {soundProfile !== 'none' && (
                <div className="hidden sm:flex items-center gap-1.5">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={soundVolume}
                    onChange={(e) => setSoundVolume(Number(e.target.value))}
                    className="h-1.5 w-16 accent-cyan-500 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Focus Lost Overlay Banner */}
          {!isTestAreaFocused && (
            <div className="my-4 flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-amber-300">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-xs font-semibold">
                  Test area is currently paused. Keystrokes are not being captured.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsTestAreaFocused(true)}
                className="rounded-xl bg-amber-500 px-3 py-1 text-xs font-bold text-slate-950 shadow-md transition hover:bg-amber-400"
              >
                Resume Key Capture
              </button>
            </div>
          )}

          {/* Virtual Keyboard Grid Container */}
          <div className="mt-5 overflow-x-auto pb-2">
            <div className="min-w-[760px] space-y-2 select-none">
              {/* Function Row */}
              <div className="flex gap-4">
                {/* Main Esc + F-Keys */}
                <div className="flex flex-1 gap-1.5">
                  {ROW_ESC_FUNCTION.map(renderKey)}
                </div>

                {/* Nav Top PrtSc/ScrLk/Pause */}
                {layout !== '60' && (
                  <div className="flex gap-1.5">
                    {ROW_NAV_TOP.map(renderKey)}
                  </div>
                )}

                {/* Numpad Top Spacing Spacer */}
                {layout === '104' && <div className="w-[188px]" />}
              </div>

              {/* Row 1: Numbers */}
              <div className="flex gap-4">
                <div className="flex flex-1 gap-1.5">{ROW_1_MAIN.map(renderKey)}</div>
                {layout !== '60' && <div className="flex gap-1.5">{ROW_1_NAV.map(renderKey)}</div>}
                {layout === '104' && <div className="flex gap-1.5">{ROW_1_NUM.map(renderKey)}</div>}
              </div>

              {/* Row 2: QWERTY */}
              <div className="flex gap-4">
                <div className="flex flex-1 gap-1.5">{ROW_2_MAIN.map(renderKey)}</div>
                {layout !== '60' && <div className="flex gap-1.5">{ROW_2_NAV.map(renderKey)}</div>}
                {layout === '104' && <div className="flex gap-1.5">{ROW_2_NUM.map(renderKey)}</div>}
              </div>

              {/* Row 3: ASDF */}
              <div className="flex gap-4">
                <div className="flex flex-1 gap-1.5">{ROW_3_MAIN.map(renderKey)}</div>
                {layout !== '60' && (
                  <div className="w-[130px] flex items-center justify-center opacity-20">
                    <span className="text-[10px] font-mono text-slate-500">TKL CLUSTER</span>
                  </div>
                )}
                {layout === '104' && <div className="flex gap-1.5">{ROW_3_NUM.map(renderKey)}</div>}
              </div>

              {/* Row 4: ZXCV */}
              <div className="flex gap-4">
                <div className="flex flex-1 gap-1.5">{ROW_4_MAIN.map(renderKey)}</div>
                {layout !== '60' && (
                  <div className="w-[130px] flex items-center justify-center">
                    {ROW_4_NAV.map(renderKey)}
                  </div>
                )}
                {layout === '104' && <div className="flex gap-1.5">{ROW_4_NUM.map(renderKey)}</div>}
              </div>

              {/* Row 5: Space & Modifiers */}
              <div className="flex gap-4">
                <div className="flex flex-1 gap-1.5">{ROW_5_MAIN.map(renderKey)}</div>
                {layout !== '60' && <div className="flex gap-1.5">{ROW_5_NAV.map(renderKey)}</div>}
                {layout === '104' && <div className="flex gap-1.5">{ROW_5_NUM.map(renderKey)}</div>}
              </div>
            </div>
          </div>

          {/* Active Key Legend */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-md bg-gradient-to-b from-cyan-400 to-cyan-600 border border-cyan-300" />
                <span className="text-slate-300 font-medium">Currently Pressed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-md bg-emerald-950/60 border border-emerald-500/60" />
                <span className="text-slate-300 font-medium">Tested & Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-md bg-slate-900 border border-slate-800" />
                <span className="text-slate-400 font-medium">Untested</span>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
              <span>Total Keypresses:</span>
              <span className="font-bold text-cyan-400">{totalKeypressCount}</span>
            </div>
          </div>
        </div>

        {/* 3. Real-Time Telemetry Inspector & Chatter Diagnostics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Event Telemetry Inspector */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white">Live Event Telemetry Inspector</h2>
              </div>
              {latestEvent && (
                <span className="rounded-full bg-cyan-500/15 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300 uppercase">
                  {latestEvent.repeat ? 'Repeat Fired' : 'Key Down'}
                </span>
              )}
            </div>

            {latestEvent ? (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-2xl bg-slate-950/80 p-3 border border-slate-800">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">event.key</span>
                    <p className="mt-1 font-mono text-base font-extrabold text-cyan-400 truncate">
                      {latestEvent.key}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-950/80 p-3 border border-slate-800">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">event.code</span>
                    <p className="mt-1 font-mono text-base font-extrabold text-white truncate">
                      {latestEvent.code}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-950/80 p-3 border border-slate-800">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">keyCode / which</span>
                    <p className="mt-1 font-mono text-base font-extrabold text-emerald-400">
                      {latestEvent.keyCode}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-950/80 p-3 border border-slate-800">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Location</span>
                    <p className="mt-1 font-mono text-sm font-bold text-slate-300">
                      {latestEvent.locationName} ({latestEvent.location})
                    </p>
                  </div>
                </div>

                {/* Event History Stream */}
                <div>
                  <span className="block text-xs font-semibold text-slate-400 mb-2">
                    Recent Event Stream (Last 30 Events):
                  </span>
                  <div className="h-44 overflow-y-auto rounded-2xl bg-slate-950/90 border border-slate-800 p-2 font-mono text-xs space-y-1">
                    {eventHistory.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-slate-900 transition text-slate-300"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-cyan-400 font-bold w-16 truncate">{ev.key}</span>
                          <span className="text-slate-400 text-[11px]">{ev.code}</span>
                          {ev.repeat && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded">
                              REPEAT
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                          <span>loc: {ev.locationName}</span>
                          <span className="text-slate-400">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <Keyboard className="h-10 w-10 mx-auto mb-2 text-slate-400" />
                <p className="text-xs">Press any key on your keyboard to inspect real-time DOM telemetry.</p>
              </div>
            )}
          </div>

          {/* Mechanical Switch Chatter Fault Monitor */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white">Mechanical Switch Chatter Detector</h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">Threshold: &lt; 30ms</span>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Key chatter (contact bounce) occurs when a worn or dirty mechanical switch sends unintentional double
                or triple keystrokes within milliseconds.
              </p>

              {chatterIncidents.length > 0 ? (
                <div className="space-y-2">
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 flex items-center gap-3 text-rose-300 text-xs">
                    <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
                    <div>
                      <p className="font-bold">Possible Switch Chatter Detected!</p>
                      <p className="text-[11px] text-rose-400/90">
                        Rapid bounce registered under 30ms. Consider cleaning or replacing the switch.
                      </p>
                    </div>
                  </div>

                  <div className="h-36 overflow-y-auto rounded-2xl bg-slate-950/90 border border-slate-800 p-2 font-mono text-xs space-y-1">
                    {chatterIncidents.map((incident) => (
                      <div
                        key={incident.id}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-200"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-rose-400">{incident.key}</span>
                          <span className="text-slate-400 text-[11px]">({incident.code})</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="font-bold text-rose-300">{incident.intervalMs} ms</span>
                          <span className="text-slate-400 text-[10px]">
                            {incident.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5 text-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-emerald-300">Clean Switch Contacts</p>
                  <p className="text-[11px] text-emerald-400/70 mt-1 max-w-sm mx-auto">
                    Zero rapid bounce incidents detected. Your mechanical switch debouncing is functioning normally.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </HardwareTestLayout>
  );
};
