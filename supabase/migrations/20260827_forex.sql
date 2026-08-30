-- Migration: Forex Rates and History Schema
-- Date: 2026-08-27
-- Description: Caching tables for live exchange rates and historical trend data

CREATE TABLE IF NOT EXISTS public.forex_rates (
    base_currency TEXT NOT NULL DEFAULT 'USD',
    rates JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (base_currency)
);

CREATE TABLE IF NOT EXISTS public.forex_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pair TEXT NOT NULL, -- e.g. 'USD/PKR'
    rate NUMERIC(14, 4) NOT NULL,
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT unique_pair_date UNIQUE (pair, recorded_date)
);

CREATE INDEX IF NOT EXISTS idx_forex_history_pair ON public.forex_history(pair, recorded_date DESC);

-- Enable RLS
ALTER TABLE public.forex_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forex_history ENABLE ROW LEVEL SECURITY;

-- Allow public read access to forex rates and history
CREATE POLICY "Public users can read forex rates"
    ON public.forex_rates
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Public users can read forex history"
    ON public.forex_history
    FOR SELECT
    TO public
    USING (true);

-- Service role full access
CREATE POLICY "Service role can manage forex rates"
    ON public.forex_rates
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role can manage forex history"
    ON public.forex_history
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
