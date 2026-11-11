"use client";

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, UserRound, X } from "lucide-react";
import "./mobile-login.css";

type AuthUser = {
  id: string;
  username: string;
};

// Sticky notes on the phone design. "rotate" is the resting tilt, "delay" when the note drops in.
const NOTES = [
  { text: "Keep Learning!", bg: "#FFF27A", rotate: -6, delay: 0.5, pos: "right-[7%] top-[23%] w-[120px]" },
  { text: "Small steps everyday.", bg: "#A8E6A1", rotate: 4, delay: 0.75, pos: "right-[3%] top-[34%] w-[128px]" },
  { text: "Progress = Perfection", bg: "#F7A8A8", rotate: -3, delay: 1, pos: "right-[8%] top-[46%] w-[120px]" },
];

// Passes a CSS custom property (e.g. --d) through React's style prop.
const vars = (values: Record<string, string>) => values as CSSProperties;

export default function LandingPage() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch {
        // The visitor can still open the login form if the session check fails.
      }
    }

    void loadUser();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        isRegister ? "/api/auth/register" : "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Could not sign in. Please try again.");
        return;
      }

      setUser(data.user);
      setUsername("");
      setPassword("");
      setIsAuthOpen(false);
    } catch {
      setError("Could not connect. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEnter() {
    if (user) {
      router.push("/home");
      return;
    }

    setError("");
    setIsAuthOpen(true);
  }

  // The login panel. Used by both the phone and desktop designs.
  const authPanel = (className: string) => (
    <section className={className} role="dialog" aria-modal="false" aria-labelledby="auth-title">
      <div className="mb-5 flex items-center justify-between">
        <h1 id="auth-title" className="text-xl font-semibold">
          {isRegister ? "Create account" : "Welcome back"}
        </h1>
        <button
          type="button"
          onClick={() => setIsAuthOpen(false)}
          className="rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
          aria-label="Close login form"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-1.5 text-sm">
          <span className="text-white/80">Username</span>
          <input
            type="text"
            required
            minLength={isRegister ? 3 : 1}
            maxLength={20}
            pattern={isRegister ? "[a-zA-Z0-9_-]+" : undefined}
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 outline-none placeholder:text-white/40 focus:border-white/60"
          />
        </label>

        <label className="block space-y-1.5 text-sm">
          <span className="text-white/80">Password</span>
          <input
            type="password"
            required
            minLength={isRegister ? 8 : 1}
            maxLength={72}
            autoComplete={isRegister ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 outline-none placeholder:text-white/40 focus:border-white/60"
          />
        </label>

        {error && (
          <p className="text-sm text-red-300" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-white px-4 py-2.5 font-semibold text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Please wait…" : isRegister ? "Create account" : "Log in"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-white/70">
        {isRegister ? "Already registered?" : "New here?"}{" "}
        <button
          type="button"
          onClick={() => {
            setError("");
            setIsRegister((registering) => !registering);
          }}
          className="font-medium text-white underline underline-offset-4 hover:text-white/80"
        >
          {isRegister ? "Log in" : "Create an account"}
        </button>
      </p>
    </section>
  );

  const loginButtonLabel = user ? user.username : "Login";

  return (
    <>
      {/* ============ PHONE DESIGN (below md) ============ */}
      <main className="relative h-dvh min-h-[560px] overflow-hidden text-slate-900 md:hidden">
        <img
          src="/login-bg-mobile.svg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Bird flying across once */}
        <svg
          className="ml-bird absolute left-[64%] top-[30%] h-7 w-9"
          viewBox="0 0 40 28"
          aria-hidden="true"
        >
          <path d="M2 14 Q12 2 20 12 Q28 2 38 14 Q28 12 20 20 Q12 12 2 14Z" fill="#1c1c1c" />
        </svg>

        {/* Sticky notes */}
        {NOTES.map((note) => (
          <div
            key={note.text}
            className={`ml-note absolute ${note.pos} rounded-sm p-3 text-center text-[13px] font-medium leading-snug text-slate-800 shadow-lg`}
            style={vars({ backgroundColor: note.bg, "--r": `${note.rotate}deg`, "--d": `${note.delay}s` })}
          >
            <span className="block">{note.text}</span>
            <span className="block text-base" aria-hidden="true">
              ☺
            </span>
          </div>
        ))}

        {/* Login button, top left */}
        <header className="absolute left-5 top-5 z-20">
          <button
            type="button"
            onClick={() => {
              setError("");
              setIsAuthOpen((open) => !open);
            }}
            className="flex items-center gap-2 rounded-full border border-slate-900/20 bg-white/70 px-4 py-2.5 text-sm font-semibold shadow-md backdrop-blur-sm transition active:scale-95"
            aria-label={user ? `Signed in as ${user.username}` : "Open login"}
          >
            <UserRound size={18} aria-hidden="true" />
            <span>{loginButtonLabel}</span>
          </button>
        </header>

        {/* Title */}
        <section className="absolute inset-x-0 top-[27%] text-center">
          <h2
            className="ml-rise text-[58px] font-black leading-none tracking-tight"
            style={vars({ "--d": "0.2s" })}
          >
            Project
          </h2>
          <p
            className="ml-script ml-rise -mt-3 text-[92px] leading-none"
            style={vars({ "--d": "0.5s" })}
          >
            freedom
          </p>
          <div
            className="ml-rise mx-auto mt-1 h-1.5 w-40 rounded-full bg-slate-900"
            style={vars({ "--d": "0.8s" })}
            aria-hidden="true"
          />
          <p className="ml-rise mt-5 text-lg font-semibold" style={vars({ "--d": "1s" })}>
            Focus. Build. Be Free.
          </p>
        </section>

        {/* Invitation and progress dots */}
        <div className="absolute inset-x-0 top-[66%] flex flex-col items-center gap-3">
          <p
            className="ml-rise text-base font-medium text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]"
            style={vars({ "--d": "1.3s" })}
          >
            Let&apos;s begin your journey
          </p>
          <div className="flex gap-2" aria-hidden="true">
            <span className="h-1.5 w-7 rounded-full bg-[#F5B82E]" />
            <span className="h-1.5 w-4 rounded-full bg-white/80" />
            <span className="h-1.5 w-4 rounded-full bg-white/80" />
          </div>
        </div>

        {/* Enter button, sits on the desk */}
        <button
          type="button"
          onClick={handleEnter}
          className="absolute bottom-10 left-1/2 z-20 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-slate-900 text-white shadow-xl transition active:scale-95"
          aria-label={user ? "Enter Project Freedom" : "Log in to enter"}
        >
          <ArrowRight size={24} aria-hidden="true" />
        </button>

        {isAuthOpen && (
          <div className="absolute inset-x-3 bottom-3 z-30">
            {authPanel("ml-sheet rounded-3xl border border-white/20 bg-black/85 p-6 shadow-2xl backdrop-blur-md")}
          </div>
        )}
      </main>

      {/* ============ DESKTOP DESIGN (md and up), unchanged ============ */}
      <main
        className="relative hidden min-h-screen items-center justify-center overflow-hidden bg-cover bg-center text-white md:flex"
        style={{ backgroundImage: "url('/landing-page-bg.png')" }}
      >
        <div className="absolute inset-0 bg-black/20" aria-hidden="true" />

        <header className="absolute left-6 top-6 z-10">
          <button
            type="button"
            onClick={() => {
              setError("");
              setIsAuthOpen((open) => !open);
            }}
            className="flex items-center gap-2 rounded-full border border-white/30 bg-black/40 px-4 py-3 shadow-lg backdrop-blur-sm transition hover:bg-black/60"
            aria-label={user ? `Signed in as ${user.username}` : "Open login"}
          >
            <UserRound size={18} aria-hidden="true" />
            <span className="text-sm font-medium">{loginButtonLabel}</span>
          </button>

          {isAuthOpen &&
            authPanel(
              "absolute left-0 top-14 w-[min(20rem,calc(100vw-3rem))] rounded-2xl border border-white/20 bg-black/85 p-6 shadow-2xl backdrop-blur-md",
            )}
        </header>

        <button
          type="button"
          onClick={handleEnter}
          className="absolute bottom-8 left-1/2 z-10 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border border-white/50 bg-black/40 shadow-lg backdrop-blur-sm transition hover:scale-105 hover:bg-black/60"
          aria-label={user ? "Enter Project Freedom" : "Log in to enter"}
        >
          <ArrowRight size={24} aria-hidden="true" />
        </button>
      </main>
    </>
  );
}
