"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { EditorPanel } from "@/components/EditorPanel";
import { PreviewPanel } from "@/components/PreviewPanel";
import { useAuth } from "@/context/AuthContext";
import { useEditor } from "@/context/EditorContext";
import type { ConferenceId } from "@/types/editor";

function parseConference(raw: string | null): ConferenceId | null {
  if (raw === "IEEE" || raw === "ACM" || raw === "Springer") return raw;
  return null;
}

export default function EditorPage() {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();
  const { selectedConference, setSelectedConference, panelSizes, setPanelSizes } = useEditor();

  const dragRef = useRef<
    | null
    | {
        kind: "sidebar" | "json";
        pointerId: number;
        startX: number;
        startSidebar: number;
        startJson: number;
      }
  >(null);

  const sizes = useMemo(() => {
    const sidebarW = panelSizes.sidebarCollapsed ? 72 : panelSizes.sidebarWidth;
    return { sidebarW, jsonW: panelSizes.jsonWidth };
  }, [panelSizes.jsonWidth, panelSizes.sidebarCollapsed, panelSizes.sidebarWidth]);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace("/login");
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const fromQuery =
      typeof window !== "undefined"
        ? parseConference(new URLSearchParams(window.location.search).get("conf"))
        : null;
    if (fromQuery && fromQuery !== selectedConference) setSelectedConference(fromQuery);
  }, [selectedConference, setSelectedConference]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-300">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 min-h-0">
        <div className="h-full flex">
          <div style={{ width: sizes.sidebarW }} className="min-w-[72px] max-w-[520px]">
            <Sidebar />
          </div>

          <ResizeHandle
            onPointerDown={(e) => {
              if (panelSizes.sidebarCollapsed) return;
              dragRef.current = {
                kind: "sidebar",
                pointerId: e.pointerId,
                startX: e.clientX,
                startSidebar: panelSizes.sidebarWidth,
                startJson: panelSizes.jsonWidth,
              };
              (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
              document.body.style.cursor = "col-resize";
              document.body.style.userSelect = "none";
            }}
            onPointerMove={(e) => {
              const drag = dragRef.current;
              if (!drag || drag.pointerId !== e.pointerId || drag.kind !== "sidebar") return;
              const dx = e.clientX - drag.startX;
              const nextW = Math.max(220, Math.min(520, drag.startSidebar + dx));
              setPanelSizes({ ...panelSizes, sidebarWidth: nextW });
            }}
            onPointerUp={(e) => {
              const drag = dragRef.current;
              if (!drag || drag.pointerId !== e.pointerId) return;
              dragRef.current = null;
              document.body.style.cursor = "";
              document.body.style.userSelect = "";
              try {
                (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
              } catch {
                // ignore
              }
            }}
            disabled={panelSizes.sidebarCollapsed}
          />

          <div style={{ width: sizes.jsonW }} className="min-w-[340px] max-w-[900px]">
            <EditorPanel />
          </div>

          <ResizeHandle
            onPointerDown={(e) => {
              dragRef.current = {
                kind: "json",
                pointerId: e.pointerId,
                startX: e.clientX,
                startSidebar: panelSizes.sidebarWidth,
                startJson: panelSizes.jsonWidth,
              };
              (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
              document.body.style.cursor = "col-resize";
              document.body.style.userSelect = "none";
            }}
            onPointerMove={(e) => {
              const drag = dragRef.current;
              if (!drag || drag.pointerId !== e.pointerId || drag.kind !== "json") return;
              const dx = e.clientX - drag.startX;
              const nextW = Math.max(340, Math.min(900, drag.startJson + dx));
              setPanelSizes({ ...panelSizes, jsonWidth: nextW });
            }}
            onPointerUp={(e) => {
              const drag = dragRef.current;
              if (!drag || drag.pointerId !== e.pointerId) return;
              dragRef.current = null;
              document.body.style.cursor = "";
              document.body.style.userSelect = "";
              try {
                (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
              } catch {
                // ignore
              }
            }}
          />

          <div className="flex-1 min-w-[320px]">
            <PreviewPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

function ResizeHandle({
  onPointerDown,
  onPointerMove,
  onPointerUp,
  disabled,
}: {
  onPointerDown: React.PointerEventHandler<HTMLDivElement>;
  onPointerMove: React.PointerEventHandler<HTMLDivElement>;
  onPointerUp: React.PointerEventHandler<HTMLDivElement>;
  disabled?: boolean;
}) {
  return (
    <div
      className={[
        "w-2 sm:w-2.5 relative",
        disabled ? "cursor-not-allowed opacity-40" : "cursor-col-resize",
      ].join(" ")}
      onPointerDown={disabled ? undefined : onPointerDown}
      onPointerMove={disabled ? undefined : onPointerMove}
      onPointerUp={disabled ? undefined : onPointerUp}
      role="separator"
      aria-label="Resize panel"
    >
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-slate-200 dark:bg-slate-800" />
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-[linear-gradient(to_right,transparent,rgba(59,130,246,0.12),transparent)] dark:bg-[linear-gradient(to_right,transparent,rgba(34,211,238,0.10),transparent)]" />
    </div>
  );
}

