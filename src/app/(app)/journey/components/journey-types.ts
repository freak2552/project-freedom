import { BookOpen, Compass, Heart, RotateCcw, Zap, type LucideIcon } from 'lucide-react';

export type JourneyType = 'general' | 'study' | 'life' | 'habit' | 'health';

export type JourneyEntry = { id: string; date: string; content: string };

export type Journey = {
  id: string;
  name: string;
  description: string;
  type: JourneyType;
  entries: JourneyEntry[];
};

// Full class names so Tailwind picks them up.
export const JOURNEY_TYPES: { id: JourneyType; label: string; icon: LucideIcon; bg: string; iconBg: string }[] = [
  { id: 'general', label: 'General', icon: Compass, bg: 'bg-cyan-300', iconBg: 'bg-cyan-100' },
  { id: 'study', label: 'Study', icon: BookOpen, bg: 'bg-yellow-300', iconBg: 'bg-yellow-100' },
  { id: 'life', label: 'Life', icon: Zap, bg: 'bg-fuchsia-300', iconBg: 'bg-fuchsia-100' },
  { id: 'habit', label: 'Habit', icon: RotateCcw, bg: 'bg-violet-300', iconBg: 'bg-violet-100' },
  { id: 'health', label: 'Health', icon: Heart, bg: 'bg-emerald-300', iconBg: 'bg-emerald-100' },
];

export function typeConfig(id: JourneyType) {
  return JOURNEY_TYPES.find((t) => t.id === id) ?? JOURNEY_TYPES[0];
}

// Shared input style: thick comic border, works in light and dark mode.
export const INPUT_CLASS =
  'w-full rounded-2xl border-4 border-slate-900 bg-slate-50 p-3 font-bold text-slate-900 placeholder-slate-400 outline-none focus:border-rose-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-rose-400';
