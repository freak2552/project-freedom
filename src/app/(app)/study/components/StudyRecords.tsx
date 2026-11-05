"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Check, Clock3, Pencil, Trash2, X } from "lucide-react";
import type { StudyRecord } from "./study-types";

type Props = {
  selectedDate: string;
  records: StudyRecord[];
  onEdit: (id: string, minutes: number) => void;
  onDelete: (id: string) => void;
};

function displayDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en", { day: "numeric", month: "long" });
}

export default function StudyRecords({ selectedDate, records, onEdit, onDelete }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [minutesValue, setMinutesValue] = useState("");
  const totalMinutes = useMemo(() => records.reduce((sum, record) => sum + record.minutes, 0), [records]);

  function beginEdit(record: StudyRecord) {
    setEditingId(record.id);
    setMinutesValue(String(record.minutes));
  }

  function saveEdit(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const value = Number(minutesValue);
    if (Number.isInteger(value) && value > 0 && value <= 1440) {
      onEdit(id, value);
      setEditingId(null);
    }
  }

  return (
    <section className="relative flex min-h-[19rem] flex-1 flex-col rounded-xl border border-[#e0c465] bg-[#fce598]/75 px-4 py-4 sm:px-6" aria-labelledby="study-records-title">
      <div className="text-center">
        <h2 id="study-records-title" className="inline-block border-b border-[#b58c37] pb-1 text-lg font-bold text-[#253541]">Records for {displayDate(selectedDate)}</h2>
        <p className="mx-auto mt-2 inline-flex items-center gap-1 rounded-full border border-[#d8bd62] bg-[#fff8dc] px-4 py-2 text-[11px] font-semibold text-gray-700 shadow-sm">
          <span>Total Studied Today:</span><span className="font-black text-green-700">{(totalMinutes / 60).toFixed(1)} Hrs</span>
        </p>
      </div>

      {records.length === 0 ? (
        <div className="mx-auto mt-4 w-full max-w-sm rounded-lg border border-dashed border-[#d6b84e] bg-[#fff3ca]/70 px-4 py-6 text-center text-xs text-gray-500">
          No subjects logged for this day.
        </div>
      ) : (
        <ul className="mx-auto mt-4 w-full max-w-2xl space-y-2">
          {records.map((record) => (
            <li key={record.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-[#ddc36c] bg-[#fff7d7] px-3 py-2.5 shadow-sm">
              <span className="min-w-0 flex-1 truncate text-sm font-bold text-[#253541]">{record.subjectName}</span>
              {editingId === record.id ? (
                <form onSubmit={(event) => saveEdit(event, record.id)} className="flex items-center gap-1.5">
                  <input type="number" min={1} max={1440} required value={minutesValue} onChange={(event) => setMinutesValue(event.target.value)} aria-label={"Minutes for " + record.subjectName} className="w-20 rounded-md border border-[#d8bd62] bg-white px-2 py-1.5 text-sm outline-none focus:border-[#3e8ca0]" />
                  <span className="text-xs text-gray-500">min</span>
                  <button type="submit" aria-label="Save record time" className="rounded-md bg-emerald-100 p-1.5 text-emerald-800 hover:bg-emerald-200"><Check className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setEditingId(null)} aria-label="Cancel edit" className="rounded-md bg-gray-100 p-1.5 text-gray-600 hover:bg-gray-200"><X className="h-4 w-4" /></button>
                </form>
              ) : (
                <>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-800"><Clock3 className="h-4 w-4" />{record.minutes} min</span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => beginEdit(record)} aria-label={"Edit time for " + record.subjectName} title="Edit time" className="rounded-md p-1.5 text-[#3e8ca0] hover:bg-sky-100"><Pencil className="h-4 w-4" /></button>
                    <button type="button" onClick={() => { if (window.confirm("Delete this study record?")) onDelete(record.id); }} aria-label={"Delete record for " + record.subjectName} title="Delete record" className="rounded-md p-1.5 text-red-600 hover:bg-red-100"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
