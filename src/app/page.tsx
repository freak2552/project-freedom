"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, UserRound, X } from "lucide-react";

type AuthUser = {
  id: string;
  username: string;
};

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

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden text-white">
      {/* Background: desktop image on medium screens and up */}
      <div
        className="absolute inset-0 hidden bg-cover bg-center md:block"
        style={{ backgroundImage: "url('/landing-page-bg.png')" }}
        aria-hidden="true"
      />

      {/* Background: phone image on small screens */}
      <div
        className="absolute inset-0 block bg-cover bg-center md:hidden"
        style={{ backgroundImage: "url('/landing-page-bg-mobile.png')" }}
        aria-hidden="true"
      />

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
          <span className="text-sm font-medium">
            {user ? user.username : "Login"}
          </span>
        </button>

        {isAuthOpen && (
          <section
            className="absolute left-0 top-14 w-[min(20rem,calc(100vw-3rem))] rounded-2xl border border-white/20 bg-black/85 p-6 shadow-2xl backdrop-blur-md"
            role="dialog"
            aria-modal="false"
            aria-labelledby="auth-title"
          >
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
                {isSubmitting
                  ? "Please wait…"
                  : isRegister
                    ? "Create account"
                    : "Log in"}
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
  );
}