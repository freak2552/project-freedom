'use client';

import { COLOR_OPTIONS, dayNumber, logKey, type Habit, type LogMap } from './habit-types';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type HabitCardProps = {
  habit: Habit;
  dayKeys: string[];
  firstWeekday: number;
  logs: LogMap;
  onCellClick: (habitId: string, dateKey: string, rect: DOMRect) => void;
};

// One habit with its month grid. Used in the desktop grid and the mobile carousel.
export function HabitCard({ habit, dayKeys, firstWeekday, logs, onCellClick }: HabitCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-black/75 p-5 shadow-2xl backdrop-blur-xl transition-all hover:border-white/20 dark:border-amber-800/60 dark:bg-amber-950/85">
      <div className="mb-3 border-b border-white/10 pb-3">
        <h3 className="truncate text-base font-extrabold tracking-wide text-white">{habit.name}</h3>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1.5 text-center">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="text-[10px] font-bold text-gray-400">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: firstWeekday }, (_, i) => (
          <div key={`pad-${i}`} className="aspect-square" />
        ))}

        {dayKeys.map((dateKey) => {
          const color = logs[logKey(habit.id, dateKey)];
          const option = COLOR_OPTIONS.find((c) => c.id === color);
          return (
            <button
              key={dateKey}
              type="button"
              onClick={(e) => onCellClick(habit.id, dateKey, e.currentTarget.getBoundingClientRect())}
              aria-label={`${habit.name}, day ${dayNumber(dateKey)}${option ? `, ${option.name}` : ''}`}
              className={`flex aspect-square items-center justify-center rounded-lg border border-white/10 text-xs font-bold transition-all duration-150 ${
                option ? `${option.bg} ${option.text}` : 'bg-white/10 text-white/90 hover:bg-white/20'
              }`}
            >
              {dayNumber(dateKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
