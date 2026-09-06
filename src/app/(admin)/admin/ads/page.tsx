'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Save,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { AD_PLACEMENTS, AdPlacementConfig, AdPlacementKey } from '@/components/ads/ad-config';

interface AdPlacementState extends AdPlacementConfig {
  provider: 'adsense' | 'ezoic' | 'medianet' | 'custom_banner';
  unitId: string;
}

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Record<AdPlacementKey, AdPlacementState>>(() => {
    return Object.entries(AD_PLACEMENTS).reduce((acc, [k, v]) => {
      acc[k as AdPlacementKey] = {
        ...v,
        provider: 'adsense',
        unitId: `ca-pub-9482019482/${k}`,
      };
      return acc;
    }, {} as Record<AdPlacementKey, AdPlacementState>);
  });

  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch live config from server API
    fetch('/api/admin/ads')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.ads) {
          setAds((prev) => ({
            ...prev,
            ...data.ads,
          }));
        }
      })
      .catch((err) => console.error('Failed to load ad configs', err));
  }, []);

  const handleToggle = (key: AdPlacementKey) => {
    setAds((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        enabled: !prev[key].enabled,
      },
    }));
  };

  const handleProviderChange = (key: AdPlacementKey, provider: string) => {
    setAds((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        provider: provider as any,
      },
    }));
  };

  const handleUnitIdChange = (key: AdPlacementKey, unitId: string) => {
    setAds((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        unitId,
      },
    }));
  };

  const handleSavePlacement = async (key: AdPlacementKey) => {
    setSavingKey(key);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ads[key]),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`Placement '${ads[key].name}' updated successfully!`);
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage(data.error || 'Failed to save configuration');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error saving ad configuration');
    } finally {
      setSavingKey(null);
    }
  };

  const handleSaveAll = async () => {
    setSavingKey('all');
    setSuccessMessage(null);
    try {
      for (const key of Object.keys(ads) as AdPlacementKey[]) {
        await fetch('/api/admin/ads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ads[key]),
        });
      }
      setSuccessMessage('All 6 ad placement configurations updated successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (e) {
      setErrorMessage('Failed to batch save configurations');
    } finally {
      setSavingKey(null);
    }
  };

  const totalEnabled = Object.values(ads).filter((a) => a.enabled).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Live Ad Placement Console
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Control individual ad slots, switch network providers, and toggle monetization in real
            time without redeploying.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-slate-300">
            <span className="font-semibold text-emerald-400">{totalEnabled}</span> / 6 Units Active
          </div>
          <button
            onClick={handleSaveAll}
            disabled={savingKey === 'all'}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 disabled:opacity-50"
          >
            {savingKey === 'all' ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>{savingKey === 'all' ? 'Saving All...' : 'Save All Placements'}</span>
          </button>
        </div>
      </div>

      {/* Success/Error Alerts */}
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

      {/* AdSense Policy Strict Compliance Notice */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>AdSense Policy Compliance Guards</span>
        </div>
        <p className="mt-1 text-xs text-slate-400 leading-relaxed">
          ApexTools enforces Google AdSense program policies automatically: all units enforce
          CLS-locked container heights, explicit &apos;Advertisement&apos; labels, a mandatory 25px buffer
          away from download buttons, and automatic hiding on mobile when viewport width is below
          the minimum threshold.
        </p>
      </div>

      {/* Placements Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3.5 font-semibold">Placement & Key</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
                <th className="px-4 py-3.5 font-semibold">Dimensions</th>
                <th className="px-4 py-3.5 font-semibold">Network Provider</th>
                <th className="px-4 py-3.5 font-semibold">Ad Unit Slot ID</th>
                <th className="px-4 py-3.5 font-semibold">Mobile Guard</th>
                <th className="px-5 py-3.5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(Object.keys(ads) as AdPlacementKey[]).map((key) => {
                const item = ads[key];
                const isSaving = savingKey === key;

                return (
                  <tr key={key} className="transition-colors hover:bg-slate-800/30">
                    {/* Placement Name & Key */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-200">{item.name}</div>
                      <div className="mt-0.5 font-mono text-[11px] text-slate-400">{item.key}</div>
                      <div className="mt-1 text-[11px] text-slate-400">{item.description}</div>
                    </td>

                    {/* Enable/Disable Toggle */}
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleToggle(key)}
                        className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold transition-all hover:bg-slate-800"
                      >
                        {item.enabled ? (
                          <>
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            <span className="text-emerald-400 font-bold">ACTIVE</span>
                          </>
                        ) : (
                          <>
                            <span className="h-2 w-2 rounded-full bg-slate-500" />
                            <span className="text-slate-400">PAUSED</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Dimensions & Min Height */}
                    <td className="px-4 py-4 font-mono text-[11px] text-slate-300">
                      <div>
                        {item.width} × {item.height} px
                      </div>
                      <div className="text-[10px] text-slate-400">MinH: {item.minHeight}px</div>
                    </td>

                    {/* Provider Selector */}
                    <td className="px-4 py-4">
                      <select
                        value={item.provider}
                        onChange={(e) => handleProviderChange(key, e.target.value)}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="adsense">Google AdSense</option>
                        <option value="ezoic">Ezoic</option>
                        <option value="medianet">Media.net</option>
                        <option value="custom_banner">Custom HTML Banner</option>
                      </select>
                    </td>

                    {/* Slot ID */}
                    <td className="px-4 py-4">
                      <input
                        type="text"
                        value={item.unitId}
                        onChange={(e) => handleUnitIdChange(key, e.target.value)}
                        className="w-44 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 font-mono text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                        placeholder="Slot or Div ID"
                      />
                    </td>

                    {/* Mobile Guard */}
                    <td className="px-4 py-4 text-[11px] text-slate-400">
                      {item.hideOnMobile ? (
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-300">
                          Hidden on Mobile
                        </span>
                      ) : (
                        <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-indigo-400">
                          {item.mobileWidth || item.width}×{item.mobileHeight || item.height}
                        </span>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleSavePlacement(key)}
                        disabled={isSaving}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-600/20 px-3 py-1.5 text-xs font-semibold text-indigo-300 transition-all hover:bg-indigo-600 hover:text-white disabled:opacity-50"
                      >
                        {isSaving ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <Save className="h-3 w-3" />
                        )}
                        <span>{isSaving ? 'Saving...' : 'Save'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
