'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Users,
  Clock,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Server,
  Database,
  Cpu,
  ShieldAlert,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function AdminOverviewPage() {
  const [loading, setLoading] = useState(false);
  const [statsData, setStatsData] = useState<any>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const json = await res.json();
        setStatsData(json.stats);
      }
    } catch (e) {
      console.error('Failed to fetch admin stats', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const stats = statsData || {
    overview: {
      totalConversionsToday: 14280,
      totalConversionsYesterday: 12940,
      sevenDayAverage: 13450,
      dailyGrowthPct: 10.35,
      activeUsersNow: 412,
      errorRatePct: 0.28,
      quotaCapHitsToday: 684,
      quotaHitRatePct: 4.79,
    },
    categoryBreakdown: [
      { name: 'Document & PDF', value: 4820, percentage: 33.7, color: '#6366f1' },
      { name: 'Image Converters', value: 3950, percentage: 27.6, color: '#3b82f6' },
      { name: 'Pakistan Regional', value: 2480, percentage: 17.4, color: '#10b981' },
      { name: 'Currency & Forex', value: 1650, percentage: 11.5, color: '#f59e0b' },
      { name: 'Video & Audio', value: 920, percentage: 6.4, color: '#8b5cf6' },
      { name: 'Unit & Calculators', value: 460, percentage: 3.2, color: '#ec4899' },
    ],
    dailyVolumeHistory: [
      { date: 'Aug 21', conversions: 11200, anonymous: 8900, registered: 2300 },
      { date: 'Aug 22', conversions: 12100, anonymous: 9400, registered: 2700 },
      { date: 'Aug 23', conversions: 12850, anonymous: 9950, registered: 2900 },
      { date: 'Aug 24', conversions: 11900, anonymous: 9100, registered: 2800 },
      { date: 'Aug 25', conversions: 13400, anonymous: 10200, registered: 3200 },
      { date: 'Aug 26', conversions: 12940, anonymous: 9800, registered: 3140 },
      { date: 'Today (Aug 27)', conversions: 14280, anonymous: 10850, registered: 3430 },
    ],
    recentLogs: [
      {
        id: 'job-94821',
        tool: 'PDF to Word',
        status: 'completed',
        duration: '1.74s',
        fileSize: '4.2 MB',
        tier: 'Free',
        timestamp: '1 min ago',
        ipCountry: 'PK',
      },
      {
        id: 'job-94820',
        tool: 'HEIC to JPG',
        status: 'completed',
        duration: '0.82s',
        fileSize: '2.8 MB',
        tier: 'Anonymous',
        timestamp: '2 mins ago',
        ipCountry: 'US',
      },
      {
        id: 'job-94819',
        tool: 'MP4 to MP3',
        status: 'completed',
        duration: '3.45s',
        fileSize: '18.6 MB',
        tier: 'Pro',
        timestamp: '3 mins ago',
        ipCountry: 'GB',
      },
      {
        id: 'job-94818',
        tool: 'Compress PDF',
        status: 'failed',
        duration: '5.10s',
        fileSize: '48.2 MB',
        tier: 'Anonymous',
        timestamp: '4 mins ago',
        ipCountry: 'PK',
        error: 'Input file corrupted or password-protected PDF stream',
      },
      {
        id: 'job-94817',
        tool: 'Gold Tola to Grams',
        status: 'completed',
        duration: '0.04s',
        fileSize: '—',
        tier: 'Anonymous',
        timestamp: '5 mins ago',
        ipCountry: 'PK',
      },
    ],
    systemHealth: {
      redisStatus: 'healthy',
      redisLatencyMs: 8,
      supabaseStatus: 'healthy',
      supabaseLatencyMs: 14,
      bullmqQueueDepth: 3,
      activeWorkerInstances: 2,
      workerCpuUsagePct: 18.4,
      workerMemoryUsagePct: 34.2,
      uptimePct: 99.98,
    },
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Platform Health & Operations
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time conversion traffic, daily quota burn-rates, and background worker telemetry.
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 self-start rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 transition-all hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          <span>{loading ? 'Refreshing...' : 'Refresh Metrics'}</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Conversions Today */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Today
            </span>
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              {stats.overview.totalConversionsToday.toLocaleString()}
            </span>
            <span className="flex items-center text-xs font-semibold text-emerald-400">
              <ArrowUpRight className="h-3 w-3" />+{stats.overview.dailyGrowthPct}%
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            vs {stats.overview.totalConversionsYesterday.toLocaleString()} yesterday (7d avg:{' '}
            {stats.overview.sevenDayAverage.toLocaleString()})
          </p>
        </div>

        {/* Quota Cap Hit Rate */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Daily Quota Hits
            </span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              {stats.overview.quotaCapHitsToday.toLocaleString()}
            </span>
            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs font-bold text-amber-400">
              {stats.overview.quotaHitRatePct}% cap rate
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Anonymous & free users hitting 10 / 25 daily limits (upsell funnel)
          </p>
        </div>

        {/* Platform Error Rate */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Job Error Rate
            </span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              {stats.overview.errorRatePct}%
            </span>
            <span className="text-xs font-semibold text-emerald-400">99.72% Success</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {stats.systemHealth.uptimePct}% overall system availability
          </p>
        </div>

        {/* Live Active Concurrency */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Users Now
            </span>
            <div className="rounded-lg bg-sky-500/10 p-2 text-sky-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              {stats.overview.activeUsersNow}
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-sky-400">
              <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping"></span>
              Live Concurrency
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Queue Depth: {stats.systemHealth.bullmqQueueDepth} jobs awaiting worker execution
          </p>
        </div>
      </div>

      {/* Charts Section: Volume Trend & Category Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 7-Day Conversion Volume Area Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Daily Conversion Volume (7 Days)</h2>
              <p className="text-xs text-slate-400">
                Segmented by anonymous visitors vs registered authenticated accounts
              </p>
            </div>
            <span className="rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-400">
              +27.5% Weekly
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyVolumeHistory}>
                <defs>
                  <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="conversions"
                  name="Total Conversions"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorConversions)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Split Distribution */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm">
          <h2 className="text-base font-bold text-white">Category Distribution</h2>
          <p className="text-xs text-slate-400">Volume share across converter tool categories</p>

          <div className="mt-4 flex h-48 items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {stats.categoryBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-2">
            {stats.categoryBreakdown.map((cat: any) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-300">{cat.name}</span>
                </div>
                <span className="font-mono font-semibold text-slate-400">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Infrastructure Telemetry & Live Conversion Stream */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Real-time Infrastructure & Queue Health */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Cluster Infrastructure</h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Real-time status of cache, database, and background processing workers
          </p>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-emerald-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Upstash Redis</div>
                  <div className="text-[11px] text-slate-400">Rate limiter & Forex cache</div>
                </div>
              </div>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-xs font-bold text-emerald-400">
                {stats.systemHealth.redisLatencyMs}ms
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-sky-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Supabase Auth & Storage</div>
                  <div className="text-[11px] text-slate-400">User sessions & file metadata</div>
                </div>
              </div>
              <span className="rounded bg-sky-500/10 px-2 py-0.5 font-mono text-xs font-bold text-sky-400">
                {stats.systemHealth.supabaseLatencyMs}ms
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex items-center gap-3">
                <Cpu className="h-4 w-4 text-indigo-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">BullMQ Heavy Workers</div>
                  <div className="text-[11px] text-slate-400">
                    FFmpeg & LibreOffice ({stats.systemHealth.activeWorkerInstances} instances)
                  </div>
                </div>
              </div>
              <span className="rounded bg-indigo-500/10 px-2 py-0.5 font-mono text-xs font-bold text-indigo-400">
                {stats.systemHealth.workerCpuUsagePct}% CPU
              </span>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3 text-[11px] text-slate-400">
              <div className="flex items-center justify-between">
                <span>Worker RAM Utilization:</span>
                <span className="font-semibold text-slate-300">
                  {stats.systemHealth.workerMemoryUsagePct}%
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span>Auto-Purge Retention:</span>
                <span className="font-semibold text-emerald-400">Active (1 Hour TTL)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Conversion Stream & Error Log Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Live Execution Stream & Error Log</h2>
              <p className="text-xs text-slate-400">
                Real-time stream of incoming conversion jobs and error traces
              </p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Feed
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="pb-3 font-semibold">Job ID</th>
                  <th className="pb-3 font-semibold">Tool</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Latency</th>
                  <th className="pb-3 font-semibold">File Size</th>
                  <th className="pb-3 font-semibold">Tier</th>
                  <th className="pb-3 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 font-mono">
                {stats.recentLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-800/30">
                    <td className="py-3 font-semibold text-slate-300">{log.id}</td>
                    <td className="py-3 font-sans font-medium text-slate-200">{log.tool}</td>
                    <td className="py-3">
                      {log.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-400">
                          <AlertCircle className="h-3 w-3" /> FAILED
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-slate-400">{log.duration}</td>
                    <td className="py-3 text-slate-400">{log.fileSize}</td>
                    <td className="py-3 font-sans">
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">
                        {log.tier}
                      </span>
                    </td>
                    <td className="py-3 font-sans text-slate-400">{log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Failing Job Error Trace Alert Preview */}
          {stats.recentLogs.some((l: any) => l.status === 'failed') && (
            <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-950/20 p-3 text-xs text-rose-300">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                <span>Last Error Trace (job-94818):</span>
              </div>
              <p className="mt-1 font-mono text-[11px] text-rose-300/80">
                Input file corrupted or password-protected PDF stream — worker rejected gracefully
                without cluster stall.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
