import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, Download, Maximize2, Minimize2, X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { useEditor } from "@/context/EditorContext";
import type { ConferenceId, PaperDoc } from "@/types/editor";

/* ─── Conference-specific formatting config ─── */

type CitationStyle = "numbered" | "author-year" | "superscript";
type HeadingTransform = "uppercase" | "titlecase" | "none";

interface ConferenceFormat {
  layout: "single" | "two-column";
  fontFamily: string;
  baseFontSize: string;
  titleFontSize: string;
  headingNumbered: boolean;
  headingTransform: HeadingTransform;
  citationStyle: CitationStyle;
  abstractLabel: string;
  showKeywords: boolean;
  paperPadding: string;
  headerInfo: string;
  headerColor: string;
  accentColor: string;
  authorStyle: "inline" | "block" | "superscript";
  sectionDivider: boolean;
}

const CONFERENCE_FORMATS: Record<ConferenceId, ConferenceFormat> = {
  ieee: {
    layout: "two-column",
    fontFamily: '"Times New Roman", Times, serif',
    baseFontSize: "10pt",
    titleFontSize: "1.5rem",
    headingNumbered: true,
    headingTransform: "uppercase",
    citationStyle: "numbered",
    abstractLabel: "Abstract",
    showKeywords: false,
    paperPadding: "2rem 2.5rem",
    headerInfo: "IEEE Conference Publication",
    headerColor: "#1a56db",
    accentColor: "#1a56db",
    authorStyle: "inline",
    sectionDivider: false,
  },
  acm: {
    layout: "single",
    fontFamily: 'Charter, "Bitstream Charter", "Times New Roman", serif',
    baseFontSize: "10pt",
    titleFontSize: "1.75rem",
    headingNumbered: true,
    headingTransform: "titlecase",
    citationStyle: "author-year",
    abstractLabel: "ABSTRACT",
    showKeywords: true,
    paperPadding: "2.5rem 3rem",
    headerInfo: "ACM SIGCONF",
    headerColor: "#0e7490",
    accentColor: "#0e7490",
    authorStyle: "block",
    sectionDivider: false,
  },
  nature: {
    layout: "single",
    fontFamily: 'Georgia, "Times New Roman", serif',
    baseFontSize: "11pt",
    titleFontSize: "2rem",
    headingNumbered: false,
    headingTransform: "none",
    citationStyle: "superscript",
    abstractLabel: "Abstract",
    showKeywords: false,
    paperPadding: "3rem 3.5rem",
    headerInfo: "Nature Publishing Group",
    headerColor: "#dc2626",
    accentColor: "#dc2626",
    authorStyle: "superscript",
    sectionDivider: true,
  },
  springer: {
    layout: "two-column",
    fontFamily: '"Computer Modern", "Latin Modern", Georgia, serif',
    baseFontSize: "10pt",
    titleFontSize: "1.5rem",
    headingNumbered: true,
    headingTransform: "titlecase",
    citationStyle: "numbered",
    abstractLabel: "Abstract.",
    showKeywords: true,
    paperPadding: "2rem 2.5rem",
    headerInfo: "Springer LNCS Proceedings",
    headerColor: "#4338ca",
    accentColor: "#4338ca",
    authorStyle: "inline",
    sectionDivider: false,
  },
  arxiv: {
    layout: "single",
    fontFamily: '"Computer Modern", "Latin Modern", Georgia, serif',
    baseFontSize: "12pt",
    titleFontSize: "1.75rem",
    headingNumbered: true,
    headingTransform: "titlecase",
    citationStyle: "numbered",
    abstractLabel: "Abstract",
    showKeywords: false,
    paperPadding: "2.5rem 3rem",
    headerInfo: "arXiv Preprint",
    headerColor: "#b91c1c",
    accentColor: "#b91c1c",
    authorStyle: "inline",
    sectionDivider: false,
  },
  iclr: {
    layout: "two-column",
    fontFamily: '"Times New Roman", Times, serif',
    baseFontSize: "10pt",
    titleFontSize: "1.5rem",
    headingNumbered: true,
    headingTransform: "titlecase",
    citationStyle: "numbered",
    abstractLabel: "Abstract",
    showKeywords: true,
    paperPadding: "2rem 2.5rem",
    headerInfo: "ICLR Submission",
    headerColor: "#7c3aed",
    accentColor: "#7c3aed",
    authorStyle: "inline",
    sectionDivider: false,
  },
  cvpr: {
    layout: "two-column",
    fontFamily: '"Times New Roman", Times, serif',
    baseFontSize: "10pt",
    titleFontSize: "1.5rem",
    headingNumbered: true,
    headingTransform: "titlecase",
    citationStyle: "numbered",
    abstractLabel: "Abstract",
    showKeywords: false,
    paperPadding: "2rem 2.5rem",
    headerInfo: "IEEE/CVF CVPR",
    headerColor: "#059669",
    accentColor: "#059669",
    authorStyle: "inline",
    sectionDivider: false,
  },
  acl: {
    layout: "single",
    fontFamily: '"Times New Roman", Times, serif',
    baseFontSize: "11pt",
    titleFontSize: "1.75rem",
    headingNumbered: true,
    headingTransform: "titlecase",
    citationStyle: "author-year",
    abstractLabel: "Abstract",
    showKeywords: false,
    paperPadding: "2.5rem 3rem",
    headerInfo: "ACL Submission",
    headerColor: "#ea580c",
    accentColor: "#ea580c",
    authorStyle: "inline",
    sectionDivider: false,
  },
};

function formatCitation(style: CitationStyle, index: number): string {
  switch (style) {
    case "numbered":
      return `[${index}]`;
    case "author-year":
      return `(Author et al., ${2024 - index})`;
    case "superscript":
      return `${index}`;
    default:
      return `[${index}]`;
  }
}

function transformHeading(text: string, transform: HeadingTransform): string {
  switch (transform) {
    case "uppercase":
      return text.toUpperCase();
    case "titlecase":
      return text.replace(/\b\w/g, (c) => c.toUpperCase());
    case "none":
    default:
      return text;
  }
}

/* ─── Component ─── */

/* ─── Shared paper content renderer ─── */

function PaperContent({
  doc,
  fmt,
  assetsBySection,
  isFullPage,
}: {
  doc: PaperDoc;
  fmt: ConferenceFormat;
  assetsBySection: {
    tables: Map<string, PaperDoc["tables"]>;
    images: Map<string, PaperDoc["images"]>;
  };
  isFullPage?: boolean;
}) {
  return (
    <div
      className="bg-white text-slate-900 shadow-[0_30px_120px_rgba(2,6,23,0.18)] rounded-2xl border border-slate-200"
      style={{ fontFamily: fmt.fontFamily }}
    >
      {/* Conference header banner */}
      <div
        className="rounded-t-2xl px-6 py-2 text-[10px] font-bold tracking-widest text-white uppercase text-center"
        style={{ backgroundColor: fmt.accentColor }}
      >
        {fmt.headerInfo}
      </div>

      {/* Main content area */}
      <div
        className={isFullPage && fmt.layout === "two-column" ? "columns-2 gap-10" : fmt.layout === "two-column" ? "columns-1 lg:columns-2 gap-10" : ""}
        style={{ padding: fmt.paperPadding, fontSize: fmt.baseFontSize }}
      >
        {/* ── Title ── */}
        <div className="break-inside-avoid">
          <h1
            className="font-bold text-center leading-tight"
            style={{ fontSize: fmt.titleFontSize }}
          >
            {doc.title}
          </h1>

          {/* ── Authors ── */}
          <div className="mt-4 text-center text-sm text-slate-700">
            {doc.authors.map((a, idx) => (
              <div key={`${a.name}-${idx}`} className={fmt.authorStyle === "block" ? "mb-3" : "inline-block px-3 py-1"}>
                <div className="font-semibold">
                  {a.name}
                  {fmt.authorStyle === "superscript" && (
                    <sup className="text-[9px] ml-0.5" style={{ color: fmt.accentColor }}>{idx + 1}</sup>
                  )}
                </div>
                {a.affiliation && (
                  <div className="text-xs text-slate-600">
                    {fmt.authorStyle === "superscript" && <sup className="text-[9px] mr-0.5">{idx + 1}</sup>}
                    {a.affiliation}
                  </div>
                )}
                {a.email && <div className="text-xs text-slate-500 italic">{a.email}</div>}
              </div>
            ))}
          </div>

          {/* ── Abstract ── */}
          <div className={`mt-6 py-4 ${fmt.sectionDivider ? "border-y border-slate-200" : "border-t border-slate-200"}`}>
            <h2
              className="font-bold mb-2"
              style={{
                fontSize: fmt.headingTransform === "uppercase" ? "0.7rem" : "0.85rem",
                letterSpacing: fmt.headingTransform === "uppercase" ? "0.05em" : "normal",
              }}
            >
              {fmt.abstractLabel}
            </h2>
            <p className="text-sm leading-relaxed text-justify">{doc.abstract}</p>
          </div>

          {/* ── Keywords ── */}
          {fmt.showKeywords && (
            <div className="mt-2 mb-4">
              <span className="text-xs font-bold">Keywords: </span>
              <span className="text-xs text-slate-600 italic">keyword1, keyword2, keyword3</span>
            </div>
          )}
        </div>

        {/* ── Sections ── */}
        <div className="mt-6 space-y-6">
          {doc.sections.map((section, idx) => (
            <div key={section.id} className="break-inside-avoid">
              <h2
                className="font-bold"
                style={{
                  fontSize: fmt.headingTransform === "uppercase" ? "0.75rem" : "0.9rem",
                  letterSpacing: fmt.headingTransform === "uppercase" ? "0.04em" : "normal",
                  borderBottom: fmt.sectionDivider ? "1px solid #e2e8f0" : "none",
                  paddingBottom: fmt.sectionDivider ? "0.25rem" : "0",
                }}
              >
                {fmt.headingNumbered ? `${idx + 1}. ` : ""}
                {transformHeading(section.name, fmt.headingTransform)}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-justify">{section.content}</p>

              {/* Section images */}
              {(assetsBySection.images.get(section.id) ?? []).map((img, imageIdx) => (
                <figure key={img.id} className="mt-4">
                  <div className="relative w-full h-56 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    {img.url ? (
                      <img src={img.url} alt={img.alt ?? `Figure ${imageIdx + 1}`} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                    ) : null}
                  </div>
                  {img.caption && (
                    <figcaption className="mt-2 text-xs text-slate-600 text-center italic">
                      <span className="font-bold not-italic">Figure {imageIdx + 1}:</span> {img.caption}
                    </figcaption>
                  )}
                </figure>
              ))}

              {/* Section tables */}
              {(assetsBySection.tables.get(section.id) ?? []).map((t, tIdx) => (
                <div key={t.id} className="mt-4">
                  {t.caption && (
                    <div className="mb-2 text-xs text-slate-700 text-center">
                      <span className="font-bold">Table {tIdx + 1}:</span> {t.caption}
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="border-b-2 border-slate-900">
                          {t.headers.map((h, hIdx) => (<th key={hIdx} className="text-left py-2 pr-3 font-bold">{h}</th>))}
                        </tr>
                      </thead>
                      <tbody>
                        {t.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="border-b border-slate-200">
                            {row.map((cell, cIdx) => (<td key={cIdx} className="py-2 pr-3 align-top">{cell}</td>))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {/* Subsections */}
              {section.subsections.length > 0 && (
                <div className="mt-4 space-y-4">
                  {section.subsections.map((sub, subIdx) => (
                    <div key={sub.id}>
                      <h3
                        className="text-sm font-bold"
                        style={{ fontStyle: fmt.headingTransform === "none" ? "italic" : "normal" }}
                      >
                        {fmt.headingNumbered ? `${idx + 1}.${subIdx + 1} ` : ""}
                        {transformHeading(sub.name, fmt.headingTransform)}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-justify">{sub.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Unattached images */}
          {(assetsBySection.images.get("") ?? []).length > 0 && (
            <div className="break-inside-avoid">
              <h2 className="text-base font-bold">
                {fmt.headingNumbered ? `${doc.sections.length + 1}. ` : ""}
                {transformHeading("Figures", fmt.headingTransform)}
              </h2>
              {(assetsBySection.images.get("") ?? []).map((img, imageIdx) => (
                <figure key={img.id} className="mt-4">
                  <div className="relative w-full h-56 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    {img.url ? (<img src={img.url} alt={img.alt ?? `Figure ${imageIdx + 1}`} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />) : null}
                  </div>
                  {img.caption && (
                    <figcaption className="mt-2 text-xs text-slate-600 text-center italic">
                      <span className="font-bold not-italic">Figure {imageIdx + 1}:</span> {img.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}

          {/* Unattached tables */}
          {(assetsBySection.tables.get("") ?? []).length > 0 && (
            <div className="break-inside-avoid">
              <h2 className="text-base font-bold">{transformHeading("Tables", fmt.headingTransform)}</h2>
              {(assetsBySection.tables.get("") ?? []).map((t, tIdx) => (
                <div key={t.id} className="mt-4">
                  {t.caption && (
                    <div className="mb-2 text-xs text-slate-700 text-center">
                      <span className="font-bold">Table {tIdx + 1}:</span> {t.caption}
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead><tr className="border-b-2 border-slate-900">{t.headers.map((h, hIdx) => (<th key={hIdx} className="text-left py-2 pr-3 font-bold">{h}</th>))}</tr></thead>
                      <tbody>{t.rows.map((row, rIdx) => (<tr key={rIdx} className="border-b border-slate-200">{row.map((cell, cIdx) => (<td key={cIdx} className="py-2 pr-3 align-top">{cell}</td>))}</tr>))}</tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* References */}
          <div className="break-inside-avoid mt-8 pt-4 border-t border-slate-300">
            <h2
              className="font-bold mb-3"
              style={{
                fontSize: fmt.headingTransform === "uppercase" ? "0.75rem" : "0.9rem",
                letterSpacing: fmt.headingTransform === "uppercase" ? "0.04em" : "normal",
              }}
            >
              {transformHeading("References", fmt.headingTransform)}
            </h2>
            <div className="space-y-1.5">
              <div className="text-xs text-slate-600 leading-relaxed flex gap-2">
                <span className="font-mono shrink-0" style={{ color: fmt.accentColor }}>
                  {fmt.citationStyle === "superscript" ? <sup>1</sup> : formatCitation(fmt.citationStyle, 1)}
                </span>
                <span>Author, A., et al., &ldquo;Title of the paper&rdquo;, <em>Conference/Journal Name</em>, 2024.</span>
              </div>
              <div className="text-xs text-slate-600 leading-relaxed flex gap-2">
                <span className="font-mono shrink-0" style={{ color: fmt.accentColor }}>
                  {fmt.citationStyle === "superscript" ? <sup>2</sup> : formatCitation(fmt.citationStyle, 2)}
                </span>
                <span>Author, B., &ldquo;Another paper title&rdquo;, <em>Publication Name</em>, 2023.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conference footer */}
      <div className="rounded-b-2xl px-6 py-2 text-[9px] text-slate-500 text-center border-t border-slate-100 bg-slate-50/50">
        Formatted following {fmt.headerInfo} guidelines • {fmt.layout === "two-column" ? "Two-Column" : "Single-Column"} Layout • {fmt.citationStyle === "numbered" ? "Numbered" : fmt.citationStyle === "author-year" ? "Author-Year" : "Superscript"} Citations • Font: {fmt.fontFamily.split(",")[0].replace(/"/g, "")}
      </div>
    </div>
  );
}

/* ─── Full-Page Preview Overlay ─── */

function FullPageOverlay({
  doc,
  fmt,
  assetsBySection,
  selectedConference,
  onClose,
}: {
  doc: PaperDoc;
  fmt: ConferenceFormat;
  assetsBySection: {
    tables: Map<string, PaperDoc["tables"]>;
    images: Map<string, PaperDoc["images"]>;
  };
  selectedConference: ConferenceId;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === "=") { e.preventDefault(); setZoom((z) => Math.min(200, z + 10)); }
      if ((e.ctrlKey || e.metaKey) && e.key === "-") { e.preventDefault(); setZoom((z) => Math.max(50, z - 10)); }
      if ((e.ctrlKey || e.metaKey) && e.key === "0") { e.preventDefault(); setZoom(100); }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-100 dark:bg-slate-900">
      {/* ── Sticky toolbar ── */}
      <div
        className="h-14 flex items-center justify-between gap-4 px-5 border-b border-slate-200/70 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur shrink-0"
      >
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center text-white shadow-sm"
            style={{ backgroundColor: fmt.accentColor }}
          >
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              Full Page Preview
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: fmt.accentColor }}
              >
                {selectedConference.toUpperCase()}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              {fmt.layout === "two-column" ? "Two-Column" : "Single-Column"} • {fmt.fontFamily.split(",")[0].replace(/"/g, "")} • {fmt.citationStyle === "numbered" ? "Numbered [1]" : fmt.citationStyle === "author-year" ? "Author-Year" : "Superscript"} Citations
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 px-1 py-1">
            <button
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              className="h-7 w-7 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition inline-flex items-center justify-center text-slate-600 dark:text-slate-300"
              title="Zoom Out (Ctrl+-)"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-200 w-10 text-center tabular-nums">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(200, z + 10))}
              className="h-7 w-7 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition inline-flex items-center justify-center text-slate-600 dark:text-slate-300"
              title="Zoom In (Ctrl+=)"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setZoom(100)}
              className="h-7 w-7 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition inline-flex items-center justify-center text-slate-600 dark:text-slate-300"
              title="Reset Zoom (Ctrl+0)"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Print/Export */}
          <button
            onClick={() => window.print()}
            className="h-9 px-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200 transition text-xs font-medium inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950/30 dark:hover:border-red-800 transition inline-flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400"
            title="Close Full Preview (Escape)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Scrollable paper area ── */}
      <div className="flex-1 min-h-0 overflow-auto">
        <div
          className="mx-auto py-10 px-6 transition-transform duration-150 origin-top"
          style={{
            maxWidth: "210mm",
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
          }}
        >
          <PaperContent doc={doc} fmt={fmt} assetsBySection={assetsBySection} isFullPage />
        </div>
      </div>

      {/* ── Bottom status bar ── */}
      <div className="h-8 flex items-center justify-center gap-4 px-5 border-t border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur shrink-0 text-[10px] text-slate-500 dark:text-slate-400">
        <span>A4 Paper (210 × 297 mm)</span>
        <span>•</span>
        <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono text-[9px]">Esc</kbd> to close</span>
        <span>•</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono text-[9px]">Ctrl +/-</kbd> to zoom</span>
      </div>
    </div>
  );
}

/* ─── Main PreviewPanel ─── */

export function PreviewPanel() {
  const { doc, selectedConference } = useEditor();
  const fmt = CONFERENCE_FORMATS[selectedConference] ?? CONFERENCE_FORMATS.ieee;
  const [isFullscreen, setIsFullscreen] = useState(false);

  const closeFullscreen = useCallback(() => setIsFullscreen(false), []);

  const assetsBySection = useMemo(() => {
    const tables = new Map<string, typeof doc.tables>();
    const images = new Map<string, typeof doc.images>();
    for (const t of doc.tables) {
      const key = t.sectionId ?? "";
      tables.set(key, [...(tables.get(key) ?? []), t]);
    }
    for (const img of doc.images) {
      const key = img.sectionId ?? "";
      images.set(key, [...(images.get(key) ?? []), img]);
    }
    return { tables, images };
  }, [doc]);

  return (
    <>
      <div className="h-full min-h-0 flex flex-col bg-white/55 dark:bg-slate-950/35 backdrop-blur">
        {/* ── Header Bar ── */}
        <div className="h-12 flex items-center justify-between gap-3 px-3 border-b border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: fmt.accentColor }}
            >
              <FileText className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 tracking-wide">
                Live Preview
              </div>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white tracking-wide"
                style={{ backgroundColor: fmt.accentColor }}
              >
                {selectedConference.toUpperCase()}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {fmt.layout === "two-column" ? "Two-Column" : "Single-Column"} • {fmt.citationStyle === "numbered" ? "[1]" : fmt.citationStyle === "author-year" ? "(Author, Year)" : "Superscript"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(true)}
              className="h-8 px-3 rounded-xl border border-slate-200/70 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 transition text-xs font-medium inline-flex items-center gap-2 text-slate-700 dark:text-slate-200"
              title="Full Page Preview"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              Full Preview
            </button>
            <button
              onClick={() => window.print()}
              className="h-8 px-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200 transition text-xs font-medium inline-flex items-center gap-2"
              title="Print (placeholder for PDF export)"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* ── Paper Body ── */}
        <div className="flex-1 min-h-0 overflow-auto p-5 bg-slate-50/60 dark:bg-slate-950/20">
          <div className="mx-auto max-w-5xl">
            <PaperContent doc={doc} fmt={fmt} assetsBySection={assetsBySection} />
          </div>
        </div>
      </div>

      {/* Full-page overlay */}
      {isFullscreen && (
        <FullPageOverlay
          doc={doc}
          fmt={fmt}
          assetsBySection={assetsBySection}
          selectedConference={selectedConference}
          onClose={closeFullscreen}
        />
      )}
    </>
  );
}
