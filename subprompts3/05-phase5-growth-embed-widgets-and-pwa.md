# SUB-PROMPT 05: Growth, Embeddable Widgets & Platform Flywheels (Phase 5)

## 1. Context & Objective
This sub-prompt guides the complete implementation of **Phase 5** from [`ConvertHub-NextGen-Master-Prompt.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/ConvertHub-NextGen-Master-Prompt.md).
This phase builds long-term traffic compounding mechanisms, backlink acquisition flywheels, offline PWA capabilities, and public API monetization scaffolding.

---

## 2. Features in Scope

1. **Feature 5.1: Contextual "Next Best Action" Recommendation Engine (`NextActionRecommendations.tsx`)**
   - Renders 2–3 logically connected follow-up tools directly on the conversion download screen.
   - Example mappings:
     - After *Merge PDF* $\rightarrow$ Suggest *Compress PDF* and *Protect PDF*.
     - After *Video to MP3* $\rightarrow$ Suggest *Audio Speed Changer* and *Audio Joiner*.
     - After *SVG to PNG* $\rightarrow$ Suggest *Favicon Multi-Pack (.ico)* and *Image Compressor*.
     - After *FBR Tax Calculator* $\rightarrow$ Suggest *Freelancer Tax* and *Zakat Calculator*.
   - Boosts average session duration, internal linking equity, and ad views.
2. **Feature 5.2: Embeddable Responsive Calculator Widgets (`EmbedWidgetModal.tsx` & `/embed/[tool]`)**
   - Allows external property portals, financial blogs, and tech sites to embed ConvertHub tools (FBR Tax, Zakat, Marla, Currency, PTA Tax) via responsive `<iframe>`.
   - Embed modal provides copyable iframe code with width/height/theme customization and built-in dofollow attribution backlink ("Powered by ConvertHub").
3. **Feature 5.3: Offline-Ready Progressive Web App (PWA)**
   - PWA Manifest (`public/manifest.json`) with app icons, splash screens, and shortcuts.
   - Service Worker (`public/sw.js`) caching client-side converter pages, static assets, and WebAssembly modules.
   - Smart in-app install banner prompt (`PwaInstallPrompt.tsx`) with dismiss memory.
4. **Feature 5.4: Public REST API & API Key Management Scaffolding**
   - API endpoints under `/api/v1/convert/*` for programmatic access.
   - API key generation and usage quota verification middleware (`src/middleware/apiKeyAuth.ts`).

---

## 3. Implementation Blueprint

### 3.1 Next Best Action Engine (`src/components/conversion/NextActionRecommendations.tsx`)
Create a smart rule-based recommendation mapping engine:
```typescript
interface NextActionRule {
  triggerSlugs: string[];
  recommendations: {
    slug: string;
    categorySlug: string;
    title: string;
    description: string;
    iconName: string;
    badge?: string;
  }[];
}

export const NEXT_ACTION_RULES: NextActionRule[] = [
  {
    triggerSlugs: ['merge-pdf', 'jpg-to-pdf', 'organize-pdf'],
    recommendations: [
      {
        slug: 'compress-pdf',
        categorySlug: 'document',
        title: 'Compress PDF',
        description: 'Shrink file size while preserving high visual quality.',
        iconName: 'Minimize2',
        badge: 'Recommended',
      },
      {
        slug: 'sign-pdf',
        categorySlug: 'document',
        title: 'Sign & Stamp PDF',
        description: 'Add your digital signature to the newly generated document.',
        iconName: 'PenTool',
      },
    ],
  },
  {
    triggerSlugs: ['fbr-salary-tax-calculator', 'pta-mobile-tax-calculator'],
    recommendations: [
      {
        slug: 'freelance-tax-calculator',
        categorySlug: 'pakistan',
        title: 'Freelancer IT Tax Calculator',
        description: 'Calculate 0.25% PSEB export tax and foreign remittance rates.',
        iconName: 'Laptop',
        badge: '0.25% Tax',
      },
      {
        slug: 'property-tax-calculator',
        categorySlug: 'pakistan',
        title: 'Property Transfer & Stamp Duty',
        description: 'Calculate 236K/236C withholding taxes and e-Stamping costs.',
        iconName: 'Building2',
      },
    ],
  },
];
```
Embed `<NextActionRecommendations currentSlug={tool.slug} />` into the download completion view in `ConverterCanvas.tsx` and converter components.

### 3.2 Embeddable Widget Generator (`src/components/widgets/EmbedWidgetModal.tsx` & `src/app/embed/[tool]/page.tsx`)
- Create dedicated lightweight embed route `/app/embed/[tool]/page.tsx` (renders the converter UI with stripped headers, footers, and minimal branding).
- Build the "Embed on your Website" modal with live iframe code generator:
  ```html
  <iframe 
    src="https://converthub.com/embed/fbr-salary-tax-calculator?theme=light" 
    width="100%" 
    height="600" 
    frameborder="0" 
    style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;"
  ></iframe>
  <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
    Powered by <a href="https://converthub.com" target="_blank" style="color: #2563eb;">ConvertHub</a>
  </div>
  ```

### 3.3 Progressive Web App (PWA) Configuration
- Create `public/manifest.json`:
  ```json
  {
    "name": "ConvertHub — All-in-One Fast Converter",
    "short_name": "ConvertHub",
    "description": "Fast, free, privacy-first file, unit, data, currency, and Pakistani tax converters.",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#0f172a",
    "theme_color": "#2563eb",
    "icons": [
      {
        "src": "/icons/icon-192x192.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "/icons/icon-512x512.png",
        "sizes": "512x512",
        "type": "image/png"
      }
    ]
  }
  ```
- Add Service Worker registration in `src/app/layout.tsx` for caching static pages and client-side calculators.
- Build `src/components/common/PwaInstallPrompt.tsx` with a non-intrusive bottom banner offering "Install ConvertHub App".

### 3.4 Public API Scaffolding (`src/app/api/v1/convert/route.ts`)
- REST endpoint structure supporting JSON request payloads with `X-API-Key` authentication header.
- Connect to Redis rate limiter for developer tier quotas (e.g., 500 requests/day for standard API keys).

---

## 4. Verification & Quality Checklist

- [ ] "Next Best Action" card renders seamlessly on the download completion screen for PDF, Media, Image, and Tax tools.
- [ ] `/embed/[tool]` renders clean, responsive widget pages without navigation headers.
- [ ] Embed modal copies valid `<iframe>` snippet with active attribution backlink.
- [ ] PWA manifest is detected by Chrome/Edge DevTools (Application $\rightarrow$ Manifest) with zero validation warnings.
- [ ] Service worker successfully caches client-side calculator routes for offline access.
- [ ] Run `npm run lint` and verify 0 TypeScript/ESLint errors.
- [ ] Run `npm run build` and ensure static generation compiles without errors.
