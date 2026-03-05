// pages/components/GeminiChat.jsx
import React, { useState } from 'react';
import { useEditorStore } from '../store';

function escapeLatex(text) {
  return String(text)
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([#$%&_{}])/g, '\\\\$1')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/~/g, '\\textasciitilde{}');
}

function titleCase(label) {
  return String(label)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function parseJsonFromResponse(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch?.[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {
      // Fall through to whole-string parsing.
    }
  }

  try {
    return JSON.parse(rawText.trim());
  } catch {
    return null;
  }
}

function renderNodeToLatex(node, depth = 0) {
  const sectionCmds = ['section', 'subsection', 'subsubsection', 'paragraph'];
  const sectionCmd = sectionCmds[Math.min(depth, sectionCmds.length - 1)];

  if (node == null) return '';

  if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') {
    return `${escapeLatex(node)}\n\n`;
  }

  if (Array.isArray(node)) {
    if (node.length === 0) return '';
    const items = node
      .map((item) => {
        if (typeof item === 'object' && item !== null) {
          const rendered = renderNodeToLatex(item, depth + 1).trim();
          return rendered ? `\\item ${rendered}` : '';
        }
        return `\\item ${escapeLatex(item)}`;
      })
      .filter(Boolean)
      .join('\n');
    return `\\begin{itemize}\n${items}\n\\end{itemize}\n\n`;
  }

  const entries = Object.entries(node);
  return entries
    .map(([key, value]) => {
      const heading = `\\${sectionCmd}{${escapeLatex(titleCase(key))}}\n`;
      return `${heading}${renderNodeToLatex(value, depth + 1)}`;
    })
    .join('\n');
}

function convertJsonToLatex(jsonData) {
  const body = renderNodeToLatex(jsonData).trim();
  return `\\documentclass{article}\n\\usepackage[T1]{fontenc}\n\\usepackage[utf8]{inputenc}\n\\usepackage{lmodern}\n\\begin{document}\n${body}\n\\end{document}`;
}

export default function GeminiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { latexCode, setLatexCode, setPdfUrl, setAstData } = useEditorStore();

  const refreshOutputs = async (code) => {
    fetch('http://localhost:8000/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latex_code: code })
    })
      .then((res) => res.json())
      .then((data) => setAstData(data.ast))
      .catch(() => {});

    fetch('http://localhost:8000/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latex_code: code })
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      })
      .catch(() => {});
  };

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMsg = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Pass both the question and the document context
        body: JSON.stringify({ latex_code: latexCode, query: userMsg.content })
      });

      const data = await response.json();
      const jsonPayload = parseJsonFromResponse(data.response);

      if (jsonPayload) {
        const latexOutput = convertJsonToLatex(jsonPayload);
        setLatexCode(latexOutput);
        refreshOutputs(latexOutput);
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: 'Converted AI JSON response to LaTeX and inserted it into the editor.'
          }
        ]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error reaching backend.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-80 h-96 bg-[#252526] border border-gray-600 rounded-lg shadow-2xl mb-2 flex flex-col overflow-hidden">
          <div className="bg-[#333333] p-3 border-b border-gray-600 flex justify-between items-center">
            <span className="font-bold text-sm">Gemini Research Assistant</span>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">&times;</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
            {messages.map((msg, i) => (
              <div key={i} className={`p-2 rounded-md max-w-[85%] ${msg.role === 'user' ? 'bg-blue-600 self-end ml-auto text-white' : 'bg-gray-700 text-gray-200'}`}>
                {msg.content}
              </div>
            ))}
            {isLoading && <div className="text-gray-400 italic text-xs">Thinking...</div>}
          </div>

          <div className="p-3 bg-[#1e1e1e] border-t border-gray-600 flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your LaTeX..."
              className="flex-1 bg-[#333333] border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
            />
            <button onClick={handleSend} className="bg-blue-600 px-3 py-1 rounded text-white text-sm hover:bg-blue-500">Send</button>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white rounded-full p-4 shadow-lg font-bold transition-transform hover:scale-105"
        >
          Ask AI
        </button>
      )}
    </div>
  );
}