'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CURRENCIES,
  CURRENCY_LIST,
  POPULAR_CURRENCIES,
  generateCurrencyTable,
  generateInverseCurrencyTable,
} from '@/lib/forex/matrix';
import { calculateCrossRate, ForexRatesResponse } from '@/lib/forex/forex-service';
import { ForexTrendChart } from './ForexTrendChart';
import { CurrencyComparisonGrid } from './CurrencyComparisonGrid';
import { RemittanceComparison } from './RemittanceComparison';
import {
  ArrowLeftRight,
  Copy,
  Check,
  Share2,
  RefreshCw,
  TrendingUp,
  Search,
  Sparkles,
  DollarSign,
  Landmark,
} from 'lucide-react';

interface CurrencyConverterProps {
  initialFrom?: string;
  initialTo?: string;
  initialAmount?: number;
}

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({
  initialFrom = 'USD',
  initialTo = 'PKR',
  initialAmount = 100,
}) => {
  const [amount, setAmount] = useState<string>(initialAmount.toString());
  const [fromCurrency, setFromCurrency] = useState<string>(initialFrom.toUpperCase());
  const [toCurrency, setToCurrency] = useState<string>(initialTo.toUpperCase());
  const [ratesData, setRatesData] = useState<ForexRatesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [fromSearch, setFromSearch] = useState<string>('');
  const [toSearch, setToSearch] = useState<string>('');
  const [showFromDropdown, setShowFromDropdown] = useState<boolean>(false);
  const [showToDropdown, setShowToDropdown] = useState<boolean>(false);

  // Sync state if props change (e.g. navigation between routes)
  useEffect(() => {
    if (initialFrom) setFromCurrency(initialFrom.toUpperCase());
    if (initialTo) setToCurrency(initialTo.toUpperCase());
  }, [initialFrom, initialTo]);

  // Fetch exchange rates from backend API
  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/forex/rates');
      if (res.ok) {
        const data: ForexRatesResponse = await res.json();
        setRatesData(data);
      }
    } catch (err) {
      console.error('Failed to load forex rates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const numAmount = parseFloat(amount) || 0;

  // Active rates map or fallback
  const rates = useMemo(() => {
    return (
      ratesData?.rates || {
        USD: 1,
        PKR: 278.50,
        SAR: 3.751,
        AED: 3.673,
        GBP: 0.772,
        EUR: 0.912,
        CAD: 1.355,
        AUD: 1.503,
        QAR: 3.645,
        KWD: 0.306,
        OMR: 0.385,
        CNY: 7.142,
      }
    );
  }, [ratesData]);

  // Exchange rate calculations
  const unitRate = calculateCrossRate(rates, fromCurrency, toCurrency);
  const inverseUnitRate = unitRate > 0 ? 1 / unitRate : 0;
  const convertedTotal = numAmount * unitRate;

  const fromInfo = CURRENCIES[fromCurrency] || {
    code: fromCurrency,
    name: fromCurrency,
    symbol: fromCurrency,
    flag: '🌐',
  };
  const toInfo = CURRENCIES[toCurrency] || {
    code: toCurrency,
    name: toCurrency,
    symbol: toCurrency,
    flag: '🌐',
  };

  // Swap currencies
  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  // Copy result text
  const handleCopy = () => {
    const text = `${numAmount} ${fromCurrency} = ${convertedTotal.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${toCurrency} (Rate: 1 ${fromCurrency} = ${unitRate.toFixed(4)} ${toCurrency})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // WhatsApp share
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `💵 *Currency Exchange Rate on ConvertHub*\n` +
      `${numAmount.toLocaleString()} ${fromCurrency} = *${toInfo.symbol} ${convertedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${toCurrency}*\n` +
      `1 ${fromCurrency} = ${unitRate.toFixed(4)} ${toCurrency}\n` +
      `Check live forex rates: ${typeof window !== 'undefined' ? window.location.href : ''}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Filter currency lists for dropdown search
  const filteredFromCurrencies = CURRENCY_LIST.filter(
    (c) =>
      c.code.toLowerCase().includes(fromSearch.toLowerCase()) ||
      c.name.toLowerCase().includes(fromSearch.toLowerCase())
  );

  const filteredToCurrencies = CURRENCY_LIST.filter(
    (c) =>
      c.code.toLowerCase().includes(toSearch.toLowerCase()) ||
      c.name.toLowerCase().includes(toSearch.toLowerCase())
  );

  // Pre-calculated conversion tables
  const directTable = useMemo(
    () => generateCurrencyTable(fromCurrency, toCurrency, unitRate),
    [fromCurrency, toCurrency, unitRate]
  );
  const inverseTable = useMemo(
    () => generateInverseCurrencyTable(fromCurrency, toCurrency, unitRate),
    [fromCurrency, toCurrency, unitRate]
  );

  const currentPairKey = `${fromCurrency}/${toCurrency}`;

  return (
    <div className="w-full space-y-8">
      {/* 1. Main Currency Converter Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-xl backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 sm:p-8">
        {/* Quick Pick Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5 dark:border-slate-800/60">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Live Forex Exchange Calculator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mid-market interbank & open market rates updated hourly
              </p>
            </div>
          </div>

          {/* Quick-Pick Currency Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Quick:
            </span>
            {['USD', 'SAR', 'AED', 'GBP', 'EUR', 'CAD'].map((code) => {
              const info = CURRENCIES[code];
              const isSelected = fromCurrency === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setFromCurrency(code)}
                  className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{info?.flag}</span>
                  <span>{code}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input & Selector Grid */}
        <div className="mt-6 grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr,auto,1fr]">
          {/* Amount and From Currency Box */}
          <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition-all focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-950/40 dark:focus-within:bg-slate-900">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Amount & From Currency
              </label>
              <span className="text-xs font-semibold text-slate-400">{fromInfo.symbol}</span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                className="w-full bg-transparent text-2xl font-extrabold text-slate-900 outline-none dark:text-white"
              />

              {/* From Currency Selector Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowFromDropdown(!showFromDropdown);
                    setShowToDropdown(false);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  <span className="text-lg">{fromInfo.flag}</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {fromInfo.code}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showFromDropdown && (
                  <div className="absolute right-0 z-50 mt-2 max-h-64 w-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                    <div className="sticky top-0 bg-white pb-2 dark:bg-slate-900">
                      <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-2.5 py-1.5 dark:border-slate-700">
                        <Search className="h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search currency..."
                          value={fromSearch}
                          onChange={(e) => setFromSearch(e.target.value)}
                          className="w-full bg-transparent text-xs outline-none dark:text-white"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      {filteredFromCurrencies.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setFromCurrency(c.code);
                            setShowFromDropdown(false);
                            setFromSearch('');
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition ${
                            fromCurrency === c.code
                              ? 'bg-indigo-50 font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{c.flag}</span>
                            <span>{c.name}</span>
                          </div>
                          <span className="font-bold text-slate-400">{c.code}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Swap Button */}
          <div className="flex justify-center md:pt-4">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap Currencies"
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50 text-indigo-600 shadow-md transition-all duration-200 hover:scale-110 hover:bg-indigo-600 hover:text-white dark:border-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-400 dark:hover:bg-indigo-600 dark:hover:text-white"
            >
              <ArrowLeftRight className="h-5 w-5" />
            </button>
          </div>

          {/* Converted Output and To Currency Box */}
          <div className="relative rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4 transition-all dark:border-emerald-900/60 dark:bg-emerald-950/20">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                Converted Payout ({toInfo.code})
              </label>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                {toInfo.symbol}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="truncate text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
                {convertedTotal.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>

              {/* To Currency Selector Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowToDropdown(!showToDropdown);
                    setShowFromDropdown(false);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  <span className="text-lg">{toInfo.flag}</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {toInfo.code}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showToDropdown && (
                  <div className="absolute right-0 z-50 mt-2 max-h-64 w-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                    <div className="sticky top-0 bg-white pb-2 dark:bg-slate-900">
                      <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-2.5 py-1.5 dark:border-slate-700">
                        <Search className="h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search currency..."
                          value={toSearch}
                          onChange={(e) => setToSearch(e.target.value)}
                          className="w-full bg-transparent text-xs outline-none dark:text-white"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      {filteredToCurrencies.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setToCurrency(c.code);
                            setShowToDropdown(false);
                            setToSearch('');
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition ${
                            toCurrency === c.code
                              ? 'bg-indigo-50 font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{c.flag}</span>
                            <span>{c.name}</span>
                          </div>
                          <span className="font-bold text-slate-400">{c.code}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Highlight Result Banner & Timestamp */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200/60 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-emerald-50/30 p-4 dark:border-slate-800/60 dark:from-slate-950/60 dark:via-indigo-950/20 dark:to-emerald-950/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                1 {fromCurrency} = {unitRate < 1 ? unitRate.toFixed(4) : unitRate.toFixed(2)}{' '}
                {toCurrency}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                1 {toCurrency} = {inverseUnitRate < 1 ? inverseUnitRate.toFixed(4) : inverseUnitRate.toFixed(2)}{' '}
                {fromCurrency}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              ⚡ High-speed hourly cached rates • Source:{' '}
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {ratesData?.source === 'redis'
                  ? 'Redis Cache (<10ms)'
                  : ratesData?.source === 'database'
                  ? 'Supabase Cloud DB'
                  : 'Live Interbank API'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-600"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={fetchRates}
              disabled={loading}
              title="Refresh live exchange rates"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Multi-Currency Instant Comparison Grid */}
      <CurrencyComparisonGrid
        baseAmount={numAmount}
        fromCurrency={fromCurrency}
        rates={rates}
        onSelectCurrency={(code) => setToCurrency(code)}
      />

      {/* 4. 7-Day & 30-Day Historical Trend Chart */}
      <ForexTrendChart pair={currentPairKey} />

      {/* 5. Remittance Cost & Savings Estimator (shown when destination is PKR) */}
      {toCurrency === 'PKR' && (
        <RemittanceComparison
          amount={numAmount}
          fromCurrency={fromCurrency}
          rates={rates}
        />
      )}

      {/* 6. Pre-Calculated Denomination Conversion Matrix Tables (Exact-match SEO) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Direct Table */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/70">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {directTable.title}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Standard denomination quick conversion matrix
          </p>

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
                <tr>
                  <th className="p-3">{directTable.headers[0]}</th>
                  <th className="p-3 text-right">{directTable.headers[1]}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {directTable.rows.map((row, i) => (
                  <tr
                    key={i}
                    className="hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors"
                  >
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                      {row.from}
                    </td>
                    <td className="p-3 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                      {row.to}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inverse Table */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/70">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {inverseTable.title}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Reverse conversion matrix from {toCurrency} to {fromCurrency}
          </p>

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
                <tr>
                  <th className="p-3">{inverseTable.headers[0]}</th>
                  <th className="p-3 text-right">{inverseTable.headers[1]}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {inverseTable.rows.map((row, i) => (
                  <tr
                    key={i}
                    className="hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors"
                  >
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                      {row.from}
                    </td>
                    <td className="p-3 text-right font-extrabold text-indigo-600 dark:text-indigo-400">
                      {row.to}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
