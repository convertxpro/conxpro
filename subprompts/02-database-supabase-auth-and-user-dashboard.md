# SUB-PROMPT 02: Database Schema, Supabase Integration, Auth, User Dashboard & Crawl Budget Guards

## 1. Context & Objective
ConvertHub requires a persistent data layer and user management foundation built on Supabase (PostgreSQL). While the core free tools can be used anonymously without registration (10 conversions/day per IP), registered free accounts unlock an increased quota (25 conversions/day) and access to a personal conversion history dashboard.

Your objective in this prompt is to:
1. Create the complete Supabase SQL schema migrations (users, daily usage, job logs, ad config).
2. Establish secure server/client Supabase helper utilities using `@supabase/ssr`.
3. Configure passwordless magic link / OTP authentication with high-converting, trust-oriented UI.
4. Build the user account dashboard (`/dashboard`).
5. **Enforce Search Engine Crawl Budget Optimization** by placing strict `noindex, nofollow` metadata on private/dynamic routes (`/dashboard`, `/auth/*`) to ensure Googlebot dedicates 100% of its crawl budget to high-value converter landing pages.

---

## 2. Technical Stack & Dependencies

- **Database & Auth:** Supabase (PostgreSQL, Supabase Auth)
- **Libraries:** `@supabase/supabase-js`, `@supabase/ssr`
- **Security & SEO:** PostgreSQL Row Level Security (RLS), Service Role separation, Next.js metadata `robots: { index: false, follow: false }` on private pages.

Install packages:
```bash
npm install @supabase/supabase-js @supabase/ssr
```

---

## 3. Detailed Database Schema & SQL Migration

Create the SQL migration file at `supabase/migrations/20260827_initial_schema.sql`:

```sql
-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE (Extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. DAILY USAGE COUNTERS (For analytics & persistent daily quotas)
CREATE TABLE public.usage_daily (
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

CREATE INDEX idx_usage_user_date ON public.usage_daily(user_id, date);
CREATE INDEX idx_usage_ip_date ON public.usage_daily(ip_hash, date);

-- 4. CONVERSION JOBS (Metadata only - never store raw files in Postgres)
CREATE TABLE public.conversion_jobs (
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

CREATE INDEX idx_jobs_user ON public.conversion_jobs(user_id);
CREATE INDEX idx_jobs_created_at ON public.conversion_jobs(created_at DESC);
CREATE INDEX idx_jobs_expires_at ON public.conversion_jobs(expires_at);

-- 5. AD CONFIGURATION TABLE (Dynamic ad management)
CREATE TABLE public.ad_config (
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
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Conversion Jobs policies
CREATE POLICY "Users can view own conversion jobs" ON public.conversion_jobs FOR SELECT USING (auth.uid() = user_id);

-- Ad Config policies (Public read, admin write)
CREATE POLICY "Anyone can read ad configs" ON public.ad_config FOR SELECT USING (true);

-- 7. AUTOMATIC USER PROFILE TRIGGER ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, plan)
  VALUES (new.id, new.email, 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 4. Key Deliverables & Implementation Steps

### 4.1 Supabase Client Helpers
Setup client wrappers for App Router inside `src/lib/supabase/`:
- `client.ts`: Browser client using `createBrowserClient`
- `server.ts`: Server Component & Route Handler client using `createServerClient` and Next.js cookies
- `admin.ts`: Service-role client with elevated privileges for background job logs and quota increments.

### 4.2 Crawl Budget Guards & Private Page Metadata
To protect search engine crawl budget, all private user pages and authentication routes must explicitly declare `noindex, nofollow` metadata.

#### Blueprint (`src/app/(auth)/layout.tsx` & `src/app/(dashboard)/layout.tsx`):
```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

### 4.3 Trust-Driven Authentication Flow
- **Magic Link / OTP Auth:** Clean modal/page (`/auth/login`, `/auth/sign-up`) with email input.
- **Organic Retention Messaging:** Highlight that creating an account is **100% free forever** and unlocks:
  - 25 conversions/day (up from 10)
  - 100 MB max file size (up from 25 MB)
  - Conversion history log
- **Trust Badges:** Place badges (*No credit card required*, *Zero spam policy*, *Auto-delete privacy guarantee*) to build immediate user trust and maximize registration rates.
- **Auth State Listener:** Global user avatar/dropdown in `Navbar.tsx` displaying current quota status and direct link to Dashboard.

### 4.4 User Dashboard (`/dashboard`)
Build the dashboard page with:
1. **Quota Usage Card:** Circular or linear progress bar showing `X / 25 daily conversions used today`. Resets at midnight PKT.
2. **Account Tier Badge:** Shows `Free Plan` with a disabled `Pro Tier — Coming Soon` banner.
3. **Recent Conversion History:**
   - Filterable data table displaying the user's past 30 days of conversion jobs.
   - Columns: Date & Time, Tool (`JPG → PDF`), Original File Size, Status (`Completed`, `Failed`, `Expired`).
   - Privacy Banner: *"For your security and privacy, converted files are automatically purged from our servers after 2 hours. Only job metadata is stored."*

---

## 5. Acceptance Criteria & Verification Checklist

- [ ] Supabase migration runs cleanly with all tables, indexes, triggers, and RLS policies created.
- [ ] User registration via Magic Link or Email successfully fires the `handle_new_user()` trigger and inserts a row into `public.users`.
- [ ] `/dashboard` and `/auth/*` routes serve `robots: { index: false, follow: false }` metadata headers to protect Googlebot crawl budget.
- [ ] User login and session persistence works smoothly in Next.js Server Components and Client Components.
- [ ] Logged-in users can access `/dashboard`, whereas unauthenticated visitors are redirected to `/auth/login`.
- [ ] Dashboard displays accurate conversion usage numbers and metadata history without exposing sensitive data.
