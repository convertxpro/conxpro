/**
 * NADRA CNIC & FBR NTN Decoder, Validator & Administrative Region Mapper
 * 100% Client-Side In-Memory Execution
 */

export interface CnicDecodedData {
  isValid: boolean;
  formattedCnic: string;
  rawDigits: string;
  provinceCode: number;
  provinceName: string;
  provinceUrdu: string;
  divisionCode: number;
  divisionName: string;
  districtTehsilCode: string;
  likelyDistrict: string;
  familySequence: string;
  genderDigit: number;
  gender: 'Male' | 'Female / Other';
  genderUrdu: 'مرد' | 'خواتین / دیگر';
  errorMessage?: string;
}

export interface NtnValidationResult {
  isValid: boolean;
  formattedNtn: string;
  rawDigits: string;
  calculatedCheckDigit: number;
  providedCheckDigit: number;
  entityType: 'Individual / Business' | 'AOP (Partnership)' | 'Corporate Company';
  statusDescription: string;
  errorMessage?: string;
}

// NADRA Administrative Division Mappings
const DIVISION_MAP: Record<number, { name: string; likelyDistricts: string[] }> = {
  // KPK (1x)
  11: { name: 'Peshawar Division', likelyDistricts: ['Peshawar', 'Charsadda', 'Nowshera'] },
  12: { name: 'Mardan Division', likelyDistricts: ['Mardan', 'Swabi'] },
  13: { name: 'Hazara Division', likelyDistricts: ['Abbottabad', 'Haripur', 'Mansehra', 'Battagram'] },
  14: { name: 'Kohat Division', likelyDistricts: ['Kohat', 'Karak', 'Hangu'] },
  15: { name: 'Bannu Division', likelyDistricts: ['Bannu', 'Lakki Marwat'] },
  16: { name: 'Dera Ismail Khan Division', likelyDistricts: ['D.I. Khan', 'Tank'] },
  17: { name: 'Malakand Division', likelyDistricts: ['Swat', 'Dir Lower', 'Dir Upper', 'Chitral', 'Buner', 'Shangla'] },

  // FATA (2x - Merged)
  21: { name: 'Merged Tribal Districts (Khyber / Mohmand / Bajaur)', likelyDistricts: ['Khyber', 'Bajaur', 'Mohmand'] },
  22: { name: 'Merged Tribal Districts (Waziristan / Kurram / Orakzai)', likelyDistricts: ['North Waziristan', 'South Waziristan', 'Kurram', 'Orakzai'] },

  // Punjab (3x)
  31: { name: 'Bahawalpur Division', likelyDistricts: ['Bahawalpur', 'Bahawalnagar', 'Rahim Yar Khan'] },
  32: { name: 'Dera Ghazi Khan Division', likelyDistricts: ['D.G. Khan', 'Layyah', 'Muzaffargarh', 'Rajanpur', 'Kot Addu'] },
  33: { name: 'Faisalabad Division', likelyDistricts: ['Faisalabad', 'Chiniot', 'Jhang', 'Toba Tek Singh'] },
  34: { name: 'Gujranwala Division', likelyDistricts: ['Gujranwala', 'Gujrat', 'Hafizabad', 'Mandi Bahauddin', 'Narowal', 'Sialkot', 'Wazirabad'] },
  35: { name: 'Lahore Division', likelyDistricts: ['Lahore City', 'Kasur', 'Nankana Sahib', 'Sheikhupura'] },
  36: { name: 'Multan Division', likelyDistricts: ['Multan', 'Khanewal', 'Lodhran', 'Vehari'] },
  37: { name: 'Rawalpindi Division', likelyDistricts: ['Rawalpindi', 'Attock', 'Chakwal', 'Jhelum', 'Murree', 'Talagang'] },
  38: { name: 'Sargodha Division', likelyDistricts: ['Sargodha', 'Bhakkar', 'Khushab', 'Mianwali'] },
  39: { name: 'Sahiwal Division', likelyDistricts: ['Sahiwal', 'Okara', 'Pakpattan'] },

  // Sindh (4x)
  41: { name: 'Hyderabad Division', likelyDistricts: ['Hyderabad', 'Badin', 'Dadu', 'Jamshoro', 'Matiari', 'Sujawal', 'Tando Allahyar', 'Thatta'] },
  42: { name: 'Karachi Division', likelyDistricts: ['Karachi Central', 'Karachi East', 'Karachi South', 'Karachi West', 'Korangi', 'Malir', 'Keamari'] },
  43: { name: 'Sukkur Division', likelyDistricts: ['Sukkur', 'Ghotki', 'Khairpur'] },
  44: { name: 'Larkana Division', likelyDistricts: ['Larkana', 'Jacobabad', 'Kashmore', 'Qambar Shahdadkot', 'Shikarpur'] },
  45: { name: 'Mirpur Khas Division', likelyDistricts: ['Mirpur Khas', 'Tharparkar', 'Umerkot'] },
  46: { name: 'Shaheed Benazirabad Division', likelyDistricts: ['Nawabshah (SBA)', 'Naushahro Feroze', 'Sanghar'] },

  // Balochistan (5x)
  51: { name: 'Quetta Division', likelyDistricts: ['Quetta', 'Chaman', 'Pishin', 'Qilla Abdullah'] },
  52: { name: 'Kalat Division', likelyDistricts: ['Khuzdar', 'Kalat', 'Mastung', 'Surab', 'Hub', 'Lasbela'] },
  53: { name: 'Makran Division', likelyDistricts: ['Gwadar', 'Kech (Turbat)', 'Panjgur'] },
  54: { name: 'Nasirabad Division', likelyDistricts: ['Nasirabad', 'Jaffarabad', 'Jhal Magsi', 'Sohbatpur', 'Usta Muhammad'] },
  55: { name: 'Sibi Division', likelyDistricts: ['Sibi', 'Dera Bugti', 'Kohlu', 'Ziarat', 'Harnai'] },
  56: { name: 'Zhob Division', likelyDistricts: ['Zhob', 'Loralai', 'Barkhan', 'Musakhail', 'Qilla Saifullah'] },
  57: { name: 'Rakhshan Division', likelyDistricts: ['Chagai', 'Kharan', 'Nushki', 'Washuk'] },

  // Islamabad (6x)
  61: { name: 'Islamabad Capital Territory (ICT)', likelyDistricts: ['Islamabad Urban', 'Islamabad Rural'] },

  // Gilgit-Baltistan (7x)
  71: { name: 'Gilgit Division', likelyDistricts: ['Gilgit', 'Hunza', 'Nagar', 'Ghizer'] },
  72: { name: 'Baltistan Division', likelyDistricts: ['Skardu', 'Shigar', 'Kharmang', 'Ghanche'] },
  73: { name: 'Diamer Division', likelyDistricts: ['Diamer (Chilas)', 'Astore'] },

  // AJK (8x)
  81: { name: 'Muzaffarabad Division', likelyDistricts: ['Muzaffarabad', 'Hattian Bala', 'Neelum Valley'] },
  82: { name: 'Mirpur Division', likelyDistricts: ['Mirpur', 'Bhimber', 'Kotli'] },
  83: { name: 'Poonch Division', likelyDistricts: ['Rawalakot (Poonch)', 'Bagh', 'Haveli', 'Sudhanoti'] },
};

const PROVINCE_MAP: Record<number, { name: string; urdu: string }> = {
  1: { name: 'Khyber Pakhtunkhwa (KPK)', urdu: 'خیبر پختونخوا' },
  2: { name: 'Merged Tribal Districts (FATA)', urdu: 'قبائلی علاقہ جات' },
  3: { name: 'Punjab', urdu: 'پنجاب' },
  4: { name: 'Sindh', urdu: 'سندھ' },
  5: { name: 'Balochistan', urdu: 'بلوچستان' },
  6: { name: 'Islamabad Capital Territory (ICT)', urdu: 'وفاقی دارالحکومت اسلام آباد' },
  7: { name: 'Gilgit-Baltistan (GB)', urdu: 'گلگت بلتستان' },
  8: { name: 'Azad Jammu & Kashmir (AJK)', urdu: 'آزاد جموں و کشمیر' },
};

export function formatCnicInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
}

export function decodeCnic(input: string): CnicDecodedData {
  const digits = input.replace(/\D/g, '');
  const formatted = formatCnicInput(digits);

  if (digits.length !== 13) {
    return {
      isValid: false,
      formattedCnic: formatted,
      rawDigits: digits,
      provinceCode: 0,
      provinceName: 'Unknown',
      provinceUrdu: '',
      divisionCode: 0,
      divisionName: 'Unknown',
      districtTehsilCode: '',
      likelyDistrict: 'Unknown',
      familySequence: '',
      genderDigit: 0,
      gender: 'Male',
      genderUrdu: 'مرد',
      errorMessage: digits.length === 0 ? 'Enter a 13-digit Pakistani CNIC number.' : `CNIC must have exactly 13 digits (currently ${digits.length}/13).`,
    };
  }

  const provDigit = parseInt(digits[0], 10);
  const divDigit = parseInt(digits.slice(0, 2), 10);
  const distTehsilCode = digits.slice(2, 5);
  const familySeq = digits.slice(5, 12);
  const lastDigit = parseInt(digits[12], 10);

  const prov = PROVINCE_MAP[provDigit] || { name: 'Overseas / Unassigned Region', urdu: 'نامعلوم' };
  const div = DIVISION_MAP[divDigit] || { name: `Administrative Division (${divDigit})`, likelyDistricts: ['Regional District'] };
  const isMale = lastDigit % 2 !== 0;

  return {
    isValid: true,
    formattedCnic: formatted,
    rawDigits: digits,
    provinceCode: provDigit,
    provinceName: prov.name,
    provinceUrdu: prov.urdu,
    divisionCode: divDigit,
    divisionName: div.name,
    districtTehsilCode: distTehsilCode,
    likelyDistrict: div.likelyDistricts.join(', '),
    familySequence: familySeq,
    genderDigit: lastDigit,
    gender: isMale ? 'Male' : 'Female / Other',
    genderUrdu: isMale ? 'مرد' : 'خواتین / دیگر',
  };
}

export function formatNtnInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 7) return digits;
  return `${digits.slice(0, 7)}-${digits.slice(7, 8)}`;
}

export function validateNtn(input: string): NtnValidationResult {
  const digits = input.replace(/\D/g, '');
  const formatted = formatNtnInput(digits);

  if (digits.length < 7 || digits.length > 8) {
    return {
      isValid: false,
      formattedNtn: formatted,
      rawDigits: digits,
      calculatedCheckDigit: -1,
      providedCheckDigit: -1,
      entityType: 'Individual / Business',
      statusDescription: 'Invalid NTN length',
      errorMessage: `Pakistani NTN must be 7 digits (with optional 1 check digit). Got ${digits.length} digits.`,
    };
  }

  const base7 = digits.slice(0, 7);
  const providedCheck = digits.length === 8 ? parseInt(digits[7], 10) : -1;

  // FBR Weighted Modulo-11 Algorithm
  // Weights: [8, 7, 6, 5, 4, 3, 2]
  const weights = [8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    sum += parseInt(base7[i], 10) * weights[i];
  }

  const remainder = sum % 11;
  const calculatedCheck = (11 - remainder) % 11;

  const isCheckValid = providedCheck === -1 || providedCheck === calculatedCheck;
  
  // Entity determination based on FBR prefix patterns
  let entityType: 'Individual / Business' | 'AOP (Partnership)' | 'Corporate Company' = 'Individual / Business';
  const prefix = parseInt(base7.slice(0, 2), 10);
  if (prefix >= 70 && prefix <= 89) {
    entityType = 'Corporate Company';
  } else if (prefix >= 50 && prefix <= 69) {
    entityType = 'AOP (Partnership)';
  }

  return {
    isValid: isCheckValid,
    formattedNtn: `${base7}-${calculatedCheck}`,
    rawDigits: digits,
    calculatedCheckDigit: calculatedCheck,
    providedCheckDigit: providedCheck !== -1 ? providedCheck : calculatedCheck,
    entityType,
    statusDescription: isCheckValid ? 'Valid FBR NTN Checksum' : 'Checksum Mismatch (Invalid Check Digit)',
    errorMessage: isCheckValid ? undefined : `Check digit mismatch. Calculated checksum is ${calculatedCheck}, but ${providedCheck} was entered.`,
  };
}
