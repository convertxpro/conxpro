# SUB-PROMPT 10: Admin Dashboard, Master SEO & Growth Engine, AdSense Integration & Production Runbook

## 1. Context & Objective
The final milestone for **ConvertHub** (ConvertX) connects the entire platform into a production-ready, highly monetizable, search-engine-dominant web property engineered for long-term organic growth.

Your objective in this prompt is to:
1. Build the protected **Internal Admin Dashboard** (`/admin`) to manage ad placements, monitor daily conversion metrics, track rate-limit hit rates, and update regional configuration constants.
2. Complete **Google AdSense / Monetization Integration** with live script injection, consent management, and strict compliance guards.
3. Deploy the **Master SEO & Growth Engine**:
   - Dynamic Programmatic Metadata Generator (`src/lib/seo/metadata.ts`)
   - Complete Schema.org JSON-LD Suite (`SoftwareApplication`, `WebApplication`, `FAQPage`, `HowTo`, `BreadcrumbList`, `Article`)
   - Category Pillar Hubs & Internal PageRank Distribution
   - Automated Multi-Segment `sitemap.xml`
   - Educational Topical Authority Guides Hub (`/guides/*`) with embedded interactive conversion tools
   - Core Web Vitals Performance Audit & Canonical URL standardization
4. Implement **Security Hardening** (CSP, CORS, rate limits, auto-purge verification) and establish the **Production Deployment Runbook** (Vercel Frontend + Railway/VPS Docker Worker).

---

## 2. Technical Stack & Dependencies

- **SEO & Structured Data:** `schema-dts`, Next.js Metadata API, `@vercel/og`
- **Analytics & Admin UI:** Recharts, Lucide Icons, Supabase Admin RLS
- **AdSense & Consent:** Google AdSense asynchronous script loader, CMP Consent banner
- **Content & Guides:** `@mdx-js/loader`, `gray-matter`, `reading-time`
- **Deployment:** Dockerfile for worker (Node.js + LibreOffice + FFmpeg), Vercel configuration

Install dependencies:
```bash
npm install schema-dts gray-matter reading-time
```

---

## 3. Internal Admin Dashboard (`/admin`)

### 3.1 Admin Authentication & RBAC Guard
Protect all `/admin/*` routes with Supabase role-based middleware:
- Verify `users.plan = 'admin'` or check admin email whitelist in environment variables (`ADMIN_EMAILS=admin@converthub.com`).

---

### 3.2 Key Admin Dashboard Modules

```
src/app/(admin)/admin/
├── page.tsx                  # Overview: KPIs, Daily Volume, Quota Cap Hits
├── ads/page.tsx              # Live Ad Management Console
├── analytics/page.tsx        # Tool-by-Tool & Category Conversion Breakdown
└── regional-config/page.tsx  # Pakistan Tool Constants (Gold rates, Marla presets)
```

1. **Analytics Overview (`/admin`):**
   - **Total Daily Conversions:** Today vs Yesterday vs 7-day average.
   - **Category Distribution Pie Chart:** Document vs Image vs Video vs Audio vs Units vs Regional.
   - **Quota Cap Hit Rate Meter:** % of anonymous and free users hitting their 10 / 25 daily conversion ceiling.
   - **Error Rate & Failed Jobs Table:** Real-time log of failing conversions with error traces.
2. **Dynamic Ad Placement Console (`/admin/ads`):**
   - Interactive table listing all 6 ad placements (`header_leaderboard`, `sidebar_rectangle`, `in_content_native`, `processing_screen`, `download_page`, `footer_banner`).
   - Toggles: Enable / Disable instantly without code redeployment.
   - Network Selector: Switch individual units between `adsense`, `ezoic`, `medianet`, or `custom HTML banner`.
   - Ad Unit ID Input: Update slot IDs in real time in `public.ad_config`.
3. **Regional Configuration Manager (`/admin/regional-config`):**
   - Update default gold price per tola (PKR).
   - Manage real estate conversion presets and district-specific land formulas.

---

## 4. Master SEO & Organic Growth Engine

### 4.1 Automated Programmatic Metadata Generator (`src/lib/seo/metadata.ts`)
Generates high-CTR, SEO-optimized title tags, descriptions, OpenGraph images, and canonical URLs for every converter:

```typescript
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export interface ToolSeoProps {
  toolName: string;
  category: string;
  categorySlug: string;
  slug: string;
  customTitle?: string;
  customDescription?: string;
  keywords?: string[];
}

export function generateToolMetadata({
  toolName,
  category,
  categorySlug,
  slug,
  customTitle,
  customDescription,
  keywords = [],
}: ToolSeoProps): Metadata {
  const title = customTitle || `Convert ${toolName} Free Online | ${siteConfig.name}`;
  const description =
    customDescription ||
    `Fast, free, and secure online ${toolName.toLowerCase()} tool. 100% free with no email required. Instant conversion on any mobile or desktop browser.`;

  const canonicalUrl = `${siteConfig.url}/convert/${categorySlug}/${slug}`;
  const ogImageUrl = `${siteConfig.url}/og?title=${encodeURIComponent(toolName)}&category=${encodeURIComponent(category)}`;

  return {
    title,
    description,
    keywords: [
      toolName.toLowerCase(),
      `convert ${toolName.toLowerCase()}`,
      `free ${toolName.toLowerCase()} online`,
      'online file converter',
      'free unit calculator',
      ...keywords,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${toolName} Converter Online`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
```

---

### 4.2 JSON-LD Schema.org Structured Data Engine (`src/components/seo/JsonLd.tsx`)
Embed rich structured data on every tool page to secure Google rich snippets (FAQ drop-downs, How-To steps, and Software Application ratings):

```tsx
import React from 'react';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface HowToStep {
  name: string;
  text: string;
  image?: string;
}

export interface JsonLdProps {
  toolName: string;
  url: string;
  description: string;
  faqs?: FaqItem[];
  howToSteps?: HowToStep[];
  breadcrumbs: { name: string; url: string }[];
}

export const JsonLd: React.FC<JsonLdProps> = ({
  toolName,
  url,
  description,
  faqs = [],
  howToSteps = [],
  breadcrumbs,
}) => {
  // 1. WebApplication / SoftwareApplication Schema
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: toolName,
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    applicationCategory: 'UtilitiesApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description,
    url,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '1250',
      bestRating: '5',
      worstRating: '1',
    },
  };

  // 2. FAQPage Schema
  const faqSchema =
    faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : null;

  // 3. HowTo Schema
  const howToSchema =
    howToSteps.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: `How to Convert with ${toolName}`,
          description: `Step-by-step instructions on converting with ${toolName} on ConvertHub.`,
          step: howToSteps.map((step, idx) => ({
            '@type': 'HowToStep',
            position: idx + 1,
            name: step.name,
            text: step.text,
            url: `${url}#step-${idx + 1}`,
          })),
        }
      : null;

  // 4. BreadcrumbList Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
};
```

---

### 4.3 Automated Multi-Segment Sitemaps (`src/app/sitemap.ts`)
Generates comprehensive XML sitemaps including:
- **Homepage:** `https://converthub.com`
- **Category Pillar Hubs:** `/document-converters`, `/image-converters`, `/video-converters`, `/audio-converters`, `/unit-converters`, `/pakistan-tools`, `/currency-converter`, `/developer-tools`, `/color-tools`, `/date-time-tools`
- **50+ Tool URLs:** `/convert/...`
- **Topical Guides:** `/guides/...`

```typescript
import { MetadataRoute } from 'next';
import { CATEGORIES } from '@/config/categories';
import { siteConfig } from '@/config/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString();

  // 1. Static Core Pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteConfig.url, lastModified: currentDate, changeFrequency: 'daily', priority: 1.0 },
    { url: `${siteConfig.url}/guides`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.8 },
  ];

  // 2. Category Hub Pages
  const categoryPages: MetadataRoute.Sitemap = Object.keys(CATEGORIES).map((catKey) => ({
    url: `${siteConfig.url}/convert/${catKey}`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // 3. Individual Tool Pages
  const toolPages: MetadataRoute.Sitemap = [];
  Object.entries(CATEGORIES).forEach(([catKey, cat]) => {
    cat.tools.forEach((tool) => {
      toolPages.push({
        url: `${siteConfig.url}/convert/${catKey}/${tool.slug}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });
  });

  return [...staticPages, ...categoryPages, ...toolPages];
}
```

---

### 4.4 Topical Authority Guides Hub (`/guides/[slug]`)
Publish high-ranking evergreen articles to capture top-of-funnel informational searches:
- `/guides/pakistan-property-measurement-units-guide` (*Marla, Kanal, Square Feet, Sarsahi complete breakdown*)
- `/guides/tola-masha-grams-gold-purity-guide` (*Gold valuation and purity calculation*)
- `/guides/heic-to-jpg-iphone-photos-guide` (*Why Apple uses HEIC and how to convert without quality loss*)
- `/guides/how-to-compress-pdf-for-government-portals` (*DPI reduction, file size optimization*)
- `/guides/usd-to-pkr-forex-remittance-guide` (*Interbank vs Open Market rate comparison*)

Each guide includes:
- Embedded interactive converter widget corresponding to the guide's topic.
- Table of Contents with jump links.
- Schema.org `Article` / `TechArticle` structured data.

---

## 5. Google AdSense & Monetization Production Setup

1. **AdSense Script Injection (`src/app/layout.tsx`):**
   - Inject the official AdSense asynchronous tag:
   ```html
   <script
     async
     src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
     crossOrigin="anonymous"
   ></script>
   ```
2. **AdSense Policy Compliance Checklist:**
   - [ ] No ads placed closer than 25px to download buttons.
   - [ ] Download buttons are explicitly styled distinctly from banner ad rectangles.
   - [ ] All ad units feature an unambiguous `Advertisement` header.
   - [ ] No deceptive countdown popups, interstitials, or autoplay sound ads.
   - [ ] Ads auto-pause/hide cleanly on responsive mobile layouts when viewport is below minimum threshold.

---

## 6. Production Deployment Runbook

### 6.1 Architecture Overview
- **Frontend & Serverless API:** Deployed on **Vercel** (Next.js App Router).
- **Background Worker & Heavy Processing (FFmpeg + LibreOffice):** Deployed on **Railway / Render / Docker VPS** connected to BullMQ + Redis.
- **Database & Auth:** **Supabase**.
- **Cache & Queues:** **Upstash Redis**.

---

### 6.2 Worker Dockerfile (`docker/worker.Dockerfile`)
```dockerfile
FROM node:20-bullseye-slim

RUN apt-get update && apt-get install -y \
    ffmpeg \
    libreoffice-core \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    fonts-noto \
    fonts-noto-cjk \
    fonts-noto-urdu \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

ENV NODE_ENV=production
CMD ["npm", "run", "start:worker"]
```

---

## 7. Acceptance Criteria & Final Launch Verification

- [ ] Admin dashboard is strictly protected and provides real-time toggle control over ad placements.
- [ ] Admin analytics charts display daily conversion volumes, category splits, and daily quota hit rates.
- [ ] Every converter page has valid canonical tags, dynamic `@vercel/og` image routes, and valid JSON-LD schemas (`SoftwareApplication`, `FAQPage`, `HowTo`, `BreadcrumbList`).
- [ ] Multi-segment `sitemap.xml` generates completely and includes all 50+ converter URLs with valid `lastmod` dates.
- [ ] Google AdSense scripts load asynchronously without degrading Google PageSpeed Core Web Vitals (LCP < 1.2s, CLS = 0, INP < 50ms).
- [ ] Topical authority guides under `/guides` render with embedded interactive converters and `Article` schema.
- [ ] Worker Docker container compiles and successfully runs both FFmpeg and LibreOffice background jobs.
- [ ] Security headers (CSP, CORS, X-Frame-Options) are verified and active.
