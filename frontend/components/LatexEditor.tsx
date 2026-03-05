import React, { useState, useEffect } from 'react';
import { useManuscript } from '@/context/ManuscriptContext';
import { readFileAsText } from '@/utils/manuscript';

export const LatexEditor: React.FC = () => {
  const [code, setCode] = useState(`\\documentclass{article}
\\usepackage[utf8]{inputenc}

\\title{Your Manuscript Title}
\\author{Author Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
Your abstract text here.
\\end{abstract}

\\section{Introduction}
Your introduction text here.

\\end{document}`);
  const [loading, setLoading] = useState(false);
  const { uploadedFile } = useManuscript();

  useEffect(() => {
    const loadFile = async () => {
      if (uploadedFile) {
        setLoading(true);
        try {
          const content = await readFileAsText(uploadedFile);
          setCode(content);
        } catch (error) {
          console.error('Failed to load file:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadFile();
  }, [uploadedFile]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-900">LaTeX Editor</h3>
          {uploadedFile && (
            <p className="text-xs text-gray-500 mt-1">Editing: {uploadedFile.name}</p>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {loading ? 'Loading...' : 'Ready'}
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none border-none"
          spellCheck="false"
          disabled={loading}
        />
      </div>
    </div>
  );
};
