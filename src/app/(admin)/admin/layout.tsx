'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Megaphone,
  BarChart3,
  MapPin,
  ShieldCheck,
  ExternalLink,
  Zap,
  Activity,
  Server,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Overview',
      href: '/admin',
      icon: LayoutDashboard,
      active: pathname === '/admin',
    },
    {
      name: 'Ad Placement Console',
      href: '/admin/ads',
      icon: Megaphone,
      active: pathname.startsWith('/admin/ads'),
    },
    {
      name: 'Analytics & Tools',
      href: '/admin/analytics',
      icon: BarChart3,
      active: pathname.startsWith('/admin/analytics'),
    },
    {
      name: 'Regional Config (PK)',
      href: '/admin/regional-config',
      icon: MapPin,
      active: pathname.startsWith('/admin/regional-config'),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
      {/* Top Banner Warning for Admin Mode */}
      <div className="border-b border-rose-500/20 bg-rose-950/40 px-4 py-1.5 text-center text-xs font-semibold tracking-wide text-rose-300">
        <span className="mr-2 inline-flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-rose-400" />
          MASTER ADMIN CONSOLE
        </span>
        • Real-time changes directly affect live traffic, monetization, and regional converters.
      </div>

      <div className="flex">
        {/* Left Sidebar Navigation */}
        <aside className="sticky top-0 hidden h-[calc(100vh-33px)] w-64 flex-shrink-0 flex-col justify-between border-r border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-xl lg:flex">
          <div className="space-y-6">
            {/* Branding */}
            <div className="flex items-center gap-2.5 px-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md shadow-indigo-500/30">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight text-white">ApexTools</span>
                <span className="ml-1.5 rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-400">
                  ROOT
                </span>
                <p className="text-[11px] text-slate-400">Command Center</p>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Operations
              </p>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all',
                      item.active
                        ? 'bg-indigo-600/15 text-indigo-400 shadow-sm shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    )}
                  >
                    <Icon className={cn('h-4 w-4', item.active ? 'text-indigo-400' : 'text-slate-400')} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Live System Indicator & Return Link */}
          <div className="space-y-3 pt-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                  Cluster Engine
                </span>
                <span className="font-mono text-[11px] font-semibold text-emerald-400">ONLINE</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Worker Nodes:</span>
                <span className="font-semibold text-slate-300">2 BullMQ (Docker)</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                <span>Redis Latency:</span>
                <span className="font-semibold text-slate-300">8ms</span>
              </div>
            </div>

            <Link
              href="/"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Back to Public App</span>
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="min-w-0 flex-1 p-6 lg:p-8">
          {/* Mobile Navigation Header */}
          <div className="mb-6 flex flex-wrap gap-2 lg:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                    item.active
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
