'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  Zap,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock3,
  FileText,
  Image as ImageIcon,
  Video,
  FileCode,
  DollarSign,
  Ruler,
  LogOut,
  RefreshCw,
  Crown,
  ChevronRight,
  Layers,
  History
} from 'lucide-react';
import { ConversionJob } from '@/lib/supabase/types';

// Mock initial data if newly registered or demo mode
const INITIAL_DEMO_JOBS: ConversionJob[] = [
  {
    id: 'job-1',
    user_id: 'user-1',
    ip_hash: null,
    tool_type: 'jpg-to-pdf',
    source_format: 'jpg',
    target_format: 'pdf',
    file_size_bytes: 4210000,
    status: 'completed',
    download_token: 'tok-1',
    error_message: null,
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    expires_at: new Date(Date.now() + 1000 * 60 * 95).toISOString(),
  },
  {
    id: 'job-2',
    user_id: 'user-1',
    ip_hash: null,
    tool_type: 'mp4-to-mp3',
    source_format: 'mp4',
    target_format: 'mp3',
    file_size_bytes: 18450000,
    status: 'completed',
    download_token: 'tok-2',
    error_message: null,
    created_at: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    expires_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: 'job-3',
    user_id: 'user-1',
    ip_hash: null,
    tool_type: 'marla-to-sqft',
    source_format: 'marla',
    target_format: 'sqft',
    file_size_bytes: null,
    status: 'completed',
    download_token: null,
    error_message: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    expires_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'job-4',
    user_id: 'user-1',
    ip_hash: null,
    tool_type: 'image-compressor',
    source_format: 'png',
    target_format: 'webp',
    file_size_bytes: 8900000,
    status: 'completed',
    download_token: 'tok-4',
    error_message: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    expires_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
];

export default function DashboardPage() {
  const { user, profile, dailyUsage, signOut, isLoading } = useAuth();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'failed' | 'expired'>('all');
  const [jobs, setJobs] = useState<ConversionJob[]>(INITIAL_DEMO_JOBS);
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');

  // Live countdown to midnight PKT (UTC+5)
  useEffect(() => {
    const calculateTimeUntilMidnightPKT = () => {
      const now = new Date();
      // Current UTC time in ms
      const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
      // Pakistan Time (UTC + 5 hours)
      const pktNow = new Date(utcMs + 5 * 3600000);

      // Next midnight PKT
      const pktMidnight = new Date(pktNow);
      pktMidnight.setHours(24, 0, 0, 0);

      const diffMs = pktMidnight.getTime() - pktNow.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeUntilReset(`${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTimeUntilMidnightPKT();
    const interval = setInterval(calculateTimeUntilMidnightPKT, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Format file size
  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format date
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Filtered jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.tool_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.source_format && job.source_format.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.target_format && job.target_format.toLowerCase().includes(searchQuery.toLowerCase()));

    // Check if expired based on expiration timestamp
    const isJobExpired = new Date(job.expires_at).getTime() < Date.now();
    const effectiveStatus = isJobExpired && job.status === 'completed' ? 'expired' : job.status;

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && effectiveStatus === statusFilter;
  });

  return (
    <div className="space-y-8">
      {/* Welcome & Top Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              <Zap className="h-3 w-3" />
              <span>Personal Dashboard</span>
            </span>
            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              Free Plan (25/day)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {user?.email ? user.email.split('@')[0] : 'Member'} Account
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {user?.email || 'Logged in via Magic Link'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Layers className="h-3.5 w-3.5 text-indigo-500" />
            <span>Browse All Tools</span>
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-rose-600 shadow-sm transition hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-900 dark:text-rose-400 dark:hover:bg-rose-950/40"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Top 3 Stat Bento Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Card 1: Daily Quota Usage */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Daily Conversions
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Zap className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {dailyUsage.used}
            </span>
            <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">
              / {dailyUsage.limit} used today
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                style={{ width: `${dailyUsage.percentUsed}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <span>{dailyUsage.remaining} conversions remaining</span>
              <span>{dailyUsage.percentUsed}%</span>
            </div>
          </div>

          {/* Reset Timer */}
          <div className="mt-4 flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            <Clock className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span>Resets in: <strong className="font-mono text-slate-900 dark:text-white">{timeUntilReset || 'midnight PKT'}</strong> (PKT)</span>
          </div>
        </div>

        {/* Card 2: Current Membership Plan */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Plan Tier
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                Free Forever
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                ACTIVE
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Includes 25 daily conversions, 100 MB max file size, and all Pakistan regional tools.
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 p-3 text-xs dark:border-indigo-900/50 dark:bg-indigo-950/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-300">
                <Crown className="h-3.5 w-3.5 text-amber-500" />
                <span>Pro Tier</span>
              </div>
              <span className="rounded bg-indigo-200/60 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                Coming Soon
              </span>
            </div>
            <p className="mt-1 text-[11px] text-indigo-700/80 dark:text-indigo-400">
              Unlimited conversions, batch folder processing, zero wait time, and developer API keys.
            </p>
          </div>
        </div>

        {/* Card 3: Privacy & Retention Status */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Security & Storage
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                2 Hours
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Auto-Purge Window
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Files are processed in memory or isolated temporary storage and strictly purged after 2 hours.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Zero file retention policy active</span>
          </div>
        </div>
      </div>

      {/* Privacy Guarantee Notice Banner */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/30">
        <div className="flex items-start gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white dark:bg-indigo-500">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="text-xs leading-relaxed text-indigo-950 dark:text-indigo-200">
            <strong className="font-semibold text-indigo-900 dark:text-white">Privacy Guarantee: </strong>
            For your complete security and privacy, converted files are automatically purged from our servers after 2 hours.
            Only job metadata (tool used, date, status) is retained in your personal dashboard below.
          </div>
        </div>
      </div>

      {/* Quick Launchers */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
          Quick Tool Launchers
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { name: 'JPG to PDF', href: '/convert/jpg-to-pdf', icon: FileText, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/60' },
            { name: 'Word to PDF', href: '/convert/word-to-pdf', icon: FileText, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/60' },
            { name: 'MP4 to MP3', href: '/convert/mp4-to-mp3', icon: Video, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/60' },
            { name: 'Marla to Sq Ft', href: '/convert/marla-to-square-feet', icon: Ruler, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60' },
            { name: 'Image Compressor', href: '/convert/image-compressor', icon: ImageIcon, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60' },
            { name: 'Forex PKR', href: '/convert/currency', icon: DollarSign, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/60' },
          ].map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.name}
                href={tool.href}
                className="group flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 p-3.5 text-center transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:hover:border-indigo-700"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${tool.color} transition-transform group-hover:scale-110`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="mt-2 text-xs font-semibold text-slate-800 dark:text-slate-200 truncate w-full">
                  {tool.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 30-Day Conversion History Section */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Table Header & Controls */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Recent Conversion History (Past 30 Days)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Detailed metadata log of your conversions.
              </p>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Status Filter */}
              <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-800/60 text-xs">
                {(['all', 'completed', 'expired'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setStatusFilter(filter)}
                    className={`rounded-lg px-2.5 py-1 font-semibold capitalize transition ${
                      statusFilter === filter
                        ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by tool..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-48 rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3.5">Tool / Conversion</th>
                <th className="px-6 py-3.5">File Format</th>
                <th className="px-6 py-3.5">File Size</th>
                <th className="px-6 py-3.5">Date & Time</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => {
                  const isExpired = new Date(job.expires_at).getTime() < Date.now();
                  return (
                    <tr key={job.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-indigo-500" />
                          <span className="capitalize">{job.tool_type.replace(/-/g, ' ')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {job.source_format && job.target_format ? (
                          <span className="inline-flex items-center gap-1 font-mono uppercase text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            {job.source_format}
                            <ChevronRight className="h-3 w-3 text-slate-400" />
                            {job.target_format}
                          </span>
                        ) : (
                          <span className="text-slate-400">Unit / Math</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {formatFileSize(job.file_size_bytes)}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        {formatDate(job.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            <Clock3 className="h-3 w-3" />
                            Expired (Purged)
                          </span>
                        ) : job.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" />
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                            <AlertCircle className="h-3 w-3" />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/convert/${job.tool_type}`}
                          className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          <span>Convert again</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    <History className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm font-semibold">No conversion jobs match your filter</p>
                    <p className="text-xs text-slate-400 mt-1">Start converting any file or unit to view records here.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
