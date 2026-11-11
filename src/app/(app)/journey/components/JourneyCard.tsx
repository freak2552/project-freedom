'use client';

import { ChevronDown, ChevronUp, Trash2, X } from 'lucide-react';
import { INPUT_CLASS, typeConfig, type Journey } from './journey-types';

type JourneyCardProps = {
  journey: Journey;
  expanded: boolean;
  entryInput: string;
  onToggle: () => void;
  onDelete: () => void;
  onInputChange: (value: string) => void;
  onAddEntry: () => void;
  onDeleteEntry: (entryId: string) => void;
};

// One journey. Click the header to open it: log input first, then the timeline of entries, newest first.
export function JourneyCard({
  journey,
  expanded,
  entryInput,
  onToggle,
  onDelete,
  onInputChange,
  onAddEntry,
  onDeleteEntry,
}: JourneyCardProps) {
  const config = typeConfig(journey.type);
  const Icon = config.icon;
  const entries = [...journey.entries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <article
      className={`overflow-hidden rounded-3xl border-4 border-slate-900 shadow-[6px_6px_0px_rgba(15,23,42,1)] transition-all dark:border-slate-600 dark:shadow-[6px_6px_0px_rgba(255,255,255,0.12)] ${config.bg}`}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
        className="group flex cursor-pointer items-center justify-between gap-4 p-5"
      >
        <div className="flex min-w-0 items-center gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-4 border-slate-900 shadow-[2px_2px_0px_rgba(15,23,42,1)] ${config.iconBg}`}
          >
            <Icon className="h-6 w-6 text-slate-900" strokeWidth={3} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-xl font-black uppercase tracking-tight text-slate-900 transition-transform group-hover:scale-[1.02]">
              {journey.name}
            </h3>
            {journey.description && (
              <p className="truncate text-sm font-bold text-slate-900/80">{journey.description}</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label={`Delete ${journey.name}`}
            title="Delete journey"
            className="rounded-xl border-4 border-slate-900 bg-white p-2.5 shadow-[2px_2px_0px_rgba(15,23,42,1)] transition hover:scale-105 hover:bg-rose-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <Trash2 className="h-4 w-4 text-slate-900" strokeWidth={3} aria-hidden="true" />
          </button>
          <span className="rounded-full border-4 border-slate-900 bg-white p-2 text-slate-900">
            {expanded ? (
              <ChevronUp className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
            ) : (
              <ChevronDown className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
            )}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="space-y-6 border-t-4 border-slate-900 bg-white/90 p-5 backdrop-blur-sm dark:border-slate-600 dark:bg-slate-900/90">
          <div className="flex gap-3">
            <input
              type="text"
              value={entryInput}
              maxLength={1000}
              placeholder="What happened today?"
              aria-label={`New entry for ${journey.name}`}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onAddEntry();
              }}
              className={INPUT_CLASS}
            />
            <button
              type="button"
              onClick={onAddEntry}
              disabled={!entryInput.trim()}
              className="shrink-0 rounded-2xl border-4 border-slate-900 bg-yellow-400 px-6 py-3 text-sm font-black uppercase text-slate-900 shadow-[4px_4px_0px_rgba(15,23,42,1)] transition-all hover:bg-yellow-300 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50"
            >
              Log
            </button>
          </div>

          {entries.length === 0 ? (
            <div className="rounded-3xl border-4 border-dashed border-slate-300 py-6 text-center dark:border-slate-700">
              <p className="text-sm font-bold text-slate-400 dark:text-slate-500">
                The canvas is blank! Add your first entry.
              </p>
            </div>
          ) : (
            <ol className="relative ml-4 space-y-8 border-l-8 border-slate-900 pl-8 dark:border-slate-600">
              {entries.map((entry) => (
                <li key={entry.id} className="relative">
                  <span
                    aria-hidden="true"
                    className={`absolute -left-[44px] top-0 h-6 w-6 rounded-full border-4 border-slate-900 ${config.bg}`}
                  />
                  <div className="rounded-2xl border-4 border-slate-900 bg-white p-3 text-slate-900 shadow-[4px_4px_0px_rgba(15,23,42,1)] dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:shadow-none">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <p className="text-[11px] font-black uppercase tracking-widest opacity-60">
                        {new Date(entry.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                      <button
                        type="button"
                        onClick={() => onDeleteEntry(entry.id)}
                        aria-label="Delete entry"
                        title="Delete entry"
                        className="rounded-md p-1 text-slate-500 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/40"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                    <p className="whitespace-pre-wrap text-sm font-bold leading-relaxed">{entry.content}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </article>
  );
}
