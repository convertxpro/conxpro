'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Gamepad2,
  RotateCcw,
  Volume2,
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
  Sliders,
  Radio,
  Vibrate,
  Info,
  Circle,
  HelpCircle,
} from 'lucide-react';
import { ToolMetadata } from '@/config/categories';
import { HardwareTestLayout } from './common/HardwareTestLayout';
import { HardwareMetricCard } from './common/HardwareMetricCard';
import { cn } from '@/lib/utils';

export interface GamepadTesterComponentProps {
  tool?: ToolMetadata | { name: string; description: string; slug?: string };
}

type ControllerType = 'xbox' | 'playstation' | 'nintendo' | 'generic';

interface GamepadTelemetry {
  id: string;
  index: number;
  mapping: string;
  connected: boolean;
  timestamp: number;
  axes: number[];
  buttons: { pressed: boolean; touched: boolean; value: number }[];
}

export const GamepadTesterComponent: React.FC<GamepadTesterComponentProps> = ({
  tool = {
    name: 'Gamepad & Controller Tester',
    description:
      'Calibrate Xbox, PlayStation, Nintendo Switch, and Generic controllers with live thumbstick drift radar, trigger pressure gauges, and dual-motor haptic rumble test 100% in-browser.',
    slug: 'gamepad-test',
  },
}) => {
  // 1. Gamepad Connection State
  const [gamepadsList, setGamepadsList] = useState<{ id: string; index: number }[]>([]);
  const [selectedGamepadIndex, setSelectedGamepadIndex] = useState<number>(0);
  const [gamepadTelemetry, setGamepadTelemetry] = useState<GamepadTelemetry | null>(null);
  const [controllerType, setControllerType] = useState<ControllerType>('xbox');

  // 2. Deadzone & Calibration
  const [deadzoneThreshold, setDeadzoneThreshold] = useState<number>(0.08); // 8% default
  const [leftStickRestDrift, setLeftStickRestDrift] = useState<number>(0);
  const [rightStickRestDrift, setRightStickRestDrift] = useState<number>(0);
  const [leftStickMaxMagnitude, setLeftStickMaxMagnitude] = useState<number>(0);
  const [rightStickMaxMagnitude, setRightStickMaxMagnitude] = useState<number>(0);

  // 3. Vibration / Haptic State
  const [isVibrating, setIsVibrating] = useState<boolean>(false);
  const [vibrationSupported, setVibrationSupported] = useState<boolean>(true);
  const [vibrationFeedbackMessage, setVibrationFeedbackMessage] = useState<string | null>(null);

  // 4. Polling & Telemetry
  const [pollingRateHz, setPollingRateHz] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Animation Frame Ref
  const animFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastHzCalcTimeRef = useRef<number>(performance.now());

  // Auto-detect controller type from ID string
  const detectControllerType = (idStr: string): ControllerType => {
    const idLower = idStr.toLowerCase();
    if (idLower.includes('xbox') || idLower.includes('xinput') || idLower.includes('microsoft')) {
      return 'xbox';
    }
    if (idLower.includes('dualshock') || idLower.includes('dualsense') || idLower.includes('playstation') || idLower.includes('sony') || idLower.includes('054c')) {
      return 'playstation';
    }
    if (idLower.includes('nintendo') || idLower.includes('switch') || idLower.includes('pro controller') || idLower.includes('joy-con')) {
      return 'nintendo';
    }
    return 'xbox'; // Default to Xbox standard mapping
  };

  // Poll Gamepads via requestAnimationFrame
  const pollGamepads = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return;

    const gamepads = navigator.getGamepads();
    const available: { id: string; index: number }[] = [];

    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (gp && gp.connected) {
        available.push({ id: gp.id, index: gp.index });
      }
    }

    setGamepadsList(available);

    const activeGp = gamepads[selectedGamepadIndex] || (available.length > 0 ? gamepads[available[0].index] : null);

    if (activeGp && activeGp.connected) {
      // Calculate stick magnitudes
      const lx = activeGp.axes[0] || 0;
      const ly = activeGp.axes[1] || 0;
      const rx = activeGp.axes[2] || 0;
      const ry = activeGp.axes[3] || 0;

      const leftMag = Math.sqrt(lx * lx + ly * ly);
      const rightMag = Math.sqrt(rx * rx + ry * ry);

      setLeftStickMaxMagnitude((m) => Math.max(m, leftMag));
      setRightStickMaxMagnitude((m) => Math.max(m, rightMag));

      // Calculate resting drift (when sticks are roughly near neutral)
      if (leftMag < 0.25) {
        setLeftStickRestDrift(Math.round(leftMag * 1000) / 1000);
      }
      if (rightMag < 0.25) {
        setRightStickRestDrift(Math.round(rightMag * 1000) / 1000);
      }

      // Check vibration actuator support
      const hasVibration = !!(
        (activeGp as any).vibrationActuator ||
        ((activeGp as any).hapticActuators && (activeGp as any).hapticActuators.length > 0)
      );
      setVibrationSupported(hasVibration);

      setGamepadTelemetry({
        id: activeGp.id,
        index: activeGp.index,
        mapping: activeGp.mapping || 'standard',
        connected: activeGp.connected,
        timestamp: activeGp.timestamp,
        axes: Array.from(activeGp.axes),
        buttons: activeGp.buttons.map((b) => ({
          pressed: b.pressed,
          touched: b.touched ?? false,
          value: b.value,
        })),
      });

      // Calculate polling rate
      frameCountRef.current++;
      const now = performance.now();
      if (now - lastHzCalcTimeRef.current >= 1000) {
        setPollingRateHz(frameCountRef.current);
        frameCountRef.current = 0;
        lastHzCalcTimeRef.current = now;
      }
    } else {
      setGamepadTelemetry(null);
      setPollingRateHz(0);
    }

    animFrameRef.current = requestAnimationFrame(pollGamepads);
  }, [selectedGamepadIndex]);

  // Window gamepad connected/disconnected listeners
  useEffect(() => {
    const handleConnected = (e: GamepadEvent) => {
      setSelectedGamepadIndex(e.gamepad.index);
      setControllerType(detectControllerType(e.gamepad.id));
    };

    const handleDisconnected = (e: GamepadEvent) => {
      if (selectedGamepadIndex === e.gamepad.index) {
        setSelectedGamepadIndex(0);
      }
    };

    window.addEventListener('gamepadconnected', handleConnected);
    window.addEventListener('gamepaddisconnected', handleDisconnected);

    animFrameRef.current = requestAnimationFrame(pollGamepads);

    return () => {
      window.removeEventListener('gamepadconnected', handleConnected);
      window.removeEventListener('gamepaddisconnected', handleDisconnected);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [pollGamepads, selectedGamepadIndex]);

  // Trigger Dual-Motor Vibration / Rumble
  const triggerRumble = async (weakMag: number, strongMag: number, durationMs: number = 800) => {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
    const gamepads = navigator.getGamepads();
    const gp = gamepads[selectedGamepadIndex];
    if (!gp) return;

    const actuator = (gp as any).vibrationActuator;
    if (actuator && actuator.playEffect) {
      try {
        setIsVibrating(true);
        setVibrationFeedbackMessage(`Rumble Active (Weak: ${weakMag}, Strong: ${strongMag})`);
        await actuator.playEffect('dual-rumble', {
          startDelay: 0,
          duration: durationMs,
          weakMagnitude: weakMag,
          strongMagnitude: strongMag,
        });
      } catch (err: any) {
        setVibrationFeedbackMessage(`Vibration error: ${err?.message || 'Unsupported'}`);
      } finally {
        setIsVibrating(false);
      }
    } else {
      setVibrationFeedbackMessage('VibrationActuator API not supported by this gamepad/browser.');
      setTimeout(() => setVibrationFeedbackMessage(null), 3000);
    }
  };

  // Reset calibration
  const handleReset = () => {
    setLeftStickRestDrift(0);
    setRightStickRestDrift(0);
    setLeftStickMaxMagnitude(0);
    setRightStickMaxMagnitude(0);
  };

  // Export report
  const handleExportReport = () => {
    if (!gamepadTelemetry) return;
    const report = {
      test: 'ApexTools Gamepad & Controller Calibration Diagnostic',
      date: new Date().toLocaleString(),
      gamepadId: gamepadTelemetry.id,
      gamepadIndex: gamepadTelemetry.index,
      controllerLayout: controllerType.toUpperCase(),
      pollingRateHz,
      calibration: {
        deadzoneThreshold: `${Math.round(deadzoneThreshold * 100)}%`,
        leftStickRestingDrift: leftStickRestDrift,
        leftStickDriftVerdict: leftStickRestDrift > deadzoneThreshold ? 'Stick Drift Detected' : 'Healthy Centering',
        rightStickRestingDrift: rightStickRestDrift,
        rightStickDriftVerdict: rightStickRestDrift > deadzoneThreshold ? 'Stick Drift Detected' : 'Healthy Centering',
      },
      triggerTelemetry: {
        leftTriggerLT: gamepadTelemetry.buttons[6]?.value ?? 0,
        rightTriggerRT: gamepadTelemetry.buttons[7]?.value ?? 0,
      },
      axes: gamepadTelemetry.axes,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gamepad-calibration-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper Labels for Face Buttons based on Controller Type
  const getButtonLabels = () => {
    if (controllerType === 'playstation') {
      return {
        btn0: '✕ (Cross)',
        btn1: '○ (Circle)',
        btn2: '□ (Square)',
        btn3: '△ (Triangle)',
        lb: 'L1',
        rb: 'R1',
        lt: 'L2',
        rt: 'R2',
        select: 'Share / Create',
        start: 'Options',
        l3: 'L3 (Stick)',
        r3: 'R3 (Stick)',
        home: 'PS Button',
      };
    }
    if (controllerType === 'nintendo') {
      return {
        btn0: 'B Button',
        btn1: 'A Button',
        btn2: 'Y Button',
        btn3: 'X Button',
        lb: 'L',
        rb: 'R',
        lt: 'ZL',
        rt: 'ZR',
        select: '- (Minus)',
        start: '+ (Plus)',
        l3: 'Left Stick Click',
        r3: 'Right Stick Click',
        home: 'Home',
      };
    }
    // Xbox Standard
    return {
      btn0: 'A Button',
      btn1: 'B Button',
      btn2: 'X Button',
      btn3: 'Y Button',
      lb: 'LB (Left Bumper)',
      rb: 'RB (Right Bumper)',
      lt: 'LT (Left Trigger)',
      rt: 'RT (Right Trigger)',
      select: 'View / Back',
      start: 'Menu / Start',
      l3: 'LS (Left Stick)',
      r3: 'RS (Right Stick)',
      home: 'Xbox Guide',
    };
  };

  const btnLabels = getButtonLabels();

  // Sticks Values
  const lx = gamepadTelemetry?.axes[0] ?? 0;
  const ly = gamepadTelemetry?.axes[1] ?? 0;
  const rx = gamepadTelemetry?.axes[2] ?? 0;
  const ry = gamepadTelemetry?.axes[3] ?? 0;

  const leftMag = Math.sqrt(lx * lx + ly * ly);
  const rightMag = Math.sqrt(rx * rx + ry * ry);

  const isLeftDrifting = leftStickRestDrift > deadzoneThreshold;
  const isRightDrifting = rightStickRestDrift > deadzoneThreshold;

  // Triggers Pressure Values
  const ltValue = gamepadTelemetry?.buttons[6]?.value ?? 0;
  const rtValue = gamepadTelemetry?.buttons[7]?.value ?? 0;

  return (
    <HardwareTestLayout
      tool={tool}
      isFullscreen={isFullscreen}
      onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
      onReset={handleReset}
      onExportReport={handleExportReport}
      reportData={{
        controllerId: gamepadTelemetry?.id,
        pollingHz: pollingRateHz,
        leftStickDrift: leftStickRestDrift,
        rightStickDrift: rightStickRestDrift,
      }}
      statusBadge={{
        label: gamepadTelemetry ? `${gamepadTelemetry.id.slice(0, 24)}...` : 'No Gamepad Detected',
        variant: gamepadTelemetry ? 'success' : 'warning',
      }}
      headerActions={
        <div className="flex items-center gap-2">
          {gamepadsList.length > 1 && (
            <select
              value={selectedGamepadIndex}
              onChange={(e) => setSelectedGamepadIndex(Number(e.target.value))}
              className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none"
            >
              {gamepadsList.map((g) => (
                <option key={g.index} value={g.index}>
                  Gamepad {g.index + 1}: {g.id.slice(0, 20)}
                </option>
              ))}
            </select>
          )}

          {/* Layout Profile Switcher */}
          <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1">
            <button
              type="button"
              onClick={() => setControllerType('xbox')}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-bold transition',
                controllerType === 'xbox' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              )}
            >
              Xbox
            </button>
            <button
              type="button"
              onClick={() => setControllerType('playstation')}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-bold transition',
                controllerType === 'playstation'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              PlayStation
            </button>
            <button
              type="button"
              onClick={() => setControllerType('nintendo')}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-bold transition',
                controllerType === 'nintendo'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              Switch
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* 1. Metric Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <HardwareMetricCard
            title="Connection Status"
            value={gamepadTelemetry ? 'Connected' : 'Waiting...'}
            unit=""
            status={gamepadTelemetry ? 'optimal' : 'warning'}
            statusLabel={gamepadTelemetry ? `${pollingRateHz} Hz Polling` : 'Press Any Button'}
            icon={Gamepad2}
            subtext={gamepadTelemetry ? gamepadTelemetry.id : 'Connect USB / Bluetooth controller'}
          />

          <HardwareMetricCard
            title="Left Stick Resting Drift"
            value={(leftStickRestDrift * 100).toFixed(1)}
            unit="%"
            status={isLeftDrifting ? 'error' : leftStickRestDrift > 0.04 ? 'warning' : 'optimal'}
            statusLabel={isLeftDrifting ? 'Drift Alert' : 'Centered'}
            icon={Compass}
            subtext={`Rest magnitude: ${leftStickRestDrift.toFixed(3)}`}
            copyable
          />

          <HardwareMetricCard
            title="Right Stick Resting Drift"
            value={(rightStickRestDrift * 100).toFixed(1)}
            unit="%"
            status={isRightDrifting ? 'error' : rightStickRestDrift > 0.04 ? 'warning' : 'optimal'}
            statusLabel={isRightDrifting ? 'Drift Alert' : 'Centered'}
            icon={Compass}
            subtext={`Rest magnitude: ${rightStickRestDrift.toFixed(3)}`}
            copyable
          />

          <HardwareMetricCard
            title="Analog Triggers"
            value={`L: ${Math.round(ltValue * 100)}%`}
            unit={`| R: ${Math.round(rtValue * 100)}%`}
            status={ltValue > 0 || rtValue > 0 ? 'optimal' : 'neutral'}
            statusLabel={ltValue > 0 || rtValue > 0 ? 'Active Pull' : 'Neutral'}
            icon={Sliders}
            subtext="Linear hall-effect / analog trigger depth."
          />
        </div>

        {/* Not Detected State Alert Box */}
        {!gamepadTelemetry && (
          <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-blue-950/40 p-6 sm:p-8 backdrop-blur-xl text-center space-y-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/20 animate-pulse">
              <Gamepad2 className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">No Controller Detected Yet</h2>
              <p className="mt-2 text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                Connect your <strong>Xbox</strong>, <strong>PlayStation</strong>, <strong>Nintendo Switch Pro</strong>,
                or <strong>Generic USB / Bluetooth</strong> gamepad, then <strong>press any button or wiggle a thumbstick</strong> to wake the browser Gamepad API.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-cyan-300 font-medium">
              <span className="rounded-full bg-cyan-500/10 px-3 py-1 border border-cyan-500/20">Xbox Series & One</span>
              <span className="rounded-full bg-cyan-500/10 px-3 py-1 border border-cyan-500/20">DualSense & DualShock 4</span>
              <span className="rounded-full bg-cyan-500/10 px-3 py-1 border border-cyan-500/20">Switch Pro Controller</span>
              <span className="rounded-full bg-cyan-500/10 px-3 py-1 border border-cyan-500/20">8BitDo & Steam Deck</span>
            </div>
          </div>
        )}

        {/* 2. Analog Thumbstick Drift & Radar Calibration Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Thumbstick Radar */}
          <div className="lg:col-span-6 rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white">Left Analog Stick (Axes 0, 1)</h2>
              </div>
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase',
                  isLeftDrifting
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                )}
              >
                {isLeftDrifting ? 'Drift Detected' : 'Centered OK'}
              </span>
            </div>

            {/* Radar Visualizer */}
            <div className="relative my-6 flex flex-col items-center justify-center">
              <div className="relative h-56 w-56 rounded-full border-2 border-slate-800 bg-slate-900/80 shadow-inner flex items-center justify-center">
                {/* Crosshairs */}
                <div className="absolute h-full w-[1px] bg-slate-800" />
                <div className="absolute w-full h-[1px] bg-slate-800" />

                {/* Deadzone Ring */}
                <div
                  className="absolute rounded-full border border-dashed border-amber-500/40 bg-amber-500/5"
                  style={{
                    width: `${deadzoneThreshold * 200}%`,
                    height: `${deadzoneThreshold * 200}%`,
                  }}
                />

                {/* Outer Perimeter Ring */}
                <div className="absolute inset-4 rounded-full border border-slate-800/60" />

                {/* Thumbstick Position Dot */}
                <div
                  className="absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 border-2 border-white shadow-lg shadow-cyan-500/50 transition-all duration-75"
                  style={{
                    left: `${50 + (lx * 40)}%`,
                    top: `${50 + (ly * 40)}%`,
                  }}
                />
              </div>

              {/* Coordinate Values */}
              <div className="mt-4 flex items-center gap-4 font-mono text-xs">
                <div className="rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5">
                  <span className="text-slate-400">X: </span>
                  <span className="font-bold text-cyan-400">{lx.toFixed(4)}</span>
                </div>
                <div className="rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5">
                  <span className="text-slate-400">Y: </span>
                  <span className="font-bold text-cyan-400">{ly.toFixed(4)}</span>
                </div>
                <div className="rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5">
                  <span className="text-slate-400">Mag: </span>
                  <span className="font-bold text-emerald-400">{leftMag.toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Thumbstick Radar */}
          <div className="lg:col-span-6 rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white">Right Analog Stick (Axes 2, 3)</h2>
              </div>
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase',
                  isRightDrifting
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                )}
              >
                {isRightDrifting ? 'Drift Detected' : 'Centered OK'}
              </span>
            </div>

            {/* Radar Visualizer */}
            <div className="relative my-6 flex flex-col items-center justify-center">
              <div className="relative h-56 w-56 rounded-full border-2 border-slate-800 bg-slate-900/80 shadow-inner flex items-center justify-center">
                {/* Crosshairs */}
                <div className="absolute h-full w-[1px] bg-slate-800" />
                <div className="absolute w-full h-[1px] bg-slate-800" />

                {/* Deadzone Ring */}
                <div
                  className="absolute rounded-full border border-dashed border-amber-500/40 bg-amber-500/5"
                  style={{
                    width: `${deadzoneThreshold * 200}%`,
                    height: `${deadzoneThreshold * 200}%`,
                  }}
                />

                {/* Outer Perimeter Ring */}
                <div className="absolute inset-4 rounded-full border border-slate-800/60" />

                {/* Thumbstick Position Dot */}
                <div
                  className="absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 border-2 border-white shadow-lg shadow-cyan-500/50 transition-all duration-75"
                  style={{
                    left: `${50 + (rx * 40)}%`,
                    top: `${50 + (ry * 40)}%`,
                  }}
                />
              </div>

              {/* Coordinate Values */}
              <div className="mt-4 flex items-center gap-4 font-mono text-xs">
                <div className="rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5">
                  <span className="text-slate-400">X: </span>
                  <span className="font-bold text-cyan-400">{rx.toFixed(4)}</span>
                </div>
                <div className="rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5">
                  <span className="text-slate-400">Y: </span>
                  <span className="font-bold text-cyan-400">{ry.toFixed(4)}</span>
                </div>
                <div className="rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5">
                  <span className="text-slate-400">Mag: </span>
                  <span className="font-bold text-emerald-400">{rightMag.toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deadzone Slider Control Bar */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-300">
              Adjustable Deadzone Ring: <strong className="text-cyan-400">{Math.round(deadzoneThreshold * 100)}%</strong>
            </span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-64">
            <span className="text-[10px] text-slate-400 font-mono">0%</span>
            <input
              type="range"
              min={0}
              max={25}
              value={Math.round(deadzoneThreshold * 100)}
              onChange={(e) => setDeadzoneThreshold(Number(e.target.value) / 100)}
              className="h-1.5 w-full accent-cyan-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 font-mono">25%</span>
          </div>
        </div>

        {/* 3. Button Mapping & Trigger Pressure Gauges */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white">Full Button & Trigger Pressure Telemetry</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono uppercase">{controllerType} Standard Layout</span>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Analog Triggers (LT / RT) Gauges */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Analog Triggers (Hall-Effect)</h3>

              {/* Left Trigger */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span>{btnLabels.lt} (Button 6)</span>
                  <span className="font-mono text-cyan-400">{(ltValue * 100).toFixed(0)}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-950">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-75"
                    style={{ width: `${Math.min(100, ltValue * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-mono block text-right">{ltValue.toFixed(4)}</span>
              </div>

              {/* Right Trigger */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span>{btnLabels.rt} (Button 7)</span>
                  <span className="font-mono text-cyan-400">{(rtValue * 100).toFixed(0)}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-950">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-75"
                    style={{ width: `${Math.min(100, rtValue * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-mono block text-right">{rtValue.toFixed(4)}</span>
              </div>
            </div>

            {/* Face Buttons & Bumpers Grid */}
            <div className="lg:col-span-8 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Digital Buttons & D-Pad</h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { index: 0, label: btnLabels.btn0 },
                  { index: 1, label: btnLabels.btn1 },
                  { index: 2, label: btnLabels.btn2 },
                  { index: 3, label: btnLabels.btn3 },
                  { index: 4, label: btnLabels.lb },
                  { index: 5, label: btnLabels.rb },
                  { index: 8, label: btnLabels.select },
                  { index: 9, label: btnLabels.start },
                  { index: 10, label: btnLabels.l3 },
                  { index: 11, label: btnLabels.r3 },
                  { index: 12, label: 'D-Pad Up' },
                  { index: 13, label: 'D-Pad Down' },
                  { index: 14, label: 'D-Pad Left' },
                  { index: 15, label: 'D-Pad Right' },
                  { index: 16, label: btnLabels.home },
                ].map(({ index, label }) => {
                  const btn = gamepadTelemetry?.buttons[index];
                  const isPressed = btn?.pressed || (btn?.value ?? 0) > 0.5;

                  return (
                    <div
                      key={index}
                      className={cn(
                        'flex items-center justify-between rounded-2xl border p-3 text-xs transition-all duration-75 select-none',
                        isPressed
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-300 text-slate-950 font-bold shadow-lg shadow-cyan-500/30 scale-95'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300'
                      )}
                    >
                      <span className="truncate">{label}</span>
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full',
                          isPressed ? 'bg-white shadow-sm' : 'bg-slate-700'
                        )}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Dual-Motor Haptic Vibration / Rumble Lab */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Vibrate className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white">Dual-Motor Haptic Vibration / Rumble Test</h2>
            </div>
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase',
                vibrationSupported ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              )}
            >
              {vibrationSupported ? 'Haptics Supported' : 'API Unsupported'}
            </span>
          </div>

          <div className="mt-4 space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Test both High-Frequency (Weak Motor - Right Grip) and Low-Frequency (Strong Motor - Left Grip) vibration
              motors to check motor balance and rattle.
            </p>

            {vibrationFeedbackMessage && (
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-xs text-cyan-300 font-mono">
                {vibrationFeedbackMessage}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => triggerRumble(0.8, 0.0, 600)}
                disabled={isVibrating || !gamepadTelemetry}
                className="rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs font-bold text-slate-200 hover:border-cyan-500 hover:text-cyan-400 disabled:opacity-50 transition"
              >
                Right Motor (High Freq)
              </button>

              <button
                type="button"
                onClick={() => triggerRumble(0.0, 1.0, 600)}
                disabled={isVibrating || !gamepadTelemetry}
                className="rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs font-bold text-slate-200 hover:border-cyan-500 hover:text-cyan-400 disabled:opacity-50 transition"
              >
                Left Motor (Heavy Bass)
              </button>

              <button
                type="button"
                onClick={() => triggerRumble(0.5, 0.5, 800)}
                disabled={isVibrating || !gamepadTelemetry}
                className="rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs font-bold text-slate-200 hover:border-cyan-500 hover:text-cyan-400 disabled:opacity-50 transition"
              >
                Dual Balance (50%)
              </button>

              <button
                type="button"
                onClick={() => triggerRumble(1.0, 1.0, 1000)}
                disabled={isVibrating || !gamepadTelemetry}
                className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 p-3 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:brightness-110 disabled:opacity-50 transition"
              >
                Max Power Rumble (100%)
              </button>
            </div>
          </div>
        </div>
      </div>
    </HardwareTestLayout>
  );
};
