import { Clock3, Save } from "lucide-react";
import type { StudySubject } from "./study-types";

type Props = {
  subject: StudySubject;
  selectedDate: string;
  minutes: number;
  onMinutesChange: (minutes: number) => void;
  onSave: () => void;
};

function shortDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en", { day: "numeric", month: "short" }).toUpperCase();
}

export default function StudyTimer({ subject, selectedDate, minutes, onMinutesChange, onSave }: Props) {
  return (
    <section data-keep-timer-open className="absolute bottom-4 left-1/2 z-20 w-[min(30rem,calc(100%-1.5rem))] -translate-x-1/2 rounded-2xl border-2 border-emerald-400 bg-gradient-to-r from-[#075b37] to-[#06361f] p-3 text-white shadow-[0_0_28px_rgba(16,185,129,0.35)] sm:px-4">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1 border-r border-white/15 pr-3">
          <p className="text-[9px] font-bold uppercase tracking-wide text-emerald-300">{shortDate(selectedDate)}</p>
          <p className="truncate text-sm font-bold">{subject.name}</p>
        </div>
        <Clock3 className="hidden h-4 w-4 text-emerald-300 sm:block" />
        <input type="range" min={0} max={180} step={5} value={Math.min(minutes, 180)} onChange={(event) => onMinutesChange(Number(event.target.value))} aria-label="Study minutes slider" className="hidden w-24 accent-emerald-400 sm:block" />
        <label className="flex items-center gap-1 rounded-lg border border-emerald-500 bg-black/20 px-2 py-1.5">
          <input type="number" min={0} max={1440} value={minutes} onChange={(event) => onMinutesChange(Number(event.target.value))} aria-label="Study duration in minutes" className="w-10 bg-transparent text-center text-sm font-bold text-emerald-300 outline-none" />
          <span className="text-[10px] text-emerald-200">min</span>
        </label>
        <button type="button" onClick={onSave} disabled={!Number.isInteger(minutes) || minutes <= 0} className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-black text-[#052d1b] shadow hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40">
          <Save className="h-3.5 w-3.5 sm:hidden" /><span>SAVE</span>
        </button>
      </div>
    </section>
  );
}
