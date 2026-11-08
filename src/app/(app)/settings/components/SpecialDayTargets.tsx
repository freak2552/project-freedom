'use client';

import { useState } from 'react';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import { formatDayLabel, todayKey } from '@/lib/dates';

type SpecialDayTargetsProps = {
  specialDays: Record<string, number>;
  onChange: (specialDays: Record<string, number>) => void;
};

// A special-day target replaces the normal daily target for that date (it is not added on top).
export function SpecialDayTargets({ specialDays, onChange }: SpecialDayTargetsProps) {
  const [date, setDate] = useState(todayKey());
  const [hours, setHours] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editHours, setEditHours] = useState('');

  const entries = Object.entries(specialDays).sort(([a], [b]) => a.localeCompare(b));

  async function request(url: string, init: RequestInit): Promise<Response> {
    const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? 'Request failed');
    }
    return res;
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(hours);
    if (!date || !Number.isFinite(value) || value < 0 || value > 24) {
      setError('Choose a date and enter 0 to 24 hours.');
      return;
    }
    try {
      await request('/api/settings/special-days', { method: 'POST', body: JSON.stringify({ date, hours: value }) });
      onChange({ ...specialDays, [date]: value });
      setHours('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add');
    }
  }

  async function saveEdit(day: string) {
    const value = Number(editHours);
    if (!Number.isFinite(value) || value < 0 || value > 24) {
      setError('Enter 0 to 24 hours.');
      return;
    }
    try {
      await request(`/api/settings/special-days/${day}`, { method: 'PATCH', body: JSON.stringify({ hours: value }) });
      onChange({ ...specialDays, [day]: value });
      setEditingDate(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update');
    }
  }

  async function remove(day: string) {
    try {
      await request(`/api/settings/special-days/${day}`, { method: 'DELETE' });
      const next = { ...specialDays };
      delete next[day];
      onChange(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove');
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-amber-500/50 bg-[#FFF8DC] p-4 shadow-sm dark:border-amber-800 dark:bg-amber-950/50">
      <div>
        <h3 className="text-sm font-extrabold text-emerald-950 dark:text-amber-50">Special-day targets</h3>
        <p className="text-xs text-stone-700 dark:text-stone-400">Set a different target for an unusual day.</p>
      </div>

      <form onSubmit={add} className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="special-date" className="text-xs font-bold text-emerald-950 dark:text-amber-100">Date</label>
          <input
            id="special-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 rounded-lg border border-amber-500 bg-white px-2 text-sm text-emerald-950 dark:bg-amber-950/70 dark:text-amber-50"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="special-hours" className="text-xs font-bold text-emerald-950 dark:text-amber-100">Target hours</label>
          <input
            id="special-hours"
            type="number"
            step="0.5"
            min={0}
            max={24}
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="h-10 w-28 rounded-lg border border-amber-500 bg-white px-3 text-sm text-emerald-950 dark:bg-amber-950/70 dark:text-amber-50"
          />
        </div>
        <button type="submit" className="h-10 rounded-lg bg-emerald-700 px-4 text-xs font-extrabold text-amber-50 hover:bg-emerald-800">
          Add special day
        </button>
      </form>

      {error && <p role="alert" className="text-xs font-bold text-red-700 dark:text-red-300">{error}</p>}

      {entries.length === 0 ? (
        <p className="text-xs text-stone-700 dark:text-stone-400">No special days yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {entries.map(([day, value]) => (
            <li key={day} className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-300/70 bg-white/70 px-3 py-2 dark:border-amber-800 dark:bg-amber-950/60">
              <span className="min-w-0 flex-1 text-sm font-bold text-emerald-950 dark:text-amber-50">{formatDayLabel(day)}</span>
              {editingDate === day ? (
                <>
                  <input
                    type="number"
                    step="0.5"
                    min={0}
                    max={24}
                    value={editHours}
                    onChange={(e) => setEditHours(e.target.value)}
                    aria-label={`Hours for ${day}`}
                    className="h-8 w-24 rounded-lg border border-amber-500 bg-white px-2 text-sm dark:bg-amber-950/70 dark:text-amber-50"
                  />
                  <IconBtn label="Save special day" onClick={() => saveEdit(day)}><Check size={14} aria-hidden="true" /></IconBtn>
                  <IconBtn label="Cancel edit" onClick={() => setEditingDate(null)}><X size={14} aria-hidden="true" /></IconBtn>
                </>
              ) : (
                <>
                  <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">{value} h</span>
                  <IconBtn label={`Edit ${day}`} onClick={() => { setEditingDate(day); setEditHours(String(value)); }}>
                    <Pencil size={14} aria-hidden="true" />
                  </IconBtn>
                  <IconBtn label={`Remove ${day}`} onClick={() => remove(day)} danger>
                    <Trash2 size={14} aria-hidden="true" />
                  </IconBtn>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function IconBtn({ label, onClick, danger = false, children }: { label: string; onClick: () => void; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/60 bg-white/70 dark:bg-transparent ${
        danger ? 'text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40' : 'text-emerald-900 hover:bg-amber-200 dark:text-amber-100 dark:hover:bg-amber-900'
      }`}
    >
      {children}
    </button>
  );
}
