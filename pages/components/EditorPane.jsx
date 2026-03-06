import React, { useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useEditorStore } from '../store';
import debounce from 'lodash.debounce';

export default function EditorPane() {
  const { latexCode, setLatexCode, setPdfUrl, setAstData } = useEditorStore();

  const compileAndParse = async (code) => {
    // 1. Fetch Parse AST
    fetch('http://localhost:8000/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latex_code: code })
    }).then(res => res.json()).then(data => setAstData(data.ast));

    // 2. Fetch Compiled PDF
    fetch('http://localhost:8000/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latex_code: code })
    })
    .then(res => res.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    });
  };

  // 1000ms delay after user stops typing
  const debouncedCompile = useCallback(debounce(compileAndParse, 1000), []);

  const handleEditorChange = (value) => {
    setLatexCode(value);
    debouncedCompile(value);
  };

  return (
    <Editor
      height="100vh"
      defaultLanguage="latex"
      theme="vs-dark"
      value={latexCode}
      onChange={handleEditorChange}
      options={{ wordWrap: 'on', minimap: { enabled: false } }}
    />
  );
}