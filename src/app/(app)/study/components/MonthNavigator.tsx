import { ChevronLeft, ChevronRight } from 'lucide-react';
import { monthLabel } from '@/lib/dates';

type MonthNavigatorProps = {
  monthKey: string;
  onPrevious: () => void;
  onNext: () => void;
};

const arrowClass =
  'flex h-7 w-7 items-center justify-center rounded-md border border-[#F59E0B]/60 bg-[#FFFBEB] text-[#065F46] shadow-sm transition hover:bg-[#FDE68A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857] dark:border-amber-700 dark:bg-amber-950/70 dark:text-amber-100 dark:hover:bg-amber-900';

// Month label on the left, previous/next arrows on the right.
export function MonthNavigator({ monthKey, onPrevious, onNext }: MonthNavigatorProps) {
  return (
    <div className="flex w-full items-center justify-between">
      <h1 className="text-sm font-extrabold text-[#064E3B] dark:text-amber-50">{monthLabel(monthKey)}</h1>
      <div className="flex gap-1.5">
        <button type="button" onClick={onPrevious} aria-label="Previous month" className={arrowClass}>
          <ChevronLeft size={15} aria-hidden="true" />
        </button>
        <button type="button" onClick={onNext} aria-label="Next month" className={arrowClass}>
          <ChevronRight size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
