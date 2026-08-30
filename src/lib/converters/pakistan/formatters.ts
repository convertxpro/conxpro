/**
 * Pakistani Numbering System and Currency Formatters
 * Supports South Asian numerical grouping (Lakh, Crore, Arab, Kharab)
 */

export function formatPakistaniNumber(num: number | string): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '0';

  const parts = n.toString().split('.');
  let integerPart = parts[0];
  const decimalPart = parts.length > 1 ? `.${parts[1]}` : '';

  const isNegative = integerPart.startsWith('-');
  if (isNegative) integerPart = integerPart.slice(1);

  if (integerPart.length <= 3) {
    return (isNegative ? '-' : '') + integerPart + decimalPart;
  }

  // Last 3 digits
  const last3 = integerPart.slice(-3);
  const remaining = integerPart.slice(0, -3);

  // Group rest by 2
  const groupedRemaining = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  const formattedInteger = `${groupedRemaining},${last3}`;

  return (isNegative ? '-' : '') + formattedInteger + decimalPart;
}

export function formatLakhCrore(num: number | string): {
  formatted: string;
  inWords: string;
  inUrdu: string;
} {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n) || n === 0) {
    return { formatted: 'PKR 0', inWords: 'Zero Rupees', inUrdu: 'صفر روپے' };
  }

  const absN = Math.abs(n);
  let inWords = '';
  let inUrdu = '';

  if (absN >= 1000000000000) {
    // Kharab (10^12)
    const val = absN / 1000000000000;
    inWords = `${val.toFixed(2)} Kharab`;
    inUrdu = `${val.toFixed(2)} کھرب روپے`;
  } else if (absN >= 1000000000) {
    // Arab (10^9 = 100 Crore)
    const val = absN / 1000000000;
    inWords = `${val.toFixed(2)} Arab`;
    inUrdu = `${val.toFixed(2)} ارب روپے`;
  } else if (absN >= 10000000) {
    // Crore (10^7)
    const val = absN / 10000000;
    inWords = `${val.toFixed(2)} Crore`;
    inUrdu = `${val.toFixed(2)} کروڑ روپے`;
  } else if (absN >= 100000) {
    // Lakh (10^5)
    const val = absN / 100000;
    inWords = `${val.toFixed(2)} Lakh`;
    inUrdu = `${val.toFixed(2)} لاکھ روپے`;
  } else if (absN >= 1000) {
    // Thousand
    const val = absN / 1000;
    inWords = `${val.toFixed(2)} Thousand`;
    inUrdu = `${val.toFixed(2)} ہزار روپے`;
  } else {
    inWords = `${absN.toFixed(2)} Rupees`;
    inUrdu = `${absN.toFixed(2)} روپے`;
  }

  return {
    formatted: `Rs. ${formatPakistaniNumber(Math.round(n))}`,
    inWords,
    inUrdu,
  };
}

export function formatCurrencyPKR(amount: number | string): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(n)) return 'Rs. 0';
  return `Rs. ${formatPakistaniNumber(n.toFixed(2))}`;
}
