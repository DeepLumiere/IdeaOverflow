// pages/components/ASTNavigator.jsx
import React from 'react';
import { useEditorStore } from './store';

export default function ASTNavigator() {
  const { astData, editorInstance, latexCode } = useEditorStore();

  const jumpToLine = (searchText) => {
    if (!editorInstance || !searchText) return;

    // Find the line number of the text in the raw LaTeX string
    const lines = latexCode.split('\n');
    const lineNumber = lines.findIndex(line => line.includes(searchText)) + 1;

    if (lineNumber > 0) {
      editorInstance.revealLineInCenter(lineNumber);
      editorInstance.setPosition({ lineNumber: lineNumber, column: 1 });
      editorInstance.focus();
    }
  };

  if (!astData) return <div className="p-4 text-sm text-gray-400">Loading structure...</div>;

  return (
    <div className="p-4 h-full overflow-y-auto font-mono text-sm">
      <h2 className="text-gray-300 font-bold mb-4 uppercase tracking-wider text-xs">Document Outline</h2>

      {/* Sections Map */}
      <div className="mb-4">
        <h3 className="text-blue-400 mb-2">Sections</h3>
        <ul className="space-y-1 pl-2 border-l border-gray-600">
          {astData.structure?.sections?.map((sec, idx) => (
            <li
              key={idx}
              className="cursor-pointer hover:text-white text-gray-400 truncate"
              onClick={() => jumpToLine(`\\section{${sec}}`)}
            >
              {sec}
            </li>
          ))}
        </ul>
      </div>

      {/* Packages Map */}
      <div className="mb-4">
        <h3 className="text-green-400 mb-2">Packages</h3>
        <div className="flex flex-wrap gap-1">
          {astData.metadata?.packages?.map((pkg, idx) => (
            <span key={idx} className="bg-gray-700 text-gray-200 px-2 py-0.5 rounded text-xs cursor-pointer" onClick={() => jumpToLine(`\\usepackage{${pkg}}`)}>
              {pkg}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}