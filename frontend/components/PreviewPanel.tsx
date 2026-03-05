import React, { useMemo } from "react";
import { FileText, Download } from "lucide-react";
import { useEditor } from "@/context/EditorContext";

export function PreviewPanel() {
  const { doc, selectedConference } = useEditor();

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

  const isIEEE = selectedConference === "IEEE";
  const isACM = selectedConference === "ACM";

  return (
    <div className="h-full min-h-0 flex flex-col bg-white/55 dark:bg-slate-950/35 backdrop-blur">
      <div className="h-12 flex items-center justify-between gap-3 px-3 border-b border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center">
            <FileText className="h-4 w-4" />
          </div>
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 tracking-wide">
            Live Preview • {selectedConference}
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="h-8 px-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200 transition text-xs font-medium inline-flex items-center gap-2"
          title="Print (placeholder for PDF export)"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-auto p-5 bg-slate-50/60 dark:bg-slate-950/20">
        <div className="mx-auto max-w-5xl">
          <div
            className={[
              "bg-white text-slate-900 shadow-[0_30px_120px_rgba(2,6,23,0.18)]",
              "rounded-2xl border border-slate-200",
              isIEEE ? "columns-1 lg:columns-2 gap-10" : "",
            ].join(" ")}
            style={{
              fontFamily: isACM ? 'Charter, "Times New Roman", serif' : 'Georgia, "Times New Roman", serif',
            }}
          >
            <div className="p-10 break-inside-avoid">
              <h1 className="text-3xl font-bold text-center leading-tight">{doc.title}</h1>

              <div className="mt-4 text-center text-sm text-slate-700">
                {doc.authors.map((a, idx) => (
                  <div key={`${a.name}-${idx}`} className="inline-block px-3 py-1">
                    <div className="font-semibold">{a.name}</div>
                    {a.affiliation ? <div className="text-xs text-slate-600">{a.affiliation}</div> : null}
                    {a.email ? <div className="text-xs text-slate-600">{a.email}</div> : null}
                  </div>
                ))}
              </div>

              <div className="mt-6 border-y border-slate-200 py-4">
                <h2 className="text-lg font-bold mb-2">Abstract</h2>
                <p className="text-sm leading-relaxed text-justify">{doc.abstract}</p>
              </div>

              <div className="mt-6 space-y-6">
                {doc.sections.map((section, idx) => (
                  <div key={section.id} className="break-inside-avoid">
                    <h2 className="text-base font-bold">
                      {idx + 1}. {section.name}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-justify">{section.content}</p>

                    {(assetsBySection.images.get(section.id) ?? []).map((img, imageIdx) => (
                      <figure key={img.id} className="mt-4">
                        <div className="relative w-full h-56 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                          {img.url ? (
                            // Using <img> keeps this fully static (no Next Image remote config needed).
                            <img
                              src={img.url}
                              alt={img.alt ?? `Figure ${imageIdx + 1}`}
                              className="absolute inset-0 h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : null}
                        </div>
                        {img.caption ? (
                          <figcaption className="mt-2 text-xs text-slate-600 text-center italic">
                            Figure {imageIdx + 1}: {img.caption}
                          </figcaption>
                        ) : null}
                      </figure>
                    ))}

                    {(assetsBySection.tables.get(section.id) ?? []).map((t, tIdx) => (
                      <div key={t.id} className="mt-4">
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="border-b-2 border-slate-900">
                                {t.headers.map((h, hIdx) => (
                                  <th key={hIdx} className="text-left py-2 pr-3 font-bold">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {t.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="border-b border-slate-200">
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="py-2 pr-3 align-top">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {t.caption ? (
                          <div className="mt-2 text-xs text-slate-600 text-center italic">
                            Table {tIdx + 1}: {t.caption}
                          </div>
                        ) : null}
                      </div>
                    ))}

                    {section.subsections.length > 0 && (
                      <div className="mt-4 space-y-4">
                        {section.subsections.map((sub, subIdx) => (
                          <div key={sub.id}>
                            <h3 className="text-sm font-bold">
                              {idx + 1}.{subIdx + 1} {sub.name}
                            </h3>
                            <p className="mt-1 text-sm leading-relaxed text-justify">{sub.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Unattached assets */}
                {(assetsBySection.images.get("") ?? []).length > 0 && (
                  <div className="break-inside-avoid">
                    <h2 className="text-base font-bold">Images</h2>
                    {(assetsBySection.images.get("") ?? []).map((img, imageIdx) => (
                      <figure key={img.id} className="mt-4">
                        <div className="relative w-full h-56 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                          {img.url ? (
                            <img
                              src={img.url}
                              alt={img.alt ?? `Figure ${imageIdx + 1}`}
                              className="absolute inset-0 h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : null}
                        </div>
                        {img.caption ? (
                          <figcaption className="mt-2 text-xs text-slate-600 text-center italic">
                            Figure {imageIdx + 1}: {img.caption}
                          </figcaption>
                        ) : null}
                      </figure>
                    ))}
                  </div>
                )}

                {(assetsBySection.tables.get("") ?? []).length > 0 && (
                  <div className="break-inside-avoid">
                    <h2 className="text-base font-bold">Tables</h2>
                    {(assetsBySection.tables.get("") ?? []).map((t, tIdx) => (
                      <div key={t.id} className="mt-4">
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="border-b-2 border-slate-900">
                                {t.headers.map((h, hIdx) => (
                                  <th key={hIdx} className="text-left py-2 pr-3 font-bold">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {t.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="border-b border-slate-200">
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="py-2 pr-3 align-top">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {t.caption ? (
                          <div className="mt-2 text-xs text-slate-600 text-center italic">
                            Table {tIdx + 1}: {t.caption}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
