import { Trophy } from 'lucide-react';
import type { ReportCard as ReportCardData } from '@/lib/report';

// Minimal card shown in the list. Click it to open the detail view.
export function ReportCard({ card, onOpen }: { card: ReportCardData; onOpen: () => void }) {
  const best = card.bestHabits[0];
  const bestNames = card.bestHabits.map((h) => h.name).join(' & ');

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full flex-col gap-3 rounded-2xl border border-[#F59E0B]/70 bg-[#FFFBEB] p-4 text-left shadow-sm transition hover:bg-[#FDE68A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857] dark:border-amber-700 dark:bg-amber-950 dark:hover:bg-amber-900"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 truncate text-sm font-extrabold text-[#064E3B] dark:text-amber-50">{card.name}</p>
        <span className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
          <Trophy size={12} aria-hidden="true" />
          {card.league.name}
        </span>
      </div>

      <p className="text-2xl font-extrabold text-[#064E3B] dark:text-amber-50">{card.studiedHours.toFixed(1)} h</p>

      <p className="truncate text-xs text-stone-600 dark:text-stone-400">
        {best ? (
          <>
            Best habit: {bestNames} · {best.days}/{best.totalDays} days
          </>
        ) : (
          'No habit marks this month'
        )}
      </p>
    </button>
  );
}
