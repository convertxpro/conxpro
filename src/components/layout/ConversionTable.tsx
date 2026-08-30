import React from 'react';
import { cn } from '@/lib/utils';

export interface ConversionRow {
  fromValue: string | number;
  toValue: string | number;
  extraInfo?: string;
}

export interface ConversionTableProps {
  headers: [string, string] | [string, string, string];
  rows: ConversionRow[];
  caption?: string;
  className?: string;
}

export const ConversionTable: React.FC<ConversionTableProps> = ({
  headers,
  rows,
  caption,
  className,
}) => {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-900/40',
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          {caption && (
            <caption className="border-b border-slate-100 bg-slate-50/50 p-3 text-left font-medium text-slate-500 dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-400">
              {caption}
            </caption>
          )}
          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            <tr>
              <th scope="col" className="px-5 py-3.5">
                {headers[0]}
              </th>
              <th scope="col" className="px-5 py-3.5">
                {headers[1]}
              </th>
              {headers[2] && (
                <th scope="col" className="px-5 py-3.5">
                  {headers[2]}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {rows.map((row, idx) => (
              <tr
                key={`row-${idx}`}
                className={cn(
                  'transition-colors hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20',
                  idx % 2 === 1 && 'bg-slate-50/40 dark:bg-slate-900/20'
                )}
              >
                <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-200">
                  {row.fromValue}
                </td>
                <td className="px-5 py-3 font-semibold text-indigo-600 dark:text-indigo-400">
                  {row.toValue}
                </td>
                {headers[2] && (
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                    {row.extraInfo || '-'}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
