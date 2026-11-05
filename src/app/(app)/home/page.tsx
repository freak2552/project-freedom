import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Target,
  Trophy,
} from "lucide-react";

export default function HomePage() {
  const now = new Date();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();

  const dailyTargetHours = 5;
  const monthlyTargetHours = daysInMonth * dailyTargetHours;
  const studiedHours = 0;
  const progress =
    monthlyTargetHours > 0
      ? Math.min((studiedHours / monthlyTargetHours) * 100, 100)
      : 0;

  const dateLabel = now.toLocaleDateString("en", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-full bg-[#fce598] px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7">
          <p className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-600">
            <CalendarDays className="h-4 w-4 text-[#3e8ca0]" />
            {dateLabel}
          </p>
          <h1 className="text-3xl font-black tracking-tight text-[#253541] sm:text-4xl">
            Home
          </h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Your study progress, all in one place.
          </p>
        </div>

        <section className="mb-6 rounded-2xl border border-[#dfc36a] bg-gradient-to-r from-[#fff4c8] to-[#f7df8c] p-5 shadow-sm sm:p-7">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a66b2d]">
                Project Freedom
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-[#253541] sm:text-3xl">
                Build your momentum.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600">
                Small, steady study sessions add up. Your monthly overview is
                ready whenever you are.
              </p>
            </div>

            <div className="flex h-16 w-16 shrink-0 items-center justify-center self-start rounded-2xl bg-gradient-to-br from-[#d98c36] to-[#f3c25b] text-white shadow-md sm:self-center">
              <BookOpen className="h-8 w-8" />
            </div>
          </div>
        </section>

        <section
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          aria-label="Monthly study summary"
        >
          <article className="rounded-2xl border border-[#dfc36a] bg-[#fff8df] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-600">
                Studied this month
              </p>
              <span className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                <BookOpen className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-black text-[#253541]">
              {studiedHours.toFixed(1)}
              <span className="ml-1 text-base font-bold text-gray-500">hrs</span>
            </p>
          </article>

          <article className="rounded-2xl border border-[#dfc36a] bg-[#fff8df] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-600">
                Monthly target
              </p>
              <span className="rounded-xl bg-amber-100 p-2 text-[#b8762e]">
                <Target className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-black text-[#253541]">
              {monthlyTargetHours}
              <span className="ml-1 text-base font-bold text-gray-500">hrs</span>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Based on {dailyTargetHours} hours per day
            </p>
          </article>

          <article className="rounded-2xl border border-[#dfc36a] bg-[#fff8df] p-5 shadow-sm sm:col-span-2 xl:col-span-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-600">
                Current league
              </p>
              <span className="rounded-xl bg-orange-100 p-2 text-[#c47b32]">
                <Trophy className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-black text-[#253541]">Failed</p>
            <p className="mt-1 text-xs text-gray-500">
              Your league updates as you record study time.
            </p>
          </article>
        </section>

        <section className="mt-6 rounded-2xl border border-[#dfc36a] bg-[#fff8df] p-5 shadow-sm sm:p-6">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-[#253541]">Monthly progress</h2>
              <p className="mt-1 text-xs text-gray-500">
                {now.toLocaleString("en", { month: "long" })} study target
              </p>
            </div>
            <span className="text-lg font-black text-[#d98c36]">
              {Math.round(progress)}%
            </span>
          </div>

          <div
            className="h-3 overflow-hidden rounded-full border border-[#dfc36a] bg-white/70"
            role="progressbar"
            aria-label="Monthly study progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#d98c36] to-green-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>{studiedHours.toFixed(1)} hrs studied</span>
            <span>{monthlyTargetHours} hrs target</span>
          </div>
        </section>

        <p className="mt-6 flex items-center gap-2 text-xs text-gray-500">
          <ArrowRight className="h-4 w-4 text-[#3e8ca0]" />
          Study and Habit pages will be connected next.
        </p>
      </div>
    </div>
  );
}