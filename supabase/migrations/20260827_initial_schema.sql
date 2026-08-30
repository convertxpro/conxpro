-- ==============================================================================
-- ConvertHub / Lapvy Enterprises - Database Schema Migration
-- Initial Schema: Users, Daily Quota Usage, Conversion Jobs, Dynamic Ads & RLS
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. DAILY USAGE COUNTERS (For analytics & persistent daily quotas)
CREATE TABLE IF NOT EXISTS public.usage_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    ip_hash TEXT, -- SHA-256 salted hash of IP address for anonymous users
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    conversions_count INTEGER NOT NULL DEFAULT 1,
    last_conversion_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT user_or_ip_check CHECK (
        (user_id IS NOT NULL AND ip_hash IS NULL) OR 
        (user_id IS NULL AND ip_hash IS NOT NULL)
    ),
    CONSTRAINT unique_user_daily UNIQUE (user_id, date),
    CONSTRAINT unique_ip_daily UNIQUE (ip_hash, date)
);

CREATE INDEX IF NOT EXISTS idx_usage_user_date ON public.usage_daily(user_id, date);
CREATE INDEX IF NOT EXISTS idx_usage_ip_date ON public.usage_daily(ip_hash, date);

-- 4. CONVERSION JOBS (Metadata only - never store raw files in Postgres)
CREATE TABLE IF NOT EXISTS public.conversion_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    ip_hash TEXT,
    tool_type TEXT NOT NULL, -- e.g., 'jpg-to-pdf', 'mp4-to-mp3', 'marla-to-sqft'
    source_format TEXT,      -- e.g., 'jpg', 'mp4', 'docx'
    target_format TEXT,      -- e.g., 'pdf', 'mp3', 'pdf'
    file_size_bytes BIGINT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
    download_token TEXT UNIQUE,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '2 hours')
);

CREATE INDEX IF NOT EXISTS idx_jobs_user ON public.conversion_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.conversion_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_expires_at ON public.conversion_jobs(expires_at);

-- 5. AD CONFIGURATION TABLE (Dynamic ad management)
CREATE TABLE IF NOT EXISTS public.ad_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    placement_key TEXT NOT NULL UNIQUE, -- e.g., 'header_leaderboard', 'processing_screen'
    network TEXT NOT NULL DEFAULT 'adsense' CHECK (network IN ('adsense', 'ezoic', 'medianet', 'custom', 'disabled')),
    ad_unit_id TEXT,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Default Ad Placements
INSERT INTO public.ad_config (placement_key, network, ad_unit_id, enabled) VALUES
('header_leaderboard', 'adsense', 'ca-pub-xxxxxxxxxxxx/leaderboard_1', true),
('sidebar_rectangle', 'adsense', 'ca-pub-xxxxxxxxxxxx/sidebar_1', true),
('in_content_native', 'adsense', 'ca-pub-xxxxxxxxxxxx/native_1', true),
('processing_screen', 'adsense', 'ca-pub-xxxxxxxxxxxx/processing_1', true),
('download_page', 'adsense', 'ca-pub-xxxxxxxxxxxx/download_1', true),
('footer_banner', 'adsense', 'ca-pub-xxxxxxxxxxxx/footer_1', true)
ON CONFLICT (placement_key) DO NOTHING;

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_config ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Conversion Jobs policies
DROP POLICY IF EXISTS "Users can view own conversion jobs" ON public.conversion_jobs;
CREATE POLICY "Users can view own conversion jobs" ON public.conversion_jobs FOR SELECT USING (auth.uid() = user_id);

-- Ad Config policies (Public read, admin write)
DROP POLICY IF EXISTS "Anyone can read ad configs" ON public.ad_config;
CREATE POLICY "Anyone can read ad configs" ON public.ad_config FOR SELECT USING (true);

-- 7. AUTOMATIC USER PROFILE TRIGGER ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, plan)
  VALUES (new.id, new.email, 'free')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
