import Decimal from 'decimal.js';

export interface ZakatAssetsInput {
  cashInHandAndBank: number;
  goldWeightTolas: number;
  goldPurityKarat: 24 | 22 | 21 | 18;
  goldRatePerTolaPkr: number; // default benchmark: ~Rs. 275,000
  silverWeightTolas: number;
  silverRatePerTolaPkr: number; // default benchmark: ~Rs. 3,200
  businessInventoryValue: number;
  sharesMutualFundsReceivables: number;
  immediateDebtsAndLiabilities: number;
  nisabStandard: 'gold' | 'silver'; // Silver is recommended by majority scholars
}

export interface ZakatAssetItem {
  key: string;
  item: string;
  itemUrdu: string;
  valuePkr: number;
  percentage: number;
  details?: string;
}

export interface ZakatResult {
  totalAssetsPkr: number;
  totalLiabilitiesPkr: number;
  netZakatableWealthPkr: number;
  goldNisabThresholdPkr: number; // 7.5 Tolas * Gold Rate
  silverNisabThresholdPkr: number; // 52.5 Tolas * Silver Rate
  activeNisabThresholdPkr: number;
  isEligibleToPayZakat: boolean;
  totalZakatDuePkr: number; // Exactly 2.5% (1/40th)
  goldValuationPkr: number;
  silverValuationPkr: number;
  assetBreakdown: ZakatAssetItem[];
}

export const GOLD_PURITY_MAP: Record<24 | 22 | 21 | 18, { ratio: number; label: string; description: string }> = {
  24: { ratio: 24 / 24, label: '24 Karat (99.9% Pure)', description: 'Bullion bars & fine gold coins' },
  22: { ratio: 22 / 24, label: '22 Karat (91.6% Pure)', description: 'Standard Pakistani wedding jewelry' },
  21: { ratio: 21 / 24, label: '21 Karat (87.5% Pure)', description: 'Gulf & Arab traditional jewelry' },
  18: { ratio: 18 / 24, label: '18 Karat (75.0% Pure)', description: 'Diamond settings & Italian gold' },
};

export const DEFAULT_GOLD_RATE_PKR = 275000;
export const DEFAULT_SILVER_RATE_PKR = 3200;

export function calculateZakat(input: ZakatAssetsInput): ZakatResult {
  const goldPurityMultiplier = (input.goldPurityKarat || 24) / 24;
  const goldWeight = new Decimal(input.goldWeightTolas || 0);
  const goldRate = new Decimal(input.goldRatePerTolaPkr || DEFAULT_GOLD_RATE_PKR);
  const goldValue = goldWeight.times(goldRate).times(goldPurityMultiplier);

  const silverWeight = new Decimal(input.silverWeightTolas || 0);
  const silverRate = new Decimal(input.silverRatePerTolaPkr || DEFAULT_SILVER_RATE_PKR);
  const silverValue = silverWeight.times(silverRate);

  const cash = new Decimal(input.cashInHandAndBank || 0);
  const inventory = new Decimal(input.businessInventoryValue || 0);
  const receivables = new Decimal(input.sharesMutualFundsReceivables || 0);
  const liabilities = new Decimal(input.immediateDebtsAndLiabilities || 0);

  const totalAssets = cash.plus(goldValue).plus(silverValue).plus(inventory).plus(receivables);
  const netZakatableWealth = Decimal.max(0, totalAssets.minus(liabilities));

  const goldNisab = new Decimal(7.5).times(goldRate);
  const silverNisab = new Decimal(52.5).times(silverRate);
  const activeNisab = input.nisabStandard === 'gold' ? goldNisab : silverNisab;

  const isEligible = netZakatableWealth.greaterThanOrEqualTo(activeNisab);
  // Zakat is precisely 2.5% (1/40th)
  const totalZakatDue = isEligible ? netZakatableWealth.times(0.025) : new Decimal(0);

  const totalAssetsNum = totalAssets.toNumber();

  const breakdown: ZakatAssetItem[] = [
    {
      key: 'cash',
      item: 'Cash in Hand & Bank Accounts',
      itemUrdu: 'نقد رقم اور بینک اکاؤنٹ',
      valuePkr: Math.round(cash.toNumber()),
      percentage: totalAssetsNum > 0 ? Number(((cash.toNumber() / totalAssetsNum) * 100).toFixed(1)) : 0,
      details: 'Current accounts, savings, foreign currency & prize bonds',
    },
    {
      key: 'gold',
      item: `Gold (${input.goldWeightTolas || 0} Tola, ${input.goldPurityKarat}K)`,
      itemUrdu: `سونا (${input.goldWeightTolas || 0} تولہ، ${input.goldPurityKarat} قیراط)`,
      valuePkr: Math.round(goldValue.toNumber()),
      percentage: totalAssetsNum > 0 ? Number(((goldValue.toNumber() / totalAssetsNum) * 100).toFixed(1)) : 0,
      details: `${(goldPurityMultiplier * 100).toFixed(1)}% purity valuation at Rs. ${input.goldRatePerTolaPkr.toLocaleString()}/Tola`,
    },
    {
      key: 'silver',
      item: `Silver (${input.silverWeightTolas || 0} Tola)`,
      itemUrdu: `چاندی (${input.silverWeightTolas || 0} تولہ)`,
      valuePkr: Math.round(silverValue.toNumber()),
      percentage: totalAssetsNum > 0 ? Number(((silverValue.toNumber() / totalAssetsNum) * 100).toFixed(1)) : 0,
      details: `Valuation at Rs. ${input.silverRatePerTolaPkr.toLocaleString()}/Tola`,
    },
    {
      key: 'inventory',
      item: 'Business Merchandise & Stock',
      itemUrdu: 'کاروباری مالِ تجارت اور اسٹاک',
      valuePkr: Math.round(inventory.toNumber()),
      percentage: totalAssetsNum > 0 ? Number(((inventory.toNumber() / totalAssetsNum) * 100).toFixed(1)) : 0,
      details: 'Wholesale / retail merchandise purchased with intention to resell',
    },
    {
      key: 'receivables',
      item: 'Shares, Mutual Funds & Receivables',
      itemUrdu: 'حصص، میوچل فنڈز اور واجب الوصول رقم',
      valuePkr: Math.round(receivables.toNumber()),
      percentage: totalAssetsNum > 0 ? Number(((receivables.toNumber() / totalAssetsNum) * 100).toFixed(1)) : 0,
      details: 'Tradable stocks, profit receivables, good loan debts expected back',
    },
  ];

  return {
    totalAssetsPkr: Math.round(totalAssetsNum),
    totalLiabilitiesPkr: Math.round(liabilities.toNumber()),
    netZakatableWealthPkr: Math.round(netZakatableWealth.toNumber()),
    goldNisabThresholdPkr: Math.round(goldNisab.toNumber()),
    silverNisabThresholdPkr: Math.round(silverNisab.toNumber()),
    activeNisabThresholdPkr: Math.round(activeNisab.toNumber()),
    isEligibleToPayZakat: isEligible,
    totalZakatDuePkr: Math.round(totalZakatDue.toNumber()),
    goldValuationPkr: Math.round(goldValue.toNumber()),
    silverValuationPkr: Math.round(silverValue.toNumber()),
    assetBreakdown: breakdown,
  };
}
