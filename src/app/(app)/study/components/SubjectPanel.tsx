'use client';

import { forwardRef, useState } from 'react';
import { Plus } from 'lucide-react';
import type { Subject } from './study-types';

type SubjectPanelProps = {
  subjects: Subject[];
  selectedSubjectId: string | null;
  onSelect: (subjectId: string) => void;
  onAdd: (name: string) => Promise<boolean>;
};

// Right-side panel: add a subject, then select one to open the timer.
// Edit and Delete live beside the timer, not on each subject here.
export const SubjectPanel = forwardRef<HTMLElement, SubjectPanelProps>(function SubjectPanel(
  { subjects, selectedSubjectId, onSelect, onAdd },
  ref,
) {
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setAdding(true);
    const ok = await onAdd(trimmed);
    setAdding(false);
    if (ok) setName('');
  }

  return (
    <section
      ref={ref}
      aria-label="Subjects"
      className="flex h-full min-h-[320px] flex-col rounded-2xl border border-[#F59E0B]/50 bg-[#FDE68A] p-4 shadow-md shadow-amber-900/10 dark:border-amber-800 dark:bg-[#2a2308]"
    >
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          placeholder="New subject"
          aria-label="New subject name"
          className="h-10 min-w-0 flex-1 rounded-xl border border-[#F59E0B] bg-[#FFFBEB] px-3 text-sm text-[#064E3B] placeholder:text-stone-500 dark:border-amber-700 dark:bg-amber-950/70 dark:text-amber-50"
        />
        <button
          type="submit"
          disabled={adding || !name.trim()}
          aria-label="Add subject"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#047857] text-[#FFFBEB] transition hover:bg-[#065F46] disabled:opacity-50"
        >
          <Plus size={18} aria-hidden="true" />
        </button>
      </form>

      <h2 className="mt-5 border-b border-[#D97706] pb-2 text-sm font-extrabold text-[#047857] dark:text-emerald-400">
        Subjects
      </h2>

      {subjects.length === 0 ? (
        <p className="mt-4 text-xs text-stone-700 dark:text-stone-300">Add a subject to start logging study time.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-1.5 overflow-y-auto">
          {subjects.map((subject) => {
            const selected = subject.id === selectedSubjectId;
            return (
              <li key={subject.id}>
                <button
                  type="button"
                  onClick={() => onSelect(subject.id)}
                  aria-pressed={selected}
                  className={`w-full truncate rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
                    selected
                      ? 'bg-[#047857] text-[#FFFBEB] shadow-md shadow-emerald-900/25 dark:bg-emerald-600'
                      : 'bg-[#FFFBEB] text-[#064E3B] hover:bg-[#FCD34D] dark:bg-amber-950/60 dark:text-amber-50 dark:hover:bg-amber-900'
                  }`}
                >
                  {subject.name}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
});
