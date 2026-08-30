'use client';

import React, { useState } from 'react';
import {
  Cpu,
  Camera,
  Mic,
  Volume2,
  Monitor,
  Keyboard,
  Mouse,
  Gamepad2,
  Video,
  RefreshCw,
  Maximize2,
  Minimize2,
  RotateCcw,
  Download,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { ToolMetadata } from '@/config/categories';
import { PrivacyAssuranceBadge } from '@/components/converters/common/PrivacyAssuranceBadge';
import { cn } from '@/lib/utils';

export interface HardwareTestDevice {
  deviceId: string;
  label: string;
  kind?: string;
  groupId?: string;
}

export interface HardwareTestLayoutProps {
  tool:
    | ToolMetadata
    | {
        id?: string;
        name: string;
        description: string;
        categoryName?: string;
        badge?: string;
        iconName?: string;
      };
  activeDeviceId?: string;
  devices?: HardwareTestDevice[];
  onDeviceChange?: (deviceId: string) => void;
  onRefreshDevices?: () => void | Promise<void>;
  isRefreshingDevices?: boolean;
  onReset?: () => void;
  onExportReport?: () => void;
  reportData?: Record<string, any>;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
  statusBadge?: {
    label: string;
    variant?: 'success' | 'warning' | 'error' | 'info';
  };
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Cpu,
  Camera,
  Mic,
  Volume2,
  Monitor,
  Keyboard,
  Mouse,
  Gamepad2,
  Video,
};

export const HardwareTestLayout: React.FC<HardwareTestLayoutProps> = ({
  tool,
  activeDeviceId,
  devices = [],
  onDeviceChange,
  onRefreshDevices,
  isRefreshingDevices = false,
  onReset,
  onExportReport,
  reportData,
  onToggleFullscreen,
  isFullscreen = false,
  statusBadge,
  headerActions,
  children,
  footer,
  className,
}) => {
  const [copiedReport, setCopiedReport] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const Icon = ICON_MAP[tool.iconName || ''] || Cpu;

  const handleRefresh = async () => {
    if (!onRefreshDevices) return;
    setRefreshing(true);
    try {
      await onRefreshDevices();
    } finally {
      setTimeout(() => setRefreshing(false), 400);
    }
  };

  const handleCopyReport = () => {
    if (!reportData) return;
    const reportText = JSON.stringify(
      {
        tool: tool.name,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        ...reportData,
      },
      null,
      2
    );
    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div
      className={cn(
        'w-full max-w-6xl mx-auto space-y-6 transition-all duration-300',
        isFullscreen && 'fixed inset-0 z-50 max-w-none h-screen bg-slate-950 p-4 sm:p-6 overflow-y-auto',
        className
      )}
    >
      {/* 1. Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 p-6 sm:p-8 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/60">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-blue-500/15 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Tool Info & Title */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25">
              <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                  {tool.categoryName || 'Hardware Diagnostic Suite'}
                </span>
                {tool.badge && (
                  <span className="rounded-full bg-cyan-500/15 px-2.5 py-0.5 text-[11px] font-bold text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300">
                    {tool.badge}
                  </span>
                )}
                {statusBadge && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider',
                      statusBadge.variant === 'success' && 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
                      statusBadge.variant === 'warning' && 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
                      statusBadge.variant === 'error' && 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
                      (!statusBadge.variant || statusBadge.variant === 'info') &&
                        'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                    )}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                    <span>{statusBadge.label}</span>
                  </span>
                )}
              </div>

              <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {tool.name}
              </h1>

              <p className="mt-1 max-w-2xl text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {tool.description}
              </p>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 sm:self-auto">
            {headerActions}

            {onReset && (
              <button
                type="button"
                onClick={onReset}
                title="Reset Test State"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                <span>Reset</span>
              </button>
            )}

            {reportData && (
              <button
                type="button"
                onClick={handleCopyReport}
                title="Copy Test Telemetry Report"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                {copiedReport ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Copy Stats</span>
                  </>
                )}
              </button>
            )}

            {onToggleFullscreen && (
              <button
                type="button"
                onClick={onToggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="h-3.5 w-3.5" />
                    <span>Exit Fullscreen</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span>Fullscreen</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Device Switcher Row (If multiple devices available) */}
        {devices.length > 0 && onDeviceChange && (
          <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <span className="text-slate-400">Active Device:</span>
              <div className="relative">
                <select
                  value={activeDeviceId || ''}
                  onChange={(e) => onDeviceChange(e.target.value)}
                  className="appearance-none rounded-xl border border-slate-200 bg-slate-50/90 py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-900 shadow-sm focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {devices.map((d, index) => (
                    <option key={d.deviceId || index} value={d.deviceId}>
                      {d.label || `Device ${index + 1}`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            {onRefreshDevices && (
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing || isRefreshingDevices}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition"
              >
                <RefreshCw
                  className={cn(
                    'h-3.5 w-3.5',
                    (refreshing || isRefreshingDevices) && 'animate-spin'
                  )}
                />
                <span>Scan for New Devices</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Privacy Assurance Banner */}
      <PrivacyAssuranceBadge
        variant="banner"
        customTitle="🔒 100% In-Browser Hardware Diagnostic"
        customDescription="Zero camera frames, microphone audio, keystrokes, or gamepad telemetry are transmitted to any server. Diagnostics run entirely inside your browser's local sandbox."
      />

      {/* 3. Main Workspace / Child Tester Components */}
      <div className="relative">{children}</div>

      {/* 4. Optional Custom Footer / Recommendations */}
      {footer && <div className="mt-6">{footer}</div>}
    </div>
  );
};
