import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Account Authentication | ApexTools',
  description: 'Sign in or create your free ApexTools account.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background glow accents */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[450px] w-[700px] rounded-full bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-emerald-500/10 blur-3xl dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-emerald-950/20" />
      </div>
      {children}
    </div>
  );
}
