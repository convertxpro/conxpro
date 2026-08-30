# SUB-PROMPT 06: Live Forex Currency Converter, High-Speed Cache & Remittance Programmatic SEO

## 1. Context & Objective
Currency conversion is one of the highest-frequency daily utilities on the internet. For ConvertHub, Pakistani Rupee (PKR) pairs (**USD to PKR**, **SAR to PKR**, **AED to PKR**, **GBP to PKR**, **EUR to PKR**, **CAD to PKR**, **QAR to PKR**, **KWD to PKR**) represent massive organic search demand driven by freelancers, IT exporters, overseas Pakistani remitters, importers, and travelers.

Your objective in this prompt is to:
1. Build a high-availability live Forex Currency Converter integrating an hourly updated exchange rate API.
2. Implement a multi-tier cache architecture: **Upstash Redis (1hr TTL) → Supabase PostgreSQL → Static Fallback** to ensure sub-10ms response times with zero API exhaustion.
3. Construct **Programmatic Exact-Match Landing Pages** for all major currency pairs with pre-calculated conversion matrices ($1 to $1,000 in PKR) that Google can crawl and rank.
4. Render 7-day and 30-day historical exchange rate trend charts.
5. Embed rich Schema.org `FinancialProduct` and `FAQPage` structured data.

---

## 2. Technical Stack & Dependencies

- **Forex Data Provider:** `open.er-api.com` / `exchangerate.host` (Free tier, hourly updates)
- **Caching Layer:** `@upstash/redis` (TTL: 3600 seconds) + Supabase PostgreSQL table `forex_rates`
- **Charting:** `recharts` (Responsive SVG area/line chart)
- **SEO & Schema:** `schema-dts`, Next.js Dynamic Metadata

Install dependencies:
```bash
npm install recharts schema-dts
```

---

## 3. Database & Caching Architecture

### 3.1 PostgreSQL Backup Schema (`supabase/migrations/20260827_forex.sql`)
```sql
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

CREATE INDEX idx_forex_history_pair ON public.forex_history(pair, recorded_date DESC);
```

---

### 3.2 Forex Fetcher & Caching Service (`src/lib/forex/forex-service.ts`)

```typescript
import { Redis } from '@upstash/redis';
import { createAdminClient } from '@/lib/supabase/admin';

const redis = Redis.fromEnv();
const CACHE_KEY = 'forex:rates:latest';
const CACHE_TTL = 3600; // 1 Hour

export interface ForexRatesResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
  source: 'redis' | 'database' | 'live_api';
  updatedAt: string;
}

export async function getLatestExchangeRates(): Promise<ForexRatesResponse> {
  // 1. Try Redis Cache (<10ms)
  try {
    const cached = await redis.get<ForexRatesResponse>(CACHE_KEY);
    if (cached) {
      return { ...cached, source: 'redis' };
    }
  } catch (err) {
    console.error('Redis cache lookup failed:', err);
  }

  // 2. Fetch from Live Forex API
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 3600 },
    });
    
    if (res.ok) {
      const data = await res.json();
      const payload: ForexRatesResponse = {
        base: data.base_code || 'USD',
        date: data.time_last_update_utc || new Date().toISOString(),
        rates: data.rates,
        source: 'live_api',
        updatedAt: new Date().toISOString(),
      };

      // Save to Redis
      try {
        await redis.set(CACHE_KEY, payload, { ex: CACHE_TTL });
      } catch (e) {
        console.error('Failed to set Redis forex cache:', e);
      }

      // Backup to Supabase
      const supabase = createAdminClient();
      await supabase.from('forex_rates').upsert({
        base_currency: 'USD',
        rates: data.rates,
        updated_at: new Date().toISOString(),
      });

      return payload;
    }
  } catch (apiErr) {
    console.error('Forex API fetch failed:', apiErr);
  }

  // 3. Fallback to Supabase Database
  const supabase = createAdminClient();
  const { data: dbData } = await supabase
    .from('forex_rates')
    .select('*')
    .eq('base_currency', 'USD')
    .single();

  if (dbData) {
    return {
      base: dbData.base_currency,
      date: dbData.updated_at,
      rates: dbData.rates,
      source: 'database',
      updatedAt: dbData.updated_at,
    };
  }

  // 4. Emergency Static Fallback
  return {
    base: 'USD',
    date: new Date().toISOString(),
    rates: { USD: 1, PKR: 278.5, SAR: 3.75, AED: 3.67, GBP: 0.79, EUR: 0.92, CAD: 1.36, QAR: 3.64, KWD: 0.31, OMR: 0.38 },
    source: 'database',
    updatedAt: new Date().toISOString(),
  };
}
```

---

## 4. Programmatic SEO Forex Pages & Pre-Calculated Matrices

### 4.1 Supported High-Volume Remittance Landing Pages (`/convert/currency/[slug]`)
Generate dedicated SSG/ISR routes with exact-match URL slugs:
- `/convert/currency/usd-to-pkr` (Primary remittance & freelancer search query)
- `/convert/currency/sar-to-pkr` (Saudi Arabia overseas remittances)
- `/convert/currency/aed-to-pkr` (UAE / Dubai remittances)
- `/convert/currency/gbp-to-pkr` (UK diaspora remittances)
- `/convert/currency/eur-to-pkr` (European remittances)
- `/convert/currency/cad-to-pkr`, `/convert/currency/aud-to-pkr`
- `/convert/currency/qar-to-pkr`, `/convert/currency/kwd-to-pkr`, `/convert/currency/omr-to-pkr`

### 4.2 Pre-Calculated Currency Conversion Table Generator
Every currency pair page renders a rich tabular reference matrix:

```typescript
export function generateCurrencyTable(fromCurrency: string, toCurrency: string, rate: number) {
  const denominations = [1, 5, 10, 20, 50, 100, 250, 500, 1000, 5000, 10000];
  return {
    title: `${fromCurrency} to ${toCurrency} Conversion Reference Table`,
    headers: [`Amount (${fromCurrency})`, `Converted (${toCurrency})`] as [string, string],
    rows: denominations.map((amt) => ({
      from: `${amt.toLocaleString()} ${fromCurrency}`,
      to: `${(amt * rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${toCurrency}`,
    })),
  };
}
```

---

## 5. Converter UI & Interactive Features

1. **Primary Converter Card:**
   - Amount input with numerical formatting.
   - "From Currency" dropdown with search and quick-picks (USD, SAR, AED, GBP, EUR).
   - Quick-Swap button.
   - "To Currency" dropdown (default: `PKR`).
   - Large live result banner: `1 USD = 278.50 PKR` with live last-updated timestamp.
2. **Multi-Currency Instant Comparison Grid:**
   - Enter `100 USD` → instantly outputs equivalent in `PKR`, `SAR`, `AED`, `GBP`, `EUR`, `CAD`, and `CNY` in a responsive card grid.
3. **Historical Trend Chart (7-Day / 30-Day):**
   - Smooth interactive Recharts area chart displaying historical high, low, and average rate.
4. **Rich Google FAQ Schema:**
   - *"What is the current USD to PKR open market vs interbank rate?"*
   - *"How to convert foreign remittances to Pakistani Rupee without excessive fees?"*
   - *"When does the foreign exchange rate update daily on ConvertHub?"*

---

## 6. Acceptance Criteria & Verification Checklist

- [ ] Rate lookups resolve from Redis in <10ms with seamless fallback chain.
- [ ] PKR is selected as default destination currency and prioritized in selector dropdowns.
- [ ] Programmatic landing pages for USD/PKR, SAR/PKR, AED/PKR, GBP/PKR compile with valid SSG metadata.
- [ ] Pre-calculated conversion reference tables render on all currency pair pages for search engine crawlers.
- [ ] Interactive 7-day/30-day rate chart renders smoothly without hydration errors.
- [ ] Valid `FAQPage` and `FinancialProduct` Schema.org JSON-LD scripts are embedded on all currency routes.
