import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

export const PKT_TIMEZONE = 'Asia/Karachi'; // UTC+5 (Pakistan Standard Time)

/**
 * Returns current date string formatted as YYYY-MM-DD in PKT (Asia/Karachi)
 */
export function getCurrentPKTDate(referenceDate: Date = new Date()): string {
  try {
    return formatInTimeZone(referenceDate, PKT_TIMEZONE, 'yyyy-MM-dd');
  } catch {
    // Fallback using native Intl
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: PKT_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(referenceDate);
  }
}

/**
 * Returns the exact Date of the upcoming 00:00:00 midnight in PKT
 */
export function getNextPKTMidnight(referenceDate: Date = new Date()): Date {
  try {
    const zonedNow = toZonedTime(referenceDate, PKT_TIMEZONE);
    const tomorrow = new Date(zonedNow);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    // Calculate difference in milliseconds
    const diffMs = tomorrow.getTime() - zonedNow.getTime();
    return new Date(referenceDate.getTime() + diffMs);
  } catch {
    // Standard UTC+5 offset calculation fallback
    const utcTime = referenceDate.getTime() + referenceDate.getTimezoneOffset() * 60000;
    const pktTime = new Date(utcTime + 5 * 3600000);
    
    const nextMidnight = new Date(pktTime);
    nextMidnight.setDate(nextMidnight.getDate() + 1);
    nextMidnight.setHours(0, 0, 0, 0);

    const diff = nextMidnight.getTime() - pktTime.getTime();
    return new Date(referenceDate.getTime() + diff);
  }
}

/**
 * Calculates remaining seconds until next 00:00:00 midnight PKT
 */
export function getSecondsUntilPKTMidnight(referenceDate: Date = new Date()): number {
  const nextMidnight = getNextPKTMidnight(referenceDate);
  const diffMs = nextMidnight.getTime() - referenceDate.getTime();
  return Math.max(Math.floor(diffMs / 1000), 60); // Minimum 60s safety buffer
}

/**
 * Returns formatted ISO string representing the reset time
 */
export function getPKTResetISOString(referenceDate: Date = new Date()): string {
  const nextMidnight = getNextPKTMidnight(referenceDate);
  return nextMidnight.toISOString();
}
