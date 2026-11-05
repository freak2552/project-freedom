import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  month: Date;
  selectedDate: string;
  onSelect: (dateKey: string) => void;
};

function dateKey(date: Date) {
  return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
}

export default function DateStrip({ month, selectedDate, onSelect }: Props) {
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  return (
    <section className="shrink-0 border-b border-[#d7bd60] pb-2" aria-label="Choose a study date">
      <div className="flex gap-2 overflow-x-auto px-1 py-2">
        {Array.from({ length: days }, (_, index) => {
          const date = new Date(month.getFullYear(), month.getMonth(), index + 1);
          const key = dateKey(date);
          const active = key === selectedDate;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              aria-pressed={active}
              className={"flex h-11 min-w-10 shrink-0 flex-col items-center justify-center rounded-lg border px-2 shadow-sm transition " + (active ? "border-emerald-700 bg-gradient-to-b from-emerald-500 to-emerald-700 text-white" : "border-[#d8a345] bg-gradient-to-b from-[#f4c45f] to-[#e3a43d] text-[#29343d] hover:brightness-105")}
            >
              <span className="text-[8px] font-semibold uppercase">{date.toLocaleDateString("en", { weekday: "short" })}</span>
              <span className="text-sm font-black leading-4">{date.getDate()}</span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2 px-1 text-gray-500" aria-hidden="true">
        <ChevronLeft className="h-3 w-3 shrink-0" />
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-300"><div className="h-full w-3/4 rounded-full bg-gray-500" /></div>
        <ChevronRight className="h-3 w-3 shrink-0" />
      </div>
    </section>
  );
}
