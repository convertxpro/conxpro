'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserTier } from './quota-manager';
import { useAuth } from '@/components/auth/AuthProvider';

export interface QuotaState {
  tier: UserTier;
  limit: number;
  used: number;
  remaining: number;
  maxFileSizeBytes: number;
  maxFileSizeDisplay: string;
  resetsInSeconds: number;
  resetsAt: string;
  authenticated: boolean;
}

export interface ConsumeQuotaOptions {
  fileSize?: number;
  onExceeded?: () => void;
}

export interface QuotaContextType {
  quota: QuotaState;
  isLoading: boolean;
  isModalOpen: boolean;
  modalDetails: {
    message?: string;
    tier?: UserTier;
    used?: number;
    limit?: number;
    resetsAt?: string;
  } | null;
  openModal: (details?: Partial<QuotaContextType['modalDetails']>) => void;
  closeModal: () => void;
  refreshQuota: () => Promise<void>;
  consumeQuota: (options?: ConsumeQuotaOptions) => Promise<{ success: boolean; error?: string }>;
  checkQuota: (fileSize?: number) => Promise<{ allowed: boolean; reason?: string }>;
}

const defaultQuota: QuotaState = {
  tier: 'anonymous',
  limit: 10,
  used: 0,
  remaining: 10,
  maxFileSizeBytes: 25 * 1024 * 1024,
  maxFileSizeDisplay: '25 MB',
  resetsInSeconds: 86400,
  resetsAt: 'Midnight PKT (UTC+5)',
  authenticated: false,
};

const QuotaContext = createContext<QuotaContextType | undefined>(undefined);

export const QuotaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [quota, setQuota] = useState<QuotaState>({
    ...defaultQuota,
    limit: user ? 25 : 10,
    remaining: user ? 25 : 10,
    tier: user ? 'free' : 'anonymous',
    authenticated: Boolean(user),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDetails, setModalDetails] = useState<QuotaContextType['modalDetails']>(null);

  const fetchQuotaStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/quota', {
        method: 'GET',
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setQuota({
          tier: data.tier || (user ? 'free' : 'anonymous'),
          limit: data.limit || (user ? 25 : 10),
          used: data.used ?? 0,
          remaining: data.remaining ?? (user ? 25 : 10),
          maxFileSizeBytes: data.maxFileSizeBytes || (user ? 100 * 1024 * 1024 : 25 * 1024 * 1024),
          maxFileSizeDisplay: data.maxFileSizeDisplay || (user ? '100 MB' : '25 MB'),
          resetsInSeconds: data.resetsInSeconds || 86400,
          resetsAt: data.resetsAt || 'Midnight PKT (UTC+5)',
          authenticated: Boolean(data.authenticated || user),
        });
      }
    } catch (err) {
      console.warn('Failed to fetch quota status:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchQuotaStatus();
  }, [fetchQuotaStatus]);

  const openModal = useCallback((details?: Partial<QuotaContextType['modalDetails']>) => {
    setModalDetails({
      message: details?.message || `You have reached your daily conversion limit (${quota.limit}/${quota.limit}).`,
      tier: details?.tier || quota.tier,
      used: details?.used || quota.limit,
      limit: details?.limit || quota.limit,
      resetsAt: details?.resetsAt || quota.resetsAt,
    });
    setIsModalOpen(true);
  }, [quota]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Listen for global quota exceeded events from anywhere in the app
  useEffect(() => {
    const handleGlobalQuotaExceeded = (e: CustomEvent) => {
      openModal(e.detail);
    };

    window.addEventListener('apextools:quota-exceeded' as any, handleGlobalQuotaExceeded);
    return () => {
      window.removeEventListener('apextools:quota-exceeded' as any, handleGlobalQuotaExceeded);
    };
  }, [openModal]);

  const checkQuota = useCallback(async (fileSize?: number): Promise<{ allowed: boolean; reason?: string }> => {
    if (fileSize && fileSize > quota.maxFileSizeBytes) {
      return {
        allowed: false,
        reason: `File size exceeds ${quota.maxFileSizeDisplay} limit for ${quota.tier === 'anonymous' ? 'anonymous users' : 'free accounts'}.`,
      };
    }

    if (quota.remaining <= 0) {
      openModal();
      return {
        allowed: false,
        reason: 'DAILY_QUOTA_EXCEEDED',
      };
    }

    return { allowed: true };
  }, [quota, openModal]);

  const consumeQuota = useCallback(async (options?: ConsumeQuotaOptions): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/quota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'increment',
          fileSize: options?.fileSize,
        }),
      });

      if (res.status === 429) {
        const errorData = await res.json();
        openModal({
          message: errorData.message,
          tier: errorData.tier,
          used: errorData.used,
          limit: errorData.limit,
          resetsAt: errorData.resetsAt,
        });
        if (options?.onExceeded) options.onExceeded();
        return { success: false, error: 'DAILY_QUOTA_EXCEEDED' };
      }

      if (res.status === 413) {
        const errorData = await res.json();
        return { success: false, error: errorData.message || 'FILE_SIZE_LIMIT_EXCEEDED' };
      }

      if (res.ok) {
        const data = await res.json();
        setQuota((prev) => ({
          ...prev,
          used: data.used ?? prev.used + 1,
          remaining: data.remaining ?? Math.max(0, prev.remaining - 1),
          resetsInSeconds: data.resetsInSeconds ?? prev.resetsInSeconds,
        }));
        return { success: true };
      }

      return { success: true };
    } catch (err: any) {
      console.warn('Could not consume quota through API, decrementing locally:', err);
      setQuota((prev) => ({
        ...prev,
        used: prev.used + 1,
        remaining: Math.max(0, prev.remaining - 1),
      }));
      return { success: true };
    }
  }, [openModal]);

  return (
    <QuotaContext.Provider
      value={{
        quota,
        isLoading,
        isModalOpen,
        modalDetails,
        openModal,
        closeModal,
        refreshQuota: fetchQuotaStatus,
        consumeQuota,
        checkQuota,
      }}
    >
      {children}
    </QuotaContext.Provider>
  );
};

export const useQuota = () => {
  const context = useContext(QuotaContext);
  if (!context) {
    throw new Error('useQuota must be used within a QuotaProvider');
  }
  return context;
};
