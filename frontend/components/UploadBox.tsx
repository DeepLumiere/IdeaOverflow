import React, { useMemo, useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { useEditor } from "@/context/EditorContext";

const ACCEPT = ".pdf,.tex,.txt,application/pdf,text/plain,application/x-latex";

function isValidFile(file: File): boolean {
  const validTypes = ["application/pdf", "text/plain", "application/x-latex"];
  const validExtensions = [".pdf", ".tex", ".txt"];
  const fileExtension = "." + (file.name.split(".").pop() ?? "").toLowerCase();
  return validTypes.includes(file.type) || validExtensions.includes(fileExtension);
}

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"] as const;
  const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
  const value = Math.round((bytes / Math.pow(k, i)) * 10) / 10;
  return `${value} ${sizes[i]}`;
}

export function UploadBox() {
  const { uploadedFile, setUploadedFile } = useEditor();
  const [isDragging, setIsDragging] = useState(false);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fileToShow = localFile ?? null;

  const fileMeta = useMemo(() => {
    if (!fileToShow) return null;
    return {
      name: fileToShow.name,
      size: fileToShow.size,
      type: fileToShow.type,
      lastModified: fileToShow.lastModified,
    };
  }, [fileToShow]);

  const pick = () => inputRef.current?.click();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!isValidFile(file)) return;
    setLocalFile(file);
    setUploadedFile({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    });
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isValidFile(file)) return;
    setLocalFile(file);
    setUploadedFile({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    });
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={pick}
        role="button"
        tabIndex={0}
        className={[
          "relative overflow-hidden rounded-2xl border border-dashed p-7 sm:p-8 cursor-pointer select-none",
          "bg-white/70 dark:bg-slate-950/40 backdrop-blur",
          "transition shadow-[0_10px_40px_rgba(2,6,23,0.10)] hover:shadow-[0_18px_65px_rgba(2,6,23,0.14)]",
          isDragging ? "border-blue-400 dark:border-cyan-400/70" : "border-slate-300/80 dark:border-slate-800",
        ].join(" ")}
      >
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.12),transparent_45%),radial-gradient(circle_at_90%_20%,rgba(34,211,238,0.12),transparent_40%)]" />
        <div className="relative flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center shadow">
            <UploadCloud className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">Upload files</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Drag & drop a PDF / LaTeX / text file here, or click to browse.
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Supported: PDF, .tex, .txt</p>

          <div className="mt-4">
            <span className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium bg-slate-900 text-white dark:bg-white dark:text-slate-950 transition">
              Browse files
            </span>
          </div>
        </div>

        <input ref={inputRef} type="file" className="hidden" accept={ACCEPT} onChange={handleSelect} />
      </div>

      {(uploadedFile || fileMeta) && (
        <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-950/40 backdrop-blur shadow-[0_10px_40px_rgba(2,6,23,0.08)] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">
                {(fileMeta?.name ?? uploadedFile?.name) || "Selected file"}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {formatFileSize(fileMeta?.size ?? uploadedFile?.size ?? 0)}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLocalFile(null);
                setUploadedFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="rounded-lg p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              title="Clear"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
