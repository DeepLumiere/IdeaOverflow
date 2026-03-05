"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const router = useRouter();
  const { signup, isAuthenticated } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace("/home");
  }, [isAuthenticated, router]);

  const passwordMismatch = useMemo(
    () => confirmPassword.length > 0 && password !== confirmPassword,
    [password, confirmPassword]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await signup(email, password, name);
      router.push("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-950/50 backdrop-blur shadow-[0_12px_45px_rgba(2,6,23,0.14)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.16),transparent_45%),radial-gradient(circle_at_90%_20%,rgba(59,130,246,0.14),transparent_40%)]" />
            <div className="relative p-7 sm:p-8">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Create your account</h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Start a new paper with structured sections and a live preview.
              </p>

              {error && (
                <div className="mt-5 rounded-xl border border-rose-200/70 dark:border-rose-900/40 bg-rose-50/80 dark:bg-rose-950/30 px-4 py-3 text-sm text-rose-700 dark:text-rose-200">
                  {error}
                </div>
              )}

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="name">
                    Full name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Man Patel"
                    className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 px-4 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/60 transition"
                    required
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@university.edu"
                    className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 px-4 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/60 transition"
                    required
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 px-4 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/60 transition"
                    required
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="confirmPassword">
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`mt-2 w-full rounded-xl border bg-white/80 dark:bg-slate-950/60 px-4 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 transition ${
                      passwordMismatch
                        ? "border-rose-300 dark:border-rose-900/60 focus:ring-rose-500/40"
                        : "border-slate-200 dark:border-slate-800 focus:ring-blue-500/60"
                    }`}
                    required
                    autoComplete="new-password"
                  />
                  {passwordMismatch && (
                    <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">Passwords don’t match.</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2.5 text-white font-medium shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/25 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    {loading ? "Creating account…" : "Create account"}
                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </span>
                </button>

                <p className="text-sm text-slate-600 dark:text-slate-300 text-center pt-2">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-blue-700 dark:text-cyan-300 hover:underline underline-offset-4"
                  >
                    Sign in
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

