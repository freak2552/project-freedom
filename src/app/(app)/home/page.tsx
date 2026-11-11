import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Clock, Flame, Target, Trophy } from 'lucide-react';
import { connectDB } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth-bridge';
import { currentMonthKey, formatDayLabel, monthLabel, todayKey } from '@/lib/dates';
import { dailyTargetFor } from '@/lib/targets';
import { getMonthlySummary } from '@/lib/summary';
import { StudySettings } from '@/models/StudySettings';

export default function HomePage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-stone-600 dark:text-stone-400">Loading…</p>}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/');

  const monthKey = currentMonthKey();
  const today = todayKey();

  await connectDB();
  const [summary, settings] = await Promise.all([
    getMonthlySummary(userId, monthKey),
    StudySettings.findOne({ userId }).lean(),
  ]);

  const dailyTargetHours = settings?.dailyTargetHours ?? 5;
  const specialDays = (settings?.specialDays ?? {}) as Record<string, number>;
  const todayTarget = dailyTargetFor(today, dailyTargetHours, specialDays);
  const percent = Math.round(summary.progress * 100);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-600 dark:text-stone-400">
          {formatDayLabel(today)}
        </p>
        <h1 className="text-2xl font-extrabold text-emerald-950 dark:text-amber-50">Your month at a glance</h1>
        <p className="text-sm text-stone-700 dark:text-stone-300">{monthLabel(monthKey)}</p>
      </header>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Monthly summary">
        <Card icon={<Clock size={16} />} label="Studied this month" value={`${summary.studiedHours.toFixed(1)} h`} />
        <Card icon={<Target size={16} />} label="Monthly target" value={`${summary.targetHours.toFixed(1)} h`} />
        <Card icon={<Flame size={16} />} label="Today's target" value={`${todayTarget.toFixed(1)} h`} />
        <Card icon={<Trophy size={16} />} label="Current league" value={summary.league.name} />
      </section>

      <section className="rounded-2xl border border-amber-500/50 bg-[#FFF8DC] p-5 shadow-sm dark:border-amber-800 dark:bg-amber-950/50">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-sm font-extrabold text-emerald-950 dark:text-amber-50">Monthly progress</h2>
          <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">{percent}%</span>
        </div>
        <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(percent, 100)} className="h-3 overflow-hidden rounded-full bg-amber-200 dark:bg-amber-950">
          <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400" style={{ width: `${Math.min(summary.progress, 1) * 100}%` }} />
        </div>
        <p className="mt-3 text-xs text-stone-700 dark:text-stone-400">
          Monthly target is the sum of each day&apos;s target. Special days replace the normal daily target. Change targets in Settings.
        </p>
      </section>
    </div>
  );
}

function Card({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-amber-500/50 bg-[#FFF8DC] p-4 shadow-sm dark:border-amber-800 dark:bg-amber-950/50">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
        <span className="text-emerald-700 dark:text-emerald-400">{icon}</span>
        {label}
      </div>
      <p className="mt-2 text-xl font-extrabold text-emerald-950 dark:text-amber-50">{value}</p>
    </div>
  );
}
