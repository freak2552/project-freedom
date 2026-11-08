'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { currentMonthKey, monthLabel } from '@/lib/dates';
import { calculateMonthlyTarget } from '@/lib/targets';
import { DailyTargetForm } from './components/DailyTargetForm';
import { SpecialDayTargets } from './components/SpecialDayTargets';

type SettingsData = {
  dailyTargetHours: number;
  specialDays: Record<string, number>;
};

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const monthKey = currentMonthKey();

  useEffect(() => {
    fetch('/api/settings')
      .then(async (res) => {
        if (!res.ok) throw new Error('Could not load settings');
        return (await res.json()) as SettingsData;
      })
      .then(setSettings)
      .catch((err: Error) => setError(err.message));
  }, []);

  // Keep the League block and Home in step with the new targets.
  function applyChange(next: SettingsData) {
    setSettings(next);
    router.refresh();
  }

  if (error) {
    return <p className="p-6 text-sm text-red-700 dark:text-red-300">{error}</p>;
  }
  if (!settings) {
    return <p className="p-6 text-sm text-stone-600 dark:text-stone-400">Loading settings…</p>;
  }

  const monthlyTarget = calculateMonthlyTarget(monthKey, settings.dailyTargetHours, settings.specialDays);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-emerald-950 dark:text-amber-50">Settings</h1>
          <p className="text-xs text-stone-700 dark:text-stone-400">
            {monthLabel(monthKey)} target: <strong>{monthlyTarget.toFixed(1)} h</strong>
          </p>
        </div>
        <ThemeToggle />
      </header>

      <section aria-labelledby="targets-heading" className="flex flex-col gap-4">
        <h2 id="targets-heading" className="text-sm font-extrabold uppercase tracking-wider text-emerald-900 dark:text-amber-200">
          Study targets
        </h2>
        <DailyTargetForm value={settings.dailyTargetHours} onSaved={(hours) => applyChange({ ...settings, dailyTargetHours: hours })} />
        <SpecialDayTargets
          specialDays={settings.specialDays}
          onChange={(specialDays) => applyChange({ ...settings, specialDays })}
        />
      </section>
    </div>
  );
}
