# SUB-PROMPT 07: Pakistan Utilities — DISCOs Electricity Bill, Solar Net-Metering & Gas Suite

## 1. Context & Objective
Utility bills in Pakistan (Electricity & Natural Gas) have become the most scrutinized household and commercial expense in the country. Hundreds of thousands of Pakistani consumers and solar system owners search monthly for:
- *"LESCO electricity bill calculator"*, *"IESCO tariff slabs"*, *"K-Electric protected vs unprotected unit rates"*, *"How is FPA calculated on electricity bills"*.
- *"Solar net-metering peak off-peak unit calculation"*, *"Solar bill savings in PKR"*.
- *"SNGPL gas bill calculator MMBTU to HM3"*, *"SSGC protected consumer slab rates"*.

Your objective in this sub-prompt is to build:
1. **Tool B5: WAPDA / DISCOs Electricity Bill & Solar Net-Metering Estimator** (`electricity-bill-solar-calculator`).
2. **Tool B6: Gas Billing Units Converter (MMBTU ↔ SCM / HM³ ↔ PKR)** (`gas-bill-calculator`).
3. Dedicated interactive components in `src/components/converters/pakistan/` wired into `ConverterCanvas.tsx`.
4. High-intent programmatic SEO with tariff breakdown tables, solar ROI savings estimations, and rich FAQ structured data.

---

## 2. Technical Stack & Dependencies

- **Calculations:** `decimal.js` for zero-rounding error utility bill math
- **Icons & Visuals:** `lucide-react` (Zap, Flame, Sun, BatteryCharging, ShieldAlert)
- **UI:** Tailwind CSS, responsive tariff tables

Install dependencies:
```bash
npm install decimal.js
```

---

## 3. Tool B5: WAPDA / DISCOs Electricity Bill & Solar Net-Metering Suite

### 3.1 Electricity Tariff & Net-Metering Engine (`src/lib/converters/pakistan/electricity-bill.ts`)
```typescript
import Decimal from 'decimal.js';

export type DiscoCompany = 'LESCO' | 'IESCO' | 'MEPCO' | 'GEPCO' | 'FESCO' | 'PESCO' | 'HESCO' | 'SEPCO' | 'QESCO' | 'K-Electric';

export interface ElectricityBillInput {
  company: DiscoCompany;
  connectionType: 'single_phase' | 'three_phase';
  isProtected: boolean; // Consumed <200 units consecutively for last 6 months
  unitsConsumed: number; // For single phase
  peakUnitsConsumed?: number; // For three phase ToU
  offPeakUnitsConsumed?: number; // For three phase ToU
  fuelPriceAdjustmentPerUnit?: number; // FPA rate, default: ~Rs. 3.50
  isSolarNetMetering: boolean;
  solarExportedUnits?: number; // Exported to grid (kWh)
}

export interface ElectricityBillResult {
  baseElectricityCost: number;
  fpaAmount: number;
  fcSurchargeAmount: number;
  electricityDutyAmount: number;
  generalSalesTaxAmount: number; // 18% GST (or applicable)
  tvFee: number; // Rs. 35 fixed
  totalEstimatedBillPkr: number;
  effectiveCostPerUnit: number;
  tariffSlabApplied: string;
  solarSavingsPkr?: number;
  netUnitsBilled?: number;
  taxBreakdown: Array<{ taxName: string; amountPkr: number }>;
}

export function calculateElectricityBill(input: ElectricityBillInput): ElectricityBillResult {
  let baseCost = new Decimal(0);
  let slabDesc = '';
  let units = input.unitsConsumed;

  // If Solar Net Metering is active
  if (input.isSolarNetMetering && input.solarExportedUnits) {
    units = Math.max(0, input.unitsConsumed - input.solarExportedUnits);
  }

  // Base Domestic Slab Calculation (Indicative NEPRA 2024-2025 schedules)
  if (input.isProtected) {
    if (units <= 50) {
      baseCost = new Decimal(units).times(3.95);
      slabDesc = 'Protected (1 - 50 Units Life-Line @ Rs. 3.95)';
    } else if (units <= 100) {
      baseCost = new Decimal(units).times(7.74);
      slabDesc = 'Protected (1 - 100 Units @ Rs. 7.74)';
    } else {
      baseCost = new Decimal(units).times(14.16);
      slabDesc = 'Protected (101 - 200 Units @ Rs. 14.16)';
    }
  } else {
    // Unprotected Domestic Slabs
    if (units <= 100) {
      baseCost = new Decimal(units).times(16.48);
      slabDesc = 'Unprotected (1 - 100 Units @ Rs. 16.48)';
    } else if (units <= 200) {
      baseCost = new Decimal(units).times(22.95);
      slabDesc = 'Unprotected (101 - 200 Units @ Rs. 22.95)';
    } else if (units <= 300) {
      baseCost = new Decimal(units).times(27.14);
      slabDesc = 'Unprotected (201 - 300 Units @ Rs. 27.14)';
    } else if (units <= 700) {
      baseCost = new Decimal(units).times(35.57);
      slabDesc = 'Unprotected (301 - 700 Units @ Rs. 35.57)';
    } else {
      baseCost = new Decimal(units).times(42.72);
      slabDesc = 'Unprotected (>700 Units @ Rs. 42.72)';
    }
  }

  const fpaRate = input.fuelPriceAdjustmentPerUnit || 3.5;
  const fpaAmount = new Decimal(units).times(fpaRate);
  const fcSurcharge = new Decimal(units).times(3.23); // Financing Cost Surcharge
  const electricityDuty = baseCost.times(0.015); // 1.5% ED
  const subtotalBeforeGst = baseCost.plus(fpaAmount).plus(fcSurcharge).plus(electricityDuty);
  const gst = subtotalBeforeGst.times(0.18); // 18% GST
  const tvFee = new Decimal(35);

  const totalBill = subtotalBeforeGst.plus(gst).plus(tvFee);
  const effectivePerUnit = units > 0 ? totalBill.dividedBy(units).toNumber() : 0;

  let solarSavings: number | undefined;
  if (input.isSolarNetMetering && input.solarExportedUnits) {
    const billWithoutSolar = calculateElectricityBill({ ...input, isSolarNetMetering: false });
    solarSavings = Math.max(0, billWithoutSolar.totalEstimatedBillPkr - totalBill.toNumber());
  }

  return {
    baseElectricityCost: Math.round(baseCost.toNumber()),
    fpaAmount: Math.round(fpaAmount.toNumber()),
    fcSurchargeAmount: Math.round(fcSurcharge.toNumber()),
    electricityDutyAmount: Math.round(electricityDuty.toNumber()),
    generalSalesTaxAmount: Math.round(gst.toNumber()),
    tvFee: 35,
    totalEstimatedBillPkr: Math.round(totalBill.toNumber()),
    effectiveCostPerUnit: Number(effectivePerUnit.toFixed(2)),
    tariffSlabApplied: slabDesc,
    solarSavingsPkr: solarSavings ? Math.round(solarSavings) : undefined,
    netUnitsBilled: units,
    taxBreakdown: [
      { taxName: 'Base Energy Charges', amountPkr: Math.round(baseCost.toNumber()) },
      { taxName: `Fuel Price Adjustment (FPA @ Rs. ${fpaRate}/unit)`, amountPkr: Math.round(fpaAmount.toNumber()) },
      { taxName: 'Financing Cost (FC) Surcharge', amountPkr: Math.round(fcSurcharge.toNumber()) },
      { taxName: 'Electricity Duty (1.5%)', amountPkr: Math.round(electricityDuty.toNumber()) },
      { taxName: 'General Sales Tax (18% GST)', amountPkr: Math.round(gst.toNumber()) },
      { taxName: 'PTV Fee', amountPkr: 35 },
    ],
  };
}
```

### 3.2 UI Component (`src/components/converters/pakistan/ElectricityBillCalculatorComponent.tsx`)
- **DISCO Selector:** Dropdown for LESCO (Lahore), IESCO (Islamabad), MEPCO (Multan), K-Electric (Karachi), GEPCO, FESCO, PESCO, etc.
- **Consumer Status:** Toggle: `Protected Consumer (<200 units for 6 months)` vs `Unprotected Consumer`.
- **Solar Net-Metering Mode Toggle:** Enter Imported kWh and Exported Grid kWh $\rightarrow$ calculates net unit balance and estimated monthly savings in PKR.
- **Comprehensive Bill Breakdown Card:** Base Cost + FPA + FC Surcharge + GST + TV Fee + Total Estimated Bill.

---

## 4. Tool B6: Gas Billing Units Converter (MMBTU ↔ SCM / HM³ ↔ PKR)

### 4.1 Gas Billing Engine (`src/lib/converters/pakistan/gas-bill.ts`)
```typescript
import Decimal from 'decimal.js';

export type GasCompany = 'SNGPL' | 'SSGC';

export interface GasBillInput {
  company: GasCompany;
  meterReadingHm3: number; // Meter reading difference in Hundred Cubic Meters (HM³)
  grossCalorificValueGcv?: number; // Default: ~1050 BTU/Scf
  isProtectedConsumer: boolean;
}

export interface GasBillResult {
  meterReadingHm3: number;
  consumedScm: number; // Standard Cubic Meters
  consumedMmbtu: number; // Million British Thermal Units
  gasChargesPkr: number;
  meterRentPkr: number; // Rs. 40 - Rs. 500 based on consumer category
  gstAmount: number; // 18%
  totalEstimatedBillPkr: number;
  activeSlab: string;
}

export function calculateGasBill(input: GasBillInput): GasBillResult {
  const hm3 = new Decimal(input.meterReadingHm3);
  // Formula: 1 HM³ = 100 m³ = ~3.5315 MMBTU (at standard 1050 GCV)
  const gcv = input.grossCalorificValueGcv || 1050;
  const mmbtu = hm3.times(100).times(35.3147).times(gcv).dividedBy(1_000_000);
  const mmbtuVal = mmbtu.toNumber();

  let gasRatePerMmbtu = 0;
  let slabName = '';

  if (input.isProtectedConsumer) {
    if (mmbtuVal <= 0.5) {
      gasRatePerMmbtu = 200;
      slabName = 'Protected Slab 1 (Up to 0.5 MMBTU @ Rs. 200/MMBTU)';
    } else if (mmbtuVal <= 1.0) {
      gasRatePerMmbtu = 300;
      slabName = 'Protected Slab 2 (0.5 - 1.0 MMBTU @ Rs. 300/MMBTU)';
    } else {
      gasRatePerMmbtu = 400;
      slabName = 'Protected Slab 3 (1.0 - 1.5 MMBTU @ Rs. 400/MMBTU)';
    }
  } else {
    // Non-Protected Domestic Slabs (OGRA 2024)
    if (mmbtuVal <= 0.5) {
      gasRatePerMmbtu = 500;
      slabName = 'Non-Protected Slab 1 (Up to 0.5 MMBTU @ Rs. 500)';
    } else if (mmbtuVal <= 1.5) {
      gasRatePerMmbtu = 1000;
      slabName = 'Non-Protected Slab 2 (0.5 - 1.5 MMBTU @ Rs. 1,000)';
    } else if (mmbtuVal <= 3.0) {
      gasRatePerMmbtu = 2000;
      slabName = 'Non-Protected Slab 3 (1.5 - 3.0 MMBTU @ Rs. 2,000)';
    } else {
      gasRatePerMmbtu = 3500;
      slabName = 'Non-Protected Slab 4 (>3.0 MMBTU @ Rs. 3,500)';
    }
  }

  const gasCharges = mmbtu.times(gasRatePerMmbtu);
  const meterRent = input.isProtectedConsumer ? new Decimal(40) : new Decimal(500);
  const subtotal = gasCharges.plus(meterRent);
  const gst = subtotal.times(0.18);
  const total = subtotal.plus(gst);

  return {
    meterReadingHm3: Number(hm3.toFixed(3)),
    consumedScm: Number(hm3.times(100).toFixed(2)),
    consumedMmbtu: Number(mmbtuVal.toFixed(4)),
    gasChargesPkr: Math.round(gasCharges.toNumber()),
    meterRentPkr: meterRent.toNumber(),
    gstAmount: Math.round(gst.toNumber()),
    totalEstimatedBillPkr: Math.round(total.toNumber()),
    activeSlab: slabName,
  };
}
```

### 4.2 UI Component (`src/components/converters/pakistan/GasBillCalculatorComponent.tsx`)
- **Bi-Directional Unit Converters:** Meter Reading ($HM^3$) ↔ $SCM$ ↔ $MMBTU$ ↔ Monthly PKR bill.
- **Provider Selector:** SNGPL (Punjab, KPK, Islamabad) vs SSGC (Sindh, Balochistan).
- **Tariff Slab Matrix:** Explains why jumping into non-protected status dramatically increases the bill.

---

## 5. Programmatic SEO & Acceptance Criteria

Add FAQ schemas for:
- *"How are units calculated from meter readings on LESCO and K-Electric bills?"*
- *"What is a Protected Consumer in Pakistan electricity and gas tariffs?"*
- *"How does solar net-metering credit calculation work on WAPDA bills?"*

### Acceptance Checklist:
- [ ] Electricity calculator accurately breaks down base energy charges, FPA, FC surcharge, GST, and TV fees.
- [ ] Solar net-metering mode calculates net bill deduction and estimated PKR savings.
- [ ] Gas calculator accurately converts $HM^3$ meter difference into MMBTU and applies official OGRA protected/unprotected slab rates.
- [ ] 100% client-side calculation with instant responsiveness.
