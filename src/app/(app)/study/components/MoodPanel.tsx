'use client';

import { useEffect, useState } from 'react';
import { Frown, Heart, Meh, Smile, Sparkles, X, type LucideIcon } from 'lucide-react';
import { formatDayLabel } from '@/lib/dates';

export type MoodValue = 'low' | 'meh' | 'okay' | 'good' | 'great';

const MOODS: { value: MoodValue; label: string; description: string; icon: LucideIcon }[] = [
  { value: 'low', label: 'Low', description: 'Not a great day', icon: Frown },
  { value: 'meh', label: 'Meh', description: 'Just an ordinary day', icon: Meh },
  { value: 'okay', label: 'Okay', description: 'Doing alright', icon: Smile },
  { value: 'good', label: 'Good', description: 'Feeling positive', icon: Heart },
  { value: 'great', label: 'Great', description: 'A really good day', icon: Sparkles },
];

type MoodPanelProps = {
  dateKey: string;
  open: boolean;
  onClose: () => void;
};

// Small pop-up in the centre of the window. One mood per day; it can be edited later.
export function MoodPanel({ dateKey, open, onClose }: MoodPanelProps) {
  const [saved, setSaved] = useState<MoodValue | null>(null);
  const [draft, setDraft] = useState<MoodValue | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the saved mood each time the pop-up opens.
  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    setError(null);
    fetch(`/api/study/mood?date=${dateKey}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? 'Could not load your mood.');
        return data as { mood: MoodValue | null };
      })
      .then((data) => {
        if (!active) return;
        setSaved(data.mood);
        setDraft(data.mood);
        setEditing(data.mood === null); // nothing saved yet: go straight to choosing
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Could not load your mood.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open, dateKey]);

  // Escape closes the pop-up.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const savedMood = MOODS.find((m) => m.value === saved) ?? null;
  const draftMood = MOODS.find((m) => m.value === draft) ?? null;

  async function save() {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/study/mood', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateKey, mood: draft }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Could not save your mood.');
      setSaved(data.mood);
      setDraft(data.mood);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your mood.');
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setDraft(saved);
    setError(null);
    if (saved) setEditing(false);
    else onClose();
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-label="How did you feel?"
        onClick={(e) => e.stopPropagation()}
        className="timer-enter w-full max-w-sm rounded-2xl border border-[#F59E0B]/70 bg-[#FFFBEB] shadow-2xl dark:border-amber-700 dark:bg-amber-950"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F59E0B]/40 px-5 py-4 dark:border-amber-800">
          <div>
            <h3 className="text-base font-extrabold text-[#064E3B] dark:text-amber-50">How did you feel?</h3>
            <p className="mt-0.5 text-xs text-stone-600 dark:text-stone-400">{formatDayLabel(dateKey)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-[#065F46] hover:bg-[#FDE68A] dark:text-amber-100 dark:hover:bg-amber-900"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {loading ? (
            <p className="text-center text-sm text-stone-600 dark:text-stone-400">Loading…</p>
          ) : saved && !editing ? (
            // Saved view: shows the mood with an Edit button
            savedMood && (
              <div className="flex flex-col items-center gap-2 rounded-xl bg-white/70 p-5 text-center dark:bg-amber-950/60">
                <savedMood.icon size={36} className="text-[#047857] dark:text-emerald-400" aria-hidden="true" />
                <p className="text-sm font-extrabold text-[#064E3B] dark:text-amber-50">{savedMood.label}</p>
                <p className="text-xs text-stone-600 dark:text-stone-400">{savedMood.description}</p>
              </div>
            )
          ) : (
            // Choose view: used for first save and for editing
            <>
              <div role="radiogroup" aria-label="Mood" className="grid grid-cols-5 gap-1.5">
                {MOODS.map((m) => {
                  const Icon = m.icon;
                  const selected = draft === m.value;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setDraft(m.value)}
                      className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[10px] font-bold transition ${
                        selected
                          ? 'border-[#047857] bg-[#047857] text-[#FFFBEB]'
                          : 'border-[#F59E0B]/60 bg-white text-[#064E3B] hover:bg-[#FCD34D] dark:border-amber-700 dark:bg-amber-950/70 dark:text-amber-100'
                      }`}
                    >
                      <Icon size={20} aria-hidden="true" />
                      {m.label}
                    </button>
                  );
                })}
              </div>
              {draftMood && (
                <p className="mt-3 text-center text-xs text-stone-600 dark:text-stone-400">{draftMood.description}</p>
              )}
            </>
          )}

          {error && (
            <p role="alert" className="mt-3 text-center text-xs font-bold text-red-700 dark:text-red-300">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <div className="flex justify-end gap-2 border-t border-[#F59E0B]/40 px-5 py-4 dark:border-amber-800">
            {saved && !editing ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-3 py-2 text-xs font-bold text-stone-700 hover:bg-[#FDE68A] dark:text-stone-300 dark:hover:bg-amber-900"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(saved);
                    setEditing(true);
                  }}
                  className="rounded-lg bg-[#047857] px-3 py-2 text-xs font-bold text-[#FFFBEB] hover:bg-[#065F46]"
                >
                  Edit
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={saving}
                  className="rounded-lg px-3 py-2 text-xs font-bold text-stone-700 hover:bg-[#FDE68A] disabled:opacity-50 dark:text-stone-300 dark:hover:bg-amber-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={!draft || saving}
                  className="rounded-lg bg-[#047857] px-3 py-2 text-xs font-bold text-[#FFFBEB] hover:bg-[#065F46] disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save mood'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
