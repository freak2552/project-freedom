import { CalendarDays, X } from "lucide-react";

type Props = {
  onToday: () => void;
  onCloseTimer: () => void;
  timerOpen: boolean;
};

export default function FloatingActionDock({ onToday, onCloseTimer, timerOpen }: Props) {
  return (
    <div className="fixed bottom-24 right-4 z-30 flex flex-col gap-2 sm:bottom-5" aria-label="Quick study actions">
      <button type="button" onClick={onToday} title="Go to today" aria-label="Go to today" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d8bd62] bg-[#fff4c8] text-[#3e8ca0] shadow-md transition hover:-translate-y-0.5 hover:bg-white">
        <CalendarDays className="h-4 w-4" />
      </button>
      {timerOpen && (
        <button type="button" onClick={onCloseTimer} title="Close study timer" aria-label="Close study timer" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d98c36] text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#c5792b]">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
