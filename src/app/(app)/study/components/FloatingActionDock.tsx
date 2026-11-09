'use client';

import { useState } from 'react';
import { BookOpen, Smile, type LucideIcon } from 'lucide-react';
import { DiaryPanel } from './DiaryPanel';
import { MoodPanel } from './MoodPanel';

type ActionId = 'mood' | 'diary';

type ActionItem = {
  id: ActionId;
  label: string;
  icon: LucideIcon;
  tone: 'violet' | 'amber';
};

// Add a new quick action here, and its panel below.
const ACTIONS: ActionItem[] = [
  { id: 'mood', label: 'Mood', icon: Smile, tone: 'violet' },
  { id: 'diary', label: 'Diary', icon: BookOpen, tone: 'amber' },
];

type FloatingActionDockProps = {
  dateKey: string;
};

// Its own container below the subject panel. Each button opens its pop-up in the centre of the window.
export function FloatingActionDock({ dateKey }: FloatingActionDockProps) {
  const [openId, setOpenId] = useState<ActionId | null>(null);

  return (
    <>
      <div className="w-full rounded-2xl border border-[#F59E0B]/50 bg-[#FDE68A] p-2 shadow-md shadow-amber-900/10 dark:border-amber-800 dark:bg-[#2a2308]">
        <div role="toolbar" aria-label="Quick actions" className="flex w-full items-center gap-2">
          {ACTIONS.map(({ id, label, icon: Icon, tone }) => (
            <button
              key={id}
              type="button"
              aria-label={label}
              aria-expanded={openId === id}
              title={label}
              onClick={() => setOpenId(id)}
              className={`flex h-11 flex-1 items-center justify-center rounded-xl text-white shadow-md shadow-black/15 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857] ${
                tone === 'violet' ? 'bg-[#8B5CF6] hover:bg-[#7C3AED]' : 'bg-[#F59E0B] hover:bg-[#D97706]'
              }`}
            >
              <Icon size={18} aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      <MoodPanel dateKey={dateKey} open={openId === 'mood'} onClose={() => setOpenId(null)} />
      <DiaryPanel dateKey={dateKey} open={openId === 'diary'} onClose={() => setOpenId(null)} />
    </>
  );
}
