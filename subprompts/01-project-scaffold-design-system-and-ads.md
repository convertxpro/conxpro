# SUB-PROMPT 01: Project Scaffold, Design System, Shared Layouts, SEO Foundation & Ad Engine Architecture

## 1. Context & Objective
You are building the foundational layer of **ConvertHub** (ConvertX), an ultra-fast, SEO-dominant, free all-in-one conversion platform targeting both a global audience and high-intent Pakistan-specific search traffic.

Your objective in this prompt is to:
1. Initialize the modern Next.js project scaffold optimized for **Core Web Vitals (CWV)** with zero Cumulative Layout Shift (CLS), sub-second Largest Contentful Paint (LCP), and high First Input Delay / Interaction to Next Paint (INP) scores.
2. Establish a rich, modern design system with dark/light mode support, crisp typography, and responsive bento grids.
3. Build the master layout components (Navbar, Footer, Search Modal, Category Hub Grids).
4. Construct the standard **10-Part Programmatic SEO `<ToolLayout />`** designed to rank #1 on Google for long-tail conversion queries.
5. Implement the non-intrusive, CLS-safe `<AdSlot />` architecture that monetizes user sessions without degrading search engine rankings or user experience.

---

## 2. Technical Stack & Dependencies

- **Framework:** Next.js 14+ (App Router, React 18/19, TypeScript)
- **Styling:** Tailwind CSS + `clsx` + `tailwind-merge` + `tailwind-animate`
- **Icons:** `lucide-react`
- **Typography:** Next Font (`Inter` / `Outfit` / `Noto Sans Arabic` for localized terms)
- **Theme:** `next-themes` (Dark / Light / System mode)
- **Social Graph & Dynamic OG:** `@vercel/og`
- **Structured Data:** `schema-dts`

Install baseline dependencies:
```bash
npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
npm install lucide-react clsx tailwind-merge next-themes schema-dts
```

---

## 3. Design System & Aesthetics Guidelines

Follow rich modern design standards:
- **Palette:** Deep slate/zinc background in dark mode (`#090d16` / `#0f172a`), clean crisp white/slate in light mode (`#f8fafc`). Vibrant gradient accents: Indigo (`#6366f1`) to Emerald (`#10b981`) or Cyan (`#06b6d4`).
- **Surface Elevation:** Subtle glassmorphism borders (`border-slate-200/80 dark:border-slate-800/80`), translucent backdrops (`backdrop-blur-md bg-white/70 dark:bg-slate-900/70`).
- **Typography:** Modern, legible font stack configured with `display: swap` to prevent Flash of Unstyled Text (FOUT) and eliminate layout shifts.
- **Mobile First:** All interfaces must be 100% fluid on 320px+ viewports with zero horizontal scrolling.

---

## 4. Key Deliverables & Implementation Steps

### 4.1 Project Directory Structure
Setup the following structure inside `/src`:
```
src/
├── app/
│   ├── layout.tsx                # Master Root Layout (Theme, Font, Ad Provider, Schema)
│   ├── page.tsx                  # Homepage with Hero, Category Bento, Trust Badges
│   ├── globals.css               # Design tokens, custom scrollbars, CLS utilities
│   ├── robots.ts                 # Dynamic robots.txt generator for search crawlers
│   ├── sitemap.ts                # Segmented XML sitemap generator
│   ├── og/
│   │   └── route.tsx             # Dynamic 1200x630 OpenGraph Image Generator (@vercel/og)
│   ├── not-found.tsx             # SEO-friendly 404 page with popular converter links
│   └── (routes)/                 # Dynamic tool category routes (scaffolded)
├── components/
│   ├── ads/
│   │   ├── AdSlot.tsx            # CLS-locked Reusable Ad Unit wrapper
│   │   ├── AdPlaceholder.tsx     # Clean placeholder for dev/adblock
│   │   └── ad-config.ts          # Placement definitions and sizes
│   ├── common/
│   │   ├── Navbar.tsx            # Sticky header with logo, search trigger, theme toggle
│   │   ├── Footer.tsx            # Category link hubs, disclaimer, legal links
│   │   ├── SearchModal.tsx       # Global Cmd+K quick converter launcher
│   │   ├── ThemeToggle.tsx       # Smooth theme switcher
│   │   └── TrustBadges.tsx       # Privacy & Speed badges ("Auto-delete in 1hr", "100% Free")
│   ├── layout/
│   │   ├── ToolLayout.tsx        # Standard 10-part Programmatic SEO Tool Layout
│   │   ├── CategoryBento.tsx     # Homepage category grid
│   │   ├── FAQAccordion.tsx      # SEO FAQ component with Schema markup hooks
│   │   ├── RelatedTools.tsx      # Internal cross-linking component for topical authority
│   │   ├── HowToGuide.tsx        # 3-step visual How-To section (HowTo Schema ready)
│   │   └── ConversionTable.tsx   # Pre-calculated lookup table (Crawler rich text)
│   ├── seo/
│   │   ├── JsonLd.tsx            # Schema.org structured data injector
│   │   └── Breadcrumbs.tsx       # Semantic breadcrumbs with BreadcrumbList schema
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Dropzone.tsx          # Drag-and-drop file upload zone
│       ├── ProgressBar.tsx       # Processing bar
│       └── Badge.tsx
├── config/
│   ├── categories.ts             # Metadata registry for all conversion categories & tools
│   └── site.ts                   # Site constants, meta defaults, social links
└── lib/
    ├── utils.ts                  # cn() class merger and formatting helpers
    └── seo/
        └── metadata.ts           # Dynamic programmatic metadata generator
```

---

### 4.2 Reusable `<AdSlot />` Engine (Zero CLS Architecture)
Build `<AdSlot />` to meet the non-intrusive monetization standards from Section 5 of the Master Prompt while ensuring **zero layout shift (CLS = 0)**:
- Supported Placements:
  - `header_leaderboard` (Desktop: 728×90, Mobile: 320×50)
  - `sidebar_rectangle` (Desktop only: 300×250, hidden on mobile)
  - `in_content_native` (Fluid native card below converter tool)
  - `processing_screen` (Square / medium banner next to progress bar)
  - `download_page` (Banner placed cleanly above/beside download CTA)
  - `footer_banner` (728×90 / responsive)
- Performance Rules:
  - Strict `min-height` reservation before ad loads.
  - Non-deceptive design: clearly labeled `Advertisement` in small 10px muted text.
  - NEVER disguise ads as download or conversion buttons (AdSense policy compliance).

#### Implementation Blueprint (`src/components/ads/AdSlot.tsx`):
```tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { AdPlacementKey, AD_PLACEMENTS } from './ad-config';

interface AdSlotProps {
  placement: AdPlacementKey;
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ placement, className }) => {
  const config = AD_PLACEMENTS[placement];
  if (!config || !config.enabled) return null;

  return (
    <div
      className={cn(
        'my-4 flex flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-2 text-center transition-all dark:border-slate-800 dark:bg-slate-900/30',
        config.hideOnMobile && 'hidden md:flex',
        className
      )}
      style={{ minHeight: `${config.minHeight}px` }}
      data-ad-slot={placement}
    >
      <span className="mb-1 text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Advertisement
      </span>
      <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
        <div
          className="flex items-center justify-center rounded-lg border border-slate-200 bg-white/60 p-4 text-slate-400 shadow-sm dark:border-slate-800 dark:bg-slate-950/60"
          style={{ width: `${config.width}px`, maxWidth: '100%', height: `${config.height}px` }}
        >
          <span>Ad Unit: {config.name} ({config.width}×{config.height})</span>
        </div>
      </div>
    </div>
  );
};
```

---

### 4.3 Standard 10-Part Programmatic SEO Tool Layout (`<ToolLayout />`)
Every converter page on ConvertHub must follow this exact 10-part structure to maximize organic indexing and user retention:

1. **Header Banner Ad:** Reserved aspect ratio unit above content.
2. **Semantic Breadcrumbs:** Crawlable navigation hierarchy with `BreadcrumbList` schema.
3. **Hero Header:** H1 containing primary search keywords, value proposition, and quick trust badges (*100% Free*, *No Signup*, *Instant Download*).
4. **Interactive Converter Canvas:** The primary functional converter/calculator widget.
5. **In-Content Native Ad:** Placed directly below the tool canvas.
6. **3-Step How-To Guide (`<HowToGuide />`):** Visual step-by-step walkthrough embedded with Schema.org `HowTo` structured data for Google snippet carousels.
7. **Mathematical Formula & Step-by-Step Example:** Explains the underlying conversion logic with clear numerical examples.
8. **Pre-Calculated Conversion Reference Table (`<ConversionTable />`):** Tabular calculation matrix (e.g. 1 to 100 units) that Google indexes for numeric queries.
9. **Comprehensive FAQ Accordion (`<FAQAccordion />`):** 4–6 long-tail questions answering specific user search intents with embedded `FAQPage` JSON-LD.
10. **Bidirectional Internal Linking (`<RelatedTools />`):** Reverse converter link (e.g., "Looking for Square Feet to Marla?") + category tool grid to maximize crawl depth and reduce bounce rates.

#### Tool Layout Implementation Blueprint (`src/components/layout/ToolLayout.tsx`):
```tsx
import React from 'react';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { AdSlot } from '@/components/ads/AdSlot';
import { HowToGuide, HowToStep } from '@/components/layout/HowToGuide';
import { FAQAccordion, FaqItem } from '@/components/layout/FAQAccordion';
import { RelatedTools, RelatedToolItem } from '@/components/layout/RelatedTools';
import { ConversionTable, ConversionRow } from '@/components/layout/ConversionTable';
import { JsonLd } from '@/components/seo/JsonLd';

export interface ToolLayoutProps {
  toolName: string;
  category: string;
  categorySlug: string;
  slug: string;
  description: string;
  badgeText?: string;
  children: React.ReactNode;
  howToSteps: HowToStep[];
  formula?: {
    title: string;
    expression: string;
    example: string;
  };
  conversionTable?: {
    title: string;
    headers: [string, string];
    rows: ConversionRow[];
  };
  faqs: FaqItem[];
  relatedTools: RelatedToolItem[];
  reverseTool?: {
    name: string;
    url: string;
  };
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({
  toolName,
  category,
  categorySlug,
  slug,
  description,
  badgeText = 'Free & Instant',
  children,
  howToSteps,
  formula,
  conversionTable,
  faqs,
  relatedTools,
  reverseTool,
}) => {
  const currentUrl = `https://converthub.com/convert/${categorySlug}/${slug}`;
  const breadcrumbItems = [
    { name: 'Home', url: 'https://converthub.com' },
    { name: category, url: `https://converthub.com/convert/${categorySlug}` },
    { name: toolName, url: currentUrl },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Schema.org Structured Data */}
      <JsonLd
        toolName={toolName}
        url={currentUrl}
        description={description}
        faqs={faqs}
        howToSteps={howToSteps}
        breadcrumbs={breadcrumbItems}
      />

      {/* 1. Header Banner Ad */}
      <AdSlot placement="header_leaderboard" />

      {/* 2. Breadcrumb Navigation */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* 3. Hero Header */}
      <header className="mb-8 text-center sm:text-left">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/70 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300">
          <span>{badgeText}</span>
          <span>•</span>
          <span>No Sign-up Required</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {toolName}
        </h1>
        <p className="mt-2 text-base text-slate-600 sm:text-lg dark:text-slate-400">
          {description}
        </p>
      </header>

      {/* 4. Interactive Converter Canvas */}
      <main className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        {children}
      </main>

      {/* Reverse Tool Quick Switch */}
      {reverseTool && (
        <div className="mb-8 flex items-center justify-center">
          <a
            href={reverseTool.url}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <span>⇄</span> Switch to <strong>{reverseTool.name}</strong>
          </a>
        </div>
      )}

      {/* 5. In-Content Native Ad */}
      <AdSlot placement="in_content_native" />

      {/* 6. How to Convert Guide */}
      <section className="my-10">
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          How to Convert with {toolName}
        </h2>
        <HowToGuide steps={howToSteps} />
      </section>

      {/* 7. Formula & Calculation Example */}
      {formula && (
        <section className="my-10 rounded-xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/40">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {formula.title}
          </h3>
          <div className="my-3 rounded-lg bg-slate-900 px-4 py-3 font-mono text-sm text-emerald-400 dark:bg-slate-950">
            {formula.expression}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <strong>Example:</strong> {formula.example}
          </p>
        </section>
      )}

      {/* 8. Pre-Calculated Conversion Reference Table */}
      {conversionTable && (
        <section className="my-10">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {conversionTable.title}
          </h2>
          <ConversionTable
            headers={conversionTable.headers}
            rows={conversionTable.rows}
          />
        </section>
      )}

      {/* 9. SEO FAQ Accordion */}
      <section className="my-10">
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Frequently Asked Questions
        </h2>
        <FAQAccordion items={faqs} />
      </section>

      {/* 10. Related Tools Cross-Links */}
      <section className="my-12">
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Explore Related Converters
        </h2>
        <RelatedTools tools={relatedTools} />
      </section>
    </div>
  );
};
```

---

### 4.4 Dynamic OpenGraph Image Route (`src/app/og/route.tsx`)
Generate on-the-fly 1200×630 OpenGraph social share cards using `@vercel/og`:
```tsx
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'Free Online Converter';
  const category = searchParams.get('category') || 'Utility';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: '#090d16',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              padding: '8px 18px',
              borderRadius: '999px',
              backgroundColor: '#6366f1',
              color: 'white',
              fontSize: '20px',
              fontWeight: 700,
            }}
          >
            {category.toUpperCase()}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '22px' }}>ConvertHub.com</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h1
            style={{
              fontSize: '56px',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.15,
            }}
          >
            {title}
          </h1>
          <p style={{ fontSize: '26px', color: '#94a3b8' }}>
            Fast, Free & Secure Online Tool • No Sign-up Required
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '30px',
            color: '#10b981',
            fontSize: '20px',
            fontWeight: 600,
          }}
        >
          <span>⚡ Instant Output</span>
          <span>🔒 100% Private</span>
          <span>📱 Mobile Optimized</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

---

### 4.5 Search Crawler Configuration (`src/app/robots.ts`)
```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/dashboard/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/api/', '/dashboard/'],
      },
    ],
    sitemap: 'https://converthub.com/sitemap.xml',
  };
}
```

---

## 5. Acceptance Criteria & Verification Checklist

- [ ] Project initializes cleanly with zero TypeScript errors or linter warnings.
- [ ] Responsive navigation works smoothly across mobile (320px), tablet (768px), and desktop (1280px+).
- [ ] Dark mode / Light mode toggling preserves state without hydration flicker.
- [ ] `<AdSlot />` renders with reserved aspect ratios and guarantees zero layout shift (CLS = 0).
- [ ] Standard `<ToolLayout />` renders all 10 programmatic SEO sections including breadcrumbs, formulas, reference tables, FAQ accordions, and related tool cards.
- [ ] `@vercel/og` dynamic image generator returns pixel-perfect 1200×630 share banners.
- [ ] `robots.ts` allows indexation of all public tools while disallowing private admin/API endpoints.
