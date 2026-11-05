"use client";

import { useState, type FormEvent } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import type { StudySubject } from "./study-types";

type Props = {
  subjects: StudySubject[];
  selectedSubjectId: string | null;
  onSelect: (subject: StudySubject) => void;
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
};

export default function SubjectPanel({ subjects, selectedSubjectId, onSelect, onAdd, onRename, onDelete }: Props) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  function addSubject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;
    onAdd(name);
    setNewName("");
  }

  function saveName(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const name = editName.trim();
    if (name) onRename(id, name);
    setEditingId(null);
  }

  return (
    <aside data-keep-timer-open className="flex min-h-[16rem] flex-col rounded-xl border border-[#d9b855] bg-[#f8df89] p-3 lg:min-h-0">
      <form onSubmit={addSubject} className="flex gap-2">
        <input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="New subject" aria-label="New subject name" maxLength={40} className="min-w-0 flex-1 rounded-lg border border-[#d8bd62] bg-[#fffaf0] px-3 py-2 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#3e8ca0]" />
        <button type="submit" disabled={!newName.trim()} aria-label="Add subject" className="rounded-lg bg-[#3e8ca0] px-3 text-white shadow-sm hover:bg-[#327385] disabled:opacity-40"><Plus className="h-5 w-5" /></button>
      </form>

      <h2 className="mt-3 border-b border-emerald-800/20 pb-1 text-sm font-bold text-green-800">Subjects</h2>
      <ul className="mt-2 flex-1 space-y-1 overflow-y-auto">
        {subjects.length === 0 && <li className="py-5 text-center text-xs text-gray-500">Add a subject to start.</li>}
        {subjects.map((subject) => {
          const selected = selectedSubjectId === subject.id;
          return (
            <li key={subject.id} className={"rounded-lg border bg-[#fff5d0]/80 transition " + (selected ? "border-emerald-600 ring-1 ring-emerald-400" : "border-transparent hover:border-[#d9b855]")}>
              {editingId === subject.id ? (
                <form onSubmit={(event) => saveName(event, subject.id)} className="flex items-center gap-1 p-1.5">
                  <input autoFocus value={editName} onChange={(event) => setEditName(event.target.value)} maxLength={40} aria-label="Edit subject name" className="min-w-0 flex-1 rounded-md border border-[#d8bd62] bg-white px-2 py-1.5 text-sm outline-none focus:border-[#3e8ca0]" />
                  <button type="submit" aria-label="Save subject name" className="rounded-md bg-emerald-100 p-1.5 text-emerald-800 hover:bg-emerald-200"><Check className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setEditingId(null)} aria-label="Cancel edit" className="rounded-md bg-gray-100 p-1.5 text-gray-600 hover:bg-gray-200"><X className="h-4 w-4" /></button>
                </form>
              ) : (
                <div className="flex items-center gap-1 p-1">
                  <button type="button" onClick={() => onSelect(subject)} aria-pressed={selected} className="min-w-0 flex-1 truncate rounded-md px-2 py-2 text-left text-sm font-semibold text-[#293b45] hover:bg-white/60">{subject.name}</button>
                  <button type="button" onClick={() => { setEditingId(subject.id); setEditName(subject.name); }} title="Edit subject name" aria-label={"Edit " + subject.name} className="rounded-md p-1.5 text-[#3e8ca0] hover:bg-sky-100"><Pencil className="h-4 w-4" /></button>
                  <button type="button" onClick={() => { if (window.confirm("Remove this subject? Existing study records will be kept.")) onDelete(subject.id); }} title="Delete subject" aria-label={"Delete " + subject.name} className="rounded-md p-1.5 text-red-600 hover:bg-red-100"><Trash2 className="h-4 w-4" /></button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
