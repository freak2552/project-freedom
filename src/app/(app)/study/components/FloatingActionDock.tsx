'use client';

import { useState } from 'react';
import { BookOpen, Frown, Laugh, Meh, Moon, Smile, X } from 'lucide-react';
import type { Mood } from './study-types';

const MOODS: { value: Mood; label: string; icon: React.ReactNode }[] = [
  { value: 'great', label: 'Great', icon: <Laugh size={18} aria-hidden="true" /> },
  { value: 'good', label: 'Good', icon: <Smile size={18} aria-hidden="true" /> },
  { value: 'okay', label: 'Okay', icon: <Meh size={18} aria-hidden="true" /> },
  { value: 'low', label: 'Low', icon: <Frown size={18} aria-hidden="true" /> },
  { value: 'tired', label: 'Tired', icon: <Moon size={18} aria-hidden="true" /> },
];

type FloatingActionDockProps = {
  dateKey: string;
  diaryText?: string;
  mood?: Mood | null;
  onSaveDiary?: (text: string) => void;
  onSaveMood?: (mood: Mood, note: string) => void;
};

// Bottom-right round buttons: mood (emotion) and diary for the selected date.
// Each opens a small pop-up above the button.
export function FloatingActionDock({ dateKey, diaryText = '', mood = null, onSaveDiary, onSaveMood }: FloatingActionDockProps) {
  const [open, setOpen] = useState<null | 'diary' | 'mood'>(null);
  const [draftDiary, setDraftDiary] = useState(diaryText);
  const [draftMood, setDraftMood] = useState<Mood | null>(mood);

  function toggle(panel: 'diary' | 'mood') {
    setOpen((current) => (current === panel ? null : panel));
    setDraftDiary(diaryText);
    setDraftMood(mood);
  }

  return (
    <div className="pointer-events-none absolute bottom-4 right-4 z-20 flex flex-col items-end gap-3">
      {open === 'diary' && (
        <Popup title={`Diary · ${dateKey}`} onClose={() => setOpen(null)}>
          <textarea
            value={draftDiary}
            onChange={(e) => setDraftDiary(e.target.value)}
            rows={5}
            placeholder="How did the day go?"
            aria-label="Diary entry"
            className="w-full resize-none rounded-lg border border-[#F59E0B] bg-white p-2 text-sm text-[#064E3B] dark:border-amber-700 dark:bg-amber-950/70 dark:text-amber-50"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                onSaveDiary?.(draftDiary);
                setOpen(null);
              }}
              className="rounded-lg bg-[#047857] px-3 py-2 text-xs font-bold text-[#FFFBEB] hover:bg-[#065F46]"
            >
              Save diary
            </button>
          </div>
        </Popup>
      )}

      {open === 'mood' && (
        <Popup title={`How are you feeling? · ${dateKey}`} onClose={() => setOpen(null)}>
          <div role="radiogroup" aria-label="Mood" className="grid grid-cols-5 gap-1.5">
            {MOODS.map((m) => {
              const selected = draftMood === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setDraftMood(m.value)}
                  className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[10px] font-bold transition ${
                    selected
                      ? 'border-[#047857] bg-[#047857] text-[#FFFBEB]'
                      : 'border-[#F59E0B]/60 bg-[#FFFBEB] text-[#064E3B] hover:bg-[#FCD34D] dark:border-amber-700 dark:bg-amber-950/70 dark:text-amber-100'
                  }`}
                >
                  {m.icon}
                  {m.label}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              disabled={!draftMood}
              onClick={() => {
                if (draftMood) onSaveMood?.(draftMood, '');
                setOpen(null);
              }}
              className="rounded-lg bg-[#047857] px-3 py-2 text-xs font-bold text-[#FFFBEB] hover:bg-[#065F46] disabled:opacity-50"
            >
              Save mood
            </button>
          </div>
        </Popup>
      )}

      <div className="pointer-events-auto flex items-center gap-3">
        <RoundButton label="Mood" tone="violet" active={open === 'mood'} onClick={() => toggle('mood')}>
          <Smile size={18} aria-hidden="true" />
        </RoundButton>
        <RoundButton label="Diary" tone="amber" active={open === 'diary'} onClick={() => toggle('diary')}>
          <BookOpen size={18} aria-hidden="true" />
        </RoundButton>
      </div>
    </div>
  );
}

function RoundButton({
  label,
  tone,
  active,
  onClick,
  children,
}: {
  label: string;
  tone: 'violet' | 'amber';
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const color = tone === 'violet' ? 'bg-[#8B5CF6] hover:bg-[#7C3AED]' : 'bg-[#F59E0B] hover:bg-[#D97706]';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={active}
      title={label}
      className={`flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg shadow-black/20 ring-2 ring-[#FFFBEB] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857] dark:ring-amber-950 ${color} ${
        active ? 'scale-105' : ''
      }`}
    >
      {children}
    </button>
  );
}

function Popup({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      role="dialog"
      aria-label={title}
      className="timer-enter w-72 rounded-xl border border-[#F59E0B]/70 bg-[#FFFBEB] p-3 shadow-xl dark:border-amber-700 dark:bg-amber-950"
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-extrabold text-[#064E3B] dark:text-amber-100">{title}</p>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-[#065F46] hover:bg-[#FDE68A] dark:text-amber-100 dark:hover:bg-amber-900">
          <X size={14} aria-hidden="true" />
        </button>
      </div>
      {children}
    </div>
  );
}
