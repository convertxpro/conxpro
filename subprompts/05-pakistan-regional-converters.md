# SUB-PROMPT 05: Pakistan-Specific Regional Converters Engine & Localized SEO Moat

## 1. Context & Objective
ConvertHub’s major strategic differentiator over global competitors (such as CloudConvert or Convertio) is its dedicated suite of **Pakistan-Specific Regional Converters**. In Pakistan and across the overseas Pakistani diaspora (UAE, Saudi Arabia, UK, USA, Canada), millions of users search monthly for:
- Land measurement conversions (*"1 Marla in sq ft in Lahore"*, *"Marla to Square Feet"*, *"Kanal to Marla"*, *"مرلہ سے مربع فٹ"*)
- Precious metal conversions (*"1 Tola in grams"*, *"Tola to Grams"*, *"24k gold rate per tola"* , *"تولہ سے گرام"*)
- Agricultural wholesale units (*"1 Mann in kg"*, *"Maund to Kilogram"*, *"من سے کلو گرام"*)
- Islamic lunar calendar calculations (*"Hijri to Gregorian date today"*, *"Islamic date converter"*)

Your objective in this prompt is to build high-precision, client-side regional converters tailored to local Pakistani standards, complete with regional standard toggles (Lahore 225 sq ft vs. Patwari 272.25 sq ft vs. CDA 250 sq ft), Urdu/English bilingual metadata, pre-calculated conversion lookup tables, WhatsApp-friendly shareable results, and rich Google FAQ Schema.

---

## 2. Technical Stack & Dependencies

- **Calculations:** High-precision math utility using `decimal.js`
- **Hijri Astronomical Engine:** `moment-hijri` (Umm al-Qura calendar algorithm)
- **UI & Typography:** Tailwind CSS, Lucide icons, Google Fonts `Noto Nastaliq Urdu` / `Noto Sans Arabic`
- **SEO & Schema:** `schema-dts`, Next.js Programmatic Metadata

Install dependencies:
```bash
npm install decimal.js moment-hijri
```

---

## 3. Detailed Specifications & Regional Standards

### 3.1 Real Estate Land Measurement Suite (`/convert/pakistan/marla-to-square-feet`)
In Pakistan, the definition of "1 Marla" varies by locality and housing authority:
- **Punjab / Urban Housing Societies (LDA, DHA, Bahria):** `1 Marla = 225 sq ft` (1 Kanal = 20 Marla = 4,500 sq ft).
- **Official Land Revenue (Patwari Standard):** `1 Marla = 272.25 sq ft` (9 Sarsahi = 1 Marla; 1 Karam = 5.5 ft; 1 Kanal = 20 Marla = 5,445 sq ft).
- **CDA / Islamabad Commercial:** `1 Marla = 250 sq ft`.

#### Unit Conversion Matrix:
- `1 Sarsahi` = 30.25 sq ft (under 272.25 standard) or 25 sq ft (under 225 standard)
- `1 Marla` = 9 Sarsahi
- `1 Kanal` = 20 Marla
- `1 Acre (Qilla)` = 8 Kanal = 160 Marla
- `1 Murabba` = 25 Acres = 200 Kanal
- `1 Square Meter` = 10.7639 sq ft
- `1 Square Yard (Gazz)` = 9 sq ft

#### UI & Programmatic SEO Features:
- **Standard Selector Toggle:** Dropdown/radio pills: `Urban Standard (225 sq ft)`, `Revenue / Patwari (272.25 sq ft)`, `CDA (250 sq ft)`.
- **Bidirectional Calculator:** Enter any unit (Marla, Kanal, Sq Ft, Sq Yard, Sq Meter, Acre, Murabba) and all others update simultaneously.
- **Land Plot Dimension Visualizer:** Enter Plot Width & Length in feet (e.g., `30 ft × 50 ft = 1,500 sq ft`) → automatically shows `6.67 Marla (225 sq ft)` or `5.51 Marla (272.25 sq ft)`.
- **Pre-Calculated Marla-to-SqFt Reference Table (Crawler Rich Text):**
  - Displays pre-calculated values for 1, 2, 3, 4, 5, 7, 10, 15, 20 (1 Kanal), 40 (2 Kanal), 80 (4 Kanal), 160 (1 Acre) Marlas for both 225 and 272.25 standards.
- **Glossary of Revenue Terms:** Explains *Fard, Khasra, Khatauni, Intiqal, Aks Shajra, Murabba*.

---

### 3.2 Gold, Silver & Precious Metals Suite (`/convert/pakistan/tola-to-grams`)
In the South Asian gold and jewelry market:
- `1 Tola` = 12 Masha = 96 Ratti = `11.6638 grams`
- `1 Masha` = 8 Ratti = `0.972 grams`
- `1 Ratti` = `0.1215 grams`
- `1 Troy Ounce` = 31.1035 grams = `2.6667 Tola`
- `10 Grams` = `0.8573 Tola`

#### Gold Price & Purity Calculator:
- Live/Custom Rate input: Enter current market price per Tola (e.g., `PKR 275,000`).
- Calculates value across purities:
  - **24 Karat (99.9% pure):** 100% value
  - **22 Karat (91.6% pure):** 91.67% value
  - **21 Karat (87.5% pure):** 87.50% value
  - **18 Karat (75.0% pure):** 75.00% value
- **Pre-Calculated Tola-to-Grams Reference Table:**
  - 0.5 Tola, 1 Tola, 2 Tola, 2.5 Tola, 3 Tola, 5 Tola, 10 Tola, 20 Tola with exact gram weights and purity breakdown.

---

### 3.3 Agricultural & Wholesale Commodities Suite (`/convert/pakistan/maund-to-kg`)
In Pakistani wholesale grain, cotton, wheat, and sugarcane markets (Ghalla Mandi):
- **Standard Market Maund (Mann):** `1 Maund = 40 kg`
- **Imperial / Historical Maund:** `1 Maund = 37.3242 kg`
- `1 Maund` = 40 Seers
- `1 Seer` = 16 Chhatak = `1 kg` (standard) or `0.9331 kg` (historical)
- `1 Chhatak` = 5 Tola = `58.32 grams`
- `1 Metric Ton` = 25 Maunds (standard 40 kg) = 1,000 kg

#### Commodity Trade Calculator & Reference Table:
- Enter Crop Weight in Maunds + Seers (e.g., `45 Maunds 20 Seers`).
- Enter Rate per Maund in PKR (e.g., `PKR 3,900 / Maund`).
- Instant Output: Total weight in Kilograms, Metric Tons, and Total Value in PKR formatted in Lakhs and Crores.
- **Pre-Calculated Maund-to-KG Reference Table:** Pre-computes 1 to 100 Maunds in Kilograms and Metric Tons.

---

### 3.4 Islamic Calendar (Hijri ↔ Gregorian) Suite (`/convert/pakistan/hijri-to-gregorian`)
- Converts any Gregorian date (`YYYY-MM-DD`) to Hijri date (`DD Month YYYY AH`) and vice versa.
- Displays Arabic/Urdu Hijri month names: *Muharram, Safar, Rabi' al-Awwal, Rabi' al-Thani, Jumada al-Awwal, Jumada al-Thani, Rajab, Sha'ban, Ramadan, Shawwal, Dhu al-Qi'dah, Dhu al-Hijjah*.
- **Moon Sighting Offset Toggle:** Allows user to adjust date by `-2, -1, 0, +1, +2 days` to accommodate local Central Ruet-e-Hilal Committee moon sighting declarations.
- Today's date banner showing current Gregorian, Hijri, and Solar calendar equivalents.

---

## 4. Localized SEO & Growth Optimization

1. **Bilingual Title Tags & Meta Descriptions:**
   - Title: `Convert Marla to Square Feet Free Online | مرلہ سے مربع فٹ | ConvertHub`
   - Description: `Free online Marla to Square Feet (Sq Ft) converter for Pakistan. Supports LDA/DHA (225 sq ft), Patwari/Revenue (272.25 sq ft), and CDA (250 sq ft) with conversion table.`
2. **Number Formatting in Lakhs & Crores:**
   - Option to format currency and numbers using South Asian grouping (`1,00,000` = 1 Lakh, `1,00,00,000` = 1 Crore).
3. **One-Click WhatsApp Share:**
   - Generates a cleanly formatted text summary for sharing property measurements or gold price calculations directly via WhatsApp groups.
4. **Rich Long-Tail Google FAQ Schema:**
   - *"How many square feet are in 1 Marla in Lahore (LDA/DHA)?"*
   - *"What is the difference between Revenue 272.25 sq ft Marla and Urban 225 sq ft Marla?"*
   - *"How many grams are in 1 Tola of gold in Pakistan?"*
   - *"How many kilograms are in 1 Maund (Mann) of wheat in Mandi?"*

---

## 5. Acceptance Criteria & Verification Checklist

- [ ] Marla to Square Feet converter accurately computes across 225, 272.25, and 250 sq ft standards.
- [ ] Plot dimension visualizer computes exact area in Marlas and Kanals from width × length.
- [ ] Pre-calculated conversion tables render on all regional tool pages for crawler indexation.
- [ ] Tola to Grams converter computes exact weights and 24K/22K/21K/18K gold valuations.
- [ ] Maund to KG calculator calculates wholesale crop batches and total pricing in PKR formatted in Lakhs/Crores.
- [ ] Hijri converter accurately maps dates with ±1/2 day lunar sighting adjustments.
- [ ] WhatsApp share button generates a clean summary with local units and numbers.
- [ ] Google Rich Results test confirms valid `FAQPage` and `SoftwareApplication` JSON-LD schemas.
