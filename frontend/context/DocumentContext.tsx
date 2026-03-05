import React, { createContext, useContext, useState } from 'react';
import { AcademicDocument, defaultDocument } from '@/types/document';

interface DocumentContextType {
  document: AcademicDocument;
  setDocument: (doc: AcademicDocument) => void;
  updateDocument: (updates: Partial<AcademicDocument>) => void;
  isSynced: boolean;
  setSynced: (synced: boolean) => void;
  selectedConference: string;
  setSelectedConference: (conf: string) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [document, setDocument] = useState<AcademicDocument>(defaultDocument);
  const [isSynced, setIsSynced] = useState(true);
  const [selectedConference, setSelectedConference] = useState('IEEE');

  const updateDocument = (updates: Partial<AcademicDocument>) => {
    setDocument(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString()
    }));
    setIsSynced(true);
  };

  return (
    <DocumentContext.Provider
      value={{
        document,
        setDocument,
        updateDocument,
        isSynced,
        setSynced: setIsSynced,
        selectedConference,
        setSelectedConference,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocument = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }
  return context;
};
