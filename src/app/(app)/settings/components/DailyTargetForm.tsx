'use client';

import { useState } from 'react';

type DailyTargetFormProps = {
  value: number;
  onSaved: (hours: number) => void;
};

export function DailyTargetForm({ value, onSaved }: DailyTargetFormProps) {
  const [draft, setDraft] = useState(String(value));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const hours = Number(draft);
    if (!Number.isFinite(hours) || hours < 0 || hours > 24) {
      setMessage('Enter between 0 and 24 hours.');
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dailyTargetHours: hours }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not save');
      onSaved(data.dailyTargetHours);
      setMessage('Saved');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3 rounded-2xl border border-amber-500/50 bg-[#FFF8DC] p-4 shadow-sm dark:border-amber-800 dark:bg-amber-950/50">
      <div className="flex flex-col gap-1">
        <label htmlFor="daily-target" className="text-xs font-bold text-emerald-950 dark:text-amber-100">
          Normal daily target (hours)
        </label>
        <input
          id="daily-target"
          type="number"
          step="0.5"
          min={0}
          max={24}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="h-10 w-32 rounded-lg border border-amber-500 bg-white px-3 text-sm text-emerald-950 dark:bg-amber-950/70 dark:text-amber-50"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="h-10 rounded-lg bg-emerald-700 px-4 text-xs font-extrabold text-amber-50 hover:bg-emerald-800 disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save daily target'}
      </button>
      {message && (
        <p role="status" className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
          {message}
        </p>
      )}
    </form>
  );
}
