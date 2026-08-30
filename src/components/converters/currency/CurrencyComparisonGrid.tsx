'use client';

import React from 'react';
import Link from 'next/link';
import { CURRENCIES, REMITTANCE_CURRENCIES } from '@/lib/forex/matrix';
import { calculateCrossRate } from '@/lib/forex/forex-service';
import { ArrowUpRight } from 'lucide-react';

interface CurrencyComparisonGridProps {
  baseAmount: number;
  fromCurrency: string;
  rates: Record<string, number>;
  onSelectCurrency?: (code: string) => void;
}

export const CurrencyComparisonGrid: React.FC<CurrencyComparisonGridProps> = ({
  baseAmount,
  fromCurrency,
  rates,
  onSelectCurrency,
}) => {
  const targetCurrencies = REMITTANCE_CURRENCIES.filter((c) => c !== fromCurrency);

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/70">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800/60">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Multi-Currency Instant Comparison
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Live conversion of {baseAmount.toLocaleString()} {fromCurrency} across major global currencies
          </p>
        </div>
        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
          Live Rates
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {targetCurrencies.map((code) => {
          const info = CURRENCIES[code] || { code, name: code, symbol: code, flag: '🌐' };
          const rate = calculateCrossRate(rates, fromCurrency, code);
          const convertedValue = baseAmount * rate;
          const isPkr = code === 'PKR';

          return (
            <div
              key={code}
              onClick={() => onSelectCurrency && onSelectCurrency(code)}
              className={`group flex flex-col justify-between rounded-2xl border p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${
                isPkr
                  ? 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-400 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                  : 'border-slate-200/80 bg-slate-50/60 hover:border-indigo-300 dark:border-slate-800/80 dark:bg-slate-950/40 dark:hover:border-indigo-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{info.flag}</span>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {info.code}
                    </span>
                    <p className="text-[10px] text-slate-400 truncate max-w-[90px]">
                      {info.name}
                    </p>
                  </div>
                </div>
                {isPkr && (
                  <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                    Primary
                  </span>
                )}
              </div>

              <div className="mt-3">
                <p className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                  {info.symbol} {convertedValue.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                  1 {fromCurrency} = {rate < 1 ? rate.toFixed(4) : rate.toFixed(2)} {code}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
