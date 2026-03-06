"use client";

import React, { useCallback, useMemo, useRef } from "react";
import {
  FileText,
  User,
  Mail,
  Building2,
  Image as ImageIcon,
  Table2,
  Hash,
  Trash2,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { useEditor } from "@/context/EditorContext";
import type {
  PaperDoc,
  PaperSection,
  PaperSubsection,
  PaperTable,
  PaperImage,
  PaperAuthor,
} from "@/types/editor";

/* ─────────── Helpers ─────────── */

/** Safely get innerText from a contentEditable blur event */
function textOf(e: React.FocusEvent<HTMLElement>) {
  return (e.currentTarget.textContent ?? "").trim();
}

/* ─────────── Inline-editable primitives ─────────── */

function EditableText({
  value,
  onCommit,
  className,
  placeholder,
  tag: Tag = "div",
}: {
  value: string;
  onCommit: (next: string) => void;
  className?: string;
  placeholder?: string;
  tag?: "div" | "span" | "h1" | "h2" | "h3" | "p";
}) {
  const ref = useRef<HTMLElement>(null);
  const committed = useRef(value);

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLElement>) => {
      const next = textOf(e);
      if (next !== committed.current) {
        committed.current = next;
        onCommit(next);
      }
    },
    [onCommit]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        e.currentTarget.blur();
      }
    },
    []
  );

  return (
    <Tag
      ref={ref as any}
      className={className}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      data-placeholder={placeholder}
      style={{ outline: "none", minHeight: "1.2em" }}
    >
      {value}
    </Tag>
  );
}

function EditableBlock({
  value,
  onCommit,
  className,
  placeholder,
}: {
  value: string;
  onCommit: (next: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const committed = useRef(value);

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLElement>) => {
      const next = textOf(e);
      if (next !== committed.current) {
        committed.current = next;
        onCommit(next);
      }
    },
    [onCommit]
  );

  return (
    <div
      className={className}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      data-placeholder={placeholder}
      style={{ outline: "none", minHeight: "2.4em", whiteSpace: "pre-wrap" }}
    >
      {value}
    </div>
  );
}

/* ─────────── Author Chip ─────────── */

function AuthorChip({
  author,
  index,
  onUpdate,
  onRemove,
}: {
  author: PaperAuthor;
  index: number;
  onUpdate: (i: number, a: PaperAuthor) => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div className="group relative flex items-start gap-2 px-3 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-800/40 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
      <div className="flex-shrink-0 mt-0.5 h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white flex items-center justify-center text-xs font-bold">
        {author.name?.[0]?.toUpperCase() ?? "?"}
      </div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <EditableText
          value={author.name}
          onCommit={(v) => onUpdate(index, { ...author, name: v })}
          className="text-sm font-semibold text-slate-900 dark:text-white cursor-text focus:bg-white/60 dark:focus:bg-slate-700/40 rounded px-1 -mx-1"
          placeholder="Name"
          tag="div"
        />
        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <Building2 className="h-3 w-3 flex-shrink-0" />
          <EditableText
            value={author.affiliation ?? ""}
            onCommit={(v) => onUpdate(index, { ...author, affiliation: v || undefined })}
            className="cursor-text focus:bg-white/60 dark:focus:bg-slate-700/40 rounded px-1 -mx-1"
            placeholder="Affiliation"
            tag="span"
          />
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <Mail className="h-3 w-3 flex-shrink-0" />
          <EditableText
            value={author.email ?? ""}
            onCommit={(v) => onUpdate(index, { ...author, email: v || undefined })}
            className="cursor-text focus:bg-white/60 dark:focus:bg-slate-700/40 rounded px-1 -mx-1"
            placeholder="email@example.com"
            tag="span"
          />
        </div>
      </div>
      <button
        onClick={() => onRemove(index)}
        className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
        title="Remove author"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

/* ─────────── Table Block ─────────── */

function TableBlock({
  table,
  tableIndex,
  onUpdate,
  onRemove,
}: {
  table: PaperTable;
  tableIndex: number;
  onUpdate: (t: PaperTable) => void;
  onRemove: () => void;
}) {
  const updateCell = (ri: number, ci: number, val: string) => {
    const rows = table.rows.map((r, i) =>
      i === ri ? r.map((c, j) => (j === ci ? val : c)) : [...r]
    );
    onUpdate({ ...table, rows });
  };

  const updateHeader = (ci: number, val: string) => {
    const headers = table.headers.map((h, j) => (j === ci ? val : h));
    onUpdate({ ...table, headers });
  };

  return (
    <div className="group relative my-4 rounded-xl border border-slate-200/80 dark:border-slate-700/60 overflow-hidden bg-white/50 dark:bg-slate-900/30">
      <div className="flex items-center justify-between px-3 py-2 bg-emerald-50/60 dark:bg-emerald-950/20 border-b border-slate-200/80 dark:border-slate-700/60">
        <div className="flex items-center gap-2">
          <Table2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
            Table {tableIndex + 1}
          </span>
        </div>
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 rounded bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-800/40"
          title="Remove table"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
      {table.caption && (
        <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
          <EditableText
            value={table.caption}
            onCommit={(v) => onUpdate({ ...table, caption: v })}
            className="text-xs italic text-slate-600 dark:text-slate-400 cursor-text focus:bg-white/60 dark:focus:bg-slate-700/40 rounded px-1 -mx-1"
            placeholder="Table caption"
            tag="span"
          />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/40">
              {table.headers.map((h, ci) => (
                <th
                  key={ci}
                  className="px-3 py-1.5 text-left font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200/60 dark:border-slate-700/50"
                >
                  <EditableText
                    value={h}
                    onCommit={(v) => updateHeader(ci, v)}
                    className="cursor-text focus:bg-white/60 dark:focus:bg-slate-700/40 rounded px-1 -mx-1"
                    placeholder="Header"
                    tag="span"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr
                key={ri}
                className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
              >
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-1.5 text-slate-700 dark:text-slate-300">
                    <EditableText
                      value={cell}
                      onCommit={(v) => updateCell(ri, ci, v)}
                      className="cursor-text focus:bg-white/60 dark:focus:bg-slate-700/40 rounded px-1 -mx-1"
                      placeholder="—"
                      tag="span"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────── Image / Figure Block ─────────── */

function FigureBlock({
  image,
  figureIndex,
  onUpdate,
  onRemove,
}: {
  image: PaperImage;
  figureIndex: number;
  onUpdate: (img: PaperImage) => void;
  onRemove: () => void;
}) {
  return (
    <div className="group relative my-4 rounded-xl border border-slate-200/80 dark:border-slate-700/60 overflow-hidden bg-white/50 dark:bg-slate-900/30">
      <div className="flex items-center justify-between px-3 py-2 bg-amber-50/60 dark:bg-amber-950/20 border-b border-slate-200/80 dark:border-slate-700/60">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
            Figure {figureIndex + 1}
          </span>
        </div>
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 rounded bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-800/40"
          title="Remove figure"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
      <div className="p-3 flex flex-col items-center gap-2">
        {image.url ? (
          <img
            src={image.url}
            alt={image.alt ?? image.caption ?? ""}
            className="max-w-full max-h-48 rounded-lg object-contain border border-slate-200/60 dark:border-slate-700/50"
          />
        ) : (
          <div className="w-full h-28 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs">
            No image URL
          </div>
        )}
        {image.caption !== undefined && (
          <EditableText
            value={image.caption ?? ""}
            onCommit={(v) => onUpdate({ ...image, caption: v })}
            className="text-xs italic text-slate-600 dark:text-slate-400 cursor-text text-center w-full focus:bg-white/60 dark:focus:bg-slate-700/40 rounded px-1"
            placeholder="Figure caption"
            tag="span"
          />
        )}
      </div>
    </div>
  );
}

/* ─────────── Section Block ─────────── */

function SectionBlock({
  section,
  sectionIndex,
  sectionTables,
  sectionImages,
  onUpdateSection,
  onUpdateSubsection,
  onUpdateTable,
  onRemoveTable,
  onUpdateImage,
  onRemoveImage,
  globalTableOffset,
  globalImageOffset,
}: {
  section: PaperSection;
  sectionIndex: number;
  sectionTables: PaperTable[];
  sectionImages: PaperImage[];
  onUpdateSection: (s: PaperSection) => void;
  onUpdateSubsection: (sectionId: string, subIndex: number, sub: PaperSubsection) => void;
  onUpdateTable: (t: PaperTable) => void;
  onRemoveTable: (tableId: string) => void;
  onUpdateImage: (img: PaperImage) => void;
  onRemoveImage: (imgId: string) => void;
  globalTableOffset: number;
  globalImageOffset: number;
}) {
  return (
    <div className="relative">
      {/* Section heading with number badge */}
      <div className="flex items-start gap-3 mb-2">
        <div className="flex-shrink-0 mt-0.5 h-6 w-6 rounded-lg bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
          {sectionIndex + 1}
        </div>
        <EditableText
          value={section.name}
          onCommit={(v) => onUpdateSection({ ...section, name: v })}
          className="flex-1 text-base font-bold text-slate-900 dark:text-white cursor-text focus:bg-white/60 dark:focus:bg-slate-700/40 rounded px-1.5 -mx-1.5 py-0.5"
          placeholder="Section Title"
          tag="h2"
        />
      </div>

      <div className="ml-9">
        <EditableBlock
          value={section.content}
          onCommit={(v) => onUpdateSection({ ...section, content: v })}
          className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 cursor-text focus:bg-white/60 dark:focus:bg-slate-700/40 rounded px-1.5 -mx-1.5 py-1"
          placeholder="Write section content…"
        />

        {/* Subsections */}
        {section.subsections.map((sub, si) => (
          <div key={sub.id} className="mt-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 tabular-nums">
                {sectionIndex + 1}.{si + 1}
              </span>
              <EditableText
                value={sub.name}
                onCommit={(v) =>
                  onUpdateSubsection(section.id, si, { ...sub, name: v })
                }
                className="text-sm font-semibold text-slate-800 dark:text-slate-200 cursor-text focus:bg-white/60 dark:focus:bg-slate-700/40 rounded px-1 -mx-1"
                placeholder="Subsection Title"
                tag="h3"
              />
            </div>
            <EditableBlock
              value={sub.content}
              onCommit={(v) =>
                onUpdateSubsection(section.id, si, { ...sub, content: v })
              }
              className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 cursor-text focus:bg-white/60 dark:focus:bg-slate-700/40 rounded px-1.5 -mx-1.5 py-1 ml-5"
              placeholder="Write subsection content…"
            />
          </div>
        ))}

        {/* Tables assigned to this section */}
        {sectionTables.map((t, ti) => (
          <TableBlock
            key={t.id}
            table={t}
            tableIndex={globalTableOffset + ti}
            onUpdate={onUpdateTable}
            onRemove={() => onRemoveTable(t.id)}
          />
        ))}

        {/* Images assigned to this section */}
        {sectionImages.map((img, ii) => (
          <FigureBlock
            key={img.id}
            image={img}
            figureIndex={globalImageOffset + ii}
            onUpdate={onUpdateImage}
            onRemove={() => onRemoveImage(img.id)}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════ Main Component ═══════════ */

export function EditorPanel() {
  const { doc, updateDoc } = useEditor();

  const stats = useMemo(
    () => ({
      sections: doc.sections.length,
      subsections: doc.sections.reduce((acc, s) => acc + (s.subsections?.length ?? 0), 0),
      tables: doc.tables.length,
      images: doc.images.length,
    }),
    [doc.images.length, doc.sections, doc.tables.length]
  );

  /* ── Author CRUD ── */
  const handleAuthorUpdate = useCallback(
    (i: number, a: PaperAuthor) => {
      const authors = doc.authors.map((au, j) => (j === i ? a : au));
      updateDoc({ authors });
    },
    [doc.authors, updateDoc]
  );

  const handleAuthorRemove = useCallback(
    (i: number) => {
      updateDoc({ authors: doc.authors.filter((_, j) => j !== i) });
    },
    [doc.authors, updateDoc]
  );

  const handleAuthorAdd = useCallback(() => {
    updateDoc({
      authors: [
        ...doc.authors,
        { name: "New Author", affiliation: "Affiliation", email: "email@example.com" },
      ],
    });
  }, [doc.authors, updateDoc]);

  /* ── Section update ── */
  const handleSectionUpdate = useCallback(
    (idx: number, s: PaperSection) => {
      const sections = doc.sections.map((sec, j) => (j === idx ? s : sec));
      updateDoc({ sections });
    },
    [doc.sections, updateDoc]
  );

  const handleSubsectionUpdate = useCallback(
    (sectionId: string, subIdx: number, sub: PaperSubsection) => {
      const sections = doc.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        const subsections = sec.subsections.map((ss, j) => (j === subIdx ? sub : ss));
        return { ...sec, subsections };
      });
      updateDoc({ sections });
    },
    [doc.sections, updateDoc]
  );

  /* ── Table CRUD ── */
  const handleTableUpdate = useCallback(
    (t: PaperTable) => {
      updateDoc({ tables: doc.tables.map((tb) => (tb.id === t.id ? t : tb)) });
    },
    [doc.tables, updateDoc]
  );

  const handleTableRemove = useCallback(
    (id: string) => {
      updateDoc({ tables: doc.tables.filter((t) => t.id !== id) });
    },
    [doc.tables, updateDoc]
  );

  /* ── Image CRUD ── */
  const handleImageUpdate = useCallback(
    (img: PaperImage) => {
      updateDoc({ images: doc.images.map((im) => (im.id === img.id ? img : im)) });
    },
    [doc.images, updateDoc]
  );

  const handleImageRemove = useCallback(
    (id: string) => {
      updateDoc({ images: doc.images.filter((im) => im.id !== id) });
    },
    [doc.images, updateDoc]
  );

  /* ── Organise tables & images by section ── */
  const tablesMap = new Map<string | undefined, PaperTable[]>();
  for (const t of doc.tables) {
    const key = t.sectionId;
    if (!tablesMap.has(key)) tablesMap.set(key, []);
    tablesMap.get(key)!.push(t);
  }

  const imagesMap = new Map<string | undefined, PaperImage[]>();
  for (const img of doc.images) {
    const key = img.sectionId;
    if (!imagesMap.has(key)) imagesMap.set(key, []);
    imagesMap.get(key)!.push(img);
  }

  let runningTableOffset = 0;
  let runningImageOffset = 0;

  const unassignedTables = tablesMap.get(undefined) ?? [];
  const unassignedImages = imagesMap.get(undefined) ?? [];

  return (
    <div className="h-full min-h-0 flex flex-col bg-white/55 dark:bg-slate-950/35 backdrop-blur border-r border-slate-200/70 dark:border-slate-800">
      {/* ── Header ── */}
      <div className="h-12 flex items-center justify-between gap-3 px-3 border-b border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white flex items-center justify-center">
            <FileText className="h-4 w-4" />
          </div>
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 tracking-wide">
            Document Editor
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Legend stats={stats} />
          <div className="h-8 px-3 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 border-emerald-200/70 dark:border-emerald-900/40 bg-emerald-50/70 dark:bg-emerald-950/25 text-emerald-700 dark:text-emerald-200">
            <CheckCircle2 className="h-4 w-4" />
            Synced
          </div>
        </div>
      </div>

      {/* ── Scrollable Body ── */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-[720px] mx-auto px-5 py-6 space-y-7">
          {/* ─ Title ─ */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-1.5">
              Title
            </label>
            <EditableText
              value={doc.title}
              onCommit={(v) => updateDoc({ title: v })}
              className="text-xl font-extrabold text-slate-900 dark:text-white leading-snug cursor-text focus:bg-white/60 dark:focus:bg-slate-700/40 rounded-lg px-2 -mx-2 py-1"
              placeholder="Paper Title"
              tag="h1"
            />
          </div>

          {/* ─ Authors ─ */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-2">
              <User className="inline h-3 w-3 mr-1 -mt-0.5" />
              Authors
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {doc.authors.map((a, i) => (
                <AuthorChip
                  key={i}
                  author={a}
                  index={i}
                  onUpdate={handleAuthorUpdate}
                  onRemove={handleAuthorRemove}
                />
              ))}
              <button
                onClick={handleAuthorAdd}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-blue-400 hover:text-blue-500 dark:hover:border-blue-600 dark:hover:text-blue-400 transition-colors text-xs font-medium"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Author
              </button>
            </div>
          </div>

          {/* ─ Abstract ─ */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-1.5">
              Abstract
            </label>
            <div className="rounded-xl border border-blue-200/60 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/15 p-3">
              <EditableBlock
                value={doc.abstract}
                onCommit={(v) => updateDoc({ abstract: v })}
                className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 italic cursor-text focus:bg-white/60 dark:focus:bg-slate-700/40 rounded px-1.5 -mx-1.5 py-0.5"
                placeholder="Write your abstract here…"
              />
            </div>
          </div>

          {/* ─ Sections ─ */}
          <div className="space-y-6">
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-1">
              <Hash className="inline h-3 w-3 mr-1 -mt-0.5" />
              Sections
            </label>
            {doc.sections.map((sec, idx) => {
              const secTables = tablesMap.get(sec.id) ?? [];
              const secImages = imagesMap.get(sec.id) ?? [];
              const tableOffset = runningTableOffset;
              const imageOffset = runningImageOffset;
              runningTableOffset += secTables.length;
              runningImageOffset += secImages.length;

              return (
                <React.Fragment key={sec.id}>
                  {idx > 0 && (
                    <hr className="border-slate-200/70 dark:border-slate-800" />
                  )}
                  <SectionBlock
                    section={sec}
                    sectionIndex={idx}
                    sectionTables={secTables}
                    sectionImages={secImages}
                    onUpdateSection={(s) => handleSectionUpdate(idx, s)}
                    onUpdateSubsection={handleSubsectionUpdate}
                    onUpdateTable={handleTableUpdate}
                    onRemoveTable={handleTableRemove}
                    onUpdateImage={handleImageUpdate}
                    onRemoveImage={handleImageRemove}
                    globalTableOffset={tableOffset}
                    globalImageOffset={imageOffset}
                  />
                </React.Fragment>
              );
            })}
          </div>

          {/* ─ Unassigned Tables ─ */}
          {unassignedTables.length > 0 && (
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-2">
                <Table2 className="inline h-3 w-3 mr-1 -mt-0.5" />
                Tables
              </label>
              {unassignedTables.map((t, ti) => (
                <TableBlock
                  key={t.id}
                  table={t}
                  tableIndex={runningTableOffset + ti}
                  onUpdate={handleTableUpdate}
                  onRemove={() => handleTableRemove(t.id)}
                />
              ))}
            </div>
          )}

          {/* ─ Unassigned Images ─ */}
          {unassignedImages.length > 0 && (
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-2">
                <ImageIcon className="inline h-3 w-3 mr-1 -mt-0.5" />
                Figures
              </label>
              {unassignedImages.map((img, ii) => (
                <FigureBlock
                  key={img.id}
                  image={img}
                  figureIndex={runningImageOffset + ii}
                  onUpdate={handleImageUpdate}
                  onRemove={() => handleImageRemove(img.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────── Legend (stats chips) ─────────── */

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
