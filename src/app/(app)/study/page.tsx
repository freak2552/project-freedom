'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ListChecks, X } from 'lucide-react';
import { currentMonthKey, dayKeysOfMonth, shiftMonth, todayKey } from '@/lib/dates';
import { DateStrip } from './components/DateStrip';
import { FloatingActionDock } from './components/FloatingActionDock';
import { MonthNavigator } from './components/MonthNavigator';
import { StudyRecords } from './components/StudyRecords';
import { StudyTimer } from './components/StudyTimer';
import { SubjectPanel } from './components/SubjectPanel';
import type { StudyRecord, Subject } from './components/study-types';

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

export default function StudyPage() {
  const router = useRouter();
  const [monthKey, setMonthKey] = useState(() => currentMonthKey());
  const [selectedDate, setSelectedDate] = useState(() => todayKey());
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [minutes, setMinutes] = useState(30);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  // Mobile only: whether the subject panel sheet is open. Desktop ignores this.
  const [sheetOpen, setSheetOpen] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) ?? null;

  const showError = useCallback((err: unknown) => {
    setNotice(err instanceof Error ? err.message : 'Something went wrong');
  }, []);

  // Re-run the server side of the layout so the League box in the sidebar
  // picks up the new totals right away (same thing Settings does on save).
  const refreshLeague = useCallback(() => {
    router.refresh();
  }, [router]);

  // Load subjects once.
  useEffect(() => {
    api<{ subjects: Subject[] }>('/api/subjects')
      .then((d) => setSubjects(d.subjects))
      .catch(showError);
  }, [showError]);

  // Load the records for the selected date.
  useEffect(() => {
    let active = true;
    setLoadingRecords(true);
    api<{ records: StudyRecord[] }>(`/api/study/records?date=${selectedDate}`)
      .then((d) => active && setRecords(d.records))
      .catch((err) => active && showError(err))
      .finally(() => active && setLoadingRecords(false));
    return () => {
      active = false;
    };
  }, [selectedDate, showError]);

  // Clicking free space outside the subject panel, the timer and the open/close button closes the timer.
  useEffect(() => {
    if (!selectedSubjectId) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        sheetRef.current?.contains(target) ||
        timerRef.current?.contains(target) ||
        fabRef.current?.contains(target)
      ) {
        return;
      }
      setSelectedSubjectId(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [selectedSubjectId]);

  // Auto-clear the notice after a few seconds.
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  function changeMonth(delta: number) {
    const next = shiftMonth(monthKey, delta);
    setMonthKey(next);
    setSelectedDate(next === currentMonthKey() ? todayKey() : dayKeysOfMonth(next)[0]);
  }

  // Picking a subject opens its timer. On mobile the panel closes so the timer at the bottom is visible.
  function chooseSubject(id: string) {
    setSelectedSubjectId(id);
    setSheetOpen(false);
  }

  async function addSubject(name: string): Promise<boolean> {
    try {
      const data = await api<{ subject: Subject }>('/api/subjects', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      setSubjects((prev) => [...prev, data.subject].sort((a, b) => a.name.localeCompare(b.name)));
      refreshLeague();
      return true;
    } catch (err) {
      showError(err);
      return false;
    }
  }

  async function renameSubject(name: string): Promise<boolean> {
    if (!selectedSubject) return false;
    const id = selectedSubject.id;
    try {
      const data = await api<{ subject: Subject }>(`/api/subjects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      });
      setSubjects((prev) =>
        prev.map((s) => (s.id === id ? data.subject : s)).sort((a, b) => a.name.localeCompare(b.name)),
      );
      // Past records shown on this screen get the new name too.
      setRecords((prev) => prev.map((r) => (r.subjectId === id ? { ...r, subjectName: data.subject.name } : r)));
      refreshLeague();
      return true;
    } catch (err) {
      showError(err);
      return false;
    }
  }

  async function deleteSubject(): Promise<boolean> {
    if (!selectedSubject) return false;
    const id = selectedSubject.id;
    try {
      await api<{ ok: boolean }>(`/api/subjects/${id}`, { method: 'DELETE' });
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      setSelectedSubjectId(null);
      // Records stay on the day; their subjectName snapshot keeps them readable.
      refreshLeague();
      return true;
    } catch (err) {
      showError(err);
      return false;
    }
  }

  async function saveTime() {
    if (!selectedSubject || minutes <= 0) return;
    setSaving(true);
    try {
      const data = await api<{ record: StudyRecord }>('/api/study/records', {
        method: 'POST',
        body: JSON.stringify({ subjectId: selectedSubject.id, dateKey: selectedDate, minutes }),
      });
      const saved = data.record;
      setRecords((prev) => {
        const exists = prev.some((r) => r.id === saved.id);
        return exists ? prev.map((r) => (r.id === saved.id ? saved : r)) : [...prev, saved];
      });
      setNotice(`Saved ${minutes} min to ${selectedSubject.name}`);
      refreshLeague();
    } catch (err) {
      showError(err);
    } finally {
      setSaving(false);
    }
  }

  async function updateRecord(id: string, newMinutes: number): Promise<boolean> {
    try {
      const data = await api<{ record: StudyRecord }>(`/api/study/records/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ minutes: newMinutes }),
      });
      setRecords((prev) => prev.map((r) => (r.id === id ? data.record : r)));
      refreshLeague();
      return true;
    } catch (err) {
      showError(err);
      return false;
    }
  }

  async function deleteRecord(id: string): Promise<boolean> {
    try {
      await api<{ ok: boolean }>(`/api/study/records/${id}`, { method: 'DELETE' });
      setRecords((prev) => prev.filter((r) => r.id !== id));
      refreshLeague();
      return true;
    } catch (err) {
      showError(err);
      return false;
    }
  }

  return (
    // Desktop: only the records list scrolls. Mobile: the whole page scrolls.
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:overflow-hidden">
      {/* Top: month controls and date strip */}
      <header className="shrink-0 px-4 pt-4 md:px-6">
        <MonthNavigator monthKey={monthKey} onPrevious={() => changeMonth(-1)} onNext={() => changeMonth(1)} />
        <div className="mt-3">
          <DateStrip monthKey={monthKey} selectedDate={selectedDate} todayDate={todayKey()} onSelect={setSelectedDate} />
        </div>
      </header>

      {notice && (
        <p role="status" className="mx-4 mt-2 rounded-lg bg-emerald-800 px-3 py-2 text-center text-xs font-bold text-amber-50 md:mx-6">
          {notice}
        </p>
      )}

      {/* Middle: records in the centre, subjects and quick actions on the right */}
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 md:p-6 lg:flex-row lg:overflow-hidden">
        {/* Mobile: extra bottom space keeps the last record clear of the pinned timer and the button */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col max-lg:pb-28">
          <StudyRecords
            dateKey={selectedDate}
            records={records}
            loading={loadingRecords}
            onUpdate={updateRecord}
            onDelete={deleteRecord}
          />

          {/* Timer: pinned to the bottom of the screen on mobile, bottom centre of the column on desktop */}
          {selectedSubject && (
            <div
              ref={timerRef}
              className="flex shrink-0 justify-center max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-30 max-lg:p-3 lg:mt-auto lg:pt-6"
            >
              <StudyTimer
                subjectName={selectedSubject.name}
                dateKey={selectedDate}
                minutes={minutes}
                saving={saving}
                onMinutesChange={setMinutes}
                onSave={saveTime}
                onClose={() => setSelectedSubjectId(null)}
                onRename={renameSubject}
                onDelete={deleteSubject}
              />
            </div>
          )}
        </div>

        {/* Right column: subject panel, then the open/close button and the quick-action dock at the bottom.
            On mobile the subject panel is a sheet covering 60% of the screen. The dock stays
            outside the sheet, so its Mood and Diary pop-ups still open full-page. */}
        <div className="flex w-full shrink-0 flex-col justify-end gap-3 lg:w-72">
          <div
            ref={sheetRef}
            id="subject-sheet"
            className={`flex flex-col transition-transform duration-300 max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-40 max-lg:h-[60vh] max-lg:rounded-t-2xl max-lg:bg-[#FDE68A] max-lg:p-3 max-lg:shadow-2xl dark:max-lg:bg-[#2a2308] max-lg:[&>section]:h-auto max-lg:[&>section]:min-h-0 max-lg:[&>section]:flex-1 lg:w-full ${
              sheetOpen ? 'max-lg:translate-y-0' : 'max-lg:invisible max-lg:translate-y-full'
            }`}
          >
            <SubjectPanel
              subjects={subjects}
              selectedSubjectId={selectedSubjectId}
              onSelect={chooseSubject}
              onAdd={addSubject}
            />
          </div>

          {/* Mobile only: opens and closes the subject panel. Sits above the dock when closed  */}
          <button
            ref={fabRef}
            type="button"
            onClick={() => setSheetOpen((open) => !open)}
            aria-expanded={sheetOpen}
            aria-controls="subject-sheet"
            aria-label={sheetOpen ? 'Close subjects' : 'Open subjects'}
            title={sheetOpen ? 'Close subjects' : 'Open subjects'}
            className={`flex h-12 w-12 items-center justify-center self-end rounded-full bg-[#047857] text-[#FFFBEB] shadow-lg transition hover:bg-[#065F46] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857] lg:hidden ${
              sheetOpen ? 'fixed bottom-[calc(60vh+0.5rem)] right-4 z-50' : ''
            }`}
          >
            {sheetOpen ? <X size={20} aria-hidden="true" /> : <ListChecks size={20} aria-hidden="true" />}
          </button>

          <div>
            <FloatingActionDock dateKey={selectedDate} />
          </div>
        </div>
      </div>
    </div>
  );
}