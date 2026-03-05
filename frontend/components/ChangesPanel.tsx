import React, { useState, useEffect } from 'react';
import { useManuscript } from '@/context/ManuscriptContext';
import { readFileAsText, generateFormattingIssues } from '@/utils/manuscript';

interface Change {
  id: string;
  type: 'error' | 'warning' | 'suggestion';
  title: string;
  description: string;
  line: number;
}

export const ChangesPanel: React.FC = () => {
  const [changes, setChanges] = useState<Change[]>([]);
  const [loading, setLoading] = useState(false);
  const { uploadedFile, selectedConference } = useManuscript();

  useEffect(() => {
    const loadAndAnalyzeFile = async () => {
      if (uploadedFile && selectedConference) {
        setLoading(true);
        try {
          const content = await readFileAsText(uploadedFile);
          const issues = generateFormattingIssues(selectedConference, content);
          setChanges(issues);
        } catch (error) {
          console.error('Failed to analyze file:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadAndAnalyzeFile();
  }, [uploadedFile, selectedConference]);

  const defaultChanges: Change[] = [
    {
      id: '1',
      type: 'error',
      title: 'Missing Abstract',
      description: 'Abstract is required for conference submissions',
      line: 5,
    },
    {
      id: '2',
      type: 'warning',
      title: 'Reference Format',
      description: 'Some references do not follow citation style',
      line: 45,
    },
    {
      id: '3',
      type: 'suggestion',
      title: 'Improve Title Length',
      description: 'Titles are typically 5-10 words in academic papers',
      line: 1,
    },
  ];

  const displayChanges = uploadedFile && selectedConference ? changes : defaultChanges;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full overflow-y-auto flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 sticky top-0 bg-white">
        <h3 className="font-semibold text-gray-900">Formatting Issues</h3>
        <p className="text-xs text-gray-500 mt-1">
          {loading ? 'Analyzing...' : `${displayChanges.length} issues found`}
        </p>
      </div>
      <div className="divide-y divide-gray-200 flex-1 overflow-y-auto">
        {displayChanges.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No formatting issues found</p>
          </div>
        ) : (
          displayChanges.map((change) => (
            <div key={change.id} className="p-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-start">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    change.type === 'error'
                      ? 'bg-red-100 text-red-800'
                      : change.type === 'warning'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {change.type.charAt(0).toUpperCase() + change.type.slice(1)}
                </span>
              </div>
              <h4 className="mt-2 font-medium text-gray-900">{change.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{change.description}</p>
              <p className="text-xs text-gray-500 mt-2">Line {change.line}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
