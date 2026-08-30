export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  popular?: boolean;
  pakistanRemittance?: boolean;
}

export const CURRENCIES: Record<string, CurrencyInfo> = {
  PKR: { code: 'PKR', name: 'Pakistani Rupee', symbol: 'Rs.', flag: '🇵🇰', popular: true, pakistanRemittance: true },
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', popular: true, pakistanRemittance: true },
  SAR: { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦', popular: true, pakistanRemittance: true },
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪', popular: true, pakistanRemittance: true },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', popular: true, pakistanRemittance: true },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', popular: true, pakistanRemittance: true },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦', popular: true, pakistanRemittance: true },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', popular: true, pakistanRemittance: true },
  QAR: { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR', flag: '🇶🇦', popular: true, pakistanRemittance: true },
  KWD: { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD', flag: '🇰🇼', popular: true, pakistanRemittance: true },
  OMR: { code: 'OMR', name: 'Omani Rial', symbol: 'OMR', flag: '🇴🇲', popular: true, pakistanRemittance: true },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳', popular: true },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', popular: false },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', popular: false },
  TRY: { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷', popular: false },
  MYR: { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾', popular: false },
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', popular: false },
  BHD: { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BD', flag: '🇧🇭', popular: false },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭', popular: false },
  NZD: { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿', popular: false },
};

export const CURRENCY_LIST = Object.values(CURRENCIES);

export const POPULAR_CURRENCIES = CURRENCY_LIST.filter((c) => c.popular);

export const REMITTANCE_CURRENCIES = [
  'USD',
  'SAR',
  'AED',
  'GBP',
  'EUR',
  'CAD',
  'AUD',
  'QAR',
  'KWD',
  'OMR',
];

export interface ConversionTableRow {
  from: string;
  to: string;
  rawFrom: number;
  rawTo: number;
}

export interface ConversionTableResult {
  title: string;
  headers: [string, string];
  rows: ConversionTableRow[];
}

/**
 * Generate a pre-calculated conversion reference matrix table
 */
export function generateCurrencyTable(
  fromCurrency: string,
  toCurrency: string,
  rate: number
): ConversionTableResult {
  const denominations = [1, 5, 10, 20, 50, 100, 250, 500, 1000, 5000, 10000];
  const fromInfo = CURRENCIES[fromCurrency] || { symbol: fromCurrency };
  const toInfo = CURRENCIES[toCurrency] || { symbol: toCurrency };

  return {
    title: `${fromCurrency} to ${toCurrency} Conversion Reference Table`,
    headers: [`Amount (${fromCurrency})`, `Converted (${toCurrency})`],
    rows: denominations.map((amt) => {
      const converted = amt * rate;
      return {
        rawFrom: amt,
        rawTo: converted,
        from: `${fromInfo.symbol} ${amt.toLocaleString()} ${fromCurrency}`,
        to: `${toInfo.symbol} ${converted.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} ${toCurrency}`,
      };
    }),
  };
}

/**
 * Generate an inverse pre-calculated conversion reference matrix table
 */
export function generateInverseCurrencyTable(
  fromCurrency: string,
  toCurrency: string,
  rate: number
): ConversionTableResult {
  const inverseRate = rate > 0 ? 1 / rate : 0;
  const denominations = [100, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];
  const toInfo = CURRENCIES[toCurrency] || { symbol: toCurrency };
  const fromInfo = CURRENCIES[fromCurrency] || { symbol: fromCurrency };

  return {
    title: `${toCurrency} to ${fromCurrency} Inverse Reference Table`,
    headers: [`Amount (${toCurrency})`, `Converted (${fromCurrency})`],
    rows: denominations.map((amt) => {
      const converted = amt * inverseRate;
      return {
        rawFrom: amt,
        rawTo: converted,
        from: `${toInfo.symbol} ${amt.toLocaleString()} ${toCurrency}`,
        to: `${fromInfo.symbol} ${converted.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        })} ${fromCurrency}`,
      };
    }),
  };
}
