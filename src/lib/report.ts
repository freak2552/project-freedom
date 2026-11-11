// Report types and pure helpers. No database or server imports,
// so the API route and the Report page can both use them.
import { daysInMonth, monthLabel, shiftMonth } from './dates';

export const REPORT_MOODS = ['low', 'meh', 'okay', 'good', 'great'] as const;
export type ReportMood = (typeof REPORT_MOODS)[number];

export const MOOD_LABELS: Record<ReportMood, string> = {
  low: 'Low',
  meh: 'Meh',
  okay: 'Okay',
  good: 'Good',
  great: 'Great',
};

export type ReportBestHabit = { id: string; name: string; days: number; totalDays: number };

// The minimal card shown in the list.
export type ReportCard = {
  monthKey: string;
  name: string;
  isCustomName: boolean;
  studiedHours: number;
  league: { name: string; tier: number };
  bestHabits: ReportBestHabit[];
};

export type ReportWeek = { label: string; range: string; hours: number };

// The full detail view.
export type MonthlyReport = {
  monthKey: string;
  name: string;
  isCustomName: boolean;
  studiedHours: number;
  targetHours: number;
  progress: number;
  league: { name: string; tier: number };
  previousMonthKey: string;
  previousHours: number;
  changePercent: number | null; // null when the previous month has no study time
  weeks: ReportWeek[];
  topSubjects: { name: string; hours: number }[];
  moods: { mood: ReportMood; days: number }[];
  bestHabits: ReportBestHabit[]; // every habit tied for the most green marks
  totalDays: number;
  hasData: boolean;
};

export type ReportNameChange = { monthKey: string; name: string; isCustomName: boolean };

export function defaultReportName(monthKey: string): string {
  return monthLabel(monthKey);
}

export function previousMonthOf(monthKey: string): string {
  return shiftMonth(monthKey, -1);
}

export function roundHours(minutes: number): number {
  return Math.round((minutes / 60) * 10) / 10;
}

// Fixed blocks: days 1–7, 8–14, 15–21, and 22 to the last day of the month.
export function weekBlocks(monthKey: string): { label: string; firstDay: number; lastDay: number }[] {
  const last = daysInMonth(monthKey);
  return [
    { label: '1st week', firstDay: 1, lastDay: 7 },
    { label: '2nd week', firstDay: 8, lastDay: 14 },
    { label: '3rd week', firstDay: 15, lastDay: 21 },
    { label: 'Last week', firstDay: 22, lastDay: last },
  ];
}

export function weekIndexOfDay(day: number): number {
  if (day <= 7) return 0;
  if (day <= 14) return 1;
  if (day <= 21) return 2;
  return 3;
}

// Percent change against the previous month. null when there is nothing to compare with.
export function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}
