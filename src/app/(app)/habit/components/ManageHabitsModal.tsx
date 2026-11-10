'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Habit } from './habit-types';

type ManageHabitsModalProps = {
  habits: Habit[];
  onAdd: (name: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onClose: () => void;
};

// Add and delete habits. Deleting also removes that habit's marks.
export function ManageHabitsModal({ habits, onAdd, onDelete, onClose }: ManageHabitsModalProps) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setBusy(true);
    const ok = await onAdd(trimmed);
    setBusy(false);
    if (ok) setName('');
  }

  async function remove(habit: Habit) {
    if (!window.confirm(`Delete "${habit.name}" and all its marks?`)) return;
    await onDelete(habit.id);
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Manage habits"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-white/20 bg-gray-900 p-6 text-white shadow-2xl dark:bg-amber-950"
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-extrabold">Manage Habits</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg bg-white/5 p-1 text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="mb-6 flex gap-2">
          <input
            type="text"
            value={name}
            maxLength={40}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter new habit name..."
            aria-label="New habit name"
            className="flex-1 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-gray-400 focus:border-amber-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !name.trim()}
            className="flex items-center gap-1 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-black transition hover:bg-amber-600 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </form>

        <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
          {habits.length === 0 && <p className="text-sm text-gray-400">No habits yet.</p>}
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3"
            >
              <span className="truncate text-sm font-medium text-white">{habit.name}</span>
              <button
                type="button"
                onClick={() => remove(habit)}
                aria-label={`Delete ${habit.name}`}
                className="rounded-lg p-1 text-rose-400 transition hover:bg-rose-500/20 hover:text-rose-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
