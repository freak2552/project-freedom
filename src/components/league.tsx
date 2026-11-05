import { Clock3, Sparkles, Target, Trophy } from "lucide-react";

type LeagueProps = {
  hoursStudiedThisMonth?: number;
  dailyGoalHours?: number;
  specialDayHours?: Record<string, number>;
  isSidebarOpen?: boolean;
};

const LEVELS = [
  { min: 50, name: "Awakening" },
  { min: 55, name: "Rising" },
  { min: 60, name: "Builder" },
  { min: 65, name: "Climber" },
  { min: 70, name: "Striver" },
  { min: 75, name: "Achiever" },
  { min: 80, name: "Focused" },
  { min: 85, name: "Unstoppable" },
  { min: 90, name: "Mastery" },
  { min: 95, name: "Freedom" },
];

export default function League({
  hoursStudiedThisMonth = 0,
  dailyGoalHours = 5,
  specialDayHours = {},
  isSidebarOpen = true,
}: LeagueProps) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let monthlyTarget = 0;

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    monthlyTarget += specialDayHours[dateKey] ?? dailyGoalHours;
  }

  const completion =
    monthlyTarget > 0 ? (hoursStudiedThisMonth / monthlyTarget) * 100 : 0;

  let leagueName = "Failed";
  for (const level of LEVELS) {
    if (completion >= level.min) leagueName = level.name;
  }

  const monthName = now.toLocaleString("en", { month: "long" });
  const progressWidth = Math.min(completion, 100);
  const specialDayCount = Object.keys(specialDayHours).filter((date) =>
    date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}-`),
  ).length;

  if (!isSidebarOpen) {
    return (
      <section
        className="mb-5 flex flex-col items-center gap-2 rounded-xl border border-[#e1c66e] bg-[#fce598] py-3"
        aria-label={`Monthly league: ${leagueName}, ${Math.round(completion)} percent`}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/80 bg-gradient-to-br from-[#d98c36] to-[#f3c25b] shadow-md">
          <Trophy className="h-5 w-5 text-white" />
        </span>
        <span className="text-[10px] font-black text-gray-800">
          {Math.round(completion)}%
        </span>
      </section>
    );
  }

  return (
    <section className="mb-5 rounded-xl border border-[#e1c66e] bg-[#fce598] p-3">
      <div className="mb-3 rounded-md bg-gradient-to-r from-[#d98c36] to-[#e4a64c] py-1.5 text-center text-[11px] font-bold tracking-wider text-white shadow">
        MONTHLY LEAGUE
      </div>

      <div className="relative overflow-hidden rounded-xl border border-[#d9b855] bg-gradient-to-br from-[#fff8d9] via-white/70 to-[#f7df8c] px-3 pb-3">
        <div className="relative flex flex-col items-center py-4">
          <div className="relative">
            <span className="absolute -inset-1.5 rounded-full border border-[#d98c36]/40" />
            <span className="relative flex h-[5.25rem] w-[5.25rem] items-center justify-center rounded-full border-4 border-white/80 bg-gradient-to-br from-[#d98c36] via-[#e4a64c] to-[#f3c25b] shadow-lg">
              <Trophy className="h-10 w-10 text-white" />
            </span>
            <Sparkles className="absolute -right-3 -top-1 h-5 w-5 text-[#d98c36]" />
          </div>

          <h2 className="mt-3 text-lg font-black tracking-wide text-gray-800">
            {leagueName}
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            {monthName} League
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-[#d9b855]/50 bg-white/60 p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-gray-500">
              <Clock3 className="h-3 w-3" />
              <span className="text-[9px] font-bold uppercase">Studied</span>
            </div>
            <p className="mt-0.5 text-sm font-black text-green-700">
              {hoursStudiedThisMonth.toFixed(1)}h
            </p>
          </div>

          <div className="rounded-lg border border-[#d9b855]/50 bg-white/60 p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-gray-500">
              <Target className="h-3 w-3" />
              <span className="text-[9px] font-bold uppercase">Target</span>
            </div>
            <p className="mt-0.5 text-sm font-black text-gray-800">
              {monthlyTarget.toFixed(1)}h
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-end justify-between px-1 text-[10px] font-bold text-gray-700">
          <span>Monthly progress</span>
          <span className="text-sm font-black text-[#d98c36]">
            {Math.round(completion)}%
          </span>
        </div>

        <div
          className="h-3 overflow-hidden rounded-full border border-[#d9b855]/50 bg-white/50 shadow-inner"
          role="progressbar"
          aria-label="Monthly study progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.min(Math.round(completion), 100)}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#d98c36] via-[#e4a64c] to-green-400 transition-all"
            style={{ width: `${progressWidth}%` }}
          />
        </div>

        <div className="mt-1 flex justify-between px-1 text-[9px] text-gray-500">
          <span>
            {specialDayCount} special day{specialDayCount === 1 ? "" : "s"}
          </span>
          <span>{dailyGoalHours}h/day base</span>
        </div>
      </div>
    </section>
  );
}