'use client';

import React from 'react';
import { CURRENCIES } from '@/lib/forex/matrix';
import { calculateCrossRate } from '@/lib/forex/forex-service';
import { Landmark, Zap, ShieldCheck, HelpCircle, ArrowRight } from 'lucide-react';

interface RemittanceComparisonProps {
  amount: number;
  fromCurrency: string;
  rates: Record<string, number>;
}

export const RemittanceComparison: React.FC<RemittanceComparisonProps> = ({
  amount,
  fromCurrency,
  rates,
}) => {
  const pkrRate = calculateCrossRate(rates, fromCurrency, 'PKR');
  const basePkr = amount * pkrRate;

  // Remittance channels modeling
  const channels = [
    {
      name: 'Roshan Digital Account (RDA) / Direct Bank Wire',
      tag: 'State Bank of Pakistan Backed',
      badge: 'Zero Fee for >$100',
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
      icon: Landmark,
      exchangeRate: +(pkrRate * 0.998).toFixed(2), // Interbank with ~0.2% spread
      fee: amount >= 100 ? 0 : 5,
      deliveryTime: '1 - 2 Business Days',
      taxExemption: '100% Tax Free Remittance',
    },
    {
      name: 'ACE Money Transfer / Remitly / Western Union',
      tag: 'Fast Cash Pickup & Account Credit',
      badge: 'Popular for Diaspora',
      badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
      icon: Zap,
      exchangeRate: +(pkrRate * 0.992).toFixed(2), // ~0.8% margin
      fee: 2.99,
      deliveryTime: 'Instant to 1 Hour',
      taxExemption: 'PRC (Proceeds Realization Certificate) Issued',
    },
    {
      name: 'Wise / Payoneer (IT Freelancers & Exporters)',
      tag: 'Freelance Payouts & Tech Remittance',
      badge: 'Transparent Mid-Market',
      badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
      icon: ShieldCheck,
      exchangeRate: +(pkrRate * 0.996).toFixed(2), // ~0.4% margin
      fee: +(amount * 0.012).toFixed(2), // ~1.2% fee
      deliveryTime: 'Few Hours to Same Day',
      taxExemption: '0.25% PSEB Registered IT Export Tax',
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/70">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800/60">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Pakistan Remittance Comparison & Net PKR Estimator
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Estimated net PKR payout for sending {amount.toLocaleString()} {fromCurrency} to Pakistan
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
          🇵🇰 SBP Guidelines
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {channels.map((channel, idx) => {
          const effectiveAmount = Math.max(0, amount - channel.fee);
          const netPkr = effectiveAmount * channel.exchangeRate;
          const Icon = channel.icon;

          return (
            <div
              key={idx}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all duration-200 hover:border-indigo-300 hover:bg-white dark:border-slate-800/80 dark:bg-slate-950/40 dark:hover:border-indigo-800 dark:hover:bg-slate-900/80"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {channel.name}
                    </h4>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${channel.badgeColor}`}>
                      {channel.badge}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {channel.tag} • Delivery: <strong className="text-slate-700 dark:text-slate-300">{channel.deliveryTime}</strong>
                  </p>
                  <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ {channel.taxExemption}
                  </p>
                </div>
              </div>

              <div className="flex md:flex-col items-end justify-between border-t border-slate-200/60 pt-2 md:border-0 md:pt-0">
                <div className="text-left md:text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Net Received in PKR
                  </span>
                  <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    Rs. {netPkr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-500 dark:text-slate-400">
                  Rate: 1 {fromCurrency} = {channel.exchangeRate.toFixed(2)} PKR
                  {channel.fee > 0 ? ` (Fee: $${channel.fee})` : ' (Zero Fee)'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-center text-[11px] text-slate-400 dark:text-slate-500">
        💡 Under SBP PRI (Pakistan Remittance Initiative), remittances sent through legal banking channels over $100 are completely free of transfer charges.
      </p>
    </div>
  );
};
