'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles, Smartphone, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Check if app is already running in standalone PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed recently (within 7 days)
    const dismissedUntil = localStorage.getItem('converthub_pwa_dismissed_until');
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Small delay before showing so page finishes initial load smoothly
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Register Service Worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowPrompt(false);
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('[PWA] Install prompt failed:', err);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Dismiss for 7 days
    const nextWeek = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem('converthub_pwa_dismissed_until', String(nextWeek));
  };

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <aside aria-label="Install ConvertHub app prompt" className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-slideUp">
      <div className="relative overflow-hidden rounded-3xl border border-indigo-200/90 bg-gradient-to-br from-indigo-900/95 via-slate-900/95 to-slate-950/95 p-5 text-white shadow-2xl backdrop-blur-xl ring-1 ring-white/10 dark:border-indigo-800/80">
        {/* Glow decoration */}
        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">
                  Install ConvertHub App
                </h4>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  Offline Ready
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-300">
                Instant desktop & home screen access with zero latency and offline calculators.
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            title="Dismiss install banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 pt-2 border-t border-white/10">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="text-xs text-slate-300 hover:text-white hover:bg-white/10"
          >
            Maybe Later
          </Button>
          <Button
            size="sm"
            variant="gradient"
            onClick={handleInstallClick}
            leftIcon={<Download className="h-3.5 w-3.5" />}
            className="text-xs font-bold shadow-md shadow-indigo-500/30"
          >
            Install App
          </Button>
        </div>
      </div>
    </aside>
  );
};
