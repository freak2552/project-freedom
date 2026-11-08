import { connectDB } from './db';
import { StudyRecord } from '@/models/StudyRecord';
import { StudySettings } from '@/models/StudySettings';
import { calculateMonthlyTarget, progressOf } from './targets';
import { getLeague, type League } from './league';
import { currentMonthKey } from './dates';

export type MonthlySummary = {
  monthKey: string;
  studiedHours: number;
  targetHours: number;
  progress: number; // 0 to 1+
  league: League;
};

// Single source of truth for the League block and Home page numbers.
export async function getMonthlySummary(
  userId: string,
  monthKey: string = currentMonthKey(),
): Promise<MonthlySummary> {
  await connectDB();

  const [settings, records] = await Promise.all([
    StudySettings.findOne({ userId }).lean(),
    StudyRecord.find({ userId, dateKey: { $regex: `^${monthKey}-` } }).lean(),
  ]);

  const dailyTargetHours = settings?.dailyTargetHours ?? 5;
  const specialDays = (settings?.specialDays ?? {}) as Record<string, number>;

  const totalMinutes = records.reduce((sum, r) => sum + r.minutes, 0);
  const studiedHours = totalMinutes / 60;
  const targetHours = calculateMonthlyTarget(monthKey, dailyTargetHours, specialDays);
  const progress = progressOf(studiedHours, targetHours);

  return { monthKey, studiedHours, targetHours, progress, league: getLeague(progress) };
}
