'use client';

import { X } from 'lucide-react';
import { COLOR_OPTIONS, type HabitColor } from './habit-types';

export type PickerTarget = { habitId: string; dateKey: string; rect: DOMRect };

type ColorPickerProps = {
  target: PickerTarget;
  current: HabitColor | undefined;
  mobile: boolean;
  onPick: (color: HabitColor | null) => void;
  onClose: () => void;
};

// Desktop: small popover above the day, as in the old app.
// Mobile: a sheet centred at the bottom of the screen, easier to tap.
export function ColorPicker({ target, current, mobile, onPick, onClose }: ColorPickerProps) {
  const style = mobile
    ? undefined
    : {
        top: target.rect.top - 60,
        left: Math.min(Math.max(target.rect.left - 80, 10), window.innerWidth - 220),
      };
  const size = mobile ? 'h-11 w-11' : 'h-8 w-8';

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        role="dialog"
        aria-label="Mark day"
        style={style}
        className={`fixed z-50 flex items-center gap-2 rounded-2xl border border-white/20 bg-gray-900/95 p-2.5 shadow-2xl backdrop-blur-xl ${
          mobile ? 'inset-x-0 bottom-6 mx-auto w-fit' : ''
        }`}
      >
        {COLOR_OPTIONS.map((c) => (
          <button
            key={c.id}
            type="button"
            title={c.name}
            aria-label={c.name}
            onClick={() => onPick(c.id)}
            className={`${size} rounded-xl border border-white/20 shadow-md transition-transform hover:scale-110 ${c.bg} ${
              current === c.id ? 'ring-2 ring-white' : ''
            }`}
          />
        ))}
        <button
          type="button"
          title="Clear day"
          aria-label="Clear day"
          onClick={() => onPick(null)}
          className={`${size} flex items-center justify-center rounded-xl bg-white/10 text-gray-300 hover:bg-white/20`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}
