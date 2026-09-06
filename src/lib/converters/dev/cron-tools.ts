/**
 * Cron Expression Translator, Validator & Schedule Builder Engine
 * ApexTools Developer Productivity Suite
 */

import cronstrue from 'cronstrue';
import { CronExpressionParser } from 'cron-parser';

export interface CronFieldBreakdown {
  name: string;
  key: 'second' | 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek' | 'year';
  value: string;
  allowedRange: string;
  meaning: string;
}

export interface CronExecutionRun {
  index: number;
  utc: string;
  pkt: string;
  local: string;
  relative: string;
  iso: string;
}

export interface CronAnalysis {
  expression: string;
  humanDescription: string;
  isValid: boolean;
  error?: string;
  fieldCount: number;
  fields: CronFieldBreakdown[];
  nextExecutions: CronExecutionRun[];
}

function getRelativeTimeString(targetDate: Date, baseDate: Date = new Date()): string {
  const diffMs = targetDate.getTime() - baseDate.getTime();
  if (diffMs <= 0) return 'now';

  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return `in ${diffSecs}s`;
  if (diffMins < 60) {
    const remSecs = diffSecs % 60;
    return `in ${diffMins}m ${remSecs > 0 ? `${remSecs}s` : ''}`;
  }
  if (diffHours < 24) {
    const remMins = diffMins % 60;
    return `in ${diffHours}h ${remMins > 0 ? `${remMins}m` : ''}`;
  }
  const remHours = diffHours % 24;
  return `in ${diffDays}d ${remHours > 0 ? `${remHours}h` : ''}`;
}

function describeCronField(key: string, value: string): string {
  if (value === '*') return 'Every value (no filter)';
  if (value === '?') return 'No specific value';
  if (value.startsWith('*/')) return `Every ${value.substring(2)} units`;
  if (value.includes(',')) return `At specific values: ${value}`;
  if (value.includes('-')) return `Between range: ${value}`;

  switch (key) {
    case 'minute':
      return `At minute ${value}`;
    case 'hour':
      return `At hour ${value}:00 (${Number(value) >= 12 ? (Number(value) === 12 ? '12 PM' : `${Number(value) - 12} PM`) : (Number(value) === 0 ? '12 AM' : `${value} AM`)})`;
    case 'dayOfMonth':
      return `On day ${value} of the month`;
    case 'month': {
      const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mNum = parseInt(value, 10);
      return monthNames[mNum] ? `In ${monthNames[mNum]}` : `In month ${value}`;
    }
    case 'dayOfWeek': {
      const dowNames: Record<string, string> = {
        '0': 'Sunday',
        '1': 'Monday',
        '2': 'Tuesday',
        '3': 'Wednesday',
        '4': 'Thursday',
        '5': 'Friday',
        '6': 'Saturday',
        '7': 'Sunday',
      };
      return dowNames[value] ? `On ${dowNames[value]}` : `On day-of-week ${value}`;
    }
    case 'second':
      return `At second ${value}`;
    default:
      return value;
  }
}

export function analyzeCronExpression(expression: string, currentDate: Date = new Date()): CronAnalysis {
  const trimmed = expression.trim().replace(/\s+/g, ' ');
  if (!trimmed) {
    return {
      expression: '',
      humanDescription: 'Please enter a cron expression',
      isValid: false,
      error: 'Expression is empty',
      fieldCount: 0,
      fields: [],
      nextExecutions: [],
    };
  }

  const parts = trimmed.split(' ');
  const fieldCount = parts.length;

  // Build field breakdowns
  const fields: CronFieldBreakdown[] = [];
  if (fieldCount === 5) {
    fields.push(
      { name: 'Minute', key: 'minute', value: parts[0], allowedRange: '0–59', meaning: describeCronField('minute', parts[0]) },
      { name: 'Hour', key: 'hour', value: parts[1], allowedRange: '0–23', meaning: describeCronField('hour', parts[1]) },
      { name: 'Day of Month', key: 'dayOfMonth', value: parts[2], allowedRange: '1–31', meaning: describeCronField('dayOfMonth', parts[2]) },
      { name: 'Month', key: 'month', value: parts[3], allowedRange: '1–12 or JAN–DEC', meaning: describeCronField('month', parts[3]) },
      { name: 'Day of Week', key: 'dayOfWeek', value: parts[4], allowedRange: '0–7 (0 or 7 = Sun) or SUN–SAT', meaning: describeCronField('dayOfWeek', parts[4]) }
    );
  } else if (fieldCount === 6) {
    fields.push(
      { name: 'Second', key: 'second', value: parts[0], allowedRange: '0–59', meaning: describeCronField('second', parts[0]) },
      { name: 'Minute', key: 'minute', value: parts[1], allowedRange: '0–59', meaning: describeCronField('minute', parts[1]) },
      { name: 'Hour', key: 'hour', value: parts[2], allowedRange: '0–23', meaning: describeCronField('hour', parts[2]) },
      { name: 'Day of Month', key: 'dayOfMonth', value: parts[3], allowedRange: '1–31', meaning: describeCronField('dayOfMonth', parts[3]) },
      { name: 'Month', key: 'month', value: parts[4], allowedRange: '1–12 or JAN–DEC', meaning: describeCronField('month', parts[4]) },
      { name: 'Day of Week', key: 'dayOfWeek', value: parts[5], allowedRange: '0–7 (0 or 7 = Sun)', meaning: describeCronField('dayOfWeek', parts[5]) }
    );
  }

  try {
    let humanDescription = '';
    try {
      humanDescription = cronstrue.toString(trimmed, {
        use24HourTimeFormat: false,
        verbose: true,
        throwExceptionOnParseError: true,
      });
    } catch {
      // Fallback without verbose
      humanDescription = cronstrue.toString(trimmed, {
        use24HourTimeFormat: false,
      });
    }

    // Calculate next 10 executions using cron-parser
    const interval = CronExpressionParser.parse(trimmed, {
      currentDate,
    });

    const nextExecutions: CronExecutionRun[] = [];

    for (let i = 1; i <= 10; i++) {
      if (!interval.hasNext()) break;
      const cronDate = interval.next();
      const date: Date = cronDate.toDate();

      const utc = date.toUTCString();
      const pkt = date.toLocaleString('en-US', {
        timeZone: 'Asia/Karachi',
        dateStyle: 'medium',
        timeStyle: 'medium',
        hour12: true,
      }) + ' (PKT)';

      const local = date.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'medium',
        hour12: true,
      });

      const relative = getRelativeTimeString(date, currentDate);

      nextExecutions.push({
        index: i,
        utc,
        pkt,
        local,
        relative,
        iso: date.toISOString(),
      });
    }

    return {
      expression: trimmed,
      humanDescription,
      isValid: true,
      fieldCount,
      fields,
      nextExecutions,
    };
  } catch (err: any) {
    return {
      expression: trimmed,
      humanDescription: 'Invalid cron expression format',
      isValid: false,
      error: err.message || 'Syntax error in cron expression',
      fieldCount,
      fields,
      nextExecutions: [],
    };
  }
}

export interface CrontabPreset {
  id: string;
  name: string;
  expression: string;
  description: string;
  category: 'Common' | 'Daily / Weekly' | 'Monthly / Yearly' | 'DevOps & Backups';
}

export const CRON_PRESETS: CrontabPreset[] = [
  {
    id: 'every-minute',
    name: 'Every Minute',
    expression: '* * * * *',
    description: 'Executes once every 60 seconds continuously',
    category: 'Common',
  },
  {
    id: 'every-5-minutes',
    name: 'Every 5 Minutes',
    expression: '*/5 * * * *',
    description: 'Frequently used for heartbeat monitors and queue polling',
    category: 'Common',
  },
  {
    id: 'every-15-minutes',
    name: 'Every 15 Minutes',
    expression: '*/15 * * * *',
    description: 'Periodic background syncs and batch processing',
    category: 'Common',
  },
  {
    id: 'every-hour',
    name: 'Every Hour (At Minute 0)',
    expression: '0 * * * *',
    description: 'Runs at the top of every hour (e.g. 1:00, 2:00, 3:00)',
    category: 'Common',
  },
  {
    id: 'every-2-hours',
    name: 'Every 2 Hours',
    expression: '0 */2 * * *',
    description: 'Runs at the start of every even hour (00:00, 02:00, 04:00, etc.)',
    category: 'Common',
  },
  {
    id: 'daily-midnight',
    name: 'Daily at Midnight (00:00)',
    expression: '0 0 * * *',
    description: 'Standard daily cleanup, log rotations, and quota resets',
    category: 'Daily / Weekly',
  },
  {
    id: 'daily-noon',
    name: 'Daily at Noon (12:00 PM)',
    expression: '0 12 * * *',
    description: 'Midday reporting and daily summary notifications',
    category: 'Daily / Weekly',
  },
  {
    id: 'daily-3am',
    name: 'Daily at 3:00 AM (Off-Peak)',
    expression: '0 3 * * *',
    description: 'Database indexing, heavy backups, and cache warmups',
    category: 'Daily / Weekly',
  },
  {
    id: 'weekdays-9am',
    name: 'Weekdays at 9:00 AM (Mon–Fri)',
    expression: '0 9 * * 1-5',
    description: 'Morning business digests and workday reports',
    category: 'Daily / Weekly',
  },
  {
    id: 'weekly-sunday',
    name: 'Weekly on Sunday at Midnight',
    expression: '0 0 * * 0',
    description: 'Weekly analytics rollup and archival scripts',
    category: 'Daily / Weekly',
  },
  {
    id: 'monthly-first-day',
    name: '1st of Every Month at Midnight',
    expression: '0 0 1 * *',
    description: 'Monthly billing cycles, invoice generation, and financial reconciliation',
    category: 'Monthly / Yearly',
  },
  {
    id: 'monthly-mid',
    name: '15th of Every Month at Noon',
    expression: '0 12 15 * *',
    description: 'Mid-month audit reports and inventory reviews',
    category: 'Monthly / Yearly',
  },
  {
    id: 'quarterly',
    name: 'Quarterly (Jan, Apr, Jul, Oct 1st)',
    expression: '0 0 1 1,4,7,10 *',
    description: 'Runs every 3 months for quarterly fiscal reporting',
    category: 'Monthly / Yearly',
  },
  {
    id: 'database-backup',
    name: 'Twice Daily Database Snapshot',
    expression: '0 2,14 * * *',
    description: 'Runs at 2:00 AM and 2:00 PM daily for disaster recovery',
    category: 'DevOps & Backups',
  },
  {
    id: 'temp-cleanup',
    name: 'Hourly Cleanup (Every 6 Hours)',
    expression: '0 */6 * * *',
    description: 'Removes orphaned sessions and temporary converted files',
    category: 'DevOps & Backups',
  },
];
