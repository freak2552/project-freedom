'use client';

import { useEffect, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  Frown,
  Heart,
  Meh,
  Smile,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { League } from '@/components/league';
import { monthLabel } from '@/lib/dates';
import {
  MOOD_LABELS,
  defaultReportName,
  type MonthlyReport,
  type ReportMood,
  type ReportNameChange,
} from '@/lib/report';

// Same five icons as the mood logger on the Study tab.
const MOOD_ICONS: Record<ReportMood, LucideIcon> = {
  low: Frown,
  meh: Meh,
  okay: Smile,
  good: Heart,
  great: Sparkles,
};

const panel = 'rounded-2xl border border-[#F59E0B]/70 bg-[#FFFBEB] p-4 dark:border-amber-700 dark:bg-amber-950';
const heading = 'mb-3 text-sm font-extrabold text-[#064E3B] dark:text-amber-50';
const muted = 'text-xs text-stone-600 dark:text-stone-400';

type ReportDetailProps = {
  report: MonthlyReport;
  onBack: () => void;
  onRenamed: (change: ReportNameChange) => void;
};

export function ReportDetail({ report, onBack, onRenamed }: ReportDetailProps) {
  const [draft, setDraft] = useState(report.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(report.name);
    setError(null);
  }, [report.monthKey, report.name]);

  const trimmed = draft.trim();
  const previousLabel = monthLabel(report.previousMonthKey);
  const maxSubjectHours = Math.max(1, ...report.topSubjects.map((s) => s.hours));

  async function saveName(name: string) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/report/name', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthKey: report.monthKey, name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Could not save the report name.');
      onRenamed(data as ReportNameChange);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the report name.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to reports"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#F59E0B]/60 bg-[#FFFBEB] text-[#065F46] hover:bg-[#FDE68A] dark:border-amber-700 dark:bg-amber-950/70 dark:text-amber-100 dark:hover:bg-amber-900"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-extrabold text-[#064E3B] dark:text-amber-50">{report.name}</h2>
          {report.isCustomName && <p className={muted}>{monthLabel(report.monthKey)}</p>}
        </div>
      </div>

      {/* Rename */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (trimmed && trimmed !== report.name) saveName(trimmed);
        }}
        className="flex flex-wrap items-center gap-2"
      >
        <label htmlFor="report-name" className="sr-only">
          Report name
        </label>
        <input
          id="report-name"
          value={draft}
          maxLength={60}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={defaultReportName(report.monthKey)}
          className="h-9 min-w-0 flex-1 rounded-lg border border-[#F59E0B]/60 bg-white px-3 text-sm text-[#064E3B] placeholder:text-stone-400 dark:border-amber-700 dark:bg-amber-950/70 dark:text-amber-50"
        />
        <button
          type="submit"
          disabled={saving || !trimmed || trimmed === report.name}
          className="h-9 rounded-lg bg-[#047857] px-3 text-xs font-bold text-[#FFFBEB] hover:bg-[#065F46] disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save name'}
        </button>
        {report.isCustomName && (
          <button
            type="button"
            onClick={() => saveName('')}
            disabled={saving}
            className="h-9 rounded-lg px-3 text-xs font-bold text-stone-700 hover:bg-[#FDE68A] disabled:opacity-50 dark:text-stone-300 dark:hover:bg-amber-900"
          >
            Use default
          </button>
        )}
        {error && (
          <p role="alert" className="w-full text-xs font-bold text-red-700 dark:text-red-300">
            {error}
          </p>
        )}
      </form>

      {!report.hasData && (
        <p className={muted}>No study, mood or habit data was logged for this month.</p>
      )}

      {/* Totals and league */}
      <section className="grid gap-3 sm:grid-cols-2">
        <div className={panel}>
          <p className={muted}>Total study</p>
          <p className="mt-1 text-2xl font-extrabold text-[#064E3B] dark:text-amber-50">
            {report.studiedHours.toFixed(1)} h
          </p>
          <p className={`mt-2 flex items-center gap-1 ${muted}`}>
            {report.changePercent === null ? (
              `No study data for ${previousLabel} to compare`
            ) : report.changePercent >= 0 ? (
              <>
                <ArrowUpRight size={14} aria-hidden="true" className="text-emerald-700 dark:text-emerald-400" />
                Up {report.changePercent.toFixed(1)}% vs {previousLabel}
              </>
            ) : (
              <>
                <ArrowDownRight size={14} aria-hidden="true" className="text-red-700 dark:text-red-400" />
                Down {Math.abs(report.changePercent).toFixed(1)}% vs {previousLabel}
              </>
            )}
          </p>
        </div>
        <League
          name={report.league.name}
          tier={report.league.tier}
          monthLabel={monthLabel(report.monthKey)}
          studiedHours={report.studiedHours}
          targetHours={report.targetHours}
          progress={report.progress}
        />
      </section>

      {/* Weeks */}
      <section className={panel}>
        <h3 className={heading}>Hours by week</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {report.weeks.map((week) => (
            <div key={week.label} className="rounded-xl bg-white/70 p-3 text-center dark:bg-amber-950/60">
              <p className="text-[11px] font-bold text-stone-600 dark:text-stone-400">
                {week.label} ({week.range})
              </p>
              <p className="mt-1 text-lg font-extrabold text-[#064E3B] dark:text-amber-50">{week.hours.toFixed(1)} h</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top subjects */}
      <section className={panel}>
        <h3 className={heading}>Top study subjects</h3>
        {report.topSubjects.length === 0 ? (
          <p className={muted}>No study time logged.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {report.topSubjects.map((subject) => (
              <div key={subject.name} className="grid grid-cols-[90px_1fr_60px] items-center gap-3 text-sm">
                <span className="truncate font-bold text-[#064E3B] dark:text-amber-50">{subject.name}</span>
                <div className="h-2.5 overflow-hidden rounded-full bg-amber-200 dark:bg-amber-950">
                  <div
                    className="h-full rounded-full bg-emerald-600"
                    style={{ width: `${(subject.hours / maxSubjectHours) * 100}%` }}
                  />
                </div>
                <span className="text-right text-xs font-bold text-stone-600 dark:text-stone-300">
                  {subject.hours.toFixed(1)} h
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Mood and habit */}
      <section className="grid gap-3 sm:grid-cols-2">
        <div className={panel}>
          <h3 className={heading}>Mood days</h3>
          <div className="grid grid-cols-5 gap-1.5">
            {report.moods.map(({ mood, days }) => {
              const Icon = MOOD_ICONS[mood];
              return (
                <div key={mood} className="flex flex-col items-center gap-1 rounded-lg bg-white/70 py-2 dark:bg-amber-950/60">
                  <Icon size={20} aria-hidden="true" className="text-[#047857] dark:text-emerald-400" />
                  <span className="text-[10px] font-bold text-stone-600 dark:text-stone-400">{MOOD_LABELS[mood]}</span>
                  <span className="text-sm font-extrabold text-[#064E3B] dark:text-amber-50">{days}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={panel}>
          <h3 className={heading}>{report.bestHabits.length > 1 ? 'Best habits' : 'Best habit'}</h3>
          {report.bestHabits.length === 0 ? (
            <p className={muted}>No green marks this month.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {report.bestHabits.map((habit) => (
                <div key={habit.id} className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-sm font-bold text-[#064E3B] dark:text-amber-50">{habit.name}</p>
                  <p className="shrink-0 text-lg font-extrabold text-[#064E3B] dark:text-amber-50">
                    {habit.days}/{habit.totalDays}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
