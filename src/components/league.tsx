import { Clock, Sparkles, Target, Trophy } from 'lucide-react';
import '@/styles/league-motion.css';

export type LeagueProps = {
  name: string;
  tier: number; // 0 (Failed) to 10 (Freedom)
  monthLabel: string;
  studiedHours: number;
  targetHours: number;
  progress: number; // 0 to 1+
  collapsed?: boolean;
};

export function League({
  name,
  tier,
  monthLabel,
  studiedHours,
  targetHours,
  progress,
  collapsed = false,
}: LeagueProps) {
  const percent = Math.round(progress * 100);
  const glow = 0.25 + (tier / 10) * 0.6; // higher leagues glow more
  const barWidth = `${Math.min(progress, 1) * 100}%`;

  if (collapsed) {
    return (
      <div
        className="flex flex-col items-center gap-1"
        title={`${name} · ${percent}% of ${monthLabel}`}
      >
        <TrophyBadge tier={tier} size="sm" glow={glow} />
        <span className="text-[10px] font-extrabold text-amber-900 dark:text-amber-200">
          {percent}%
        </span>
      </div>
    );
  }

  return (
    <section
      aria-label="Monthly league"
      className="relative overflow-hidden rounded-2xl border border-amber-300/80 bg-[#FFF8DC] p-4 shadow-md shadow-amber-900/10 dark:border-amber-700/50 dark:bg-[#33290c] dark:shadow-black/30"
    >
      <div className="league-shine relative overflow-hidden rounded-md bg-gradient-to-r from-[#F5A524] to-[#FCD84A] py-1.5 text-center text-[11px] font-extrabold tracking-[0.16em] text-amber-950">
        MONTHLY LEAGUE
      </div>

      <div className="mt-4 flex flex-col items-center">
        <TrophyBadge tier={tier} size="lg" glow={glow} />
        <p className="mt-3 text-lg font-extrabold text-amber-900 dark:text-amber-200">{name}</p>
        <p className="text-[10px] font-bold tracking-[0.14em] text-stone-500 dark:text-stone-400">
          {monthLabel.toUpperCase()}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Stat icon={<Clock size={13} />} label="Studied" value={`${studiedHours.toFixed(1)}h`} tone="text-emerald-700 dark:text-emerald-400" />
        <Stat icon={<Target size={13} />} label="Target" value={`${targetHours.toFixed(1)}h`} tone="text-emerald-950 dark:text-emerald-100" />
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-[10px] font-bold text-stone-600 dark:text-stone-300">
          <span>Progress</span>
          <span>{percent}%</span>
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.min(percent, 100)}
          className="h-2 overflow-hidden rounded-full bg-amber-200 dark:bg-amber-950"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-[width] duration-700"
            style={{ width: barWidth }}
          />
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-white/80 px-2 py-2 text-center dark:border-amber-800/60 dark:bg-amber-950/40">
      <div className="flex items-center justify-center gap-1 text-[9px] font-bold tracking-[0.1em] text-stone-500 dark:text-stone-400">
        {icon}
        {label.toUpperCase()}
      </div>
      <div className={`mt-0.5 text-sm font-extrabold ${tone}`}>{value}</div>
    </div>
  );
}

function TrophyBadge({ tier, size, glow }: { tier: number; size: 'sm' | 'lg'; glow: number }) {
  const disc = size === 'lg' ? 'h-24 w-24' : 'h-10 w-10';
  const icon = size === 'lg' ? 40 : 18;
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="league-glow absolute inset-0 rounded-full bg-amber-400 blur-md"
        style={{ ['--glow' as string]: glow }}
      />
      <div
        className={`relative flex ${disc} items-center justify-center rounded-full bg-gradient-to-br from-[#FCD84A] to-[#D97706] ring-4 ring-amber-100 dark:ring-amber-900`}
      >
        <Trophy size={icon} className="text-amber-50" aria-hidden="true" />
        {tier >= 1 && (
          <Sparkles
            size={size === 'lg' ? 18 : 10}
            aria-hidden="true"
            className="league-sparkle absolute -right-1 -top-1 text-amber-700 dark:text-amber-300"
          />
        )}
      </div>
    </div>
  );
}
