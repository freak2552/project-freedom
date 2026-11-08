// Pure target math. Safe to import from both server and client code,
// so Home, the League block and Settings all use the same calculation.
import { dayKeysOfMonth } from './dates';

export type SpecialDays = Record<string, number>; // "YYYY-MM-DD" -> hours

export function dailyTargetFor(
  dateKey: string,
  dailyTargetHours: number,
  specialDays: SpecialDays,
): number {
  // A special-day target replaces the normal target for its date; it is not added on top.
  return specialDays[dateKey] ?? dailyTargetHours;
}

export function calculateMonthlyTarget(
  monthKey: string,
  dailyTargetHours: number,
  specialDays: SpecialDays,
): number {
  return dayKeysOfMonth(monthKey).reduce(
    (sum, dateKey) => sum + dailyTargetFor(dateKey, dailyTargetHours, specialDays),
    0,
  );
}

export function progressOf(studiedHours: number, targetHours: number): number {
  return targetHours > 0 ? studiedHours / targetHours : 0;
}
