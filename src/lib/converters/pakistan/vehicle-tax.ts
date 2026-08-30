/**
 * Pakistan Vehicle Token Tax, Registration & Excise Estimator Engine
 * Schedules for Punjab (MTMIS), Sindh, Islamabad (ICT), and KPK
 * Updated for Finance Act 2024-2026 (Section 231B & Section 234 Filer vs Non-Filer)
 */

export type VehicleProvince = 'punjab' | 'sindh' | 'islamabad' | 'kpk';
export type VehicleCategory = 'car' | 'suv' | 'ev' | 'motorcycle' | 'commercial';
export type EngineDisplacement = 'sub_1000' | '1001_1300' | '1301_1500' | '1501_2000' | '2001_2500' | 'above_2500';
export type EvBatterySlab = 'under_35kwh' | '35_to_60kwh' | 'above_60kwh';
export type CalculationType = 'annual_token' | 'new_registration' | 'transfer_ownership';
export type VehicleFilerStatus = 'filer' | 'non_filer';

export interface VehicleTaxInput {
  province: VehicleProvince;
  vehicleCategory: VehicleCategory;
  engineDisplacement: EngineDisplacement;
  evBatterySlab?: EvBatterySlab;
  calculationType: CalculationType;
  filerStatus: VehicleFilerStatus;
  vehicleInvoicePrice?: number;
  vehicleAgeYears?: number;
  isLatePayment?: boolean;
}

export interface VehicleTaxResult {
  province: VehicleProvince;
  vehicleCategory: VehicleCategory;
  calculationType: CalculationType;
  filerStatus: VehicleFilerStatus;
  motorVehicleTax: number; // Base MVT
  advanceIncomeTax: number; // Sec 231B or 234
  registrationFee: number;
  smartCardPlateFee: number;
  transferDuty: number;
  professionalTax: number;
  latePenalty: number;
  totalPayable: number;
  filerSavings: number;
  notes: string[];
}

export const ENGINE_SLABS = [
  { id: 'sub_1000', label: 'Up to 1000cc', desc: 'Alto 660cc, Cultus, WagonR, Mira', defaultPrice: 2800000 },
  { id: '1001_1300', label: '1001cc to 1300cc', desc: 'Yaris 1.3, City 1.2/1.3, Swift', defaultPrice: 4500000 },
  { id: '1301_1500', label: '1301cc to 1500cc', desc: 'Civic 1.5T, Yaris 1.5, Alsvin, HR-V', defaultPrice: 6500000 },
  { id: '1501_2000', label: '1501cc to 2000cc', desc: 'Sportage, Tucson, Elantra, Civic 2.0', defaultPrice: 8500000 },
  { id: '2001_2500', label: '2001cc to 2500cc', desc: 'Sonata 2.5, Camry, Haval H6', defaultPrice: 11500000 },
  { id: 'above_2500', label: '2500cc+ / Luxury', desc: 'Fortuner, Prado, Land Cruiser, Revo', defaultPrice: 19500000 },
];

export function calculateVehicleTax(input: VehicleTaxInput): VehicleTaxResult {
  const isFiler = input.filerStatus === 'filer';
  const invoice = Math.max(0, Number(input.vehicleInvoicePrice) || 3500000);

  let motorVehicleTax = 0;
  let advanceIncomeTax = 0;
  let registrationFee = 0;
  let smartCardPlateFee = 0;
  let transferDuty = 0;
  let professionalTax = 200;
  let latePenalty = 0;
  const notes: string[] = [];

  // ==========================================
  // 1. MOTORCYCLE
  // ==========================================
  if (input.vehicleCategory === 'motorcycle') {
    if (input.calculationType === 'new_registration') {
      registrationFee = 2500;
      smartCardPlateFee = 2000;
      motorVehicleTax = 1500; // Lifetime token tax
      advanceIncomeTax = isFiler ? 1000 : 3000;
      notes.push('Lifetime Token Tax is included in initial motorcycle registration.');
    } else if (input.calculationType === 'transfer_ownership') {
      transferDuty = 1500;
      smartCardPlateFee = 1500;
    } else {
      motorVehicleTax = 0; // Lifetime exempt
      professionalTax = 0;
      notes.push('Standard motorcycles have lifetime token tax prepaid.');
    }
  }
  // ==========================================
  // 2. ELECTRIC VEHICLE (EV)
  // ==========================================
  else if (input.vehicleCategory === 'ev') {
    const battery = input.evBatterySlab || '35_to_60kwh';
    if (input.calculationType === 'new_registration') {
      registrationFee = Math.round(invoice * 0.01); // 1% EV promotional rate
      smartCardPlateFee = 4000; // Plate + Smart card
      advanceIncomeTax = isFiler ? 15000 : 45000;
      motorVehicleTax = battery === 'under_35kwh' ? 2500 : battery === '35_to_60kwh' ? 4500 : 8000;
      notes.push('Special 50% Green EV Excise Subsidy applied.');
    } else if (input.calculationType === 'annual_token') {
      motorVehicleTax = battery === 'under_35kwh' ? 2500 : battery === '35_to_60kwh' ? 4500 : 8000;
      advanceIncomeTax = isFiler ? 1500 : 4500;
      professionalTax = 200;
    } else {
      transferDuty = 5000;
      smartCardPlateFee = 2500;
    }
  }
  // ==========================================
  // 3. PASSENGER CARS & SUVS
  // ==========================================
  else {
    const cc = input.engineDisplacement;

    // --- A. NEW REGISTRATION ---
    if (input.calculationType === 'new_registration') {
      smartCardPlateFee = 4000; // Rs. 2000 Card + Rs. 2000 Number Plate

      if (cc === 'sub_1000') {
        registrationFee = Math.round(invoice * 0.01); // 1%
        motorVehicleTax = 10000; // Lifetime Token in Punjab/Sindh
        advanceIncomeTax = isFiler ? 10000 : 30000; // Sec 231B
        notes.push('Lifetime token tax paid at registration for cars up to 1000cc.');
      } else if (cc === '1001_1300') {
        registrationFee = Math.round(invoice * 0.015);
        motorVehicleTax = 4500; // 1st year MVT
        advanceIncomeTax = isFiler ? 25000 : 75000;
      } else if (cc === '1301_1500') {
        registrationFee = Math.round(invoice * 0.02);
        motorVehicleTax = 6500;
        advanceIncomeTax = isFiler ? 50000 : 150000;
      } else if (cc === '1501_2000') {
        registrationFee = Math.round(invoice * 0.025);
        motorVehicleTax = 9500;
        advanceIncomeTax = isFiler ? 150000 : 450000;
      } else if (cc === '2001_2500') {
        registrationFee = Math.round(invoice * 0.03);
        motorVehicleTax = 16000;
        advanceIncomeTax = isFiler ? 250000 : 750000;
      } else {
        // above 2500cc luxury
        registrationFee = Math.round(invoice * 0.04);
        motorVehicleTax = 28000;
        advanceIncomeTax = isFiler ? 450000 : 1350000;
      }
    }

    // --- B. ANNUAL TOKEN TAX RENEWAL ---
    else if (input.calculationType === 'annual_token') {
      if (cc === 'sub_1000') {
        motorVehicleTax = 0; // Lifetime token prepaid
        advanceIncomeTax = 0;
        professionalTax = 0;
        notes.push('Vehicles under 1000cc have prepaid Lifetime Token Tax.');
      } else if (cc === '1001_1300') {
        motorVehicleTax = 4000;
        advanceIncomeTax = isFiler ? 1800 : 5400; // Sec 234
        professionalTax = 200;
      } else if (cc === '1301_1500') {
        motorVehicleTax = 6000;
        advanceIncomeTax = isFiler ? 3000 : 9000;
        professionalTax = 200;
      } else if (cc === '1501_2000') {
        motorVehicleTax = 9000;
        advanceIncomeTax = isFiler ? 4500 : 13500;
        professionalTax = 200;
      } else if (cc === '2001_2500') {
        motorVehicleTax = 15000;
        advanceIncomeTax = isFiler ? 7500 : 22500;
        professionalTax = 300;
      } else {
        motorVehicleTax = 25000;
        advanceIncomeTax = isFiler ? 15000 : 45000;
        professionalTax = 500;
      }
    }

    // --- C. TRANSFER OF OWNERSHIP ---
    else if (input.calculationType === 'transfer_ownership') {
      smartCardPlateFee = 2500; // New Smart card reissue
      if (cc === 'sub_1000') {
        transferDuty = 3000;
        advanceIncomeTax = isFiler ? 5000 : 15000;
      } else if (cc === '1001_1300') {
        transferDuty = 6000;
        advanceIncomeTax = isFiler ? 10000 : 30000;
      } else if (cc === '1301_1500') {
        transferDuty = 9000;
        advanceIncomeTax = isFiler ? 20000 : 60000;
      } else if (cc === '1501_2000') {
        transferDuty = 15000;
        advanceIncomeTax = isFiler ? 40000 : 120000;
      } else if (cc === '2001_2500') {
        transferDuty = 25000;
        advanceIncomeTax = isFiler ? 75000 : 225000;
      } else {
        transferDuty = 40000;
        advanceIncomeTax = isFiler ? 150000 : 450000;
      }
    }
  }

  // Late penalty calculation (20% surcharge on MVT)
  if (input.isLatePayment && motorVehicleTax > 0) {
    latePenalty = Math.round(motorVehicleTax * 0.20);
    notes.push('20% late payment surcharge added to Base Motor Vehicle Tax.');
  }

  // Islamabad slight variation adjustment
  if (input.province === 'islamabad' && motorVehicleTax > 0) {
    motorVehicleTax = Math.round(motorVehicleTax * 0.95);
  }

  const totalPayable = motorVehicleTax + advanceIncomeTax + registrationFee + smartCardPlateFee + transferDuty + professionalTax + latePenalty;

  // Calculate filer savings
  const nonFilerIncomeTax = advanceIncomeTax * (isFiler ? 3 : 1);
  const filerIncomeTax = isFiler ? advanceIncomeTax : advanceIncomeTax / 3;
  const filerSavings = Math.max(0, nonFilerIncomeTax - filerIncomeTax);

  return {
    province: input.province,
    vehicleCategory: input.vehicleCategory,
    calculationType: input.calculationType,
    filerStatus: input.filerStatus,
    motorVehicleTax,
    advanceIncomeTax,
    registrationFee,
    smartCardPlateFee,
    transferDuty,
    professionalTax,
    latePenalty,
    totalPayable,
    filerSavings,
    notes,
  };
}
