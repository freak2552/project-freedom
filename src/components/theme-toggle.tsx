'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme, type Theme } from '@/components/theme-provider';

const OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun size={15} aria-hidden="true" /> },
  { value: 'dark', label: 'Dark', icon: <Moon size={15} aria-hidden="true" /> },
];

// Light / Dark choice for the app. Lives in Settings only.
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold text-[#064E3B] dark:text-amber-100">Appearance</span>
      <div role="radiogroup" aria-label="Appearance" className="inline-flex w-fit rounded-xl border border-[#F59E0B]/60 bg-[#FFFBEB] p-1 dark:border-amber-700 dark:bg-amber-950/70">
        {OPTIONS.map((option) => {
          const selected = theme === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setTheme(option.value)}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                selected
                  ? 'bg-[#047857] text-[#FFFBEB]'
                  : 'text-[#065F46] hover:bg-[#FDE68A] dark:text-amber-100 dark:hover:bg-amber-900'
              }`}
            >
              {option.icon}
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
