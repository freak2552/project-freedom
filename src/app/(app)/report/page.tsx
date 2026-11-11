'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { ReportCard } from './components/ReportCard';
import { ReportDetail } from './components/ReportDetail';
import type { MonthlyReport, ReportCard as ReportCardData, ReportNameChange } from '@/lib/report';

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1).padStart(2, '0'),
  label: new Date(Date.UTC(2000, i, 1)).toLocaleString('en-US', { month: 'long', timeZone: 'UTC' }),
}));

const field =
  'h-9 rounded-lg border border-[#F59E0B]/60 bg-[#FFFBEB] px-3 text-sm text-[#064E3B] dark:border-amber-700 dark:bg-amber-950/70 dark:text-amber-50';

export default function ReportPage() {
  const [cards, setCards] = useState<ReportCardData[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [year, setYear] = useState(''); // '' = all years
  const [month, setMonth] = useState(''); // '' = all months
  const [query, setQuery] = useState('');

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [detail, setDetail] = useState<MonthlyReport | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // One request loads every finished month. Filters and search then run in the browser.
  useEffect(() => {
    let active = true;
    fetch('/api/report/months')
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? 'Could not load reports.');
        return data as { reports: ReportCardData[] };
      })
      .then((data) => {
        if (!active) return;
        setCards(data.reports);
        // Start on the most recent year that has a report.
        setYear(data.reports[0]?.monthKey.slice(0, 4) ?? '');
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Could not load reports.');
      });
    return () => {
      active = false;
    };
  }, []);

  const years = useMemo(
    () => Array.from(new Set((cards ?? []).map((c) => c.monthKey.slice(0, 4)))),
    [cards],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (cards ?? []).filter((c) => {
      if (year && !c.monthKey.startsWith(`${year}-`)) return false;
      if (month && c.monthKey.slice(5) !== month) return false;
      if (q && !c.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [cards, year, month, query]);

  async function openReport(monthKey: string) {
    setSelectedKey(monthKey);
    setDetail(null);
    setDetailLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/report?month=${monthKey}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Could not load this report.');
      setDetail((data as { report: MonthlyReport }).report);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load this report.');
      setSelectedKey(null);
    } finally {
      setDetailLoading(false);
    }
  }

  function handleRenamed(change: ReportNameChange) {
    setCards((prev) =>
      prev?.map((c) =>
        c.monthKey === change.monthKey ? { ...c, name: change.name, isCustomName: change.isCustomName } : c,
      ) ?? prev,
    );
    setDetail((prev) =>
      prev && prev.monthKey === change.monthKey
        ? { ...prev, name: change.name, isCustomName: change.isCustomName }
        : prev,
    );
  }

  function backToList() {
    setSelectedKey(null);
    setDetail(null);
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      {error && (
        <p role="alert" className="mb-3 text-xs font-bold text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      {selectedKey && detail ? (
        <ReportDetail report={detail} onBack={backToList} onRenamed={handleRenamed} />
      ) : selectedKey && detailLoading ? (
        <p className="text-sm text-stone-600 dark:text-stone-400">Loading report…</p>
      ) : (
        <div className="flex flex-col gap-4">
          <h1 className="text-lg font-extrabold text-[#064E3B] dark:text-amber-50">Report</h1>

          {/* Filters and search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[180px] flex-1">
              <Search size={15} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search reports"
                aria-label="Search reports"
                className={`${field} w-full pl-9`}
              />
            </div>
            <select value={year} onChange={(e) => setYear(e.target.value)} aria-label="Year" className={field}>
              <option value="">All years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Month" className={field}>
              <option value="">All months</option>
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {cards === null ? (
            <p className="text-sm text-stone-600 dark:text-stone-400">Loading reports…</p>
          ) : cards.length === 0 ? (
            <p className="text-sm text-stone-600 dark:text-stone-400">
              No finished months yet. A month appears here once it has study, mood or habit data.
            </p>
          ) : visible.length === 0 ? (
            <p className="text-sm text-stone-600 dark:text-stone-400">No reports match these filters.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((card) => (
                <ReportCard key={card.monthKey} card={card} onOpen={() => openReport(card.monthKey)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
