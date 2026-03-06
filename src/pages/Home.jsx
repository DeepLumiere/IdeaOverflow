import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, ChevronRight, Sparkles, ArrowDown } from 'lucide-react';

const conferences = [
  {
    id: 1,
    name: 'IEEE Conference',
    template: 'ieee',
    description: 'Institute of Electrical and Electronics Engineers',
    iconName: 'cpu', // Store icon name as string instead of component
    color: 'blue',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30'
  },
  {
    id: 2,
    name: 'ACM Conference',
    template: 'acm',
    description: 'Association for Computing Machinery',
    iconName: 'book-open',
    color: 'green',
    bgColor: 'bg-green-100 dark:bg-green-900/30'
  },
  {
    id: 3,
    name: 'Springer Conference',
    template: 'springer',
    description: 'Springer Nature',
    iconName: 'library',
    color: 'purple',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30'
  }
];

// Helper function to render icons based on name
const renderIcon = (iconName, color) => {
  switch(iconName) {
    case 'cpu':
      return (
        <svg className={`h-8 w-8 text-${color}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      );
    case 'book-open':
      return (
        <svg className={`h-8 w-8 text-${color}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case 'library':
      return (
        <svg className={`h-8 w-8 text-${color}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
      );
    default:
      return null;
  }
};

const Home = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);
  const uploadSectionRef = useRef(null);
  const navigate = useNavigate();

  const scrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const validateFile = (file) => {
    const validTypes = ['.tex', '.pdf', '.txt', '.bib'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      setUploadError('Invalid file type. Please upload .tex, .pdf, .txt, or .bib files.');
      return false;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds 10MB limit.');
      return false;
    }
    
    setUploadError('');
    return true;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleConferenceSelect = (conference) => {
    console.log('Navigating to editor with:', conference);
    
    // Create a serializable conference object (without React components)
    const serializableConference = {
      id: conference.id,
      name: conference.name,
      template: conference.template,
      description: conference.description,
      color: conference.color
    };
    
    if (selectedFile) {
      sessionStorage.setItem('uploadedFile', JSON.stringify({
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      }));
    }
    
    navigate(`/editor/${conference.template}`, { 
      state: { 
        conference: serializableConference,
        uploadedFile: selectedFile ? {
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type
        } : null
      }
    });
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">AI-Powered LaTeX Editor</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Create Beautiful
              <span className="gradient-text block mt-2">Academic Papers</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              The most intuitive LaTeX editor for conference-ready documents. 
              Write, preview, and publish with ease.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={scrollToUpload}
                className="btn-primary px-8 py-4 text-lg group inline-flex items-center justify-center"
              >
                Get Started
                <ArrowDown className="h-5 w-5 ml-2 group-hover:translate-y-1 transition-transform" />
              </button>
              <button className="btn-secondary px-8 py-4 text-lg inline-flex items-center justify-center">
                Watch Demo
                <ChevronRight className="h-5 w-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* File Upload Section */}
      <div ref={uploadSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-20">
        <div className="card p-8 mb-12 animate-fade-in hover-lift">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            Upload Your Document
          </h2>
          
          <div
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
              isDragging 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105' 
                : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
              accept=".tex,.pdf,.txt,.bib"
            />
            
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex flex-col items-center"
            >
              <div className={`p-4 rounded-full mb-4 transition-all duration-300 ${
                isDragging ? 'bg-blue-200 dark:bg-blue-800 scale-110' : 'bg-blue-100 dark:bg-blue-900/30'
              }`}>
                <Upload className={`h-12 w-12 transition-all duration-300 ${
                  isDragging ? 'text-blue-700 dark:text-blue-300' : 'text-blue-500'
                }`} />
              </div>
              
              <span className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {isDragging ? '🎯 Drop your file here' : '📁 Click to upload or drag and drop'}
              </span>
              
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Supported formats: .tex, .pdf, .txt, .bib (Max 10MB)
              </span>
            </label>
            
            {uploadError && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400 text-sm">{uploadError}</p>
              </div>
            )}
            
            {selectedFile && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg animate-slide-in border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                    <div className="text-left">
                      <p className="text-green-700 dark:text-green-300 font-medium">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Size: {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeSelectedFile}
                    className="p-1 hover:bg-green-200 dark:hover:bg-green-800 rounded-full transition-colors"
                  >
                    <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Conference List */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            Choose Your Conference Template
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conferences.map((conference, index) => (
              <div
                key={conference.id}
                className="group relative card p-6 cursor-pointer overflow-hidden animate-slide-in hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleConferenceSelect(conference)}
              >
                {/* Background decoration */}
                <div className={`absolute top-0 right-0 w-32 h-32 ${conference.bgColor} rounded-bl-full opacity-50 group-hover:scale-150 transition-transform duration-500`}></div>
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 ${conference.bgColor} rounded-xl`}>
                      {renderIcon(conference.iconName, conference.color)}
                    </div>
                    <ChevronRight className={`h-5 w-5 text-${conference.color}-500 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300`} />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {conference.name}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {conference.description}
                  </p>
                  
                  <div className="flex items-center text-sm font-medium">
                    <span className={`text-${conference.color}-600 dark:text-${conference.color}-400`}>
                      Start editing
                    </span>
                    <ChevronRight className={`h-4 w-4 ml-1 text-${conference.color}-600 dark:text-${conference.color}-400 group-hover:ml-2 transition-all`} />
                  </div>

                  {/* Template features */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                      LaTeX template
                    </span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                      Ready to use
                    </span>
                  </div>

                  {/* Selected file indicator */}
                  {selectedFile && (
                    <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center">
                        <FileText className="h-3 w-3 mr-1" />
                        Will use: {selectedFile.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 transform rotate-3 hover:rotate-0 transition-transform">
              <span className="text-2xl">📁</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Step 1: Upload File</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Upload your LaTeX file or start from scratch</p>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 transform -rotate-3 hover:rotate-0 transition-transform">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Step 2: Choose Template</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Select from IEEE, ACM, Springer templates</p>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 transform rotate-3 hover:rotate-0 transition-transform">
              <span className="text-2xl">✏️</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Step 3: Edit & Preview</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Use our powerful editor to create your document</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;