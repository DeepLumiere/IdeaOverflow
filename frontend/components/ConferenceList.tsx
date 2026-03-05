import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useManuscript } from '@/context/ManuscriptContext';

interface Conference {
  id: string;
  name: string;
  abbreviation: string;
}

const conferences: Conference[] = [
  { id: '1', name: 'Association for Computational Linguistics', abbreviation: 'ACL' },
  { id: '2', name: 'Empirical Methods in Natural Language Processing', abbreviation: 'EMNLP' },
  { id: '3', name: 'International Conference on Machine Learning', abbreviation: 'ICML' },
  { id: '4', name: 'Neural Information Processing Systems', abbreviation: 'NeurIPS' },
  { id: '5', name: 'International Conference on Learning Representations', abbreviation: 'ICLR' },
];

export const ConferenceList: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const { setSelectedConference, uploadedFile } = useManuscript();
  const router = useRouter();

  const handleSelectConference = (conf: Conference) => {
    setSelected(conf.id);
    setSelectedConference(conf.id, conf);
  };

  const handleOpenEditor = () => {
    if (uploadedFile && selected) {
      router.push('/editor');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Select Conference/Journal</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {conferences.map((conf) => (
          <label key={conf.id} className="flex items-center p-4 cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="conference"
              value={conf.id}
              checked={selected === conf.id}
              onChange={() => handleSelectConference(conf)}
              className="h-4 w-4 text-blue-600"
            />
            <div className="ml-3">
              <p className="font-medium text-gray-900">{conf.abbreviation}</p>
              <p className="text-sm text-gray-500">{conf.name}</p>
            </div>
          </label>
        ))}
      </div>
      {uploadedFile && selected && (
        <div className="px-6 py-4 border-t border-gray-200 bg-blue-50">
          <button
            onClick={handleOpenEditor}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Open in Editor →
          </button>
        </div>
      )}
    </div>
  );
};
