import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from './JsonLd';

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('mb-6 flex items-center text-xs text-slate-500 dark:text-slate-400', className)}
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.url} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-600" />
              )}
              {isLast ? (
                <span
                  aria-current="page"
                  className="font-medium text-slate-800 dark:text-slate-200"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.url.replace('https://converthub.com', '') || '/'}
                  className="inline-flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {index === 0 && <Home className="h-3.5 w-3.5" />}
                  <span>{item.name}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
