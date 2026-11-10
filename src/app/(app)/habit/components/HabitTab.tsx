'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, EyeOff, Settings } from 'lucide-react';
import { currentMonthKey, dayKeysOfMonth, monthLabel, shiftMonth } from '@/lib/dates';
import { ColorPicker, type PickerTarget } from './ColorPicker';
import { HabitCard } from './HabitCard';
import { ManageHabitsModal } from './ManageHabitsModal';
import { logKey, type Habit, type HabitColor, type LogMap } from './habit-types';

// Small JSON helper: throws with the server's message when a request fails.
async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? 'Something went wrong');
  return data as T;
}

// Phone width switches the layout to the one-habit carousel.
function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return mobile;
}

export default function HabitTab() {
  const isMobile = useIsMobile();
  const [monthKey, setMonthKey] = useState(() => currentMonthKey());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<LogMap>({});
  const [showUI, setShowUI] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [picker, setPicker] = useState<PickerTarget | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Mobile carousel state
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const dayKeys = useMemo(() => dayKeysOfMonth(monthKey), [monthKey]);
  const firstWeekday = dayKeys.length ? new Date(`${dayKeys[0]}T00:00:00`).getDay() : 0;
  const count = habits.length;
  const safeIndex = Math.min(index, Math.max(count - 1, 0));
  const pickerCurrent = picker ? logs[logKey(picker.habitId, picker.dateKey)] : undefined;

  const showError = useCallback((err: unknown) => {
    setNotice(err instanceof Error ? err.message : 'Something went wrong');
  }, []);

  // Auto-clear the notice.
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  // Load habits once.
  useEffect(() => {
    api<{ habits: Habit[] }>('/api/habits')
      .then((d) => setHabits(d.habits))
      .catch(showError);
  }, [showError]);

  // Load the marks for the month on screen.
  useEffect(() => {
    let active = true;
    api<{ logs: { habitId: string; dateKey: string; color: HabitColor }[] }>(`/api/habits/logs?month=${monthKey}`)
      .then((d) => {
        if (!active) return;
        const map: LogMap = {};
        for (const l of d.logs) map[logKey(l.habitId, l.dateKey)] = l.color;
        setLogs(map);
      })
      .catch((err) => active && showError(err));
    return () => {
      active = false;
    };
  }, [monthKey, showError]);

  async function addHabit(name: string): Promise<boolean> {
    try {
      const d = await api<{ habit: Habit }>('/api/habits', { method: 'POST', body: JSON.stringify({ name }) });
      setHabits((prev) => [...prev, d.habit]);
      return true;
    } catch (err) {
      showError(err);
      return false;
    }
  }

  async function deleteHabit(id: string): Promise<boolean> {
    try {
      await api<{ ok: boolean }>(`/api/habits/${id}`, { method: 'DELETE' });
      setHabits((prev) => prev.filter((h) => h.id !== id));
      setLogs((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => !k.startsWith(`${id}_`))));
      return true;
    } catch (err) {
      showError(err);
      return false;
    }
  }

  // Marks update on screen at once; if the server refuses, the old mark comes back.
  async function setColor(habitId: string, dateKey: string, color: HabitColor | null) {
    const key = logKey(habitId, dateKey);
    const previous = logs[key];
    setPicker(null);
    setLogs((prev) => {
      const next: LogMap = { ...prev };
      if (color) next[key] = color;
      else delete next[key];
      return next;
    });
    try {
      if (color) {
        await api('/api/habits/logs', { method: 'PUT', body: JSON.stringify({ habitId, dateKey, color }) });
      } else {
        await api(`/api/habits/logs?habitId=${habitId}&date=${dateKey}`, { method: 'DELETE' });
      }
    } catch (err) {
      showError(err);
      setLogs((prev) => {
        const next: LogMap = { ...prev };
        if (previous) next[key] = previous;
        else delete next[key];
        return next;
      });
    }
  }

  const openPicker = (habitId: string, dateKey: string, rect: DOMRect) => setPicker({ habitId, dateKey, rect });

  // Swipe handling for the mobile carousel. Vertical scrolling is left to the browser.
  const onPointerDown = (e: React.PointerEvent) => {
    setStartX(e.clientX);
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    let dx = e.clientX - startX;
    const atStart = safeIndex === 0 && dx > 0;
    const atEnd = safeIndex === count - 1 && dx < 0;
    if (atStart || atEnd) dx *= 0.3; // resist at the ends
    setDragX(dx);
  };
  const endDrag = () => {
    if (!dragging) return;
    setDragging(false);
    if (dragX < -50 && safeIndex < count - 1) setIndex(safeIndex + 1);
    else if (dragX > 50 && safeIndex > 0) setIndex(safeIndex - 1);
    setDragX(0);
  };
  const go = (delta: number) => setIndex(Math.min(Math.max(safeIndex + delta, 0), Math.max(count - 1, 0)));

  return (
    <div className="relative flex min-h-0 flex-1 select-none overflow-hidden bg-[#FDE9A6] text-emerald-950 dark:bg-[#1c1708] dark:text-amber-50">
      {/* Background image: light mode only. Dark mode keeps the amber theme. */}
      <img
        src="/habit.png"
        alt=""
        className="absolute inset-0 hidden h-full w-full object-cover dark:hidden md:block"
      />
      <img
        src="/habit-mobile.png"
        alt=""
        className="absolute inset-0 block h-full w-full object-cover dark:hidden md:hidden"
      />

      {/* Top-right controls: always visible, so the eye can bring the background back */}
      <div className="absolute right-4 top-4 z-50 flex items-center gap-2">
        <IconButton label="Manage habits" onClick={() => setSettingsOpen(true)}>
          <Settings className="h-5 w-5" />
        </IconButton>
        <IconButton
          label={showUI ? 'Hide interface' : 'Show interface'}
          active={!showUI}
          onClick={() => setShowUI((v) => !v)}
        >
          {showUI ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
        </IconButton>
      </div>

      {showUI && (
        <div className="relative z-10 flex h-full min-h-0 w-full flex-col gap-4 bg-black/25 p-4 pt-16 md:p-8 md:pt-8 dark:bg-black/35">
          {/* Month navigation */}
          <header className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/60 px-3 py-2.5 shadow-2xl backdrop-blur-md md:px-6 md:py-3">
            <IconButton label="Previous month" onClick={() => setMonthKey(shiftMonth(monthKey, -1))}>
              <ChevronLeft className="h-5 w-5" />
            </IconButton>
            <h2 className="text-center text-base font-black tracking-wider text-white md:text-xl">
              {monthLabel(monthKey)}
            </h2>
            <IconButton label="Next month" onClick={() => setMonthKey(shiftMonth(monthKey, 1))}>
              <ChevronRight className="h-5 w-5" />
            </IconButton>
          </header>

          {/* Mobile only: habit dropdown, top right of the habit area */}
          {isMobile && count > 0 && (
            <div className="mx-auto flex w-full max-w-4xl justify-end">
              <select
                value={safeIndex}
                onChange={(e) => setIndex(Number(e.target.value))}
                aria-label="Choose habit"
                className="max-w-[70%] truncate rounded-xl border border-white/20 bg-black/60 px-3 py-2 text-sm font-bold text-white backdrop-blur-md"
              >
                {habits.map((h, i) => (
                  <option key={h.id} value={i} className="text-black">
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {count === 0 ? (
            <div className="m-auto max-w-md rounded-2xl border border-white/10 bg-black/75 p-10 text-center font-medium text-gray-300 backdrop-blur-xl">
              No habits yet. Tap the settings icon to add one.
            </div>
          ) : isMobile ? (
            <div className="flex min-h-0 flex-1 flex-col justify-center gap-3">
              {/* Carousel: one habit at a time, swipe or use the arrows */}
              <div
                className="touch-pan-y overflow-hidden"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerLeave={endDrag}
                onPointerCancel={endDrag}
              >
                <div
                  className="flex"
                  style={{
                    transform: `translateX(calc(${-safeIndex * 100}% + ${dragX}px))`,
                    transition: dragging ? 'none' : 'transform 350ms cubic-bezier(0.22, 0.61, 0.36, 1)',
                  }}
                >
                  {habits.map((habit) => (
                    <div key={habit.id} className="w-full shrink-0 px-1">
                      <div className="mx-auto max-w-sm">
                        <HabitCard
                          habit={habit}
                          dayKeys={dayKeys}
                          firstWeekday={firstWeekday}
                          logs={logs}
                          onCellClick={openPicker}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mx-auto flex w-full max-w-sm items-center justify-between gap-3 px-1">
                <IconButton label="Previous habit" onClick={() => go(-1)} disabled={safeIndex === 0}>
                  <ChevronLeft className="h-5 w-5" />
                </IconButton>
                <p className="truncate text-xs font-bold text-white">
                  {safeIndex + 1} / {count}
                </p>
                <IconButton label="Next habit" onClick={() => go(1)} disabled={safeIndex === count - 1}>
                  <ChevronRight className="h-5 w-5" />
                </IconButton>
              </div>
            </div>
          ) : (
            <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 overflow-y-auto p-2 lg:grid-cols-3">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  dayKeys={dayKeys}
                  firstWeekday={firstWeekday}
                  logs={logs}
                  onCellClick={openPicker}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {picker && (
        <ColorPicker
          target={picker}
          current={pickerCurrent}
          mobile={isMobile}
          onPick={(color) => setColor(picker.habitId, picker.dateKey, color)}
          onClose={() => setPicker(null)}
        />
      )}

      {settingsOpen && (
        <ManageHabitsModal
          habits={habits}
          onAdd={addHabit}
          onDelete={deleteHabit}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {notice && (
        <p
          role="status"
          className="absolute left-1/2 top-4 z-[120] max-w-[90%] -translate-x-1/2 rounded-lg bg-rose-700 px-3 py-2 text-center text-xs font-bold text-white shadow-lg"
        >
          {notice}
        </p>
      )}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 text-white shadow-lg backdrop-blur-md transition disabled:opacity-40 ${
        active ? 'bg-amber-500/80 hover:bg-amber-600' : 'bg-black/60 hover:bg-black/80'
      }`}
    >
      {children}
    </button>
  );
}
