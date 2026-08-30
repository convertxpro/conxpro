/**
 * PTA DIRBS Mobile Tax & Customs Valuation Engine (Finance Act 2024-2026)
 * Official Pakistan Telecommunication Authority & FBR SRO Schedules
 */

export type RegistrationMode = 'passport' | 'cnic';

export interface DevicePreset {
  id: string;
  name: string;
  brand: 'Apple' | 'Samsung' | 'Google' | 'Xiaomi' | 'OnePlus' | 'Generic';
  usdPrice: number;
  badge?: string;
  icon?: string;
}

export const DEVICE_PRESETS: DevicePreset[] = [
  { id: 'iphone-16-pro-max', name: 'iPhone 16 Pro Max (256GB)', brand: 'Apple', usdPrice: 1199, badge: 'Flagship 2024' },
  { id: 'iphone-16-pro', name: 'iPhone 16 Pro (128GB)', brand: 'Apple', usdPrice: 999, badge: 'New' },
  { id: 'iphone-16', name: 'iPhone 16 / Plus', brand: 'Apple', usdPrice: 799 },
  { id: 'iphone-15-pro-max', name: 'iPhone 15 Pro Max', brand: 'Apple', usdPrice: 1099 },
  { id: 'iphone-15', name: 'iPhone 15 / 14', brand: 'Apple', usdPrice: 699 },
  { id: 'iphone-13', name: 'iPhone 13 / 12', brand: 'Apple', usdPrice: 499 },
  { id: 'samsung-s24-ultra', name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', usdPrice: 1299, badge: 'Top Seller' },
  { id: 'samsung-z-fold-6', name: 'Samsung Galaxy Z Fold 6', brand: 'Samsung', usdPrice: 1899, badge: 'Luxury' },
  { id: 'samsung-s24', name: 'Samsung Galaxy S24', brand: 'Samsung', usdPrice: 799 },
  { id: 'google-pixel-9-pro', name: 'Google Pixel 9 Pro', brand: 'Google', usdPrice: 999 },
  { id: 'xiaomi-14-ultra', name: 'Xiaomi 14 Ultra', brand: 'Xiaomi', usdPrice: 1099 },
  { id: 'mid-range-phone', name: 'Mid-Range Phone (~$300)', brand: 'Generic', usdPrice: 300 },
  { id: 'budget-phone', name: 'Budget Smartphone (~$150)', brand: 'Generic', usdPrice: 150 },
  { id: 'feature-phone', name: 'Basic 2G/3G Phone (~$25)', brand: 'Generic', usdPrice: 25 },
];

export interface PtaTaxBreakdown {
  usdValue: number;
  exchangeRate: number;
  cnfPkrValue: number;
  mode: RegistrationMode;
  slabNumber: number;
  slabRange: string;
  customsDuty: number;
  regulatoryDuty: number;
  salesTax: number;
  withholdingTax: number;
  mobileLevy: number;
  totalTax: number;
  totalPhoneCostPkr: number;
  taxPercentageOfDevice: number;
  passportSavings: number; // difference if registered via passport vs cnic
  isFlagship: boolean;
}

export const DEFAULT_USD_PKR_RATE = 278.5;

function computeComponents(safeUsd: number, mode: RegistrationMode, safeRate: number) {
  const cnfPkr = safeUsd * safeRate;
  let slabNumber = 1;
  let slabRange = '$0 – $30';
  let customsDuty = 0;
  let regulatoryDuty = 0;
  let salesTax = 0;
  let withholdingTax = 0;
  let mobileLevy = 0;

  if (safeUsd <= 30) {
    slabNumber = 1;
    slabRange = 'Up to $30 (Basic)';
    customsDuty = mode === 'passport' ? 430 : 550;
    regulatoryDuty = 0;
    salesTax = 130;
    withholdingTax = 100;
    mobileLevy = 100;
  } else if (safeUsd <= 100) {
    slabNumber = 2;
    slabRange = '$30.01 – $100';
    customsDuty = mode === 'passport' ? 3200 : 4320;
    regulatoryDuty = 2800;
    salesTax = 200;
    withholdingTax = 200;
    mobileLevy = 300;
  } else if (safeUsd <= 200) {
    slabNumber = 3;
    slabRange = '$100.01 – $200';
    customsDuty = mode === 'passport' ? 9580 : 11560;
    regulatoryDuty = 6000;
    salesTax = 1680;
    withholdingTax = 600;
    mobileLevy = 1000;
  } else if (safeUsd <= 350) {
    slabNumber = 4;
    slabRange = '$200.01 – $350';
    customsDuty = mode === 'passport' ? 12200 : 14600;
    regulatoryDuty = mode === 'passport' ? 10500 : 11500;
    salesTax = Math.round(cnfPkr * 0.17); // 17% sales tax on C&F
    withholdingTax = mode === 'passport' ? 1500 : 2000;
    mobileLevy = mode === 'passport' ? 3000 : 3500;
  } else if (safeUsd <= 500) {
    slabNumber = 5;
    slabRange = '$350.01 – $500';
    customsDuty = mode === 'passport' ? 17800 : 23420;
    regulatoryDuty = mode === 'passport' ? 19000 : 21500;
    salesTax = Math.round(cnfPkr * 0.18); // 18% standard sales tax
    withholdingTax = mode === 'passport' ? 3000 : 4000;
    mobileLevy = mode === 'passport' ? 5000 : 6000;
  } else {
    // Slab 6 ($500+ Flagships - e.g. iPhone 16 Pro Max, S24 Ultra)
    slabNumber = 6;
    slabRange = 'Above $500 (Flagships & Luxury)';
    customsDuty = mode === 'passport' ? 23500 : 31000;
    regulatoryDuty = mode === 'passport' ? 44000 : 49000;
    const baseSalesTax = Math.round(cnfPkr * 0.16);
    salesTax = mode === 'passport' ? Math.max(50000, baseSalesTax) : Math.max(56000, Math.round(baseSalesTax * 1.12));
    withholdingTax = mode === 'passport' ? Math.max(15000, Math.round(cnfPkr * 0.048)) : Math.max(19000, Math.round(cnfPkr * 0.058));
    mobileLevy = mode === 'passport' ? 18000 : 20000;
  }

  const totalTax = customsDuty + regulatoryDuty + salesTax + withholdingTax + mobileLevy;
  return {
    cnfPkr,
    slabNumber,
    slabRange,
    customsDuty,
    regulatoryDuty,
    salesTax,
    withholdingTax,
    mobileLevy,
    totalTax,
  };
}

export function calculatePtaTax(
  usdPrice: number,
  mode: RegistrationMode = 'passport',
  exchangeRate: number = DEFAULT_USD_PKR_RATE
): PtaTaxBreakdown {
  const safeUsd = Math.max(0, Number(usdPrice) || 0);
  const safeRate = Math.max(1, Number(exchangeRate) || DEFAULT_USD_PKR_RATE);

  const current = computeComponents(safeUsd, mode, safeRate);
  const passportCalc = mode === 'passport' ? current : computeComponents(safeUsd, 'passport', safeRate);
  const cnicCalc = mode === 'cnic' ? current : computeComponents(safeUsd, 'cnic', safeRate);

  const totalPhoneCostPkr = current.cnfPkr + current.totalTax;
  const taxPercentageOfDevice = current.cnfPkr > 0 ? (current.totalTax / current.cnfPkr) * 100 : 0;
  const passportSavings = Math.max(0, cnicCalc.totalTax - passportCalc.totalTax);

  return {
    usdValue: safeUsd,
    exchangeRate: safeRate,
    cnfPkrValue: Math.round(current.cnfPkr),
    mode,
    slabNumber: current.slabNumber,
    slabRange: current.slabRange,
    customsDuty: current.customsDuty,
    regulatoryDuty: current.regulatoryDuty,
    salesTax: current.salesTax,
    withholdingTax: current.withholdingTax,
    mobileLevy: current.mobileLevy,
    totalTax: current.totalTax,
    totalPhoneCostPkr: Math.round(totalPhoneCostPkr),
    taxPercentageOfDevice: Number(taxPercentageOfDevice.toFixed(1)),
    passportSavings,
    isFlagship: safeUsd > 500,
  };
}
