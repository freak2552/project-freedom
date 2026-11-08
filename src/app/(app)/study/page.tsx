'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
  const [monthKey, setMonthKey] = useState(() => currentMonthKey());
  const [selectedDate, setSelectedDate] = useState(() => todayKey());
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [minutes, setMinutes] = useState(30);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const subjectPanelRef = useRef<HTMLElement>(null);
  const timerRef = useRef<HTMLDivElement>(null);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) ?? null;

  const showError = useCallback((err: unknown) => {
    setNotice(err instanceof Error ? err.message : 'Something went wrong');
  }, []);

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

  // Clicking free space outside the subject panel and the timer closes the timer.
  useEffect(() => {
    if (!selectedSubjectId) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (subjectPanelRef.current?.contains(target) || timerRef.current?.contains(target)) return;
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

  function goToToday() {
    setMonthKey(currentMonthKey());
    setSelectedDate(todayKey());
  }

  async function addSubject(name: string): Promise<boolean> {
    try {
      const data = await api<{ subject: Subject }>('/api/subjects', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      setSubjects((prev) => [...prev, data.subject].sort((a, b) => a.name.localeCompare(b.name)));
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
      return true;
    } catch (err) {
      showError(err);
      return false;
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      {/* Top: month controls, date strip, quick actions */}
      <header className="shrink-0 px-4 pt-4 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <MonthNavigator monthKey={monthKey} onPrevious={() => changeMonth(-1)} onNext={() => changeMonth(1)} />
          <FloatingActionDock timerOpen={!!selectedSubject} onGoToToday={goToToday} onCloseTimer={() => setSelectedSubjectId(null)} />
        </div>
        <div className="mt-3">
          <DateStrip monthKey={monthKey} selectedDate={selectedDate} todayDate={todayKey()} onSelect={setSelectedDate} />
        </div>
      </header>

      {notice && (
        <p role="status" className="mx-4 mt-2 rounded-lg bg-emerald-800 px-3 py-2 text-center text-xs font-bold text-amber-50 md:mx-6">
          {notice}
        </p>
      )}

      {/* Middle: records in the centre, subjects on the right (below on narrow screens) */}
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 md:p-6 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col">
          <StudyRecords
            dateKey={selectedDate}
            records={records}
            loading={loadingRecords}
            onUpdate={updateRecord}
            onDelete={deleteRecord}
          />

          {/* Timer appears near the bottom centre when a subject is selected */}
          {selectedSubject && (
            <div ref={timerRef} className="mt-auto flex justify-center pt-6">
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

        <div className="w-full shrink-0 lg:w-72">
          <SubjectPanel
            ref={subjectPanelRef}
            subjects={subjects}
            selectedSubjectId={selectedSubjectId}
            onSelect={(id) => setSelectedSubjectId(id)}
            onAdd={addSubject}
          />
        </div>
      </div>
    </div>
  );
}
