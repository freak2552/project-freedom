'use client';

import { useState } from 'react';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import { formatDayLabel } from '@/lib/dates';
import { formatMinutes, sumHours, type StudyRecord } from './study-types';

type StudyRecordsProps = {
  dateKey: string;
  records: StudyRecord[];
  loading: boolean;
  onUpdate: (id: string, minutes: number) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
};

// Centre column: day heading, total studied, and the day's records.
export function StudyRecords({ dateKey, records, loading, onUpdate, onDelete }: StudyRecordsProps) {
  return (
    <section className="flex w-full flex-col items-center">
      <h2 className="border-b-2 border-[#F59E0B] pb-1 text-xl font-extrabold text-[#064E3B] dark:border-amber-600 dark:text-amber-50">
        Records for {formatDayLabel(dateKey)}
      </h2>

      <div className="mt-3 flex items-center gap-1.5 rounded-full border border-[#FCD34D] bg-[#FFFBEB] px-4 py-1.5 text-xs shadow-sm dark:border-amber-700 dark:bg-amber-950/70">
        <span className="font-bold text-[#064E3B] dark:text-amber-100">Total Studied Today:</span>
        <span className="font-extrabold text-[#047857] dark:text-emerald-400">{sumHours(records)} Hrs</span>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-stone-600 dark:text-stone-400">Loading records…</p>
      ) : records.length === 0 ? (
        <div className="mt-6 w-full max-w-[380px] rounded-xl border-[1.5px] border-dashed border-[#D97706] bg-[#FEF9C3] px-4 py-8 text-center text-[13px] text-stone-600 dark:border-amber-800 dark:bg-amber-950/40 dark:text-stone-300">
          No subjects logged for this day.
        </div>
      ) : (
        <ul className="mt-6 flex w-full max-w-[380px] flex-col gap-2">
          {records.map((record) => (
            <RecordRow key={record.id} record={record} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </section>
  );
}

function RecordRow({
  record,
  onUpdate,
  onDelete,
}: {
  record: StudyRecord;
  onUpdate: StudyRecordsProps['onUpdate'];
  onDelete: StudyRecordsProps['onDelete'];
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(record.minutes));
  const [busy, setBusy] = useState(false);

  async function save() {
    const minutes = Number(draft);
    if (!Number.isInteger(minutes) || minutes < 0 || minutes > 1440) return;
    setBusy(true);
    const ok = await onUpdate(record.id, minutes);
    setBusy(false);
    if (ok) setEditing(false);
  }

  async function remove() {
    if (!window.confirm(`Delete ${record.subjectName} (${formatMinutes(record.minutes)}) for this day?`)) return;
    setBusy(true);
    const ok = await onDelete(record.id);
    if (!ok) setBusy(false);
  }

  return (
    <li className="flex items-center gap-3 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2.5 shadow-sm dark:border-amber-800 dark:bg-amber-950/60">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-[#064E3B] dark:text-amber-50">{record.subjectName}</p>
        {editing ? (
          <div className="mt-1 flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={1440}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label={`Minutes for ${record.subjectName}`}
              className="h-8 w-24 rounded-lg border border-[#F59E0B] bg-white px-2 text-sm text-[#064E3B] dark:bg-amber-950 dark:text-amber-50"
            />
            <span className="text-xs text-stone-600 dark:text-stone-400">min</span>
          </div>
        ) : (
          <p className="text-xs text-stone-600 dark:text-stone-400">{formatMinutes(record.minutes)}</p>
        )}
      </div>

      {editing ? (
        <div className="flex gap-1.5">
          <IconButton label="Save minutes" onClick={save} disabled={busy} tone="primary">
            <Check size={15} aria-hidden="true" />
          </IconButton>
          <IconButton
            label="Cancel edit"
            onClick={() => {
              setDraft(String(record.minutes));
              setEditing(false);
            }}
            disabled={busy}
          >
            <X size={15} aria-hidden="true" />
          </IconButton>
        </div>
      ) : (
        <div className="flex gap-1.5">
          <IconButton label={`Edit ${record.subjectName} minutes`} onClick={() => setEditing(true)} disabled={busy}>
            <Pencil size={14} aria-hidden="true" />
          </IconButton>
          <IconButton label={`Delete ${record.subjectName} record`} onClick={remove} disabled={busy} tone="danger">
            <Trash2 size={14} aria-hidden="true" />
          </IconButton>
        </div>
      )}
    </li>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  tone = 'default',
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'default' | 'primary' | 'danger';
  children: React.ReactNode;
}) {
  const toneClass =
    tone === 'primary'
      ? 'bg-[#047857] text-[#FFFBEB] hover:bg-[#065F46]'
      : tone === 'danger'
        ? 'border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40'
        : 'border-[#F59E0B]/60 text-[#065F46] hover:bg-[#FDE68A] dark:border-amber-700 dark:text-amber-100 dark:hover:bg-amber-900';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-transparent bg-white/70 transition disabled:opacity-50 dark:bg-transparent ${toneClass}`}
    >
      {children}
    </button>
  );
}
