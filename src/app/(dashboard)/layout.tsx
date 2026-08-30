import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'User Dashboard | ConvertHub',
  description: 'Manage your ConvertHub account, monitor daily conversion quotas, and view conversion history.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
