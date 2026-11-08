export type StudyTargetSpecialDay = {
  date: string;
  hours: number;
};

export type StudyTargetSettings = {
  regularStudyHours: number;
  specialDays: StudyTargetSpecialDay[];
};

/**
 * Returns a month's target in hours. A special-day value replaces the regular
 * daily target for that date.
 *
 * @param year Four-digit calendar year.
 * @param month Zero-based month, matching JavaScript Date.
 */
export function calculateMonthlyTarget(
  year: number,
  month: number,
  settings: StudyTargetSettings,
): number {
  const hoursByDate = new Map(
    settings.specialDays.map((specialDay) => [specialDay.date, specialDay.hours]),
  );
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let total = 0;

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey =
      year +
      "-" +
      String(month + 1).padStart(2, "0") +
      "-" +
      String(day).padStart(2, "0");
    total += hoursByDate.get(dateKey) ?? settings.regularStudyHours;
  }

  return Math.round(total * 100) / 100;
}
