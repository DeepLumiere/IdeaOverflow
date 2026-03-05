"use client";

import React, { useState } from "react";
import { useEditor } from "@/context/EditorContext";
import { CirclePlay, Loader2, MessageCircle, Send, X } from "lucide-react";

function parseJsonFromResponse(rawText: string): unknown {
  if (!rawText) return null;

  // Try fenced JSON blocks first
  const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch?.[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {
      // Fall through
    }
  }

  // Try raw JSON
  try {
    return JSON.parse(rawText.trim());
  } catch {
    return null;
  }
}

function escapeLatex(text: string): string {
  return String(text)
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([#$%&_{}])/g, "\\$1")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/~/g, "\\textasciitilde{}");
}

function titleCase(label: string): string {
  return String(label)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function renderNodeToLatex(node: unknown, depth: number = 0): string {
  const sectionCmds = ["section", "subsection", "subsubsection", "paragraph"];
  const sectionCmd = sectionCmds[Math.min(depth, sectionCmds.length - 1)];

  if (node == null) return "";

  if (typeof node === "string" || typeof node === "number" || typeof node === "boolean") {
    return `${escapeLatex(String(node))}\n\n`;
  }

  if (Array.isArray(node)) {
    if (node.length === 0) return "";
    const items = node
      .map((item) => {
        if (typeof item === "object" && item !== null) {
          const rendered = renderNodeToLatex(item, depth + 1).trim();
          return rendered ? `\\item ${rendered}` : "";
        }
        return `\\item ${escapeLatex(String(item))}`;
      })
      .filter(Boolean)
      .join("\n");
    return `\\begin{itemize}\n${items}\n\\end{itemize}\n\n`;
  }

  if (typeof node === "object") {
    const entries = Object.entries(node);
    return entries
      .map(([key, value]) => {
        const heading = `\\${sectionCmd}{${escapeLatex(titleCase(key))}}\n`;
        return `${heading}${renderNodeToLatex(value, depth + 1)}`;
      })
      .join("\n");
  }

  return "";
}

function convertJsonToLatex(jsonData: unknown): string {
  const body = renderNodeToLatex(jsonData).trim();
  return `\\documentclass{article}\n\\usepackage[T1]{fontenc}\n\\usepackage[utf8]{inputenc}\n\\usepackage{lmodern}\n\\begin{document}\n${body}\n\\end{document}`;
}

export function ChatPanel() {
  const { doc, setDoc } = useEditor();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMsg = { role: "user" as const, content: query };
    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latex_code: JSON.stringify(doc, null, 2),
          query: userMsg.content,
        }),
      });

      if (!response.ok) throw new Error("Backend error");

      const data = (await response.json()) as { response: string };
      const jsonPayload = parseJsonFromResponse(data.response);

      if (jsonPayload && typeof jsonPayload === "object") {
        // Convert JSON to LaTeX and update doc
        setDoc(jsonPayload as Parameters<typeof setDoc>[0]);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "✅ Converted JSON response to document structure and updated the editor.",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.response,
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Error reaching backend. Make sure it's running on port 8000.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-40"
          title="Open AI Chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-700 z-50">
          {/* Header */}
          <div className="h-14 px-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CirclePlay className="h-5 w-5 text-blue-500" />
              <span className="font-semibold text-slate-900 dark:text-white">IdeaOverflow AI</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-slate-500 dark:text-slate-400 text-sm mt-8">
                <p className="font-medium">Ask me anything about your document!</p>
                <p className="text-xs mt-2">I can generate JSON that I'll convert to your document structure.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="h-14 px-4 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask a question..."
              disabled={isLoading}
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !query.trim()}
              className="h-9 w-9 rounded-lg bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
