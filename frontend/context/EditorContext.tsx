"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ConferenceId, PaperDoc } from "@/types/editor";
import { defaultPaperDoc } from "@/types/editor";

export type UploadedFileMeta = {
  name: string;
  size: number;
  type: string;
  lastModified: number;
};

export type PanelSizes = {
  sidebarWidth: number; // px
  jsonWidth: number; // px
  sidebarCollapsed: boolean;
};

type EditorContextValue = {
  doc: PaperDoc;
  setDoc: (doc: PaperDoc) => void;
  updateDoc: (updates: Partial<PaperDoc>) => void;

  selectedConference: ConferenceId;
  setSelectedConference: (conf: ConferenceId) => void;

  uploadedFile: UploadedFileMeta | null;
  setUploadedFile: (file: UploadedFileMeta | null) => void;

  panelSizes: PanelSizes;
  setPanelSizes: (next: PanelSizes) => void;

  isJsonSynced: boolean;
  setJsonSynced: (synced: boolean) => void;
};

const EditorContext = createContext<EditorContextValue | undefined>(undefined);

const STORAGE = {
  doc: "io_editor_doc_v1",
  conf: "io_editor_conf_v1",
  file: "io_uploaded_file_meta_v1",
  panels: "io_editor_panels_v1",
} as const;

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function getString(obj: Record<string, unknown>, key: string): string | undefined {
  const value = obj[key];
  return typeof value === "string" ? value : undefined;
}

function getStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v));
}

function coerceDoc(input: unknown): PaperDoc {
  const now = Date.now();
  if (!input || typeof input !== "object") return { ...defaultPaperDoc, updatedAt: now };

  const maybe = isRecord(input) ? input : {};
  const title = typeof maybe.title === "string" ? maybe.title : defaultPaperDoc.title;
  const abstract = typeof maybe.abstract === "string" ? maybe.abstract : defaultPaperDoc.abstract;

  const authors =
    Array.isArray(maybe.authors) &&
    maybe.authors.every((a) => isRecord(a) && typeof (a as Record<string, unknown>).name === "string")
      ? maybe.authors.map((a) => {
          const rec = a as Record<string, unknown>;
          return {
            name: getString(rec, "name") ?? "",
            affiliation: getString(rec, "affiliation"),
            email: getString(rec, "email"),
          };
        })
      : defaultPaperDoc.authors;

  const sections =
    Array.isArray(maybe.sections)
      ? maybe.sections
          .filter(isRecord)
          .map((s) => {
            const subsectionsRaw = (s as Record<string, unknown>).subsections;
            const subsections = Array.isArray(subsectionsRaw)
              ? subsectionsRaw
                  .filter(isRecord)
                  .map((ss) => {
                    const ssr = ss as Record<string, unknown>;
                    return {
                      id: typeof ssr.id === "string" ? ssr.id : `sub-${Math.random().toString(36).slice(2)}`,
                      name: getString(ssr, "name") ?? "Untitled Subsection",
                      content: getString(ssr, "content") ?? "",
                    };
                  })
              : [];

            return {
              id: typeof (s as Record<string, unknown>).id === "string" ? String((s as Record<string, unknown>).id) : `sec-${Math.random().toString(36).slice(2)}`,
              name: getString(s as Record<string, unknown>, "name") ?? "Untitled Section",
              content: getString(s as Record<string, unknown>, "content") ?? "",
              subsections,
            };
          })
      : defaultPaperDoc.sections;

  const tables =
    Array.isArray(maybe.tables)
      ? maybe.tables
          .filter(isRecord)
          .map((t) => {
            const tr = t as Record<string, unknown>;
            const rowsRaw = tr.rows;
            const rows = Array.isArray(rowsRaw)
              ? rowsRaw.map((r) => (Array.isArray(r) ? r.map((c) => String(c)) : []))
              : [];
            return {
              id: typeof tr.id === "string" ? tr.id : `table-${Math.random().toString(36).slice(2)}`,
              caption: getString(tr, "caption"),
              headers: getStringArray(tr.headers),
              rows,
              sectionId: getString(tr, "sectionId"),
            };
          })
      : [];

  const images =
    Array.isArray(maybe.images)
      ? maybe.images
          .filter(isRecord)
          .map((i) => {
            const ir = i as Record<string, unknown>;
            return {
              id: typeof ir.id === "string" ? ir.id : `img-${Math.random().toString(36).slice(2)}`,
              url: getString(ir, "url") ?? "",
              caption: getString(ir, "caption"),
              alt: getString(ir, "alt"),
              sectionId: getString(ir, "sectionId"),
            };
          })
      : [];

  return {
    title,
    abstract,
    authors,
    sections,
    tables,
    images,
    updatedAt: typeof maybe.updatedAt === "number" ? maybe.updatedAt : now,
  };
}

const defaultPanels: PanelSizes = {
  sidebarWidth: 300,
  jsonWidth: 520,
  sidebarCollapsed: false,
};

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [doc, setDocState] = useState<PaperDoc>(defaultPaperDoc);
  const [selectedConference, setSelectedConferenceState] = useState<ConferenceId>("ieee");
  const [uploadedFile, setUploadedFileState] = useState<UploadedFileMeta | null>(null);
  const [panelSizes, setPanelSizesState] = useState<PanelSizes>(defaultPanels);
  const [isJsonSynced, setJsonSynced] = useState(true);

  const saveTimer = useRef<number | null>(null);

  // Load persisted state once.
  useEffect(() => {
    const storedDoc = safeParse<unknown>(localStorage.getItem(STORAGE.doc));
    if (storedDoc) setDocState(coerceDoc(storedDoc));

    const storedConf = localStorage.getItem(STORAGE.conf) as ConferenceId | null;
    const validConferences: ConferenceId[] = ["ieee", "acm", "springer", "arxiv", "iclr", "cvpr", "acl", "nature"];
    if (storedConf && validConferences.includes(storedConf)) {
      setSelectedConferenceState(storedConf);
    }

    const storedFile = safeParse<UploadedFileMeta>(localStorage.getItem(STORAGE.file));
    if (storedFile && typeof storedFile.name === "string") setUploadedFileState(storedFile);

    const storedPanels = safeParse<PanelSizes>(localStorage.getItem(STORAGE.panels));
    if (storedPanels && typeof storedPanels.sidebarWidth === "number" && typeof storedPanels.jsonWidth === "number") {
      setPanelSizesState({
        sidebarWidth: Math.max(220, Math.min(520, storedPanels.sidebarWidth)),
        jsonWidth: Math.max(340, Math.min(900, storedPanels.jsonWidth)),
        sidebarCollapsed: !!storedPanels.sidebarCollapsed,
      });
    }
  }, []);

  // Persist doc + selections (debounced).
  useEffect(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE.doc, JSON.stringify(doc));
        localStorage.setItem(STORAGE.conf, selectedConference);
        localStorage.setItem(STORAGE.file, JSON.stringify(uploadedFile));
        localStorage.setItem(STORAGE.panels, JSON.stringify(panelSizes));
      } catch {
        // ignore
      }
    }, 250);

    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [doc, selectedConference, uploadedFile, panelSizes]);

  const setDoc = (next: PaperDoc) => setDocState({ ...coerceDoc(next), updatedAt: Date.now() });

  const updateDoc = (updates: Partial<PaperDoc>) => {
    setDocState((prev) => ({ ...prev, ...updates, updatedAt: Date.now() }));
    setJsonSynced(true);
  };

  const setSelectedConference = (conf: ConferenceId) => setSelectedConferenceState(conf);
  const setUploadedFile = (file: UploadedFileMeta | null) => setUploadedFileState(file);
  const setPanelSizes = (next: PanelSizes) => setPanelSizesState(next);

  const value = useMemo<EditorContextValue>(
    () => ({
      doc,
      setDoc,
      updateDoc,
      selectedConference,
      setSelectedConference,
      uploadedFile,
      setUploadedFile,
      panelSizes,
      setPanelSizes,
      isJsonSynced,
      setJsonSynced,
    }),
    [doc, selectedConference, uploadedFile, panelSizes, isJsonSynced]
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used within EditorProvider");
  return ctx;
}

export { coerceDoc };

