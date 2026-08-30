'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { UserProfile, UserPlan } from '@/lib/supabase/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  plan: UserPlan;
  dailyUsage: {
    used: number;
    limit: number;
    remaining: number;
    percentUsed: number;
    resetsAt: string; // e.g. "Midnight PKT"
  };
  isLoading: boolean;
  signInWithOtp: (email: string) => Promise<{ error: Error | null; success: boolean }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: Error | null; success: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [usedCount, setUsedCount] = useState<number>(3); // Default demo value if not synced yet
  const [isLoading, setIsLoading] = useState(true);

  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
  );

  const fetchProfileAndUsage = useCallback(async (currentUser: User) => {
    if (!isConfigured) {
      setProfile({
        id: currentUser.id,
        email: currentUser.email || 'user@example.com',
        plan: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setUsedCount(4);
      return;
    }

    try {
      // 1. Fetch user profile
      const { data: profileData, error: profileErr } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileData) {
        setProfile(profileData as UserProfile);
      } else if (profileErr) {
        // Fallback profile if row hasn't synced yet
        setProfile({
          id: currentUser.id,
          email: currentUser.email || '',
          plan: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      // 2. Fetch today's usage count
      const todayStr = new Date().toISOString().split('T')[0];
      const { data: usageData } = await supabase
        .from('usage_daily')
        .select('conversions_count')
        .eq('user_id', currentUser.id)
        .eq('date', todayStr)
        .maybeSingle();

      if (usageData && 'conversions_count' in (usageData as object)) {
        setUsedCount(Number((usageData as { conversions_count: number }).conversions_count) || 0);
      } else {
        setUsedCount(0);
      }
    } catch (err) {
      console.warn('Could not sync user profile/usage:', err);
    }
  }, [isConfigured, supabase]);

  useEffect(() => {
    // Initial Session Check
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        if (initialSession?.user) {
          await fetchProfileAndUsage(initialSession.user);
        }
      } catch (err) {
        console.warn('Supabase auth initialization:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        await fetchProfileAndUsage(newSession.user);
      } else {
        setProfile(null);
        setUsedCount(0);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfileAndUsage]);

  const signInWithOtp = async (email: string) => {
    if (!isConfigured) {
      // Demo mock login for local developer experience without live Supabase keys
      const mockUser = {
        id: 'demo-user-123',
        email,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User;
      setUser(mockUser);
      setProfile({
        id: mockUser.id,
        email,
        plan: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setUsedCount(4);
      return { error: null, success: true };
    }

    try {
      const redirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/callback` 
        : '/auth/callback';

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;
      return { error: null, success: true };
    } catch (err: any) {
      return { error: err as Error, success: false };
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    if (!isConfigured) {
      const mockUser = {
        id: 'demo-user-123',
        email,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User;
      setUser(mockUser);
      setProfile({
        id: mockUser.id,
        email,
        plan: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return { error: null, success: true };
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'magiclink',
      });
      if (error) throw error;
      if (data.user) {
        setUser(data.user);
        await fetchProfileAndUsage(data.user);
      }
      return { error: null, success: true };
    } catch (err: any) {
      return { error: err as Error, success: false };
    }
  };

  const signOut = async () => {
    try {
      if (isConfigured) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setSession(null);
      setProfile(null);
      setUsedCount(0);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfileAndUsage(user);
    }
  };

  // Free registered accounts get 25 conversions/day; Anonymous visitors get 10
  const dailyLimit = user ? 25 : 10;
  const remaining = Math.max(0, dailyLimit - usedCount);
  const percentUsed = Math.min(100, Math.round((usedCount / dailyLimit) * 100));

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        plan: profile?.plan || 'free',
        dailyUsage: {
          used: usedCount,
          limit: dailyLimit,
          remaining,
          percentUsed,
          resetsAt: 'Midnight PKT (UTC+5)',
        },
        isLoading,
        signInWithOtp,
        verifyOtp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
