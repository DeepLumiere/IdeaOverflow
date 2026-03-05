"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon, Plus, Table2, UserPlus, Layers } from "lucide-react";
import { useEditor } from "@/context/EditorContext";
import type { PaperSection } from "@/types/editor";

type Action = "section" | "subsection" | "table" | "image" | "author";

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function ModalShell({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        aria-label="Close modal"
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/85 dark:bg-slate-950/75 backdrop-blur shadow-[0_22px_90px_rgba(2,6,23,0.22)] overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200/70 dark:border-slate-800">
            <div className="text-sm font-semibold text-slate-900 dark:text-white">{title}</div>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</label>
        {hint ? <span className="text-xs text-slate-500 dark:text-slate-400">{hint}</span> : null}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export function Sidebar() {
  const { doc, updateDoc, panelSizes, setPanelSizes, setJsonSynced } = useEditor();
  const collapsed = panelSizes.sidebarCollapsed;
  const [active, setActive] = useState<Action | null>(null);

  // Keyboard shortcuts (Ctrl/Cmd + Shift + key)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod || !e.shiftKey) return;
      const key = e.key.toLowerCase();
      const map: Record<string, Action | undefined> = {
        s: "section",
        u: "subsection",
        t: "table",
        i: "image",
        a: "author",
      };
      const next = map[key];
      if (!next) return;
      e.preventDefault();
      setActive(next);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const sectionOptions = useMemo(
    () => doc.sections.map((s) => ({ id: s.id, name: s.name })),
    [doc.sections]
  );

  return (
    <div className="h-full min-h-0 flex flex-col bg-white/55 dark:bg-slate-950/35 backdrop-blur border-r border-slate-200/70 dark:border-slate-800">
      <div className="h-12 flex items-center justify-between px-3 border-b border-slate-200/70 dark:border-slate-800">
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 tracking-wide">
          {collapsed ? "TOOLS" : "Modification Panel"}
        </div>
        <button
          onClick={() =>
            setPanelSizes({
              ...panelSizes,
              sidebarCollapsed: !panelSizes.sidebarCollapsed,
            })
          }
          className="h-8 w-8 inline-flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition text-slate-600 dark:text-slate-300"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-auto p-3">
        <div className="space-y-2">
          <SidebarButton
            collapsed={collapsed}
            icon={<Plus className="h-4 w-4" />}
            title="Add Section"
            shortcut="Ctrl+Shift+S"
            onClick={() => setActive("section")}
          />
          <SidebarButton
            collapsed={collapsed}
            icon={<Layers className="h-4 w-4" />}
            title="Add Subsection"
            shortcut="Ctrl+Shift+U"
            onClick={() => setActive("subsection")}
          />
          <SidebarButton
            collapsed={collapsed}
            icon={<Table2 className="h-4 w-4" />}
            title="Add Table"
            shortcut="Ctrl+Shift+T"
            onClick={() => setActive("table")}
          />
          <SidebarButton
            collapsed={collapsed}
            icon={<ImageIcon className="h-4 w-4" />}
            title="Add Image"
            shortcut="Ctrl+Shift+I"
            onClick={() => setActive("image")}
          />
          <SidebarButton
            collapsed={collapsed}
            icon={<UserPlus className="h-4 w-4" />}
            title="Add Author"
            shortcut="Ctrl+Shift+A"
            onClick={() => setActive("author")}
          />
        </div>

        {!collapsed && (
          <div className="mt-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-slate-950/40 p-3">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">Tips</div>
            <ul className="mt-2 text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <li>- Use the shortcuts for faster authoring.</li>
              <li>- JSON panel stays editable; preview updates live.</li>
              <li>- Drag separators to resize panels.</li>
            </ul>
          </div>
        )}
      </div>

      <ModalShell title={modalTitle(active)} open={active !== null} onClose={() => setActive(null)}>
        {active === "section" && (
          <AddSectionForm
            sections={doc.sections}
            onCancel={() => setActive(null)}
            onSubmit={(next) => {
              updateDoc({ sections: next });
              setJsonSynced(true);
              setActive(null);
            }}
          />
        )}
        {active === "subsection" && (
          <AddSubsectionForm
            sections={doc.sections}
            onCancel={() => setActive(null)}
            onSubmit={(next) => {
              updateDoc({ sections: next });
              setJsonSynced(true);
              setActive(null);
            }}
          />
        )}
        {active === "table" && (
          <AddTableForm
            sectionOptions={sectionOptions}
            onCancel={() => setActive(null)}
            onSubmit={(table) => {
              updateDoc({ tables: [...doc.tables, table] });
              setJsonSynced(true);
              setActive(null);
            }}
          />
        )}
        {active === "image" && (
          <AddImageForm
            sectionOptions={sectionOptions}
            onCancel={() => setActive(null)}
            onSubmit={(img) => {
              updateDoc({ images: [...doc.images, img] });
              setJsonSynced(true);
              setActive(null);
            }}
          />
        )}
        {active === "author" && (
          <AddAuthorForm
            onCancel={() => setActive(null)}
            onSubmit={(author) => {
              updateDoc({ authors: [...doc.authors, author] });
              setJsonSynced(true);
              setActive(null);
            }}
          />
        )}
      </ModalShell>
    </div>
  );
}

function modalTitle(action: Action | null) {
  switch (action) {
    case "section":
      return "Add Section";
    case "subsection":
      return "Add Subsection";
    case "table":
      return "Add Table";
    case "image":
      return "Add Image";
    case "author":
      return "Add Author";
    default:
      return "Edit";
  }
}

function SidebarButton({
  collapsed,
  icon,
  title,
  shortcut,
  onClick,
}: {
  collapsed: boolean;
  icon: React.ReactNode;
  title: string;
  shortcut?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full rounded-2xl border border-slate-200/70 dark:border-slate-800",
        "bg-white/60 dark:bg-slate-950/40 hover:bg-slate-100/80 dark:hover:bg-slate-900/70 transition",
        "px-3 py-2.5 flex items-center gap-3",
      ].join(" ")}
      title={shortcut ? `${title} (${shortcut})` : title}
    >
      <div className="h-9 w-9 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center">
        {icon}
      </div>
      {!collapsed && (
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-slate-900 dark:text-white">{title}</div>
          {shortcut && <div className="text-xs text-slate-500 dark:text-slate-400">{shortcut}</div>}
        </div>
      )}
    </button>
  );
}

function AddSectionForm({
  sections,
  onCancel,
  onSubmit,
}: {
  sections: PaperSection[];
  onCancel: () => void;
  onSubmit: (next: PaperSection[]) => void;
}) {
  const [position, setPosition] = useState<string>("end");
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const insertIndex = useMemo(() => {
    if (position === "start") return 0;
    if (position === "end") return sections.length;
    if (position.startsWith("after:")) {
      const id = position.slice("after:".length);
      const idx = sections.findIndex((s) => s.id === id);
      return idx >= 0 ? idx + 1 : sections.length;
    }
    return sections.length;
  }, [position, sections]);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const next = [...sections];
        next.splice(insertIndex, 0, {
          id: uid("sec"),
          name: name.trim() || "Untitled Section",
          content: content.trim(),
          subsections: [],
        });
        onSubmit(next);
      }}
    >
      <Field label="Position where section should be inserted">
        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition"
        >
          <option value="start">At the top</option>
          <option value="end">At the bottom</option>
          {sections.map((s) => (
            <option key={s.id} value={`after:${s.id}`}>
              After: {s.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Section name">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition"
          placeholder="Introduction"
        />
      </Field>

      <Field label="Content textbox" hint="Markdown-like plain text">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition resize-none"
          placeholder="Write your section content…"
        />
      </Field>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 px-4 rounded-xl border border-slate-200/70 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-medium shadow shadow-blue-500/15 hover:shadow-blue-500/25 transition"
        >
          Add section
        </button>
      </div>
    </form>
  );
}

function AddSubsectionForm({
  sections,
  onCancel,
  onSubmit,
}: {
  sections: PaperSection[];
  onCancel: () => void;
  onSubmit: (next: PaperSection[]) => void;
}) {
  const [parentId, setParentId] = useState<string>(sections[0]?.id ?? "");
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const next = sections.map((s) => {
          if (s.id !== parentId) return s;
          return {
            ...s,
            subsections: [
              ...s.subsections,
              { id: uid("sub"), name: name.trim() || "Untitled Subsection", content: content.trim() },
            ],
          };
        });
        onSubmit(next);
      }}
    >
      <Field label="Parent section">
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition"
        >
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Subsection name">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition"
          placeholder="Background"
        />
      </Field>

      <Field label="Content">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition resize-none"
          placeholder="Write your subsection content…"
        />
      </Field>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 px-4 rounded-xl border border-slate-200/70 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-medium shadow shadow-blue-500/15 hover:shadow-blue-500/25 transition"
        >
          Add subsection
        </button>
      </div>
    </form>
  );
}

function AddTableForm({
  sectionOptions,
  onCancel,
  onSubmit,
}: {
  sectionOptions: Array<{ id: string; name: string }>;
  onCancel: () => void;
  onSubmit: (table: { id: string; caption?: string; headers: string[]; rows: string[][]; sectionId?: string }) => void;
}) {
  const [sectionId, setSectionId] = useState<string>("");
  const [caption, setCaption] = useState("");
  const [headers, setHeaders] = useState("Column 1, Column 2, Column 3");
  const [rows, setRows] = useState("Data 1, Data 2, Data 3");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const parsedHeaders = headers
          .split(",")
          .map((h) => h.trim())
          .filter(Boolean);
        const parsedRows = rows
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => line.split(",").map((c) => c.trim()));

        onSubmit({
          id: uid("table"),
          caption: caption.trim() || undefined,
          headers: parsedHeaders,
          rows: parsedRows,
          sectionId: sectionId || undefined,
        });
      }}
    >
      <Field label="Attach to section (optional)">
        <select
          value={sectionId}
          onChange={(e) => setSectionId(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition"
        >
          <option value="">No specific section</option>
          {sectionOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Caption">
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition"
          placeholder="Table caption"
        />
      </Field>

      <Field label="Headers" hint="Comma-separated">
        <input
          value={headers}
          onChange={(e) => setHeaders(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition"
        />
      </Field>

      <Field label="Rows" hint="One row per line, comma-separated columns">
        <textarea
          value={rows}
          onChange={(e) => setRows(e.target.value)}
          rows={5}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition resize-none"
        />
      </Field>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 px-4 rounded-xl border border-slate-200/70 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-medium shadow shadow-blue-500/15 hover:shadow-blue-500/25 transition"
        >
          Add table
        </button>
      </div>
    </form>
  );
}

function AddImageForm({
  sectionOptions,
  onCancel,
  onSubmit,
}: {
  sectionOptions: Array<{ id: string; name: string }>;
  onCancel: () => void;
  onSubmit: (img: { id: string; url: string; caption?: string; alt?: string; sectionId?: string }) => void;
}) {
  const [sectionId, setSectionId] = useState<string>("");
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [alt, setAlt] = useState("");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          id: uid("img"),
          url: url.trim(),
          caption: caption.trim() || undefined,
          alt: alt.trim() || undefined,
          sectionId: sectionId || undefined,
        });
      }}
    >
      <Field label="Attach to section (optional)">
        <select
          value={sectionId}
          onChange={(e) => setSectionId(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition"
        >
          <option value="">No specific section</option>
          {sectionOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Image URL">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition"
          placeholder="https://…"
          required
        />
      </Field>

      <Field label="Caption (optional)">
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition"
          placeholder="Figure caption"
        />
      </Field>

      <Field label="Alt text (optional)">
        <input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition"
          placeholder="Describe the image"
        />
      </Field>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 px-4 rounded-xl border border-slate-200/70 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-medium shadow shadow-blue-500/15 hover:shadow-blue-500/25 transition"
        >
          Add image
        </button>
      </div>
    </form>
  );
}

function AddAuthorForm({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (author: { name: string; affiliation?: string; email?: string }) => void;
}) {
  const [name, setName] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [email, setEmail] = useState("");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          name: name.trim() || "Author",
          affiliation: affiliation.trim() || undefined,
          email: email.trim() || undefined,
        });
      }}
    >
      <Field label="Author name">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition"
          placeholder="Author Name"
          required
        />
      </Field>

      <Field label="Affiliation">
        <input
          value={affiliation}
          onChange={(e) => setAffiliation(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition"
          placeholder="University / Company"
        />
      </Field>

      <Field label="Email">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition"
          placeholder="author@university.edu"
          type="email"
        />
      </Field>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 px-4 rounded-xl border border-slate-200/70 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-medium shadow shadow-blue-500/15 hover:shadow-blue-500/25 transition"
        >
          Add author
        </button>
      </div>
    </form>
  );
}

