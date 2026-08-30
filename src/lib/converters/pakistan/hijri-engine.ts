import moment from 'moment-hijri';

// Ensure English numerals for default formatting
moment.locale('en');

export interface HijriMonthInfo {
  index: number; // 1 to 12
  nameEn: string;
  nameUrdu: string;
  nameArabic: string;
  significance: string;
  isSacredMonth: boolean;
}

export const HIJRI_MONTHS: HijriMonthInfo[] = [
  {
    index: 1,
    nameEn: "Muharram",
    nameUrdu: "محرم الحرام",
    nameArabic: "المُحَرَّم",
    significance: "First month of Islamic calendar. Month of mourning and Ashura (10th Muharram).",
    isSacredMonth: true,
  },
  {
    index: 2,
    nameEn: "Safar",
    nameUrdu: "صفر المظفر",
    nameArabic: "صَفَر",
    significance: "Second Islamic month.",
    isSacredMonth: false,
  },
  {
    index: 3,
    nameEn: "Rabi' al-Awwal",
    nameUrdu: "ربیع الاول",
    nameArabic: "رَبِيع الأَوَّل",
    significance: "Month of birth of Prophet Muhammad ﷺ (Eid Milad-un-Nabi on 12th).",
    isSacredMonth: false,
  },
  {
    index: 4,
    nameEn: "Rabi' al-Thani",
    nameUrdu: "ربیع الثانی",
    nameArabic: "رَبِيع الآخِر",
    significance: "Fourth month. Giyarween Sharif commemorated on 11th.",
    isSacredMonth: false,
  },
  {
    index: 5,
    nameEn: "Jumada al-Awwal",
    nameUrdu: "جمادی الاول",
    nameArabic: "جُمَادَى الأُولَى",
    significance: "Fifth month of Islamic lunar calendar.",
    isSacredMonth: false,
  },
  {
    index: 6,
    nameEn: "Jumada al-Thani",
    nameUrdu: "جمادی الثانی",
    nameArabic: "جُمَادَى الآخِرَة",
    significance: "Sixth month of Islamic lunar calendar.",
    isSacredMonth: false,
  },
  {
    index: 7,
    nameEn: "Rajab",
    nameUrdu: "رجب المرجب",
    nameArabic: "رَجَب",
    significance: "Sacred month. Shab-e-Miraj (Ascension Night) observed on 27th Rajab.",
    isSacredMonth: true,
  },
  {
    index: 8,
    nameEn: "Sha'ban",
    nameUrdu: "شعبان المعظم",
    nameArabic: "شَعْبَان",
    significance: "Precursor month to Ramadan. Shab-e-Barat (Night of Forgiveness) observed on 15th.",
    isSacredMonth: false,
  },
  {
    index: 9,
    nameEn: "Ramadan",
    nameUrdu: "رمضان المبارک",
    nameArabic: "رَمَضَان",
    significance: "Holy month of fasting (Sawm), revelation of Quran, and Laylat al-Qadr (Night of Power).",
    isSacredMonth: false,
  },
  {
    index: 10,
    nameEn: "Shawwal",
    nameUrdu: "شوال المکرم",
    nameArabic: "شَوَّال",
    significance: "Tenth month. Celebrated with Eid ul-Fitr from 1st to 3rd Shawwal.",
    isSacredMonth: false,
  },
  {
    index: 11,
    nameEn: "Dhu al-Qi'dah",
    nameUrdu: "ذی القعدہ",
    nameArabic: "ذُو القَعْدَة",
    significance: "Sacred month of preparation for Hajj.",
    isSacredMonth: true,
  },
  {
    index: 12,
    nameEn: "Dhu al-Hijjah",
    nameUrdu: "ذی الحجہ",
    nameArabic: "ذُو الحِجَّة",
    significance: "Month of Hajj pilgrimage, Day of Arafah (9th), and Eid ul-Adha (10th - 12th).",
    isSacredMonth: true,
  },
];

export interface GregorianToHijriResult {
  gregorianDate: string; // YYYY-MM-DD
  dayOfWeek: string;
  dayOfWeekUrdu: string;
  hijriDay: number;
  hijriMonthIndex: number;
  hijriMonthName: string;
  hijriMonthUrdu: string;
  hijriMonthArabic: string;
  hijriYear: number;
  formattedEn: string;
  formattedUrdu: string;
  formattedArabic: string;
  offsetDays: number;
}

export interface HijriToGregorianResult {
  hijriDateFormatted: string;
  hijriDay: number;
  hijriMonthIndex: number;
  hijriYear: number;
  gregorianDate: string; // YYYY-MM-DD
  gregorianFormatted: string;
  dayOfWeek: string;
  dayOfWeekUrdu: string;
  offsetDays: number;
}

const URDU_DAYS: Record<string, string> = {
  Sunday: 'اتوار',
  Monday: 'پیر',
  Tuesday: 'منگل',
  Wednesday: 'بدھ',
  Thursday: 'جمعرات',
  Friday: 'جمعۃ المبارک',
  Saturday: 'ہفتہ',
};

export function convertGregorianToHijri(
  gregorianDateStr: string,
  offsetDays = 0
): GregorianToHijriResult {
  moment.locale('en');
  let m = moment(gregorianDateStr, 'YYYY-MM-DD');
  if (!m.isValid()) {
    m = moment();
  }

  // Apply moon sighting offset (e.g. +1 day or -1 day)
  if (offsetDays !== 0) {
    m = m.clone().add(offsetDays, 'days');
  }

  const hYear = m.iYear();
  const hMonth = m.iMonth() + 1; // 1-indexed
  const hDay = m.iDate();
  const dayName = m.format('dddd');
  const dayUrdu = URDU_DAYS[dayName] || dayName;

  const monthInfo = HIJRI_MONTHS.find((mh) => mh.index === hMonth) || HIJRI_MONTHS[0];

  return {
    gregorianDate: moment(gregorianDateStr, 'YYYY-MM-DD').format('YYYY-MM-DD'),
    dayOfWeek: dayName,
    dayOfWeekUrdu: dayUrdu,
    hijriDay: hDay,
    hijriMonthIndex: hMonth,
    hijriMonthName: monthInfo.nameEn,
    hijriMonthUrdu: monthInfo.nameUrdu,
    hijriMonthArabic: monthInfo.nameArabic,
    hijriYear: hYear,
    formattedEn: `${hDay} ${monthInfo.nameEn} ${hYear} AH`,
    formattedUrdu: `${hDay} ${monthInfo.nameUrdu} ${hYear} ہجری`,
    formattedArabic: `${hDay} ${monthInfo.nameArabic} ${hYear} هـ`,
    offsetDays,
  };
}

export function convertHijriToGregorian(
  hijriYear: number,
  hijriMonth: number,
  hijriDay: number,
  offsetDays = 0
): HijriToGregorianResult {
  moment.locale('en');
  const formattedInput = `${hijriYear}/${hijriMonth}/${hijriDay}`;
  let m = moment(formattedInput, 'iYYYY/iM/iD');

  if (!m.isValid()) {
    m = moment();
  }

  // Reverse moon sighting offset when converting from Hijri to solar Gregorian
  if (offsetDays !== 0) {
    m = m.clone().subtract(offsetDays, 'days');
  }

  const monthInfo = HIJRI_MONTHS.find((mh) => mh.index === hijriMonth) || HIJRI_MONTHS[0];
  const dayName = m.format('dddd');
  const dayUrdu = URDU_DAYS[dayName] || dayName;

  return {
    hijriDateFormatted: `${hijriDay} ${monthInfo.nameEn} ${hijriYear} AH`,
    hijriDay,
    hijriMonthIndex: hijriMonth,
    hijriYear,
    gregorianDate: m.format('YYYY-MM-DD'),
    gregorianFormatted: m.format('MMMM D, YYYY'),
    dayOfWeek: dayName,
    dayOfWeekUrdu: dayUrdu,
    offsetDays,
  };
}

export interface IslamicEvent {
  id: string;
  nameEn: string;
  nameUrdu: string;
  hijriDay: number;
  hijriMonth: number;
  hijriMonthName: string;
  description: string;
}

export const ISLAMIC_ANNUAL_EVENTS: IslamicEvent[] = [
  {
    id: 'new_year',
    nameEn: 'Islamic New Year (1st Muharram)',
    nameUrdu: 'یکم محرم الحرام (نیا اسلامی سال)',
    hijriDay: 1,
    hijriMonth: 1,
    hijriMonthName: 'Muharram',
    description: 'Beginning of the Islamic lunar calendar year 1448 AH.',
  },
  {
    id: 'ashura',
    nameEn: 'Youm-e-Ashura (10th Muharram)',
    nameUrdu: 'یوم عاشورہ (10 محرم)',
    hijriDay: 10,
    hijriMonth: 1,
    hijriMonthName: 'Muharram',
    description: 'Martyrdom of Hazrat Imam Hussain (R.A) at Karbala. Public holiday in Pakistan.',
  },
  {
    id: 'eid_milad',
    nameEn: 'Eid Milad-un-Nabi ﷺ (12th Rabi-ul-Awwal)',
    nameUrdu: 'جشن عید میلاد النبی ﷺ (12 ربیع الاول)',
    hijriDay: 12,
    hijriMonth: 3,
    hijriMonthName: "Rabi' al-Awwal",
    description: 'Celebration of the birth of Prophet Muhammad ﷺ. National holiday in Pakistan.',
  },
  {
    id: 'giyarween',
    nameEn: 'Giyarween Sharif (11th Rabi-us-Sani)',
    nameUrdu: 'گیارہویں شریف (11 ربیع الثانی)',
    hijriDay: 11,
    hijriMonth: 4,
    hijriMonthName: "Rabi' al-Thani",
    description: 'Commemoration of Hazrat Sheikh Abdul Qadir Jilani (R.A).',
  },
  {
    id: 'shab_e_miraj',
    nameEn: 'Shab-e-Miraj (27th Rajab)',
    nameUrdu: 'شب معراج النبی ﷺ (27 رجب)',
    hijriDay: 27,
    hijriMonth: 7,
    hijriMonthName: 'Rajab',
    description: 'The miraculous night ascension of Prophet Muhammad ﷺ to the heavens.',
  },
  {
    id: 'shab_e_barat',
    nameEn: 'Shab-e-Barat (15th Shaban)',
    nameUrdu: 'شب برات / لیلۃ البرات (15 شعبان)',
    hijriDay: 15,
    hijriMonth: 8,
    hijriMonthName: "Sha'ban",
    description: 'Night of records, seeking forgiveness, and prayers for salvation.',
  },
  {
    id: 'ramadan_start',
    nameEn: '1st Ramadan (First Fasting Day)',
    nameUrdu: 'پہلا روزہ / یکم رمضان المبارک',
    hijriDay: 1,
    hijriMonth: 9,
    hijriMonthName: 'Ramadan',
    description: 'Beginning of the holy fasting month of Ramadan in Pakistan.',
  },
  {
    id: 'shab_e_qadr',
    nameEn: 'Laylat al-Qadr / Shab-e-Qadr (27th Ramadan)',
    nameUrdu: 'شب قدر / لیلۃ القدر (27 رمضان)',
    hijriDay: 27,
    hijriMonth: 9,
    hijriMonthName: 'Ramadan',
    description: 'The blessed night better than 1,000 months, marking the revelation of the Quran.',
  },
  {
    id: 'eid_ul_fitr',
    nameEn: 'Eid ul-Fitr (1st Shawwal)',
    nameUrdu: 'عید الفطر / میٹھی عید (یکم شوال)',
    hijriDay: 1,
    hijriMonth: 10,
    hijriMonthName: 'Shawwal',
    description: 'Celebration of gratitude marking the conclusion of Ramadan fasting.',
  },
  {
    id: 'hajj_arafat',
    nameEn: 'Waqfa Arafat / Youm-e-Hajj (9th Zil Hajj)',
    nameUrdu: 'یوم عرفہ / وقوف عرفات (9 ذوالحجہ)',
    hijriDay: 9,
    hijriMonth: 12,
    hijriMonthName: 'Dhu al-Hijjah',
    description: 'The pinnacle day of the Hajj pilgrimage at Mount Arafat.',
  },
  {
    id: 'eid_ul_adha',
    nameEn: 'Eid ul-Adha (10th Zil Hajj)',
    nameUrdu: 'عید الاضحیٰ / قربانی کی عید (10 ذوالحجہ)',
    hijriDay: 10,
    hijriMonth: 12,
    hijriMonthName: 'Dhu al-Hijjah',
    description: 'Feast of the Sacrifice commemorating the submission of Hazrat Ibrahim (A.S).',
  },
];
