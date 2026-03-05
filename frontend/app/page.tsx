"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function IndexPage() {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (loading) return;
    router.replace(isAuthenticated ? "/home" : "/login");
  }, [isAuthenticated, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-950/50 backdrop-blur shadow-[0_10px_40px_rgba(2,6,23,0.12)] p-6">
        <div className="h-2 w-28 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 mb-6" />
        <p className="text-slate-700 dark:text-slate-200 font-medium">Loading your workspace…</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Preparing editor state and theme preferences.
        </p>
      </div>
    </div>
  );
}

