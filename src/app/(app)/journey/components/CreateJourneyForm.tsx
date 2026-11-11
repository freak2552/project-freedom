'use client';

import { useState } from 'react';
import { Map as MapIcon } from 'lucide-react';
import { INPUT_CLASS, JOURNEY_TYPES, type JourneyType } from './journey-types';

type CreateJourneyFormProps = {
  onCreate: (input: { name: string; description: string; type: JourneyType }) => Promise<boolean>;
};

// Name, description, type and a Create button. Clears itself after a successful create.
export function CreateJourneyForm({ onCreate }: CreateJourneyFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<JourneyType>('general');
  const [busy, setBusy] = useState(false);

  async function submit() {
    const trimmed = name.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    const ok = await onCreate({ name: trimmed, description: description.trim(), type });
    setBusy(false);
    if (ok) {
      setName('');
      setDescription('');
      setType('general');
    }
  }

  return (
    <section className="rounded-3xl border-4 border-slate-900 bg-white p-5 shadow-[6px_6px_0px_rgba(15,23,42,1)] dark:border-slate-600 dark:bg-slate-800 dark:shadow-[6px_6px_0px_rgba(255,255,255,0.12)]">
      <h2 className="mb-5 flex items-center gap-2 text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">
        <MapIcon className="h-7 w-7 text-rose-500" strokeWidth={3} aria-hidden="true" />
        Start a New Adventure!
      </h2>

      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={name}
          maxLength={60}
          placeholder="Journey name (e.g., React Mastery)"
          aria-label="Journey name"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          className={INPUT_CLASS}
        />
        <input
          type="text"
          value={description}
          maxLength={200}
          placeholder="What's the quest about? (optional)"
          aria-label="Journey description"
          onChange={(e) => setDescription(e.target.value)}
          className={`${INPUT_CLASS} text-sm`}
        />

        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <div role="radiogroup" aria-label="Journey type" className="flex items-center gap-2">
            {JOURNEY_TYPES.map((t) => {
              const Icon = t.icon;
              const selected = type === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  title={t.label}
                  aria-label={t.label}
                  onClick={() => setType(t.id)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-slate-900 transition-all dark:border-slate-600 ${
                    selected
                      ? `${t.bg} scale-110 text-slate-900 shadow-[2px_2px_0px_rgba(15,23,42,1)]`
                      : 'bg-slate-100 text-slate-400 hover:scale-105 dark:bg-slate-900 dark:text-slate-500'
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={selected ? 3 : 2} aria-hidden="true" />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={busy || !name.trim()}
            className="rounded-2xl border-4 border-slate-900 bg-rose-500 px-6 py-3 text-sm font-black uppercase tracking-wider text-white shadow-[4px_4px_0px_rgba(15,23,42,1)] transition-all hover:bg-rose-400 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50"
          >
            {busy ? 'Creating…' : 'Create!'}
          </button>
        </div>
      </div>
    </section>
  );
}
