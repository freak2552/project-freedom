"use client";

import { useMemo, useState, type MouseEvent } from "react";
import DateStrip from "./components/DateStrip";
import FloatingActionDock from "./components/FloatingActionDock";
import MonthNavigator from "./components/MonthNavigator";
import StudyRecords from "./components/StudyRecords";
import StudyTimer from "./components/StudyTimer";
import SubjectPanel from "./components/SubjectPanel";
import type { StudyRecord, StudySubject } from "./components/study-types";

function makeDateKey(date: Date) {
  return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
}

function parseDateKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export default function StudyPage() {
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => makeDateKey(new Date()));
  const [subjects, setSubjects] = useState<StudySubject[]>([
    { id: "math", name: "MATH" },
    { id: "history", name: "HISTORY" },
    { id: "physics", name: "PHYSICS" },
    { id: "chemistry", name: "CHEMISTRY" },
    { id: "biology", name: "BIOLOGY" },
  ]);
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [studyMinutes, setStudyMinutes] = useState(0);
  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId) ?? null;
  const dayRecords = useMemo(() => records.filter((record) => record.date === selectedDate), [records, selectedDate]);

  function changeMonth(offset: number) {
    const nextMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + offset, 1);
    setViewMonth(nextMonth);
    setSelectedDate(makeDateKey(nextMonth));
  }

  function addSubject(name: string) {
    if (subjects.some((subject) => subject.name.toLowerCase() === name.toLowerCase())) {
      window.alert("That subject already exists.");
      return;
    }
    setSubjects((current) => [...current, { id: String(Date.now()) + Math.random().toString(36).slice(2, 7), name: name.trim().toUpperCase() }]);
  }

  function renameSubject(id: string, name: string) {
    const cleanName = name.trim().toUpperCase();
    setSubjects((current) => current.map((subject) => subject.id === id ? { ...subject, name: cleanName } : subject));
    setRecords((current) => current.map((record) => record.subjectId === id ? { ...record, subjectName: cleanName } : record));
  }

  function deleteSubject(id: string) {
    setSubjects((current) => current.filter((subject) => subject.id !== id));
    if (selectedSubjectId === id) setSelectedSubjectId(null);
  }

  function saveStudyTime() {
    if (!selectedSubject || !Number.isInteger(studyMinutes) || studyMinutes <= 0) return;
    setRecords((current) => {
      const existing = current.find((record) => record.date === selectedDate && record.subjectId === selectedSubject.id);
      if (existing) {
        return current.map((record) => record.id === existing.id ? { ...record, minutes: record.minutes + studyMinutes } : record);
      }
      return [...current, {
        id: String(Date.now()) + Math.random().toString(36).slice(2, 7),
        subjectId: selectedSubject.id,
        subjectName: selectedSubject.name,
        date: selectedDate,
        minutes: studyMinutes,
      }];
    });
    setStudyMinutes(0);
  }

  function closeTimerWhenClickingFreeArea(event: MouseEvent<HTMLElement>) {
    const target = event.target as HTMLElement;
    if (!target.closest("[data-keep-timer-open]")) setSelectedSubjectId(null);
  }

  function goToToday() {
    const today = new Date();
    setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(makeDateKey(today));
  }

  return (
    <div className="relative flex min-h-[calc(100dvh-3.5rem)] flex-col gap-2 overflow-hidden bg-[#fce598] p-3 md:min-h-dvh" onClickCapture={closeTimerWhenClickingFreeArea}>
      <MonthNavigator month={viewMonth} onPrevious={() => changeMonth(-1)} onNext={() => changeMonth(1)} />
      <DateStrip month={viewMonth} selectedDate={selectedDate} onSelect={setSelectedDate} />
      <div className="grid min-h-0 flex-1 gap-3 pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(250px,22vw)] lg:pb-20">
        <StudyRecords
          selectedDate={selectedDate}
          records={dayRecords}
          onEdit={(id, minutes) => setRecords((current) => current.map((record) => record.id === id ? { ...record, minutes } : record))}
          onDelete={(id) => setRecords((current) => current.filter((record) => record.id !== id))}
        />
        <SubjectPanel
          subjects={subjects}
          selectedSubjectId={selectedSubjectId}
          onSelect={(subject) => { setSelectedSubjectId(subject.id); setStudyMinutes(0); }}
          onAdd={addSubject}
          onRename={renameSubject}
          onDelete={deleteSubject}
        />
      </div>
      {selectedSubject && <StudyTimer subject={selectedSubject} selectedDate={selectedDate} minutes={studyMinutes} onMinutesChange={setStudyMinutes} onSave={saveStudyTime} />}
      <FloatingActionDock onToday={goToToday} onCloseTimer={() => setSelectedSubjectId(null)} timerOpen={Boolean(selectedSubject)} />
    </div>
  );
}
