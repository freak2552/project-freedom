'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Home as HomeIcon,
  LogOut,
  Menu,
  Settings,
  TrendingUp,
  X,
  type LucideIcon,
} from 'lucide-react';
import { League } from '@/components/league';

export type SidebarLeague = {
  name: string;
  tier: number;
  monthLabel: string;
  studiedHours: number;
  targetHours: number;
  progress: number;
};

type NavItem = { label: string; href: string | null; icon: LucideIcon };

// href: null means the page is not built yet, so the entry is shown but disabled.
const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/home', icon: HomeIcon },
  { label: 'Study', href: '/study', icon: BookOpen },
  { label: 'Habit', href: '/habit', icon: CheckCircle2 },
  { label: 'Journey', href: '/journey', icon: TrendingUp },
  { label: 'Report', href: '/report', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
];

type SidebarProps = {
  league: SidebarLeague;
  logoutEndpoint?: string; // your existing logout route
};

export function Sidebar({ league, logoutEndpoint = '/api/auth/logout' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false); // desktop only
  const [drawerOpen, setDrawerOpen] = useState(false); // mobile only

  // Escape closes the mobile drawer.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  return (
    <>
      {/* Mobile: hamburger opens the drawer. It sits over the page, so content is never squeezed. */}
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        aria-label="Open menu"
        aria-expanded={drawerOpen}
        className="fixed left-3 top-3 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400 bg-[#FCD84A] text-amber-950 shadow-md md:hidden"
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-[#FCD84A] p-4 shadow-2xl dark:bg-[#2a2308] overflow-y-auto ">
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-amber-950 hover:bg-amber-300/60 dark:text-amber-100"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <SidebarBody league={league} collapsed={false} onNavigate={() => setDrawerOpen(false)} logoutEndpoint={logoutEndpoint} />
          </aside>
        </div>
      )}

      {/* Desktop: full-height sidebar that collapses to icons plus the compact league badge. */}
      <aside
        className={`hidden h-full shrink-0 flex-col overflow-y-auto no-scrollbar border-r border-amber-500/40 bg-[#FCD84A] p-3 transition-[width] duration-300 md:flex dark:border-amber-900/60 dark:bg-[#2a2308] ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className={`mb-2 flex ${collapsed ? 'justify-center' : 'justify-end'}`}>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-amber-950 hover:bg-amber-300/60 dark:text-amber-100 dark:hover:bg-amber-900/50"
          >
            {collapsed ? <Menu size={20} aria-hidden="true" /> : <ChevronLeft size={20} aria-hidden="true" />}
          </button>
        </div>
        <SidebarBody league={league} collapsed={collapsed} logoutEndpoint={logoutEndpoint} />
      </aside>
    </>
  );
}

function SidebarBody({
  league,
  collapsed,
  onNavigate,
  logoutEndpoint,
}: {
  league: SidebarLeague;
  collapsed: boolean;
  onNavigate?: () => void;
  logoutEndpoint: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch(logoutEndpoint, { method: 'POST' });
    } finally {
      router.push('/');
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4">
        {collapsed ? (
          <League
            collapsed
            name={league.name}
            tier={league.tier}
            monthLabel={league.monthLabel}
            studiedHours={league.studiedHours}
            targetHours={league.targetHours}
            progress={league.progress}
          />
        ) : (
          <League
            name={league.name}
            tier={league.tier}
            monthLabel={league.monthLabel}
            studiedHours={league.studiedHours}
            targetHours={league.targetHours}
            progress={league.progress}
          />
        )}
      </div>

      <nav aria-label="Main" className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = href !== null && pathname.startsWith(href);
          const base = `flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold tracking-wide transition ${
            collapsed ? 'justify-center' : ''
          }`;

          if (href === null) {
            return (
              <span
                key={label}
                aria-disabled="true"
                title={`${label} (coming soon)`}
                className={`${base} cursor-not-allowed text-stone-500/70 dark:text-stone-500`}
              >
                <Icon size={18} aria-hidden="true" />
                {!collapsed && <span>{label.toUpperCase()}</span>}
                {!collapsed && <span className="sr-only">(not available yet)</span>}
              </span>
            );
          }

          return (
            <Link
              key={label}
              href={href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              title={collapsed ? label : undefined}
              className={`${base} ${
                active
                  ? 'bg-emerald-700 text-amber-50 shadow-md shadow-emerald-900/25 dark:bg-emerald-600'
                  : 'text-emerald-900 hover:bg-amber-300/60 dark:text-amber-100 dark:hover:bg-amber-900/50'
              }`}
            >
              <Icon size={18} aria-hidden="true" />
              {!collapsed && <span>{label.toUpperCase()}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2 pt-4">
        <div className={`flex ${collapsed ? 'flex-col items-center' : 'items-center justify-between'} gap-2`}>
          <button
            type="button"
            onClick={logout}
            disabled={loggingOut}
            className={`inline-flex items-center gap-2 rounded-xl border border-amber-700/30 px-3 py-2 text-xs font-bold text-amber-950 hover:bg-amber-300/60 disabled:opacity-60 dark:text-amber-100 dark:hover:bg-amber-900/50 ${
              collapsed ? 'h-9 w-9 justify-center px-0' : ''
            }`}
          >
            <LogOut size={16} aria-hidden="true" />
            {!collapsed && <span>{loggingOut ? 'Logging out…' : 'Log out'}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
