import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  month: Date;
  onPrevious: () => void;
  onNext: () => void;
};

export default function MonthNavigator({ month, onPrevious, onNext }: Props) {
  return (
    <header className="flex h-10 shrink-0 items-center justify-between border-b border-[#d7bd60] px-1">
      <h1 className="text-sm font-bold text-[#253541]">
        {month.toLocaleDateString("en", { month: "long", year: "numeric" })}
      </h1>
      <div className="flex gap-1.5">
        <button type="button" onClick={onPrevious} aria-label="Previous month" className="rounded-lg border border-[#d8bd62] bg-[#fff4c8] p-1.5 text-[#253541] hover:bg-white">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button type="button" onClick={onNext} aria-label="Next month" className="rounded-lg border border-[#d8bd62] bg-[#fff4c8] p-1.5 text-[#253541] hover:bg-white">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
