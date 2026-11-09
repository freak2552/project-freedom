'use client';

import { useEffect, useState } from 'react';
import { Pencil, Trash2, X } from 'lucide-react';
import { formatDayLabel } from '@/lib/dates';

const MAX_LENGTH = 5000;

type DiaryPanelProps = {
  dateKey: string;
  open: boolean;
  onClose: () => void;
};

// Large pop-up in the centre of the window for writing the day's diary.
// Saved entries show as text; Edit opens the writing area, Delete removes the entry.
export function DiaryPanel({ dateKey, open, onClose }: DiaryPanelProps) {
  const [saved, setSaved] = useState<string | null>(null); // null = no entry for this day
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the saved entry each time the pop-up opens.
  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    setError(null);
    fetch(`/api/study/diary?date=${dateKey}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? 'Could not load your diary.');
        return data as { text: string | null };
      })
      .then((data) => {
        if (!active) return;
        setSaved(data.text);
        setDraft(data.text ?? '');
        setEditing(data.text === null); // nothing saved yet: go straight to writing
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Could not load your diary.');
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

  async function save() {
    const text = draft.trim();
    if (!text) {
      setError('Write something before saving.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/study/diary', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateKey, text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Could not save your diary.');
      setSaved(data.text);
      setDraft(data.text);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your diary.');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm('Delete this diary entry?')) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/study/diary?date=${dateKey}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Could not delete the entry.');
      setSaved(null);
      setDraft('');
      setEditing(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the entry.');
    } finally {
      setBusy(false);
    }
  }

  function cancelEdit() {
    setDraft(saved ?? '');
    setError(null);
    if (saved !== null) setEditing(false);
    else onClose();
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-label="Diary"
        onClick={(e) => e.stopPropagation()}
        className="timer-enter flex h-[min(680px,85vh)] w-full max-w-2xl flex-col rounded-2xl border border-[#F59E0B]/70 bg-[#FFFBEB] shadow-2xl dark:border-amber-700 dark:bg-amber-950"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#F59E0B]/40 px-6 py-4 dark:border-amber-800">
          <div>
            <h3 className="text-lg font-extrabold text-[#064E3B] dark:text-amber-50">My diary</h3>
            <p className="mt-0.5 text-xs text-stone-600 dark:text-stone-400">{formatDayLabel(dateKey)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-[#065F46] hover:bg-[#FDE68A] dark:text-amber-100 dark:hover:bg-amber-900"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col p-6">
          {loading ? (
            <p className="text-center text-sm text-stone-600 dark:text-stone-400">Loading…</p>
          ) : saved !== null && !editing ? (
            <div className="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap rounded-xl bg-white/70 p-5 text-sm leading-relaxed text-[#064E3B] dark:bg-amber-950/60 dark:text-amber-50">
              {saved}
            </div>
          ) : (
            <>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={MAX_LENGTH}
                placeholder="How did the day go?"
                aria-label="Diary entry"
                className="min-h-0 w-full flex-1 resize-none rounded-xl border border-[#F59E0B] bg-white p-5 text-sm leading-relaxed text-[#064E3B] placeholder:text-stone-500 dark:border-amber-700 dark:bg-amber-950/70 dark:text-amber-50"
              />
              <p className="mt-2 text-right text-[11px] text-stone-600 dark:text-stone-400">
                {draft.length}/{MAX_LENGTH}
              </p>
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
          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#F59E0B]/40 px-6 py-4 dark:border-amber-800">
            {saved !== null && !editing ? (
              <>
                <button
                  type="button"
                  onClick={remove}
                  disabled={busy}
                  className="mr-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50 dark:text-red-300 dark:hover:bg-red-950/40"
                >
                  <Trash2 size={14} aria-hidden="true" />
                  Delete
                </button>
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
                    setDraft(saved ?? '');
                    setEditing(true);
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-[#047857] px-3 py-2 text-xs font-bold text-[#FFFBEB] hover:bg-[#065F46]"
                >
                  <Pencil size={14} aria-hidden="true" />
                  Edit
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={busy}
                  className="rounded-lg px-3 py-2 text-xs font-bold text-stone-700 hover:bg-[#FDE68A] disabled:opacity-50 dark:text-stone-300 dark:hover:bg-amber-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={busy}
                  className="rounded-lg bg-[#047857] px-3 py-2 text-xs font-bold text-[#FFFBEB] hover:bg-[#065F46] disabled:opacity-50"
                >
                  {busy ? 'Saving…' : 'Save diary'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
