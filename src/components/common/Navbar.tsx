'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Sparkles,
  Menu,
  X,
  ArrowUpRight,
  ChevronDown,
  Layers,
  FileText,
  Image,
  DollarSign,
  Ruler,
  Code,
  Shield,
  User as UserIcon,
  Zap,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { SearchModal } from './SearchModal';
import { QuotaIndicator } from './QuotaIndicator';
import { siteConfig } from '@/config/site';
import { CATEGORIES } from '@/config/categories';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';
import { useQuota } from '@/lib/rate-limit/use-quota';

export const Navbar: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const { user, signOut } = useAuth();
  const { quota } = useQuota();

  // Listen for Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCategoryDropdownOpen(false);
    setIsUserDropdownOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-nav">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 p-0.5 shadow-md shadow-indigo-500/20 transition-transform duration-200 group-hover:scale-105">
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950 text-white font-black text-sm tracking-wider">
                  CX
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                  Convert<span className="text-indigo-600 dark:text-indigo-400">Hub</span>
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 -mt-1">
                  100% Free
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
                  onMouseEnter={() => setIsCategoryDropdownOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Layers className="h-4 w-4 text-indigo-500" />
                  <span>Categories</span>
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isCategoryDropdownOpen && "rotate-180")} />
                </button>

                {/* Categories Mega Dropdown */}
                {isCategoryDropdownOpen && (
                  <div
                    onMouseLeave={() => setIsCategoryDropdownOpen(false)}
                    className="absolute left-0 top-full mt-1 w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="grid grid-cols-1 gap-1">
                      {CATEGORIES.slice(0, 6).map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/convert/${cat.slug}`}
                          className="flex items-center justify-between rounded-xl p-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span>{cat.name}</span>
                          </div>
                          {cat.badge && (
                            <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                              {cat.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/convert/pakistan"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50/80 border border-emerald-200/50 hover:bg-emerald-100/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40 dark:hover:bg-emerald-950/70 transition"
              >
                <span>🇵🇰 Pakistan Tools</span>
              </Link>

              <Link
                href="/convert/document"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition"
              >
                PDF Tools
              </Link>

              <Link
                href="/convert/image"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition"
              >
                Images
              </Link>

              <Link
                href="/convert/currency"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition"
              >
                Forex
              </Link>

              <Link
                href="/guides"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-slate-800 transition"
              >
                Guides
              </Link>
            </nav>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-2.5">
            {/* Quick Search Button Trigger */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="flex h-9 items-center gap-3 rounded-xl border border-slate-200/80 bg-white/70 px-3 text-xs text-slate-500 backdrop-blur-sm transition-all hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800/80 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800 sm:w-48 lg:w-56"
            >
              <Search className="h-4 w-4 text-slate-400" />
              <span className="hidden sm:inline">Search converters...</span>
              <span className="sm:hidden">Search</span>
              <kbd className="ml-auto hidden rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:border-slate-800 dark:bg-slate-800 sm:inline-block">
                ⌘K
              </kbd>
            </button>

            {/* Quota Indicator for Header */}
            <QuotaIndicator className="hidden md:inline-block" />

            {/* Auth State Button / Dropdown */}
            {user ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                  className="flex h-9 items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/80 px-2.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-800/60 dark:bg-indigo-950/50 dark:text-indigo-300"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white uppercase">
                    {user.email ? user.email[0] : 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {user.email ? user.email.split('@')[0] : 'Account'}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                    {quota.remaining} left
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-indigo-500" />
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900 z-50">
                    <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {user.email}
                      </p>
                      <span className="mt-1 inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {quota.tier === 'pro' ? 'Pro Plan (Unlimited)' : 'Free Plan (25/day)'}
                      </span>
                    </div>

                    {/* Daily Quota in dropdown */}
                    <div className="py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        <span>Daily Conversions</span>
                        <span>{quota.used} / {quota.limit}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                          style={{ width: `${Math.min(100, (quota.used / quota.limit) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 space-y-1">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/60 transition"
                      >
                        <LayoutDashboard className="h-4 w-4 text-indigo-500" />
                        <span>Personal Dashboard</span>
                      </Link>

                      <button
                        type="button"
                        onClick={signOut}
                        className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <UserIcon className="h-3.5 w-3.5 text-slate-500" />
                  <span>Sign In</span>
                </Link>

                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-indigo-500/20 transition hover:brightness-110"
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span>Free 25/day</span>
                </Link>
              </div>
            )}

            {/* Theme Switcher */}
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              aria-label="Open mobile navigation"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="border-b border-slate-200 bg-white px-4 py-4 lg:hidden dark:border-slate-800 dark:bg-slate-950">
            <div className="space-y-2">
              {/* Mobile Quota Indicator */}
              <div className="pb-1">
                <QuotaIndicator className="w-full flex justify-between" />
              </div>

              {/* Mobile Auth Button */}
              {user ? (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3 dark:border-indigo-900/60 dark:bg-indigo-950/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {user.email}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {quota.remaining} / {quota.limit} daily conversions left
                      </p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white"
                    >
                      Dashboard
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pb-2">
                  <Link
                    href="/auth/login"
                    className="flex items-center justify-center rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="flex items-center justify-center rounded-xl bg-indigo-600 p-2.5 text-xs font-semibold text-white"
                  >
                    Sign Up Free
                  </Link>
                </div>
              )}

              <Link
                href="/convert/pakistan"
                className="flex items-center justify-between rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
              >
                <span>🇵🇰 Pakistan Regional Converters</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>

              <div className="grid grid-cols-2 gap-2 pt-2">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/convert/${cat.slug}`}
                    className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/60 p-2.5 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="truncate">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Dialog Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

