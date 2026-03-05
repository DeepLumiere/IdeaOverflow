"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

export function ConferenceCard({
  name,
  description,
  selected,
  onSelect,
}: {
  name: string;
  description: string;
  selected?: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={[
        "group relative overflow-hidden rounded-2xl border backdrop-blur",
        "bg-white/70 dark:bg-slate-950/40",
        selected
          ? "border-blue-300/80 dark:border-cyan-500/40 shadow-[0_16px_55px_rgba(59,130,246,0.12)]"
          : "border-slate-200/70 dark:border-slate-800 shadow-[0_10px_40px_rgba(2,6,23,0.10)] hover:shadow-[0_18px_65px_rgba(2,6,23,0.14)]",
      ].join(" ")}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_15%_15%,rgba(59,130,246,0.15),transparent_45%),radial-gradient(circle_at_90%_25%,rgba(34,211,238,0.14),transparent_40%)]" />
      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white leading-tight">{name}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{description}</p>
          </div>
          {selected && <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-cyan-300" />}
        </div>

        <button
          onClick={onSelect}
          className={[
            "mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-medium transition",
            selected
              ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
              : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200",
          ].join(" ")}
        >
          {selected ? "Selected" : "Select"}
        </button>
      </div>
    </div>
  );
}

