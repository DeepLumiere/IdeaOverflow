// pages/components/store.js
import { create } from 'zustand'

export const useEditorStore = create((set) => ({
  latexCode: '\\documentclass{article}\n\\begin{document}\n\n\\section{Introduction}\nHello World\n\n\\end{document}',
  pdfUrl: null,
  astData: null,
  editorInstance: null, // NEW: Stores the Monaco instance

  setLatexCode: (code) => set({ latexCode: code }),
  setPdfUrl: (url) => set({ pdfUrl: url }),
  setAstData: (data) => set({ astData: data }),
  setEditorInstance: (instance) => set({ editorInstance: instance }),
}))