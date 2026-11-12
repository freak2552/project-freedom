'use client';

import { useCallback, useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { CreateJourneyForm } from './CreateJourneyForm';
import { JourneyCard } from './JourneyCard';
import type { Journey, JourneyEntry, JourneyType } from './journey-types';

// Small JSON helper: throws with the server's message when a request fails.
async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? 'Something went wrong');
  return data as T;
}

export default function JourneyTab() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [entryInputs, setEntryInputs] = useState<Record<string, string>>({});
  const [showUI, setShowUI] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const showError = useCallback((err: unknown) => {
    setNotice(err instanceof Error ? err.message : 'Something went wrong');
  }, []);

  // Auto-clear the notice.
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  // Load journeys once.
  useEffect(() => {
    api<{ journeys: Journey[] }>('/api/journeys')
      .then((d) => setJourneys(d.journeys))
      .catch(showError);
  }, [showError]);

  async function createJourney(input: { name: string; description: string; type: JourneyType }): Promise<boolean> {
    try {
      const d = await api<{ journey: Journey }>('/api/journeys', { method: 'POST', body: JSON.stringify(input) });
      setJourneys((prev) => [d.journey, ...prev]);
      setExpanded((prev) => ({ ...prev, [d.journey.id]: true }));
      return true;
    } catch (err) {
      showError(err);
      return false;
    }
  }

  async function deleteJourney(id: string) {
    if (!window.confirm('Delete this entire journey and all its entries?')) return;
    try {
      await api<{ ok: boolean }>(`/api/journeys/${id}`, { method: 'DELETE' });
      setJourneys((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      showError(err);
    }
  }

  async function addEntry(journeyId: string) {
    const content = (entryInputs[journeyId] ?? '').trim();
    if (!content) return;
    try {
      const d = await api<{ entry: JourneyEntry }>(`/api/journeys/${journeyId}/entries`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      setJourneys((prev) =>
        prev.map((j) => (j.id === journeyId ? { ...j, entries: [...j.entries, d.entry] } : j)),
      );
      setEntryInputs((prev) => ({ ...prev, [journeyId]: '' }));
    } catch (err) {
      showError(err);
    }
  }

  async function deleteEntry(journeyId: string, entryId: string) {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await api<{ ok: boolean }>(`/api/journeys/${journeyId}/entries/${entryId}`, { method: 'DELETE' });
      setJourneys((prev) =>
        prev.map((j) =>
          j.id === journeyId ? { ...j, entries: j.entries.filter((e) => e.id !== entryId) } : j,
        ),
      );
    } catch (err) {
      showError(err);
    }
  }

  return (
    <div className="relative flex min-h-0 flex-1 select-none overflow-hidden text-slate-900 dark:bg-slate-900 dark:text-white">
      {/* Background image: light mode only. Dark mode keeps the plain theme. */}
      <img
        src="/journey.png"
        alt=""
        className="fixed inset-0 z-0 hidden h-full w-full object-cover dark:hidden md:block"
      />
      <img
        src="/journey-mobile.png"
        alt=""
        className="fixed inset-0 z-0 block h-full w-full object-cover dark:hidden md:hidden"
      />

      {/* Eye toggle: always visible, so the background can be seen */}
      <div className="fixed right-3 top-3 z-30">
        <button
          type="button"
          aria-label={showUI ? 'Hide interface' : 'Show interface'}
          title={showUI ? 'Hide interface' : 'Show interface'}
          onClick={() => setShowUI((v) => !v)}
          className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-slate-900 text-slate-900 shadow-[3px_3px_0px_rgba(15,23,42,1)] transition hover:scale-105 ${
            showUI ? 'bg-white' : 'bg-amber-400'
          }`}
        >
          {showUI ? <Eye className="h-5 w-5" strokeWidth={3} /> : <EyeOff className="h-5 w-5" strokeWidth={3} />}
        </button>
      </div>

      {showUI && (
        <div className="relative z-10 h-full w-full overflow-y-auto bg-black/10 p-4 md:p-8 md:pt-20 dark:bg-black/30">
          <div className="mx-auto max-w-4xl space-y-8">
            <CreateJourneyForm onCreate={createJourney} />

            <div className="space-y-6">
              {journeys.length === 0 && (
                <div className="rounded-3xl border-4 border-slate-900 bg-white/90 py-12 text-center shadow-[6px_6px_0px_rgba(15,23,42,1)] dark:border-slate-600 dark:bg-slate-800">
                  <p className="text-xl font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    No Adventures Yet
                  </p>
                </div>
              )}

              {journeys.map((journey) => (
                <JourneyCard
                  key={journey.id}
                  journey={journey}
                  expanded={!!expanded[journey.id]}
                  entryInput={entryInputs[journey.id] ?? ''}
                  onToggle={() => setExpanded((prev) => ({ ...prev, [journey.id]: !prev[journey.id] }))}
                  onDelete={() => deleteJourney(journey.id)}
                  onInputChange={(value) => setEntryInputs((prev) => ({ ...prev, [journey.id]: value }))}
                  onAddEntry={() => addEntry(journey.id)}
                  onDeleteEntry={(entryId) => deleteEntry(journey.id, entryId)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {notice && (
        <p
          role="status"
          className="absolute left-1/2 top-4 z-[120] max-w-[90%] -translate-x-1/2 rounded-lg border-4 border-slate-900 bg-rose-500 px-3 py-2 text-center text-xs font-black text-white shadow-lg"
        >
          {notice}
        </p>
      )}
    </div>
  );
}
