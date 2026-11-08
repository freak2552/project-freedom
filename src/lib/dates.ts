// Study records are keyed by a plain "YYYY-MM-DD" string in the app's timezone,
// so "today" and month boundaries never depend on the server's UTC clock.
export const APP_TZ = 'Asia/Kolkata';

const dayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: APP_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function dateKeyFromDate(date: Date): string {
  return dayFormatter.format(date); // en-CA gives YYYY-MM-DD
}

export function todayKey(): string {
  return dateKeyFromDate(new Date());
}

export function currentMonthKey(): string {
  return todayKey().slice(0, 7);
}

export function isDateKey(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isMonthKey(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}$/.test(value);
}

export function daysInMonth(monthKey: string): number {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function dayKeysOfMonth(monthKey: string): string[] {
  const count = daysInMonth(monthKey);
  return Array.from({ length: count }, (_, i) => `${monthKey}-${String(i + 1).padStart(2, '0')}`);
}

export function monthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function shiftMonth(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function formatDayLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleString('en-US', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });
}
