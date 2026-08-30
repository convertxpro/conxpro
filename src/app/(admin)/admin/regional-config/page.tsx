'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Save,
  CheckCircle2,
  AlertCircle,
  Coins,
  Building,
  TrendingUp,
  RefreshCw,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { RegionalConfig } from '@/app/api/admin/regional-config/route';

export default function AdminRegionalConfigPage() {
  const [config, setConfig] = useState<RegionalConfig>({
    goldPrice24kPerTola: 248500,
    goldPrice22kPerTola: 227790,
    silverPricePerTola: 2950,
    marlaPresetSqFt: 225,
    forexMarkupPercent: 0.75,
    districtDefaults: {
      lahore: 225,
      rawalpindi: 272.25,
      karachi: 225,
      multan: 272.25,
      peshawar: 272.25,
      quetta: 272.25,
    },
    lastUpdated: new Date().toISOString(),
  });

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/regional-config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config) {
          setConfig(data.config);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/regional-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Pakistan Regional Tool constants updated successfully!');
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage(data.error || 'Failed to update regional configurations');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error saving constants');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setConfig({
      goldPrice24kPerTola: 248500,
      goldPrice22kPerTola: 227790,
      silverPricePerTola: 2950,
      marlaPresetSqFt: 225,
      forexMarkupPercent: 0.75,
      districtDefaults: {
        lahore: 225,
        rawalpindi: 272.25,
        karachi: 225,
        multan: 272.25,
        peshawar: 272.25,
        quetta: 272.25,
      },
      lastUpdated: new Date().toISOString(),
    });
    setSuccessMessage('Reset to platform default constants. Click Save to apply.');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-emerald-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Pakistan Regional Tool Constants
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Control baseline gold prices, Marla land calculation standards, and forex spread markups.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 transition-all hover:bg-slate-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-500 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>{saving ? 'Saving...' : 'Save Regional Config'}</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-xs font-semibold text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs font-semibold text-rose-300">
          <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid of Config Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Gold & Precious Metals Pricing */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-2 text-amber-400">
            <Coins className="h-5 w-5" />
            <h2 className="text-base font-bold text-white">Sarafa Market Gold Rates (PKR)</h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Default pricing per tola fed to the Gold Tola to Grams / Jewelry Valuation calculators
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300">
                24 Karat Gold (PKR / Tola)
              </label>
              <div className="mt-1.5 flex items-center rounded-xl border border-slate-700 bg-slate-800 px-3">
                <span className="text-xs font-semibold text-slate-400">₨</span>
                <input
                  type="number"
                  value={config.goldPrice24kPerTola}
                  onChange={(e) =>
                    setConfig({ ...config, goldPrice24kPerTola: Number(e.target.value) })
                  }
                  className="w-full bg-transparent px-2.5 py-2 font-mono text-sm text-white focus:outline-none"
                />
              </div>
              <span className="mt-1 block text-[11px] text-slate-400">
                1 Tola = 11.6638 Grams = 12 Masha = 96 Ratti
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">
                22 Karat Gold (PKR / Tola)
              </label>
              <div className="mt-1.5 flex items-center rounded-xl border border-slate-700 bg-slate-800 px-3">
                <span className="text-xs font-semibold text-slate-400">₨</span>
                <input
                  type="number"
                  value={config.goldPrice22kPerTola}
                  onChange={(e) =>
                    setConfig({ ...config, goldPrice22kPerTola: Number(e.target.value) })
                  }
                  className="w-full bg-transparent px-2.5 py-2 font-mono text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">
                Chandi / Silver (PKR / Tola)
              </label>
              <div className="mt-1.5 flex items-center rounded-xl border border-slate-700 bg-slate-800 px-3">
                <span className="text-xs font-semibold text-slate-400">₨</span>
                <input
                  type="number"
                  value={config.silverPricePerTola}
                  onChange={(e) =>
                    setConfig({ ...config, silverPricePerTola: Number(e.target.value) })
                  }
                  className="w-full bg-transparent px-2.5 py-2 font-mono text-sm text-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Real Estate Marla & Land Standards */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-2 text-emerald-400">
            <Building className="h-5 w-5" />
            <h2 className="text-base font-bold text-white">Land & Real Estate Marla Standards</h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Standardization rules across private modern housing societies vs official revenue patwaris
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Default Platform Preset (Sq Ft per Marla)
              </label>
              <select
                value={config.marlaPresetSqFt}
                onChange={(e) =>
                  setConfig({ ...config, marlaPresetSqFt: Number(e.target.value) })
                }
                className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value={225}>225 Sq Ft — Modern Housing (DHA, Bahria Town, CDA, LDA)</option>
                <option value={272.25}>272.25 Sq Ft — Official Board of Revenue / Patwari Standard</option>
                <option value={250}>250 Sq Ft — Semi-Urban Standard (Sindh & KPK)</option>
              </select>
            </div>

            {/* District Presets Table */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="text-xs font-semibold text-slate-300">District Formula Defaults:</div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between rounded bg-slate-900 p-2">
                  <span className="text-slate-400">Lahore:</span>
                  <span className="font-mono font-semibold text-emerald-400">225 sq ft</span>
                </div>
                <div className="flex items-center justify-between rounded bg-slate-900 p-2">
                  <span className="text-slate-400">Rawalpindi/ISB:</span>
                  <span className="font-mono font-semibold text-emerald-400">272.25 sq ft</span>
                </div>
                <div className="flex items-center justify-between rounded bg-slate-900 p-2">
                  <span className="text-slate-400">Karachi:</span>
                  <span className="font-mono font-semibold text-emerald-400">225 sq ft</span>
                </div>
                <div className="flex items-center justify-between rounded bg-slate-900 p-2">
                  <span className="text-slate-400">Multan/Peshawar:</span>
                  <span className="font-mono font-semibold text-emerald-400">272.25 sq ft</span>
                </div>
              </div>
            </div>

            {/* Forex Spread Buffer */}
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Forex Open Market Spread Buffer (%)
              </label>
              <div className="mt-1.5 flex items-center rounded-xl border border-slate-700 bg-slate-800 px-3">
                <input
                  type="number"
                  step="0.05"
                  value={config.forexMarkupPercent}
                  onChange={(e) =>
                    setConfig({ ...config, forexMarkupPercent: Number(e.target.value) })
                  }
                  className="w-full bg-transparent px-2 py-2 font-mono text-sm text-white focus:outline-none"
                />
                <span className="text-xs font-semibold text-slate-400">%</span>
              </div>
              <span className="mt-1 block text-[11px] text-slate-400">
                Added to SBP interbank rates to accurately calculate open market exchange rates
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
