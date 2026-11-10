export type Habit = { id: string; name: string };

export type HabitColor = 'green' | 'yellow' | 'red' | 'blue' | 'black';

// Full class names so Tailwind picks them up.
export const COLOR_OPTIONS: { id: HabitColor; name: string; bg: string; text: string }[] = [
  { id: 'green', name: 'Completed', bg: 'bg-emerald-500', text: 'text-white' },
  { id: 'yellow', name: 'Partial', bg: 'bg-amber-400', text: 'text-amber-950' },
  { id: 'red', name: 'Missed', bg: 'bg-rose-500', text: 'text-white' },
  { id: 'blue', name: 'Rest / Extra', bg: 'bg-sky-500', text: 'text-white' },
  { id: 'black', name: 'Skipped', bg: 'bg-zinc-900', text: 'text-white' },
];

// Marks are keyed by "habitId_YYYY-MM-DD".
export type LogMap = Record<string, HabitColor>;

export const logKey = (habitId: string, dateKey: string) => `${habitId}_${dateKey}`;

export const dayNumber = (dateKey: string) => Number(dateKey.slice(-2));
