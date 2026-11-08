'use client';

import { useEffect, useRef } from 'react';
import { dayKeysOfMonth } from '@/lib/dates';

type DateStripProps = {
  monthKey: string;
  selectedDate: string;
  todayDate: string;
  onSelect: (dateKey: string) => void;
};

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function weekdayOf(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

// Horizontally scrollable row of every day in the month. The selected day is green.
export function DateStrip({ monthKey, selectedDate, todayDate, onSelect }: DateStripProps) {
  const selectedRef = useRef<HTMLButtonElement>(null);
  const days = dayKeysOfMonth(monthKey);

  // Keep the selected date in view when it changes.
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [selectedDate]);

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div role="listbox" aria-label="Choose a date" className="flex w-max gap-1.5">
        {days.map((dateKey) => {
          const isSelected = dateKey === selectedDate;
          const isToday = dateKey === todayDate;
          return (
            <button
              key={dateKey}
              ref={isSelected ? selectedRef : undefined}
              type="button"
              role="option"
              aria-selected={isSelected}
              aria-current={isToday ? 'date' : undefined}
              onClick={() => onSelect(dateKey)}
              className={`flex h-[42px] w-10 shrink-0 flex-col items-center justify-center rounded-md border text-[9px] font-bold leading-tight transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857] ${
                isSelected
                  ? 'border-[#065F46] bg-[#047857] text-[#FFFBEB] shadow-md shadow-emerald-900/30 dark:border-emerald-500 dark:bg-emerald-600'
                  : 'border-[#F59E0B] bg-[#FCD34D] text-[#78350F] hover:bg-[#FBBF24] dark:border-amber-800 dark:bg-amber-900/70 dark:text-amber-100 dark:hover:bg-amber-800'
              } ${isToday && !isSelected ? 'ring-2 ring-[#047857]/60 ring-offset-1 ring-offset-[#FEF3C7] dark:ring-offset-[#1c1708]' : ''}`}
            >
              <span>{weekdayOf(dateKey)}</span>
              <span className="text-[13px] font-extrabold">{Number(dateKey.slice(8))}</span>
            </button>
          );
        })}
      </div> 
    </div>
  );
}
