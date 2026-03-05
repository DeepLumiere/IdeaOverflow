import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Moon, Sun, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

function initials(input: string | undefined) {
  const value = (input ?? "").trim();
  if (!value) return "U";
  const parts = value.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);

  const items = useMemo(
    () => [
      { label: "Home", href: "/home" },
      { label: "Editor", href: "/editor" },
    ],
    []
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 dark:border-slate-800 bg-white/55 dark:bg-slate-950/35 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6">
        <div className="h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href={isAuthenticated ? "/home" : "/login"} className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white font-semibold shadow">
                IO
              </span>
              <span className="font-semibold tracking-tight text-slate-900 dark:text-white">
                IdeaOverflow
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            {isAuthenticated &&
              items.map((i) => (
                <Link
                  key={i.href}
                  href={i.href}
                  className={[
                    "px-3 py-2 rounded-xl text-sm font-medium transition",
                    pathname === i.href
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/60",
                  ].join(" ")}
                >
                  {i.label}
                </Link>
              ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5 text-slate-100" /> : <Moon className="h-5 w-5 text-slate-700" />}
            </button>

            {isAuthenticated && user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-slate-950/40 px-2 py-1.5">
                  <div className="h-8 w-8 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center text-xs font-semibold">
                    {initials(user.name || user.email)}
                  </div>
                  <div className="pr-1">
                    <div className="text-xs font-medium text-slate-900 dark:text-white leading-tight">{user.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{user.email}</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                  className="hidden sm:inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200 transition text-sm font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="h-10 inline-flex items-center px-4 rounded-xl border border-slate-200/70 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="h-10 inline-flex items-center px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-medium shadow shadow-blue-500/15 hover:shadow-blue-500/25 transition"
                >
                  Sign up
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              title="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200/70 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                {items.map((i) => (
                  <Link
                    key={i.href}
                    href={i.href}
                    className="px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                  >
                    {i.label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                  className="mt-2 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 transition text-sm font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  className="h-10 inline-flex items-center justify-center rounded-xl border border-slate-200/70 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="h-10 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-medium shadow shadow-blue-500/15"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
