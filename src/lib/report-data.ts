import { connectDB } from './db';
import { currentMonthKey, daysInMonth, isMonthKey } from './dates';
import { getLeague } from './league';
import { calculateMonthlyTarget, progressOf } from './targets';
import {
  REPORT_MOODS,
  defaultReportName,
  percentChange,
  previousMonthOf,
  roundHours,
  weekBlocks,
  weekIndexOfDay,
  type MonthlyReport,
  type ReportBestHabit,
  type ReportCard,
  type ReportMood,
} from './report';
import { Habit } from '@/models/Habit';
import { HabitLog } from '@/models/HabitLog';
import { MonthReport } from '@/models/MonthReport';
import { MoodEntry } from '@/models/MoodEntry';
import { StudyRecord } from '@/models/StudyRecord';
import { StudySettings } from '@/models/StudySettings';

// Finished months that have any study, mood or habit data.
// The current month is excluded, because reports summarise past months.
export async function getCompletedMonthKeys(userId: string): Promise<string[]> {
  await connectDB();
  const [studyKeys, moodKeys, logKeys] = await Promise.all([
    StudyRecord.distinct('dateKey', { userId }),
    MoodEntry.distinct('dateKey', { userId }),
    HabitLog.distinct('dateKey', { userId }),
  ]);

  const current = currentMonthKey();
  const months = new Set<string>();
  for (const key of [...studyKeys, ...moodKeys, ...logKeys]) {
    const monthKey = String(key).slice(0, 7);
    if (isMonthKey(monthKey) && monthKey < current) months.add(monthKey);
  }
  return [...months].sort().reverse();
}

export async function getMonthlyReport(userId: string, monthKey: string): Promise<MonthlyReport> {
  await connectDB();

  const previousKey = previousMonthOf(monthKey);
  const monthMatch = { $regex: `^${monthKey}-` };
  const previousMatch = { $regex: `^${previousKey}-` };

  const [settings, studyRecords, previousRecords, moods, logs, habits, nameDoc] = await Promise.all([
    StudySettings.findOne({ userId }).lean(),
    StudyRecord.find({ userId, dateKey: monthMatch }).lean(),
    StudyRecord.find({ userId, dateKey: previousMatch }, { minutes: 1 }).lean(),
    MoodEntry.find({ userId, dateKey: monthMatch }, { mood: 1 }).lean(),
    HabitLog.find({ userId, dateKey: monthMatch }, { habitId: 1, color: 1 }).lean(),
    Habit.find({ userId }).lean(),
    MonthReport.findOne({ userId, monthKey }).lean(),
  ]);

  // Study totals, weekly blocks and subject ranking.
  let totalMinutes = 0;
  const weekMinutes = [0, 0, 0, 0];
  const subjectMinutes = new Map<string, { name: string; minutes: number }>();
  for (const record of studyRecords) {
    totalMinutes += record.minutes;
    weekMinutes[weekIndexOfDay(Number(record.dateKey.slice(8, 10)))] += record.minutes;

    const key = String(record.subjectId);
    const entry = subjectMinutes.get(key) ?? { name: record.subjectName, minutes: 0 };
    entry.minutes += record.minutes;
    subjectMinutes.set(key, entry);
  }
  const previousMinutes = previousRecords.reduce((sum, r) => sum + r.minutes, 0);

  const weeks = weekBlocks(monthKey).map((block, i) => ({
    label: block.label,
    range: `${block.firstDay}–${block.lastDay}`,
    hours: roundHours(weekMinutes[i]),
  }));

  const topSubjects = [...subjectMinutes.values()]
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 3)
    .map((s) => ({ name: s.name, hours: roundHours(s.minutes) }));

  // Target and league use the same rule as the Study tab and the sidebar.
  const dailyTargetHours = settings?.dailyTargetHours ?? 5;
  const specialDays = (settings?.specialDays ?? {}) as Record<string, number>;
  const targetHours = calculateMonthlyTarget(monthKey, dailyTargetHours, specialDays);
  const studiedHours = totalMinutes / 60;
  const progress = progressOf(studiedHours, targetHours);
  const league = getLeague(progress);

  // Mood: how many days each mood was chosen.
  const moodCounts: Record<ReportMood, number> = { low: 0, meh: 0, okay: 0, good: 0, great: 0 };
  for (const entry of moods) {
    const mood = entry.mood as ReportMood;
    moodCounts[mood] = (moodCounts[mood] ?? 0) + 1;
  }

  // Habits: count green marks per habit. Every habit tied for the top count is shown.
  const greenCounts = new Map<string, number>();
  for (const log of logs) {
    if (log.color !== 'green') continue;
    const key = String(log.habitId);
    greenCounts.set(key, (greenCounts.get(key) ?? 0) + 1);
  }
  const totalDays = daysInMonth(monthKey);
  const habitRows: ReportBestHabit[] = habits.map((h) => ({
    id: String(h._id),
    name: h.name,
    days: greenCounts.get(String(h._id)) ?? 0,
    totalDays,
  }));
  const topCount = Math.max(0, ...habitRows.map((h) => h.days));
  const bestHabits = topCount > 0 ? habitRows.filter((h) => h.days === topCount) : [];

  const hasData = studyRecords.length > 0 || moods.length > 0 || logs.length > 0;

  return {
    monthKey,
    name: nameDoc?.name ?? defaultReportName(monthKey),
    isCustomName: Boolean(nameDoc),
    studiedHours: roundHours(totalMinutes),
    targetHours: Math.round(targetHours * 10) / 10,
    progress,
    league: { name: league.name, tier: league.tier },
    previousMonthKey: previousKey,
    previousHours: roundHours(previousMinutes),
    changePercent: percentChange(totalMinutes, previousMinutes),
    weeks,
    topSubjects,
    moods: REPORT_MOODS.map((mood) => ({ mood, days: moodCounts[mood] })),
    bestHabits,
    totalDays,
    hasData,
  };
}

// Minimal cards for every finished month, newest first.
export async function getReportCards(userId: string): Promise<ReportCard[]> {
  const monthKeys = await getCompletedMonthKeys(userId);
  const reports = await Promise.all(monthKeys.map((m) => getMonthlyReport(userId, m)));

  return reports
    .filter((r) => r.hasData)
    .map((r) => ({
      monthKey: r.monthKey,
      name: r.name,
      isCustomName: r.isCustomName,
      studiedHours: r.studiedHours,
      league: r.league,
      bestHabits: r.bestHabits,
    }));
}
