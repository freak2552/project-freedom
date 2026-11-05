"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  House,
  LogOut,
  Menu,
  Settings,
  TrendingUp,
  X,
  type LucideIcon,
} from "lucide-react";
import League from "@/components/league";

type SidebarProps = {
  username: string;
};

type NavItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
  disabled?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "STUDY", icon: BookOpen, disabled: true },
  { label: "HABIT", icon: CheckCircle2, disabled: true },
  { label: "JOURNEY", icon: TrendingUp, disabled: true },
  { label: "REPORT", icon: BarChart3, disabled: true },
  { label: "SETTINGS", icon: Settings, disabled: true },
  { label: "HOME", icon: House, href: "/home" },
];

type SidebarContentsProps = {
  expanded: boolean;
  username: string;
  pathname: string;
  onNavigate: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
};

function SidebarContents({
  expanded,
  username,
  pathname,
  onNavigate,
  onLogout,
  isLoggingOut,
}: SidebarContentsProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className={`mb-3 flex items-center ${
          expanded ? "justify-start" : "justify-center"
        }`}
      >
        <span className="truncate text-sm font-black tracking-wide text-[#293b45]">
          {expanded ? "PROJECT FREEDOM" : "PF"}
        </span>
      </div>

      <League
        hoursStudiedThisMonth={0}
        dailyGoalHours={5}
        isSidebarOpen={expanded}
      />

      <nav className="flex-1 space-y-1 overflow-y-auto" aria-label="Main menu">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.href === pathname;
          const sharedClassName = `flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-xs font-bold tracking-wide transition ${
            active
              ? "bg-white/55 text-emerald-800"
              : item.disabled
                ? "cursor-not-allowed text-gray-500/60"
                : "text-[#3e8ca0] hover:bg-white/40"
          } ${expanded ? "" : "justify-center px-0"}`;

          if (item.href) {
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onNavigate}
                className={sharedClassName}
                aria-current={active ? "page" : undefined}
                title={!expanded ? item.label : undefined}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {expanded && <span>{item.label}</span>}
              </Link>
            );
          }

          return (
            <button
              key={item.label}
              type="button"
              disabled
              title={
                expanded
                  ? `${item.label} page will be added next`
                  : `${item.label} — coming next`
              }
              className={sharedClassName}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {expanded && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="mt-3 border-t border-[#d6bd65] pt-3">
        <div className={`flex items-center gap-2 ${expanded ? "" : "justify-center"}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3e8ca0] text-xs font-bold text-white">
            {username.slice(0, 1).toUpperCase()}
          </div>

          {expanded && (
            <span className="min-w-0 flex-1 truncate text-xs font-semibold text-gray-700">
              {username}
            </span>
          )}

          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            title="Log out"
            aria-label="Log out"
            className="rounded-lg p-2 text-[#3e8ca0] transition hover:bg-white/50 disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ username }: SidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.assign("/");
    }
  }

  return (
    <>
      <div className="fixed left-0 top-0 z-30 flex h-14 w-full items-center gap-3 border-b border-[#d6bd65] bg-[#fce598] px-4 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-[#3e8ca0] hover:bg-white/50"
          aria-label="Open sidebar"
          aria-expanded={mobileOpen}
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-black tracking-wide text-[#293b45]">
          PROJECT FREEDOM
        </span>
      </div>

      <aside
        className={`hidden h-dvh shrink-0 flex-col border-r border-black/70 bg-[#fce598] p-3 transition-[width] duration-200 md:flex ${
          expanded ? "w-60" : "w-[4.5rem]"
        }`}
      >
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className={`mb-3 rounded-lg p-1.5 text-[#3e8ca0] transition hover:bg-white/40 ${
            expanded ? "self-start" : "self-center"
          }`}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={expanded}
        >
          <Menu className="h-5 w-5" />
        </button>

        <SidebarContents
          expanded={expanded}
          username={username}
          pathname={pathname}
          onNavigate={() => undefined}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/40"
            aria-label="Close sidebar"
          />

          <aside className="absolute inset-y-0 left-0 flex w-[min(19rem,85vw)] flex-col border-r border-black/50 bg-[#fce598] p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-black tracking-wide text-[#293b45]">
                MENU
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-[#3e8ca0] hover:bg-white/50"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <SidebarContents
              expanded
              username={username}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
              onLogout={handleLogout}
              isLoggingOut={isLoggingOut}
            />
          </aside>
        </div>
      )}
    </>
  );
}