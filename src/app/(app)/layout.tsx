import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { getCurrentUserId } from '@/lib/auth-bridge';
import { getMonthlySummary } from '@/lib/summary';
import { currentMonthKey, monthLabel } from '@/lib/dates';

// The (app) route group keeps its name out of the URL: /home, /study, /settings.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh overflow-hidden bg-[#FDE9A6] text-emerald-950 dark:bg-[#1c1708] dark:text-amber-50">
      <Suspense fallback={<ShellFallback />}>
        <AppShell>{children}</AppShell>
      </Suspense>
    </div>
  );
}

// Request-time session access lives here, inside Suspense (cacheComponents).
async function AppShell({ children }: { children: React.ReactNode }) {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/login');

  const monthKey = currentMonthKey();
  const summary = await getMonthlySummary(userId, monthKey);

  return (
    <>
      <Sidebar
        league={{
          name: summary.league.name,
          tier: summary.league.tier,
          monthLabel: monthLabel(monthKey),
          studiedHours: summary.studiedHours,
          targetHours: summary.targetHours,
          progress: summary.progress,
        }}
      />
      {/* pt-14 on mobile leaves room for the fixed hamburger button. */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden pt-14 md:pt-0">{children}</main>
    </>
  );
}

function ShellFallback() {
  return (
    <div className="hidden w-64 shrink-0 bg-[#FCD84A] md:block dark:bg-[#2a2308]" aria-hidden="true" />
  );
}
