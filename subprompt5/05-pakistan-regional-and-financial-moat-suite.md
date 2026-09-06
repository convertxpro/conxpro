# SUB-PROMPT 05: Pakistan Regional & South Asia Financial Moat Suite

## 1. Context & Architectural Overview
This sub-prompt guides the implementation of the **Pakistan Regional & South Asia Financial Moat Suite** for ConvertX.
While generic international converters ignore regional tax laws, specific land units, and local duty structures, this specialized suite provides verified calculations according to official Pakistani government schedules (FBR Tax Years 2024–2026, PTA DIRBS customs valuation, Provincial Excise departments, and Revenue/Patwari land measurement standards).

### Strategic Value:
- **Zero-Competition SEO Moat:** Ranks #1 organically for high-intent search terms like "PTA tax on iPhone 16", "FBR property tax filer vs non-filer", "Marla to Square feet Lahore", "Tola to Grams gold rate".
- **Ultra-High Local Retention:** Bookmarked by Pakistani freelancers, overseas diaspora remitting funds, real estate investors, and tax filers.
- **100% Client-Side Privacy:** CNICs, salary amounts, and property valuations are never sent to remote servers.

---

## 2. Tools Included in this Sub-Prompt

| Tool Name | Slug | Verified Legal / Technical Basis | Key Features |
|---|---|---|---|
| **PTA Mobile Tax Calculator** | `pta-mobile-tax-calculator` | PTA DIRBS C&F valuation slabs (2024–2026) | Passport vs CNIC rate comparison, iPhone & Samsung flagship database, customs duty breakdown |
| **Property Transfer & Tax Calculator** | `property-tax-calculator` | FBR Section 236K (purchaser) & 236C (seller), Stamp Duty, TMA | Filer, Late-Filer, Non-Filer tax matrix, DC vs FBR valuation rates, e-Stamping fee calculation |
| **Freelancer IT Export Tax Calculator** | `freelance-tax-calculator` | Section 154A 0.25% PSEB rate vs 1% standard rate | Compare Payoneer, Wise, and Bank Wire real conversion rates in PKR, annual net take-home |
| **Vehicle Token Tax Calculator** | `vehicle-token-tax-calculator` | Punjab, Sindh, Islamabad Excise schedules | Engine CC brackets (1000cc, 1300cc, 1500cc, 1800cc+), Lifetime token tax, EV concessional tax |
| **Pakistani CNIC & NTN Decoder** | `cnic-ntn-decoder` | NADRA 13-digit format decoding | Decodes Province, Administrative Division, District, Family number, Gender parity, NTN verification |
| **Marla, Sq Ft & Kanal Land Converter** | `marla-to-square-feet` | Standard (225 sq ft), Revenue/Patwari (272.25 sq ft), CDA (250 sq ft) | Interactive plot dimension visualizer, Murabba, Bigha, Acre, Kanal, Marla, Sarsahi converter |
| **Tola to Grams Gold Valuation** | `tola-to-grams` | Sarafa Market standards (1 Tola = 11.6638g) | 24K, 22K, 21K, 18K purity valuation, Tola, Masha, Ratti converter, Making charges estimator |
| **Maund (Mann) to KG Converter** | `maund-to-kg` | Agricultural trade standards (1 Maund = 40 kg) | Maund, Seer, Chhatak, Kilograms with Mandi wholesale batch pricing |
| **Lakhs & Crores to Millions Converter** | `lakh-crore-to-million-billion` | South Asian numbering system matrix | Converts Lakh/Crore/Arab/Kharab to Million/Billion/Trillion with English & Urdu words |
| **Electricity Bill & Solar ROI Estimator** | `electricity-bill-solar-calculator` | NEPRA tariff slabs (Protected vs Unprotected) | Fuel price adjustment (FPA), GST, TV fee, Solar Net-Metering buyback & payback period ROI |
| **Sui Gas Bill Units Calculator** | `gas-bill-calculator` | SSGC / SNGPL domestic tariff slabs | Converts Gas meter $HM^3$ readings to MMBTU with protected/unprotected domestic slabs |

---

## 3. Metadata Registration (`src/config/categories.ts`)

Ensure the `pakistan` and `unit` categories contain these tools in `src/config/categories.ts`:

```typescript
{
  id: 'pakistan',
  name: 'Pakistan Regional Tools',
  slug: 'pakistan',
  description: 'Official Pakistani tax schedules (FBR 2024-2026), PTA mobile device valuation tables (DIRBS), property transfer e-Stamping, and excise calculators.',
  iconName: 'Building2',
  color: '#059669',
  gradient: 'from-emerald-600 to-teal-700',
  badge: 'Pakistan Moat',
  tools: [
    {
      id: 'pta-mobile-tax-calculator',
      name: 'PTA Mobile Phone Tax Calculator',
      slug: 'pta-mobile-tax-calculator',
      categorySlug: 'pakistan',
      categoryName: 'Pakistan Tools',
      description: 'Calculate official PTA DIRBS tax and customs duty on iPhone, Samsung, and imported mobile phones with Passport vs CNIC rates.',
      iconName: 'Smartphone',
      popular: true,
      pakistanSpecific: true,
      badge: 'DIRBS 2024-2026',
    },
    {
      id: 'property-tax-calculator',
      name: 'Pakistan Property Transfer & Tax Calculator',
      slug: 'property-tax-calculator',
      categorySlug: 'pakistan',
      categoryName: 'Pakistan Tools',
      description: 'Calculate FBR Section 236K/236C withholding taxes, provincial stamp duty, TMA fees, and mutation charges for Filer vs Non-Filer.',
      iconName: 'Building2',
      popular: true,
      pakistanSpecific: true,
      badge: 'FBR e-Stamping',
    },
    {
      id: 'freelance-tax-calculator',
      name: 'Freelancer IT Export Tax & Remittance Calculator',
      slug: 'freelance-tax-calculator',
      categorySlug: 'pakistan',
      categoryName: 'Pakistan Tools',
      description: 'Calculate Section 154A 0.25% PSEB tax vs 1% standard rate, and compare Payoneer, Wise, and bank remittance exchange rates in PKR.',
      iconName: 'Laptop',
      popular: true,
      pakistanSpecific: true,
      badge: 'PSEB 0.25%',
    },
    {
      id: 'vehicle-token-tax-calculator',
      name: 'Vehicle Token Tax & Registration Calculator',
      slug: 'vehicle-token-tax-calculator',
      categorySlug: 'pakistan',
      categoryName: 'Pakistan Tools',
      description: 'Estimate annual token tax, lifetime registration, and transfer fees for cars, SUVs, bikes, and EVs in Punjab, Sindh, and Islamabad.',
      iconName: 'Car',
      popular: true,
      pakistanSpecific: true,
      badge: 'Excise 2024-2026',
    },
    {
      id: 'cnic-ntn-decoder',
      name: 'Pakistani CNIC & NTN Decoder / Validator',
      slug: 'cnic-ntn-decoder',
      categorySlug: 'pakistan',
      categoryName: 'Pakistan Tools',
      description: 'Validate 13-digit CNIC and NTN numbers, decode province, division, district, and gender parity 100% securely in browser memory.',
      iconName: 'CreditCard',
      popular: true,
      pakistanSpecific: true,
      badge: '100% Private',
    },
  ],
}
```

---

## 4. Component Implementation Specs

### 4.1 PTA Mobile Tax Calculator (`src/components/converters/pakistan/PtaTaxCalculatorComponent.tsx`)
- **Quick Preset Selector:**
  - iPhone 16 Pro Max / 16 Pro, iPhone 15 / 14 / 13 Series, Samsung S24 Ultra / Z Fold, Google Pixel 9 Pro.
  - Or manual C&F value input in USD ($).
- **Tax Breakdown Card:**
  - Passport Rate vs CNIC Rate (Passport is typically 15-20% lower).
  - Itemized breakdown: Customs Duty, Sales Tax (18%), Mobile Levy, Regulatory Duty (RD), Withholding Tax.
  - Total PTA Registration Fee in PKR.

### 4.2 Property Transfer Tax Calculator (`src/components/converters/pakistan/PropertyTaxCalculatorComponent.tsx`)
- **Inputs:**
  - Property Value (PKR) / Plot Area & Location.
  - Buyer Status: Active Filer (3%), Late Filer (6%), Non-Filer (12% Sec 236K).
  - Seller Status: Active Filer (3%), Late Filer (6%), Non-Filer (10% Sec 236C).
  - Province: Punjab, Sindh, KPK, Islamabad (ICT).
- **Outputs:**
  - Clear itemized receipt showing Total Transfer Cost, Provincial Stamp Duty (1%), TMA Fee (1%), Mutation Fee, and e-Stamping challan amount.

### 4.3 Land Area & Marla Converter (`src/components/converters/pakistan/LandAreaCalculatorComponent.tsx`)
- **Standard Selectors:**
  - Standard / Lahore Urban: $1\text{ Marla} = 225\text{ sq ft}$
  - Revenue / Patwari Rural: $1\text{ Marla} = 272.25\text{ sq ft}$ (9 Sarsahi)
  - Islamabad / CDA: $1\text{ Marla} = 250\text{ sq ft}$
- **Interactive Visualizer:**
  - Displays interactive rectangle with calculated width $\times$ length in feet (e.g., $25\text{ ft} \times 45\text{ ft} = 5\text{ Marla}$).
  - Live conversions to Square Yards (Gazz), Square Meters, Kanals, Acres, and Murabbas.

### 4.4 Gold Tola & Bullion Calculator (`src/components/converters/pakistan/GoldValuationComponent.tsx`)
- **Conversion Units:** Tola (11.6638g), Grams, Masha (0.972g), Ratti (0.1215g), Ounces (troy oz).
- **Purity Breakdown:** 24K (Pure 99.9%), 22K (Jewelry 91.6%), 21K (87.5%), 18K (75.0%).
- **Calculation:** Custom price per Tola input, Making charges percentage, Net buying/selling value.

---

## 5. Wiring in `ConverterCanvas.tsx`
```tsx
case 'pta-mobile-tax-calculator':
  return <PtaTaxCalculatorComponent tool={tool} />;
case 'property-tax-calculator':
  return <PropertyTaxCalculatorComponent tool={tool} />;
case 'freelance-tax-calculator':
  return <FreelanceTaxCalculatorComponent tool={tool} />;
case 'vehicle-token-tax-calculator':
  return <VehicleTaxCalculatorComponent tool={tool} />;
case 'cnic-ntn-decoder':
  return <CnicDecoderComponent tool={tool} />;
case 'marla-to-square-feet':
case 'square-feet-to-marla':
case 'murabba-bigha-to-acre':
  return <LandAreaCalculatorComponent tool={tool} />;
case 'tola-to-grams':
  return <GoldValuationComponent tool={tool} />;
case 'maund-to-kg':
  return <AgriculturalWeightComponent tool={tool} />;
case 'lakh-crore-to-million-billion':
  return <NumberingSystemComponent tool={tool} />;
case 'electricity-bill-solar-calculator':
  return <ElectricitySolarCalculatorComponent tool={tool} />;
case 'gas-bill-calculator':
  return <GasBillCalculatorComponent tool={tool} />;
```

---

## 6. Verification & Quality Assurance Checklist
1. [ ] Test calculating PTA tax for iPhone 16 Pro Max ($1199 C&F); verify exact Passport vs CNIC rate comparison.
2. [ ] Test converting 5 Marla (Standard 225 sq ft) to Square Feet; verify result is exactly 1,125 sq ft.
3. [ ] Test converting 1 Tola to Grams; verify result is 11.6638 grams.
4. [ ] Run `npm run lint` and verify zero errors.
