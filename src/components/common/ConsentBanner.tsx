'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Cookie, X, Settings, Check } from 'lucide-react';

export const ConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [adConsent, setAdConsent] = useState(true);
  const [analyticsConsent, setAnalyticsConsent] = useState(true);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('converthub_cookie_consent');
      if (!consent) {
        // Small delay for clean page entry
        const timer = setTimeout(() => setShowBanner(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // Ignore localStorage access errors
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(
        'converthub_cookie_consent',
        JSON.stringify({ essential: true, analytics: true, ads: true, timestamp: Date.now() })
      );
    } catch (e) {}
    setShowBanner(false);
    setShowModal(false);
  };

  const handleDeclineNonEssential = () => {
    try {
      localStorage.setItem(
        'converthub_cookie_consent',
        JSON.stringify({ essential: true, analytics: false, ads: false, timestamp: Date.now() })
      );
    } catch (e) {}
    setShowBanner(false);
    setShowModal(false);
  };

  const handleSaveCustom = () => {
    try {
      localStorage.setItem(
        'converthub_cookie_consent',
        JSON.stringify({
          essential: true,
          analytics: analyticsConsent,
          ads: adConsent,
          timestamp: Date.now(),
        })
      );
    } catch (e) {}
    setShowBanner(false);
    setShowModal(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Floating Bottom Consent Banner */}
      <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-700/80 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center sm:p-5">
          <div className="flex items-start gap-3.5">
            <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
              <Cookie className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Privacy & Cookie Preferences</span>
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-400">
                  GDPR & CCPA Compliant
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                We use cookies and local storage to personalize your conversion experience, analyze
                traffic, and serve non-intrusive advertisements. See our{' '}
                <Link href="/privacy" className="text-indigo-400 underline hover:text-indigo-300">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs font-semibold text-slate-300 transition-all hover:bg-slate-700 hover:text-white"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Customize</span>
            </button>
            <button
              onClick={handleDeclineNonEssential}
              className="rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs font-semibold text-slate-300 transition-all hover:bg-slate-700 hover:text-white"
            >
              Reject Non-Essential
            </button>
            <button
              onClick={handleAcceptAll}
              className="flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Accept All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Custom Preferences Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Cookie Consent Preferences</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Essential */}
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                <div>
                  <div className="font-semibold text-slate-200">Strictly Necessary Cookies</div>
                  <div className="text-slate-400">
                    Required for core conversion jobs, file downloads, and quota accounting.
                  </div>
                </div>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                  ALWAYS ACTIVE
                </span>
              </div>

              {/* Analytics */}
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                <div>
                  <div className="font-semibold text-slate-200">Telemetry & Performance</div>
                  <div className="text-slate-400">
                    Helps us monitor error rates and optimize converter execution speed.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsConsent}
                  onChange={(e) => setAnalyticsConsent(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              {/* Advertising */}
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                <div>
                  <div className="font-semibold text-slate-200">Personalized Advertisements</div>
                  <div className="text-slate-400">
                    Allows Google AdSense to serve relevant non-intrusive sponsor ads.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={adConsent}
                  onChange={(e) => setAdConsent(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-4">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustom}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
