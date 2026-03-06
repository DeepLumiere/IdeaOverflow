import React, { useState, useEffect } from 'react';
import { useManuscript } from '@/context/ManuscriptContext';
import { useEditor } from '@/context/EditorContext';
import { readFileAsText } from '@/utils/manuscript';
import { getTemplateContent, getAllTemplates, type TemplateData } from '@/utils/templates';
import { ChevronDown } from 'lucide-react';

export const LatexEditor: React.FC = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [templates] = useState<TemplateData[]>(getAllTemplates());
  const { uploadedFile: manuscriptFile } = useManuscript();
  const { selectedConference, setSelectedConference } = useEditor();

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        let content: string;

        // If a file is uploaded via ManuscriptContext, read it
        if (manuscriptFile) {
          content = await readFileAsText(manuscriptFile);
        } else {
          // Otherwise use conference template
          content = getTemplateContent(selectedConference);
        }

        setCode(content);
      } catch (error) {
        console.error('Failed to load file:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [manuscriptFile, selectedConference]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-800">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">LaTeX Editor</h3>
            {manuscriptFile && (
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Editing: {manuscriptFile.name}</p>
            )}
            {!manuscriptFile && (
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Template: {selectedConference.toUpperCase()}</p>
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-slate-400">
            {loading ? 'Loading...' : 'Ready'}
          </div>
        </div>

        {!manuscriptFile && (
          <div className="relative">
            <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
              Conference Template:
            </label>
            <div className="relative inline-block w-full">
              <select
                value={selectedConference}
                onChange={(e) => {
                  setSelectedConference(e.target.value as any);
                }}
                className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-slate-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white dark:bg-slate-800 dark:text-white cursor-pointer"
              >
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} — {template.description}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none border-none bg-white dark:bg-slate-900 dark:text-slate-100"
          spellCheck="false"
          disabled={loading}
        />
      </div>
    </div>
  );
};

