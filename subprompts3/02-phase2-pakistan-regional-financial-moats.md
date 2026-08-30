# SUB-PROMPT 02: Pakistan Regional Moat & High-Intent Financial Calculators (Phase 2)

## 1. Context & Objective
This sub-prompt guides the complete implementation of **Phase 2** from [`ConvertHub-NextGen-Master-Prompt.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/ConvertHub-NextGen-Master-Prompt.md).
ConvertHub’s regional tools are its strongest organic traffic and user retention moat. This sub-prompt implements official Pakistani tax schedules (FBR 2024–2026), PTA mobile device valuation tables (DIRBS), provincial property transfer taxes (e-Stamping & Section 236K/236C), IT export freelancer tax rates (Section 154A), vehicle excise duties, and NADRA CNIC region decoders.

---

## 2. Tools in Scope

1. **Tool 2.1: PTA Mobile Phone Duty & DIRBS Tax Calculator (`pta-mobile-tax-calculator`)**
   - Official FBR Customs & PTA DIRBS valuation slabs for imported phones.
   - Mode Toggle: **Passport Registration** (Overseas Traveler) vs **CNIC Registration** (Local Import).
   - Presets: iPhone 16 / 16 Pro Max, iPhone 15/14/13, Samsung Galaxy S24 Ultra, Z Fold 6, and custom USD/PKR C&F value.
   - Outputs: Customs Duty, Regulatory Duty, Sales Tax, WHT, Mobile Levy, and Total PSID payable amount.
2. **Tool 2.2: Pakistan Property Transfer & Stamp Duty Calculator (`property-tax-calculator`)**
   - Full property transaction cost breakdown for Punjab (e-Stamping), Sindh, ICT Islamabad, and KPK.
   - Status switches: Buyer (Filer vs Non-Filer) & Seller (Filer vs Non-Filer).
   - Calculates FBR 236K (Buyer: 3% vs 6-10.5%), FBR 236C (Seller: 3% vs 6-10.5%), Provincial Stamp Duty (1-2%), TMA fee (1%), and mutation charges.
3. **Tool 2.3: Freelancer IT Export Tax & Remittance Calculator (`freelance-tax-calculator`)**
   - Section 154A IT export tax: 0.25% (PSEB Registered Filer) vs 1.0% (Non-PSEB Filer) vs Standard Slabs (Non-Filer).
   - Remittance comparison: Direct Bank Wire (PRC exemption), Payoneer, Wise, and Upwork/Fiverr currency conversion losses.
4. **Tool 2.4: Vehicle Token Tax & Registration Estimator (`vehicle-token-tax-calculator`)**
   - Excise schedules for Punjab, Sindh, Islamabad, and KPK.
   - Slabs: Up to 1000cc, 1001-1300cc, 1301-1500cc, 1501-2000cc, 2000cc+ luxury SUVs, and Electric Vehicles (EVs).
   - Calculates Initial Registration, Annual Token Tax, Income Tax (Filer vs Non-Filer), and Transfer of Ownership fee.
5. **Tool 2.5: Pakistani CNIC & NTN Validator & Region Decoder (`cnic-ntn-decoder`)**
   - Validates 13-digit CNIC format (`XXXXX-XXXXXXX-X`) and decodes administrative hierarchy (Province, Division, District, Tehsil, Gender).
   - Validates 7+1 digit NTN (National Tax Number) format with FBR checksum algorithm.
   - 100% Client-Side Privacy badge ("No data is stored or sent to any server").

---

## 3. Metadata Registration (`src/config/categories.ts`)

Add the following tool metadata entries under the `pakistan` category:

```typescript
// Add to pakistan category in src/config/categories.ts:
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
```

---

## 4. Component Construction Plan

### 4.1 PTA Mobile Tax Calculator (`src/components/converters/pakistan/PtaTaxCalculatorComponent.tsx`)
- Implement official DIRBS Customs Slabs:
  - **Slab 1 ($0 - $30):** Customs Duty: Rs. 430 (Passport) / Rs. 550 (CNIC), Sales Tax: Rs. 130, Regulatory Duty: Rs. 0.
  - **Slab 2 ($31 - $100):** Customs Duty: Rs. 3,200 (Passport) / Rs. 4,320 (CNIC), Sales Tax: Rs. 200, RD: Rs. 2,800.
  - **Slab 3 ($101 - $200):** Customs Duty: Rs. 9,580 (Passport) / Rs. 11,560 (CNIC), Sales Tax: Rs. 1,680, RD: Rs. 6,000.
  - **Slab 4 ($201 - $350):** Customs Duty: Rs. 12,200 (Passport) / Rs. 14,600 (CNIC), Sales Tax: 18% + WHT.
  - **Slab 5 ($351 - $500):** Customs Duty: Rs. 17,800 (Passport) / Rs. 23,420 (CNIC), Sales Tax: 25% + WHT.
  - **Slab 6 ($500+ / Flagships like iPhone 16 Pro Max):** Total tax ~Rs. 135,000 to Rs. 165,000 (Passport) / ~Rs. 160,000 to Rs. 185,000 (CNIC).
- Live currency converter toggle (USD C&F Value $\leftrightarrow$ PKR).
- Quick device preset selector cards with logos.
- Official PSID generation guide and WhatsApp share card.

### 4.2 Property Tax & Transfer Calculator (`src/components/converters/pakistan/PropertyTaxCalculatorComponent.tsx`)
- Inputs: Property Valuation (PKR), Jurisdiction (Punjab, Sindh, Islamabad, KPK), Property Type (Plot, House, Commercial).
- Buyer Taxes:
  - FBR Section 236K: Filer (3%) | Late-Filer (6%–7%) | Non-Filer (10.5%).
  - Provincial Stamp Duty: Punjab/Sindh e-Stamping (1%–2%).
  - TMA / Municipal Transfer Fee: 1%.
- Seller Taxes:
  - FBR Section 236C (Advance Tax on sale of immovable property): Filer (3%) | Non-Filer (6%–10.5%) with holding period exemption sliders.
  - Capital Gains Tax (CGT) estimation based on purchase year.
- Visual breakdown donut chart and downloadable PDF receipt/summary.

### 4.3 Freelance Tax & Remittance Calculator (`src/components/converters/pakistan/FreelanceTaxCalculatorComponent.tsx`)
- Earnings Input in USD/GBP/EUR/AED with live interbank and remittance exchange rates.
- Tax Calculation under Finance Act 2024:
  - **PSEB Registered Filer (Section 154A):** 0.25% final withholding tax.
  - **Unregistered Filer:** 1.0% final withholding tax.
  - **Non-Filer:** Full corporate/individual progressive tax slabs (up to 35%).
- Net Remittance Channel Comparison Table:
  - Direct Home Remittance Wire (PRC Certificate 0% bank fee).
  - Payoneer $\rightarrow$ PKR Bank Account (2% fx fee).
  - Wise $\rightarrow$ Local Bank.
  - Upwork / Fiverr platform fees (20% / 10%).
- Net take-home earnings breakdown per month and per year.

### 4.4 Vehicle Token Tax Calculator (`src/components/converters/pakistan/VehicleTaxCalculatorComponent.tsx`)
- Province selectors (Excise & Taxation Punjab, Sindh, Islamabad, KPK).
- Engine CC & EV battery size selector.
- Filer vs Non-Filer dynamic tax rates.
- Breakdown: Initial Registration Fee, Number Plate charges, Annual Token Tax, Advance Income Tax, and Transfer Duty.

### 4.5 CNIC & NTN Validator & Decoder (`src/components/converters/pakistan/CnicDecoderComponent.tsx`)
- 13-digit CNIC input with auto-hyphenation formatting (`12345-1234567-1`).
- Administrative Region Decoder:
  - First digit: Province (1: KPK, 2: FATA, 3: Punjab, 4: Sindh, 5: Balochistan, 6: Islamabad, 7: Gilgit-Baltistan, 8: AJK).
  - Second digit: Division code (e.g. Lahore, Karachi, Rawalpindi, Faisalabad, Multan).
  - 3rd to 5th digits: District and Tehsil code mapping.
  - 13th digit: Gender parity (Odd $\rightarrow$ Male; Even $\rightarrow$ Female / Transgender).
- NTN Validator: 7-digit identifier + 1-digit Modulo-11 checksum validator.
- Privacy assurance badge with 100% client-side guarantee.

---

## 5. Canvas Integration & Routing (`src/components/converters/ConverterCanvas.tsx`)

Map the new slugs to their respective components:
```typescript
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
```

---

## 6. Verification & Quality Checklist

- [ ] PTA Tax calculates correct slab for iPhone 16 Pro Max (~Rs. 135k-160k Passport vs ~Rs. 160k-185k CNIC).
- [ ] Property Tax accurately differentiates between Filer (3%) and Non-Filer (10.5%) under Section 236K/236C.
- [ ] Freelancer Tax correctly applies 0.25% PSEB tax rate vs 1% standard and shows net PKR take-home.
- [ ] Vehicle Token Tax accurately pulls provincial excise tax slabs for 660cc, 1300cc, and 2000cc+ vehicles.
- [ ] CNIC Decoder correctly identifies Punjab/Sindh/KPK provinces and male/female parity digits.
- [ ] Run `npm run lint` and verify 0 TypeScript/ESLint errors.
- [ ] Run `npm run build` and ensure static generation compiles without errors.
