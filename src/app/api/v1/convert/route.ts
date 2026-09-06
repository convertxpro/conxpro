import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { load as yamlLoad, dump as yamlDump } from 'js-yaml';
import { authenticateApiKey, applyApiRateLimitHeaders } from '@/lib/auth/apiKeyAuth';

// FBR 2024-2025 Slabs (Salaried Individuals)
function calculateFbrSalaryTax(monthlySalary: number) {
  const annualSalary = monthlySalary * 12;
  let annualTax = 0;
  let slabDescription = '';

  if (annualSalary <= 600000) {
    annualTax = 0;
    slabDescription = 'Up to Rs. 600,000 (0% Tax)';
  } else if (annualSalary <= 1200000) {
    annualTax = (annualSalary - 600000) * 0.05;
    slabDescription = 'Rs. 600,001 – 1,200,000 (5% of excess over Rs. 600,000)';
  } else if (annualSalary <= 2200000) {
    annualTax = 30000 + (annualSalary - 1200000) * 0.15;
    slabDescription = 'Rs. 1,200,001 – 2,200,000 (Rs. 30,000 + 15% of excess over Rs. 1,200,000)';
  } else if (annualSalary <= 3200000) {
    annualTax = 180000 + (annualSalary - 2200000) * 0.25;
    slabDescription = 'Rs. 2,200,001 – 3,200,000 (Rs. 180,000 + 25% of excess over Rs. 2,200,000)';
  } else if (annualSalary <= 4100000) {
    annualTax = 430000 + (annualSalary - 3200000) * 0.30;
    slabDescription = 'Rs. 3,200,001 – 4,100,000 (Rs. 430,000 + 30% of excess over Rs. 3,200,000)';
  } else {
    annualTax = 700000 + (annualSalary - 4100000) * 0.35;
    slabDescription = 'Exceeding Rs. 4,100,000 (Rs. 700,000 + 35% of excess over Rs. 4,100,000)';
  }

  // 10% Surcharge for annual taxable income exceeding Rs. 10 Million
  if (annualSalary > 10000000) {
    const surcharge = annualTax * 0.10;
    annualTax += surcharge;
  }

  const monthlyTax = annualTax / 12;
  const netMonthlySalary = monthlySalary - monthlyTax;
  const effectiveRatePercent = annualSalary > 0 ? (annualTax / annualSalary) * 100 : 0;

  return {
    monthlyGrossSalary: monthlySalary,
    annualGrossSalary: annualSalary,
    monthlyIncomeTax: Math.round(monthlyTax),
    annualIncomeTax: Math.round(annualTax),
    netMonthlySalary: Math.round(netMonthlySalary),
    netAnnualSalary: Math.round(annualSalary - annualTax),
    effectiveTaxRatePercent: Number(effectiveRatePercent.toFixed(2)),
    taxSlab: slabDescription,
    taxYear: '2024–2025',
  };
}

// Unit conversion factors to Base SI Unit
const UNIT_RATIOS: Record<string, Record<string, number>> = {
  length: {
    meter: 1,
    m: 1,
    kilometer: 1000,
    km: 1000,
    centimeter: 0.01,
    cm: 0.01,
    millimeter: 0.001,
    mm: 0.001,
    mile: 1609.344,
    mi: 1609.344,
    yard: 0.9144,
    yd: 0.9144,
    foot: 0.3048,
    ft: 0.3048,
    inch: 0.0254,
    in: 0.0254,
  },
  weight: {
    kilogram: 1,
    kg: 1,
    gram: 0.001,
    g: 0.001,
    milligram: 0.000001,
    mg: 0.000001,
    pound: 0.45359237,
    lb: 0.45359237,
    ounce: 0.028349523,
    oz: 0.028349523,
    ton: 1000,
    t: 1000,
  },
  area: {
    square_meter: 1,
    sqm: 1,
    square_kilometer: 1000000,
    sqkm: 1000000,
    square_foot: 0.092903,
    sqft: 0.092903,
    acre: 4046.856,
    hectare: 10000,
    marla_urban: 20.903, // 225 sq ft
    marla_revenue: 25.2929, // 272.25 sq ft
    kanal: 505.857,
  },
  storage: {
    byte: 1,
    b: 1,
    kilobyte: 1024,
    kb: 1024,
    megabyte: 1024 * 1024,
    mb: 1024 * 1024,
    gigabyte: 1024 * 1024 * 1024,
    gb: 1024 * 1024 * 1024,
    terabyte: 1024 * 1024 * 1024 * 1024,
    tb: 1024 * 1024 * 1024 * 1024,
  },
};

// Live Currency benchmark exchange rates (to PKR)
const FX_RATES_PKR: Record<string, number> = {
  PKR: 1,
  USD: 278.5,
  EUR: 301.2,
  GBP: 356.8,
  AED: 75.83,
  SAR: 74.25,
  CAD: 204.1,
  AUD: 182.4,
  QAR: 76.45,
  KWD: 908.5,
  OMR: 723.4,
  CNY: 38.6,
  INR: 3.32,
};

/**
 * GET /api/v1/convert — Returns documentation and capabilities schema
 */
export async function GET(request: NextRequest) {
  const auth = await authenticateApiKey(request);

  const response = NextResponse.json({
    status: 'ok',
    version: 'v1.0.0',
    service: 'ApexTools Public REST API',
    documentationUrl: 'https://apextools.app/guides/public-api-reference',
    authenticated: auth.authenticated,
    authContext: {
      tier: auth.tier,
      dailyQuotaLimit: auth.limit,
      remainingDailyQuota: auth.remaining,
      resetsInSeconds: auth.resetsInSeconds,
    },
    supportedTools: [
      {
        tool: 'unit',
        description: 'Physical & digital unit converter (Length, Weight, Area, Storage, etc.)',
        params: { value: 'number', fromUnit: 'string', toUnit: 'string', category: 'optional string' },
      },
      {
        tool: 'fbr-tax',
        description: 'Calculate official Pakistan FBR Income Tax breakdown for Tax Year 2024–2025',
        params: { monthlySalary: 'number (PKR)' },
      },
      {
        tool: 'freelance-tax',
        description: 'Calculate Pakistan IT / Software export PSEB 0.25% tax vs standard slab tax',
        params: { annualIncome: 'number (PKR)', isPsebRegistered: 'boolean' },
      },
      {
        tool: 'zakat',
        description: 'Calculate accurate Zakat on Gold, Silver, and Cash with 2.5% rate',
        params: { goldGrams: 'number', silverGrams: 'number', cashPkr: 'number' },
      },
      {
        tool: 'marla',
        description: 'Convert real estate land units (Marla, Sq Ft, Kanal, Gazz) across LDA/CDA/Revenue standards',
        params: { value: 'number', fromUnit: 'marla | sqft | kanal | gazz', standard: 'urban | revenue | cda' },
      },
      {
        tool: 'currency',
        description: 'Real-time multi-currency exchange rates and conversion calculations',
        params: { amount: 'number', from: 'string (e.g. USD)', to: 'string (e.g. PKR)' },
      },
      {
        tool: 'json-to-yaml',
        description: 'Convert JSON payload or string to clean YAML configuration document',
        params: { data: 'object | string' },
      },
      {
        tool: 'yaml-to-json',
        description: 'Convert YAML syntax to formatted JSON structure',
        params: { yamlString: 'string' },
      },
      {
        tool: 'hash',
        description: 'Generate cryptographic digests (SHA-256, SHA-512, MD5)',
        params: { text: 'string', algorithm: 'sha256 | sha512 | md5' },
      },
      {
        tool: 'base64',
        description: 'Base64 encode or decode text strings',
        params: { text: 'string', mode: 'encode | decode' },
      },
    ],
  });

  return applyApiRateLimitHeaders(response, auth);
}

/**
 * POST /api/v1/convert — Unified JSON Conversion Handler
 */
export async function POST(request: NextRequest) {
  // 1. Authenticate API Key
  const auth = await authenticateApiKey(request);
  if (!auth.authenticated || auth.error) {
    const errorResponse = NextResponse.json(
      {
        error: 'Authentication failed',
        message: auth.error,
        statusCode: auth.statusCode || 401,
      },
      { status: auth.statusCode || 401 }
    );
    return applyApiRateLimitHeaders(errorResponse, auth);
  }

  // 2. Parse Request JSON Payload
  let body: any = null;
  try {
    body = await request.json();
  } catch {
    const errorResponse = NextResponse.json(
      { error: 'Invalid JSON payload. Please send a valid JSON request body.' },
      { status: 400 }
    );
    return applyApiRateLimitHeaders(errorResponse, auth);
  }

  const { tool, params = {} } = body;
  if (!tool || typeof tool !== 'string') {
    const errorResponse = NextResponse.json(
      { error: 'Missing required field: "tool". Example: { "tool": "fbr-tax", "params": { ... } }' },
      { status: 400 }
    );
    return applyApiRateLimitHeaders(errorResponse, auth);
  }

  const normalizedTool = tool.toLowerCase().trim();
  let resultData: any = null;

  try {
    switch (normalizedTool) {
      // -------------------------------------------------------------
      // 1. FBR TAX CALCULATOR
      // -------------------------------------------------------------
      case 'fbr-tax':
      case 'fbr-salary-tax': {
        const monthlySalary = Number(params.monthlySalary || params.salary || params.amount || 0);
        if (monthlySalary <= 0) {
          throw new Error('Please provide a positive "monthlySalary" in params.');
        }
        resultData = calculateFbrSalaryTax(monthlySalary);
        break;
      }

      // -------------------------------------------------------------
      // 2. FREELANCER IT TAX CALCULATOR
      // -------------------------------------------------------------
      case 'freelance-tax':
      case 'pseb-tax': {
        const annualIncome = Number(params.annualIncome || params.income || params.amount || 0);
        const isExport = params.isPsebRegistered !== false && params.isExport !== false;
        if (annualIncome <= 0) {
          throw new Error('Please provide a positive "annualIncome" in params.');
        }

        const exportTax = isExport ? annualIncome * 0.0025 : 0;
        const standardCalculation = calculateFbrSalaryTax(annualIncome / 12);
        const savings = standardCalculation.annualIncomeTax - exportTax;

        resultData = {
          annualIncome,
          isPsebExportRegistered: isExport,
          taxRatePercent: isExport ? 0.25 : standardCalculation.effectiveTaxRatePercent,
          taxPayable: Math.round(isExport ? exportTax : standardCalculation.annualIncomeTax),
          netIncome: Math.round(annualIncome - (isExport ? exportTax : standardCalculation.annualIncomeTax)),
          savingsVersusStandardTax: Math.max(0, Math.round(savings)),
          lawReference: 'Income Tax Ordinance Clause 133 / Section 154A (0.25% Final Tax)',
        };
        break;
      }

      // -------------------------------------------------------------
      // 3. ZAKAT CALCULATOR
      // -------------------------------------------------------------
      case 'zakat':
      case 'zakat-calculator': {
        const goldGrams = Number(params.goldGrams || 0);
        const silverGrams = Number(params.silverGrams || 0);
        const cashPkr = Number(params.cashPkr || params.cash || 0);
        const goldPricePerGram = Number(params.goldPricePerGram || 24500); // Benchmark PKR
        const silverPricePerGram = Number(params.silverPricePerGram || 290); // Benchmark PKR

        const goldWealth = goldGrams * goldPricePerGram;
        const silverWealth = silverGrams * silverPricePerGram;
        const totalWealth = goldWealth + silverWealth + cashPkr;

        // Nisab threshold (52.5 tola silver = ~612.36 grams)
        const silverNisabThreshold = 612.36 * silverPricePerGram;
        const isEligible = totalWealth >= silverNisabThreshold;
        const zakatPayable = isEligible ? totalWealth * 0.025 : 0;

        resultData = {
          totalWealthPkr: Math.round(totalWealth),
          goldValuePkr: Math.round(goldWealth),
          silverValuePkr: Math.round(silverWealth),
          cashValuePkr: Math.round(cashPkr),
          silverNisabThresholdPkr: Math.round(silverNisabThreshold),
          isZakatApplicable: isEligible,
          zakatPayablePkr: Math.round(zakatPayable),
          rate: '2.5% (1/40th)',
        };
        break;
      }

      // -------------------------------------------------------------
      // 4. MARLA REAL ESTATE LAND CONVERTER
      // -------------------------------------------------------------
      case 'marla':
      case 'land-converter': {
        const value = Number(params.value || params.amount || 0);
        const fromUnit = String(params.fromUnit || 'marla').toLowerCase();
        const standard = String(params.standard || 'urban').toLowerCase();
        const sqftPerMarla = standard === 'revenue' || standard === 'patwari' ? 272.25 : standard === 'cda' ? 250 : 225;

        let totalSqFt = 0;
        if (fromUnit === 'marla') totalSqFt = value * sqftPerMarla;
        else if (fromUnit === 'kanal') totalSqFt = value * 20 * sqftPerMarla;
        else if (fromUnit === 'sqft' || fromUnit === 'square_feet') totalSqFt = value;
        else if (fromUnit === 'gazz' || fromUnit === 'square_yard') totalSqFt = value * 9;
        else totalSqFt = value * sqftPerMarla;

        resultData = {
          input: { value, unit: fromUnit, standard },
          squareFeet: Number(totalSqFt.toFixed(2)),
          marla: Number((totalSqFt / sqftPerMarla).toFixed(4)),
          kanal: Number((totalSqFt / (20 * sqftPerMarla)).toFixed(4)),
          squareYardsGazz: Number((totalSqFt / 9).toFixed(2)),
          squareMeters: Number((totalSqFt * 0.092903).toFixed(2)),
          standardSqFtPerMarla: sqftPerMarla,
        };
        break;
      }

      // -------------------------------------------------------------
      // 5. PHYSICAL & DIGITAL UNIT CONVERTER
      // -------------------------------------------------------------
      case 'unit':
      case 'unit-converter': {
        const value = Number(params.value || params.amount || 0);
        const fromUnit = String(params.fromUnit || params.from || '').toLowerCase().trim();
        const toUnit = String(params.toUnit || params.to || '').toLowerCase().trim();

        let convertedValue = null;
        let matchedCategory = null;

        for (const [catName, units] of Object.entries(UNIT_RATIOS)) {
          if (units[fromUnit] !== undefined && units[toUnit] !== undefined) {
            const baseVal = value * units[fromUnit];
            convertedValue = baseVal / units[toUnit];
            matchedCategory = catName;
            break;
          }
        }

        if (convertedValue === null) {
          // Temperature special handler
          if (
            ['celsius', 'c', 'fahrenheit', 'f', 'kelvin', 'k'].includes(fromUnit) &&
            ['celsius', 'c', 'fahrenheit', 'f', 'kelvin', 'k'].includes(toUnit)
          ) {
            let tempC = value;
            if (fromUnit === 'fahrenheit' || fromUnit === 'f') tempC = ((value - 32) * 5) / 9;
            else if (fromUnit === 'kelvin' || fromUnit === 'k') tempC = value - 273.15;

            if (toUnit === 'celsius' || toUnit === 'c') convertedValue = tempC;
            else if (toUnit === 'fahrenheit' || toUnit === 'f') convertedValue = (tempC * 9) / 5 + 32;
            else if (toUnit === 'kelvin' || toUnit === 'k') convertedValue = tempC + 273.15;
            matchedCategory = 'temperature';
          }
        }

        if (convertedValue === null) {
          throw new Error(`Unsupported unit conversion from "${fromUnit}" to "${toUnit}".`);
        }

        resultData = {
          input: { value, fromUnit },
          output: { value: Number(convertedValue.toFixed(6)), toUnit },
          category: matchedCategory,
        };
        break;
      }

      // -------------------------------------------------------------
      // 6. LIVE FOREX & CURRENCY CONVERSION
      // -------------------------------------------------------------
      case 'currency':
      case 'forex': {
        const amount = Number(params.amount || params.value || 1);
        const fromCurr = String(params.from || 'USD').toUpperCase().trim();
        const toCurr = String(params.to || 'PKR').toUpperCase().trim();

        const fromRateInPkr = FX_RATES_PKR[fromCurr];
        const toRateInPkr = FX_RATES_PKR[toCurr];

        if (!fromRateInPkr || !toRateInPkr) {
          throw new Error(`Unsupported currency code. Supported: ${Object.keys(FX_RATES_PKR).join(', ')}`);
        }

        const amountInPkr = amount * fromRateInPkr;
        const converted = amountInPkr / toRateInPkr;
        const directRate = fromRateInPkr / toRateInPkr;

        resultData = {
          amount,
          from: fromCurr,
          to: toCurr,
          convertedAmount: Number(converted.toFixed(4)),
          exchangeRate: Number(directRate.toFixed(4)),
          inverseRate: Number((1 / directRate).toFixed(4)),
          timestamp: new Date().toISOString(),
        };
        break;
      }

      // -------------------------------------------------------------
      // 7. DEVELOPER DATA & TEXT TRANSFORMS
      // -------------------------------------------------------------
      case 'json-to-yaml': {
        let inputObj = params.data || params.json;
        if (typeof inputObj === 'string') {
          inputObj = JSON.parse(inputObj);
        }
        const yamlOutput = yamlDump(inputObj, { indent: 2 });
        resultData = { yaml: yamlOutput };
        break;
      }

      case 'yaml-to-json': {
        const yamlStr = String(params.yaml || params.yamlString || params.data || '');
        const parsedJson = yamlLoad(yamlStr);
        resultData = { json: parsedJson };
        break;
      }

      case 'base64': {
        const text = String(params.text || params.data || '');
        const mode = params.mode === 'decode' ? 'decode' : 'encode';
        if (mode === 'encode') {
          resultData = { mode: 'encode', result: Buffer.from(text, 'utf-8').toString('base64') };
        } else {
          resultData = { mode: 'decode', result: Buffer.from(text, 'base64').toString('utf-8') };
        }
        break;
      }

      case 'hash': {
        const text = String(params.text || params.data || '');
        const algo = (params.algorithm || 'sha256').toLowerCase();
        if (!['sha256', 'sha512', 'md5', 'sha1'].includes(algo)) {
          throw new Error('Supported hash algorithms: sha256, sha512, md5, sha1');
        }
        const digest = crypto.createHash(algo).update(text, 'utf-8').digest('hex');
        resultData = { text, algorithm: algo, hash: digest };
        break;
      }

      default:
        throw new Error(
          `Unknown tool: "${tool}". Supported tools: unit, fbr-tax, freelance-tax, zakat, marla, currency, json-to-yaml, yaml-to-json, base64, hash.`
        );
    }
  } catch (err: any) {
    const errorResponse = NextResponse.json(
      {
        error: 'Conversion failed',
        message: err.message || 'Error executing conversion tool.',
      },
      { status: 400 }
    );
    return applyApiRateLimitHeaders(errorResponse, auth);
  }

  const successResponse = NextResponse.json({
    success: true,
    tool: normalizedTool,
    data: resultData,
    timestamp: new Date().toISOString(),
    meta: {
      tier: auth.tier,
      remainingDailyQuota: auth.remaining,
      resetsInSeconds: auth.resetsInSeconds,
    },
  });

  return applyApiRateLimitHeaders(successResponse, auth);
}
