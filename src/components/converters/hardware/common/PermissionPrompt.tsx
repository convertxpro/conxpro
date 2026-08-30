'use client';

import React, { useState } from 'react';
import {
  Camera,
  Mic,
  Volume2,
  Monitor,
  Gamepad2,
  Keyboard,
  Mouse,
  Cpu,
  Lock,
  Unlock,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type HardwareDeviceType =
  | 'camera'
  | 'microphone'
  | 'audio'
  | 'screen'
  | 'gamepad'
  | 'keyboard'
  | 'mouse'
  | 'general';

export type HardwarePermissionState =
  | 'idle'
  | 'prompt'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'not-found'
  | 'unsupported'
  | 'error';

export interface PermissionPromptProps {
  type?: HardwareDeviceType;
  state: HardwarePermissionState;
  title?: string;
  description?: string;
  errorMessage?: string;
  onRequestAccess?: () => void | Promise<void>;
  onRetry?: () => void | Promise<void>;
  buttonText?: string;
  retryText?: string;
  showPrivacyBadge?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const DEVICE_CONFIG: Record<
  HardwareDeviceType,
  {
    name: string;
    icon: React.ElementType;
    color: string;
    gradient: string;
    glow: string;
    defaultTitle: string;
    defaultDesc: string;
  }
> = {
  camera: {
    name: 'Camera / Webcam',
    icon: Camera,
    color: '#06b6d4',
    gradient: 'from-cyan-500 to-blue-600',
    glow: 'rgba(6, 182, 212, 0.25)',
    defaultTitle: 'Webcam Access Required',
    defaultDesc: 'To benchmark live video resolution, frame rates, and color accuracy, allow browser camera access.',
  },
  microphone: {
    name: 'Microphone',
    icon: Mic,
    color: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600',
    glow: 'rgba(139, 92, 246, 0.25)',
    defaultTitle: 'Microphone Access Required',
    defaultDesc: 'To visualize live decibel levels, audio frequency spectrums, and test loopback, allow microphone access.',
  },
  audio: {
    name: 'Speaker & Audio Output',
    icon: Volume2,
    color: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600',
    glow: 'rgba(59, 130, 246, 0.25)',
    defaultTitle: 'Initialize Audio Test',
    defaultDesc: 'Click below to enable the Web Audio synthesizer for stereo channel and frequency sweep tests.',
  },
  screen: {
    name: 'Display & Screen',
    icon: Monitor,
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16, 185, 129, 0.25)',
    defaultTitle: 'Display Diagnostic Ready',
    defaultDesc: 'Test screen refresh rate, detect dead/stuck pixels, and check color uniformity in fullscreen mode.',
  },
  gamepad: {
    name: 'Gamepad & Controller',
    icon: Gamepad2,
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600',
    glow: 'rgba(245, 158, 11, 0.25)',
    defaultTitle: 'Connect a Controller',
    defaultDesc: 'Plug in via USB or pair via Bluetooth (Xbox, PlayStation, Switch, or generic), then press any button.',
  },
  keyboard: {
    name: 'Keyboard',
    icon: Keyboard,
    color: '#ec4899',
    gradient: 'from-pink-500 to-rose-600',
    glow: 'rgba(236, 72, 153, 0.25)',
    defaultTitle: 'Virtual Keyboard Ready',
    defaultDesc: 'Press any key on your physical keyboard to test key rollover, latency, and switch chatter.',
  },
  mouse: {
    name: 'Mouse & Trackpad',
    icon: Mouse,
    color: '#6366f1',
    gradient: 'from-indigo-500 to-cyan-600',
    glow: 'rgba(99, 102, 241, 0.25)',
    defaultTitle: 'Mouse & Sensor Ready',
    defaultDesc: 'Click, scroll, and move your cursor in the test zone to evaluate polling rate and button switches.',
  },
  general: {
    name: 'Hardware Accessory',
    icon: Cpu,
    color: '#06b6d4',
    gradient: 'from-cyan-500 to-blue-600',
    glow: 'rgba(6, 182, 212, 0.25)',
    defaultTitle: 'Start Hardware Diagnostic',
    defaultDesc: 'Launch 100% in-browser device diagnostics with instant sub-millisecond local telemetry.',
  },
};

export const PermissionPrompt: React.FC<PermissionPromptProps> = ({
  type = 'general',
  state,
  title,
  description,
  errorMessage,
  onRequestAccess,
  onRetry,
  buttonText,
  retryText = 'Try Again',
  showPrivacyBadge = true,
  className,
  children,
}) => {
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const config = DEVICE_CONFIG[type] || DEVICE_CONFIG.general;
  const Icon = config.icon;

  const handleAction = async (callback?: () => void | Promise<void>) => {
    if (!callback) return;
    try {
      setIsProcessing(true);
      await callback();
    } catch {
      // Error handled by parent component state
    } finally {
      setIsProcessing(false);
    }
  };

  // 1. Permission Denied State
  if (state === 'denied') {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-3xl border border-rose-500/30 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950/90 p-6 sm:p-10 text-center shadow-2xl backdrop-blur-xl dark:border-rose-500/20',
          className
        )}
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 ring-8 ring-rose-500/10">
          <Lock className="h-10 w-10 animate-pulse" />
        </div>

        <h3 className="mt-6 text-xl font-bold tracking-tight text-white sm:text-2xl">
          {title || `${config.name} Access Blocked`}
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm text-slate-300">
          {description ||
            `Your browser blocked access to the ${config.name.toLowerCase()}. ConvertX processes all streams locally and never saves or uploads data.`}
        </p>

        {errorMessage && (
          <div className="mx-auto mt-4 max-w-md rounded-xl border border-rose-500/20 bg-rose-950/30 p-3 text-xs text-rose-300 font-mono">
            {errorMessage}
          </div>
        )}

        {/* Step-by-Step Fix instructions */}
        <div className="mx-auto mt-6 max-w-lg rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-left">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Info className="h-4 w-4 text-cyan-400" />
            <span>How to unblock in 3 steps:</span>
          </div>
          <ol className="mt-3 space-y-2 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
            <li>
              Click the <strong className="text-white">Lock icon 🔒 / Site Settings</strong> on the left of your browser address bar.
            </li>
            <li>
              Find <strong className="text-cyan-300">{config.name}</strong> and change the dropdown from <span className="text-rose-400 font-semibold">Block</span> to <span className="text-emerald-400 font-semibold">Allow</span>.
            </li>
            <li>Click the button below to re-check permissions.</li>
          </ol>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => handleAction(onRetry || onRequestAccess)}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition hover:scale-[1.02] hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={cn('h-4 w-4', isProcessing && 'animate-spin')} />
            <span>{retryText}</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. Device Not Found State
  if (state === 'not-found') {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950/90 p-6 sm:p-10 text-center shadow-2xl backdrop-blur-xl dark:border-amber-500/20',
          className
        )}
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 ring-8 ring-amber-500/10">
          <AlertTriangle className="h-10 w-10 animate-bounce" />
        </div>

        <h3 className="mt-6 text-xl font-bold tracking-tight text-white sm:text-2xl">
          {title || `No ${config.name} Detected`}
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm text-slate-300">
          {description ||
            `Please connect your ${config.name.toLowerCase()} via USB, 3.5mm jack, or Bluetooth and click refresh.`}
        </p>

        <div className="mx-auto mt-6 max-w-md rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-left text-xs text-slate-300 space-y-1.5">
          <p className="font-semibold text-amber-300">Quick Troubleshooting Checklist:</p>
          <ul className="space-y-1 list-disc list-inside text-slate-400">
            <li>Ensure the cable is firmly plugged into your computer.</li>
            <li>Check if another application (Zoom, Teams, Discord) has exclusive control.</li>
            <li>If using a laptop with a physical privacy slider, ensure the camera shutter is open.</li>
          </ul>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => handleAction(onRetry || onRequestAccess)}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition hover:scale-[1.02] hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={cn('h-4 w-4', isProcessing && 'animate-spin')} />
            <span>{retryText}</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Unsupported Browser State
  if (state === 'unsupported') {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-900/90 p-6 sm:p-10 text-center shadow-2xl backdrop-blur-xl',
          className
        )}
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-800 text-slate-400">
          <AlertTriangle className="h-10 w-10 text-amber-400" />
        </div>

        <h3 className="mt-6 text-xl font-bold tracking-tight text-white sm:text-2xl">
          Hardware API Not Supported
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm text-slate-300">
          Your current web browser does not support the modern HTML5 hardware APIs required for this diagnostic.
        </p>

        <p className="mt-4 text-xs text-slate-400">
          Recommended browsers: Google Chrome, Microsoft Edge, Mozilla Firefox, or Apple Safari (v15+).
        </p>
      </div>
    );
  }

  // 4. Requesting / Processing State
  if (state === 'requesting' || isProcessing) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950/90 p-6 sm:p-10 text-center shadow-2xl backdrop-blur-xl',
          className
        )}
      >
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-cyan-500/40 animate-pulse" />
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
            <Icon className="h-8 w-8 animate-spin" />
          </div>
        </div>

        <h3 className="mt-6 text-xl font-bold tracking-tight text-white">
          Awaiting Browser Permission...
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm text-slate-300">
          Please check for the pop-up prompt in your browser window and click <strong className="text-cyan-300">&ldquo;Allow&rdquo;</strong> to start the test.
        </p>
      </div>
    );
  }

  // 5. Default / Prompt / Idle State
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/95 via-slate-900/85 to-slate-950/95 p-6 sm:p-10 text-center shadow-2xl backdrop-blur-xl',
        className
      )}
    >
      {/* Glow background */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-72 rounded-full blur-3xl"
        style={{ background: config.glow }}
      />

      {/* Main Animated Icon */}
      <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
        <div
          className={cn(
            'flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr text-white shadow-xl transition-transform duration-300 hover:scale-105',
            config.gradient
          )}
        >
          <Icon className="h-10 w-10" />
        </div>
      </div>

      {/* Title & Description */}
      <h3 className="mt-6 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
        {title || config.defaultTitle}
      </h3>

      <p className="mx-auto mt-2 max-w-lg text-sm text-slate-300 leading-relaxed">
        {description || config.defaultDesc}
      </p>

      {children}

      {/* CTA Button */}
      {onRequestAccess && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => handleAction(onRequestAccess)}
            disabled={isProcessing}
            className={cn(
              'group inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r px-8 py-4 text-base font-bold text-white shadow-xl transition-all duration-200 hover:scale-[1.03] hover:shadow-2xl active:scale-98 disabled:opacity-50',
              config.gradient
            )}
          >
            <Unlock className="h-5 w-5 transition-transform group-hover:rotate-12" />
            <span>{buttonText || `Start ${config.name} Test`}</span>
          </button>
        </div>
      )}

      {/* Privacy Guarantee Footer */}
      {showPrivacyBadge && (
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="h-4 w-4" />
            <span>100% Client-Side Private</span>
          </div>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span>Zero audio, video, or keystroke data is ever sent to any server.</span>
        </div>
      )}
    </div>
  );
};
