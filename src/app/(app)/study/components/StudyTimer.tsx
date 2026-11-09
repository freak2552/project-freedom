'use client';

import { useEffect, useState } from 'react';
import { Pencil, Trash2, X } from 'lucide-react';
import { formatDayLabel } from '@/lib/dates';

type StudyTimerProps = {
  subjectName: string;
  dateKey: string;
  minutes: number;
  saving: boolean;
  onMinutesChange: (minutes: number) => void;
  onSave: () => void;
  onClose: () => void;
  onRename: (name: string) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
};

const MAX_SLIDER_MINUTES = 240;

// Bottom-centre timer bar for the selected subject.
// Edit and Delete sit on its right side and open as pop-ups beside the bar.
export function StudyTimer({
  subjectName,
  dateKey,
  minutes,
  saving,
  onMinutesChange,
  onSave,
  onClose,
  onRename,
  onDelete,
}: StudyTimerProps) {
  const [popup, setPopup] = useState<null | 'edit' | 'delete'>(null);
  const [draftName, setDraftName] = useState(subjectName);
  const [busy, setBusy] = useState(false);

  // A different subject resets the pop-ups.
  useEffect(() => {
    setPopup(null);
    setDraftName(subjectName);
  }, [subjectName]);

  // Escape closes an open pop-up.
  useEffect(() => {
    if (!popup) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPopup(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [popup]);

  async function submitRename(e: React.FormEvent) {
    e.preventDefault();
    const name = draftName.trim();
    if (!name) return;
    setBusy(true);
    const ok = await onRename(name);
    setBusy(false);
    if (ok) setPopup(null);
  }

  async function confirmDelete() {
    setBusy(true);
    const ok = await onDelete();
    setBusy(false);
    if (ok) setPopup(null);
  }

  return (
    <div className="timer-enter relative w-[min(560px,100%)] rounded-2xl border-2 border-[#34D399] bg-[#064E3B] p-3 shadow-2xl shadow-emerald-950/30 dark:border-emerald-500 dark:bg-[#03241a]">
      <div className="flex items-center gap-3">
        {/* Date and subject */}
        <div className="min-w-0 shrink-0 border-r border-[#065F46] pr-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-[#6EE7B7]">{formatDayLabel(dateKey)}</p>
          <p className="max-w-[7.5rem] truncate text-[13px] font-extrabold text-[#ECFDF5]">{subjectName}</p>
        </div>

        {/* Minutes slider */}
        <div className="flex min-w-0 flex-1 items-center">
          <input
            type="range"
            min={0}
            max={MAX_SLIDER_MINUTES}
            step={5}
            value={Math.min(minutes, MAX_SLIDER_MINUTES)}
            onChange={(e) => onMinutesChange(Number(e.target.value))}
            aria-label="Minutes studied"
            className="h-1.5 w-full cursor-pointer accent-[#34D399]"
          />
        </div>

        {/* Minutes input */}
        <div className="flex shrink-0 items-center gap-1 rounded-lg bg-[#065F46] px-2 py-1">
          <input
            type="number"
            min={0}
            max={1440}
            value={minutes}
            onChange={(e) => onMinutesChange(Math.max(0, Math.min(1440, Number(e.target.value) || 0)))}
            aria-label="Minutes to save"
            className="w-16 bg-transparent text-right text-lg font-extrabold text-[#6EE7B7] outline-none"
          />
          <span className="text-[10px] font-bold text-[#A7F3D0]">min</span>
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={saving || minutes <= 0}
          className="shrink-0 rounded-lg bg-[#34D399] px-3.5 py-2 text-xs font-extrabold tracking-wider text-[#064E3B] transition hover:bg-[#6EE7B7] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'SAVING…' : 'SAVE'}
        </button>

        {/* Right side: edit, delete, close */}
        <div className="flex shrink-0 items-center gap-0.5 border-l border-[#065F46] pl-2">
          <TimerIcon label={`Edit ${subjectName}`} expanded={popup === 'edit'} onClick={() => setPopup(popup === 'edit' ? null : 'edit')}>
            <Pencil size={14} aria-hidden="true" />
          </TimerIcon>
          <TimerIcon label={`Delete ${subjectName}`} expanded={popup === 'delete'} tone="danger" onClick={() => setPopup(popup === 'delete' ? null : 'delete')}>
            <Trash2 size={14} aria-hidden="true" />
          </TimerIcon>
          <TimerIcon label="Close timer" onClick={onClose}>
            <X size={14} aria-hidden="true" />
          </TimerIcon>
        </div>
      </div>

      {/* Pop-up for edit or delete, anchored above the right side of the bar */}
      {popup && (
        <div
          role="dialog"
          aria-label={popup === 'edit' ? 'Edit subject' : 'Delete subject'}
          className="timer-enter absolute bottom-full right-0 mb-3 w-72 rounded-xl border border-[#F59E0B]/70 bg-[#FFFBEB] p-4 shadow-xl dark:border-amber-700 dark:bg-amber-950"
        >
          {popup === 'edit' ? (
            <form onSubmit={submitRename} className="flex flex-col gap-3">
              <label htmlFor="rename-subject" className="text-xs font-bold text-[#064E3B] dark:text-amber-100">
                Subject name
              </label>
              <input
                id="rename-subject"
                autoFocus
                value={draftName}
                maxLength={60}
                onChange={(e) => setDraftName(e.target.value)}
                className="h-10 rounded-lg border border-[#F59E0B] bg-white px-3 text-sm text-[#064E3B] dark:bg-amber-950/70 dark:text-amber-50"
              />
              <p className="text-[11px] text-stone-600 dark:text-stone-400">The new name also updates past records.</p>
              <div className="flex justify-end gap-2">
                <PopupButton onClick={() => setPopup(null)}>Cancel</PopupButton>
                <button
                  type="submit"
                  disabled={busy || !draftName.trim()}
                  className="rounded-lg bg-[#047857] px-3 py-2 text-xs font-bold text-[#FFFBEB] hover:bg-[#065F46] disabled:opacity-50"
                >
                  {busy ? 'Saving…' : 'Save name'}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-bold text-[#064E3B] dark:text-amber-50">Delete &ldquo;{subjectName}&rdquo;?</p>
              <p className="text-[11px] text-stone-600 dark:text-stone-400">
                It leaves the subject list. Its existing study records are kept.
              </p>
              <div className="flex justify-end gap-2">
                <PopupButton onClick={() => setPopup(null)}>Cancel</PopupButton>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={busy}
                  className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {busy ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TimerIcon({
  label,
  onClick,
  expanded,
  tone = 'default',
  children,
}: {
  label: string;
  onClick: () => void;
  expanded?: boolean;
  tone?: 'default' | 'danger';
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={expanded}
      title={label}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
        tone === 'danger' ? 'text-red-300 hover:bg-red-900/60' : 'text-[#A7F3D0] hover:bg-[#065F46]'
      } ${expanded ? 'bg-[#065F46]' : ''}`}
    >
      {children}
    </button>
  );
}

function PopupButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg px-3 py-2 text-xs font-bold text-stone-700 hover:bg-[#FDE68A] dark:text-stone-300 dark:hover:bg-amber-900"
    >
      {children}
    </button>
  );
}
