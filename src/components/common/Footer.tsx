import React from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/config/categories';
import { siteConfig } from '@/config/site';
import { Shield, Zap, Lock, Globe, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-[#060911]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white font-black text-xs">
                CX
              </div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                Convert<span className="text-indigo-600 dark:text-indigo-400">Hub</span>
              </span>
            </Link>

            <p className="mt-3 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              The high-performance, privacy-first all-in-one conversion utility.
              Transform documents, images, media, physical units, live currency, and Pakistan regional land & gold measurements with zero friction.
            </p>

            <div className="mt-4 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Lock className="h-3.5 w-3.5 text-emerald-500" /> Auto-purged in 1 hr
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-amber-500" /> Free Forever
              </span>
            </div>
          </div>

          {/* Pakistan Regional Tools Column */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1">
              <span>🇵🇰 Pakistan Tools</span>
            </h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link
                  href="/convert/pakistan/marla-to-square-feet"
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                >
                  Marla to Square Feet
                </Link>
              </li>
              <li>
                <Link
                  href="/convert/pakistan/square-feet-to-marla"
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                >
                  Square Feet to Marla
                </Link>
              </li>
              <li>
                <Link
                  href="/convert/pakistan/tola-to-grams"
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                >
                  Tola to Grams (Gold)
                </Link>
              </li>
              <li>
                <Link
                  href="/convert/pakistan/maund-to-kg"
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                >
                  Maund to Kilograms
                </Link>
              </li>
              <li>
                <Link
                  href="/convert/pakistan/hijri-to-gregorian"
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                >
                  Hijri to Gregorian Date
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Converters */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Top Converters
            </h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link
                  href="/convert/document/pdf-to-word"
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                >
                  PDF to Word
                </Link>
              </li>
              <li>
                <Link
                  href="/convert/image/heic-to-jpg"
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                >
                  HEIC to JPG (iPhone)
                </Link>
              </li>
              <li>
                <Link
                  href="/convert/currency/usd-to-pkr"
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                >
                  USD to PKR Live Rate
                </Link>
              </li>
              <li>
                <Link
                  href="/convert/document/compress-pdf"
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                >
                  Compress PDF
                </Link>
              </li>
              <li>
                <Link
                  href="/convert/developer/json-to-csv"
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                >
                  JSON to CSV
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Platform */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Platform & Legal
            </h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link
                  href="/guides"
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-medium text-indigo-600 dark:text-indigo-400"
                >
                  Educational Guides
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/disclaimer"
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                >
                  Disclaimer & Ads Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                >
                  Contact & Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-200/80 pt-8 sm:flex-row dark:border-slate-800/80">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} ConvertHub (Lapvy Enterprises). All rights reserved.
          </p>
          <div className="mt-4 flex items-center gap-4 text-xs text-slate-400 sm:mt-0 dark:text-slate-500">
            <span>Engineered for Maximum Speed & Privacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
