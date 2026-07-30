import { toZonedTime, format as formatZoned } from 'date-fns-tz';
import { format, subDays, addDays, isSameDay, parseISO } from 'date-fns';

export type StreakStatus = 'SAFE' | 'AT_RISK' | 'CRITICAL';

export interface DayContribution {
  date: string; // YYYY-MM-DD
  count: number;
  hasAppLog: boolean;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface UserStreakMetrics {
  currentStreak: number;
  longestStreak: number;
  totalLogs: number;
  daysProtected: number;
  status: StreakStatus;
  hasContributedToday: boolean;
  userTimezone: string;
  todayDateStr: string;
  hoursRemainingToday: number;
  firstReminderHour: number;
  lastReminderHour: number;
}

/**
 * Calculates current user streak status based on contributions and timezone.
 */
export function calculateStreakStatus(
  contributions: { date: string; count: number; hasAppLog?: boolean }[],
  timezone: string = 'Asia/Ho_Chi_Minh',
  firstReminderHour: number = 18,
  lastReminderHour: number = 22
): {
  status: StreakStatus;
  currentStreak: number;
  longestStreak: number;
  hasContributedToday: boolean;
  todayDateStr: string;
  hoursRemainingToday: number;
} {
  const now = new Date();
  const zonedNow = toZonedTime(now, timezone);
  const todayDateStr = formatZoned(zonedNow, 'yyyy-MM-dd', { timeZone: timezone });
  const currentHour = zonedNow.getHours();
  const hoursRemainingToday = 24 - currentHour;

  // Map contributions by date
  const contribMap = new Map<string, number>();
  contributions.forEach((c) => contribMap.set(c.date, c.count));

  const todayCount = contribMap.get(todayDateStr) || 0;
  const hasContributedToday = todayCount > 0;

  // Status calculation logic
  let status: StreakStatus = 'SAFE';
  if (!hasContributedToday) {
    if (currentHour >= lastReminderHour) {
      status = 'CRITICAL';
    } else {
      status = 'AT_RISK';
    }
  }

  // Calculate current & longest streak
  let currentStreak = 0;
  let checkDate = zonedNow;

  // If already contributed today, count today. If not contributed today, check yesterday for active streak
  if (hasContributedToday) {
    currentStreak += 1;
    checkDate = subDays(checkDate, 1);
  } else {
    // Check if yesterday had contribution
    const yesterdayStr = formatZoned(subDays(checkDate, 1), 'yyyy-MM-dd', { timeZone: timezone });
    if ((contribMap.get(yesterdayStr) || 0) > 0) {
      checkDate = subDays(checkDate, 1);
    }
  }

  // Count backwards continuously
  while (true) {
    const dStr = formatZoned(checkDate, 'yyyy-MM-dd', { timeZone: timezone });
    const cnt = contribMap.get(dStr) || 0;
    if (cnt > 0) {
      currentStreak += 1;
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }

  // Calculate longest streak across history
  let longestStreak = currentStreak;
  let tempStreak = 0;
  const sortedDates = Array.from(contribMap.keys()).sort();
  for (const dStr of sortedDates) {
    if ((contribMap.get(dStr) || 0) > 0) {
      tempStreak += 1;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  }

  return {
    status,
    currentStreak,
    longestStreak,
    hasContributedToday,
    todayDateStr,
    hoursRemainingToday,
  };
}

/**
 * Formats a daily log content into standard Markdown template per PRD Section 5.4.
 */
export function buildMarkdownLogTemplate(
  dateStr: string,
  today: string,
  learned: string,
  tomorrow: string
): string {
  const formattedDate = format(parseISO(dateStr), 'MMMM d, yyyy');
  let body = `# ${formattedDate}\n\n## Today\n\n${today.trim()}\n`;

  if (learned.trim()) {
    const learnedLines = learned
      .split('\n')
      .map((l) => `- ${l.replace(/^-\s*/, '').trim()}`)
      .filter(Boolean)
      .join('\n');
    body += `\nLearned:\n${learnedLines}\n`;
  }

  if (tomorrow.trim()) {
    const tomorrowLines = tomorrow
      .split('\n')
      .map((l) => `- ${l.replace(/^-\s*/, '').trim()}`)
      .filter(Boolean)
      .join('\n');
    body += `\nTomorrow:\n${tomorrowLines}\n`;
  }

  return body;
}

/**
 * Maps contribution counts to GitHub-style quartile levels (0-4) relative to the user's busiest day.
 */
export function computeContributionLevel(
  count: number,
  maxCount: number
): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (maxCount === 0) return 1;
  const ratio = count / maxCount;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

export function enrichContributionsWithLevels(
  contributions: { date: string; count: number; hasAppLog?: boolean }[]
): DayContribution[] {
  const maxCount = Math.max(...contributions.map((c) => c.count), 0);
  return contributions.map((c) => ({
    ...c,
    hasAppLog: c.hasAppLog ?? false,
    level: computeContributionLevel(c.count, maxCount),
  }));
}
