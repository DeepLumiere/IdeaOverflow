"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { Braces, CheckCircle2, AlertTriangle } from "lucide-react";
import { useEditor, coerceDoc } from "@/context/EditorContext";
import { useTheme } from "@/context/ThemeContext";

export function EditorPanel() {
  const { doc, setDoc, isJsonSynced, setJsonSynced } = useEditor();
  const { theme } = useTheme();
  const [localJson, setLocalJson] = useState(() => JSON.stringify(doc, null, 2));
  const isInternalUpdate = useRef(false);

  const stats = useMemo(
    () => ({
      sections: doc.sections.length,
      subsections: doc.sections.reduce((acc, s) => acc + (s.subsections?.length ?? 0), 0),
      tables: doc.tables.length,
      images: doc.images.length,
    }),
    [doc.images.length, doc.sections, doc.tables.length]
  );

  useEffect(() => {
    if (!isInternalUpdate.current) {
      const next = JSON.stringify(doc, null, 2);
      if (next !== localJson) setLocalJson(next);
    }
    isInternalUpdate.current = false;
  }, [doc, localJson]);

  const onChange = useCallback(
    (value: string | undefined) => {
      if (typeof value !== "string") return;
      setLocalJson(value);
      try {
        const parsed = JSON.parse(value);
        isInternalUpdate.current = true;
        setDoc(coerceDoc(parsed));
        setJsonSynced(true);
      } catch {
        setJsonSynced(false);
      }
    },
    [setDoc, setJsonSynced]
  );

  return (
    <div className="h-full min-h-0 flex flex-col bg-white/55 dark:bg-slate-950/35 backdrop-blur border-r border-slate-200/70 dark:border-slate-800">
      <div className="h-12 flex items-center justify-between gap-3 px-3 border-b border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center">
            <Braces className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 tracking-wide">
              LaTeX JSON Structure
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Legend stats={stats} />
          <div
            className={[
              "h-8 px-3 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5",
              isJsonSynced
                ? "border-emerald-200/70 dark:border-emerald-900/40 bg-emerald-50/70 dark:bg-emerald-950/25 text-emerald-700 dark:text-emerald-200"
                : "border-amber-200/70 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-950/25 text-amber-700 dark:text-amber-200",
            ].join(" ")}
            title={isJsonSynced ? "JSON is valid" : "JSON has syntax errors"}
          >
            {isJsonSynced ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            {isJsonSynced ? "Synced" : "Invalid JSON"}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="json"
          value={localJson}
          onChange={onChange}
          theme={theme === "dark" ? "vs-dark" : "vs"}
          options={{
            minimap: { enabled: false },
            fontSize: 12,
            padding: { top: 14, bottom: 14 },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}

function Legend({
  stats,
}: {
  stats: { sections: number; subsections: number; tables: number; images: number };
}) {
  const chips = [
    { label: "sections", value: stats.sections, className: "bg-blue-50/70 dark:bg-blue-950/25 text-blue-700 dark:text-blue-200 border-blue-200/70 dark:border-blue-900/40" },
    { label: "subsections", value: stats.subsections, className: "bg-violet-50/70 dark:bg-violet-950/25 text-violet-700 dark:text-violet-200 border-violet-200/70 dark:border-violet-900/40" },
    { label: "tables", value: stats.tables, className: "bg-emerald-50/70 dark:bg-emerald-950/25 text-emerald-700 dark:text-emerald-200 border-emerald-200/70 dark:border-emerald-900/40" },
    { label: "images", value: stats.images, className: "bg-amber-50/70 dark:bg-amber-950/25 text-amber-700 dark:text-amber-200 border-amber-200/70 dark:border-amber-900/40" },
  ];

  return (
    <div className="hidden lg:flex items-center gap-2">
      {chips.map((c) => (
        <div
          key={c.label}
          className={`h-8 px-2.5 rounded-xl border text-xs font-medium inline-flex items-center gap-1 ${c.className}`}
        >
          <span className="font-semibold">{c.value}</span>
          <span className="opacity-90">{c.label}</span>
        </div>
      ))}
    </div>
  );
}

