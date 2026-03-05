import React, { createContext, useContext, useState } from 'react';

interface ManuscriptContextType {
  uploadedFile: File | null;
  selectedConference: string | null;
  conferenceData: { id: string; name: string; abbreviation: string } | null;
  setUploadedFile: (file: File | null) => void;
  setSelectedConference: (conferenceId: string, conferenceData: { id: string; name: string; abbreviation: string }) => void;
  clearManuscript: () => void;
}

const ManuscriptContext = createContext<ManuscriptContextType | undefined>(undefined);

export const ManuscriptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedConference, setSelectedConferenceId] = useState<string | null>(null);
  const [conferenceData, setConferenceDataState] = useState<{ id: string; name: string; abbreviation: string } | null>(null);

  const setSelectedConference = (conferenceId: string, confData: { id: string; name: string; abbreviation: string }) => {
    setSelectedConferenceId(conferenceId);
    setConferenceDataState(confData);
  };

  const clearManuscript = () => {
    setUploadedFile(null);
    setSelectedConferenceId(null);
    setConferenceDataState(null);
  };

  return (
    <ManuscriptContext.Provider
      value={{
        uploadedFile,
        selectedConference,
        conferenceData,
        setUploadedFile,
        setSelectedConference,
        clearManuscript,
      }}
    >
      {children}
    </ManuscriptContext.Provider>
  );
};

export const useManuscript = () => {
  const context = useContext(ManuscriptContext);
  if (context === undefined) {
    throw new Error('useManuscript must be used within a ManuscriptProvider');
  }
  return context;
};
