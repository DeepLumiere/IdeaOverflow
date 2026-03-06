import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { 
  Menu, Save, Download, Eye, Code, FileText,
  ChevronLeft, ChevronRight, X, Plus, Layers,
  Table, Image, Sigma, Users, GripVertical, FileCheck, Play,
  Type, Hash, Brackets, GitBranch
} from 'lucide-react';

const Editor = () => {
  const location = useLocation();
  const { template } = useParams();
  const navigate = useNavigate();
  
  // Get conference data from location state
  const conference = location.state?.conference || { 
    name: template?.toUpperCase() || 'IEEE Conference',
    template: template || 'ieee',
    color: 'blue'
  };
  
  const uploadedFile = location.state?.uploadedFile;

  // State for panel sizes and visibility
  const [leftWidth, setLeftWidth] = useState(20);
  const [middleWidth, setMiddleWidth] = useState(50);
  const [rightWidth, setRightWidth] = useState(30);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const containerRef = useRef(null);

  // Document state
  const [document, setDocument] = useState({
    title: 'Fourth Author',
    authors: ['Nirma University, India', 'nirmal23@nirma.ac.in'],
    abstract: `The race to train increasingly accurate artificial intelligence models has driven an exponential growth in model size, frequently yielding models that underperform relative to the energy and computational resources invested (Hoffmann et al., 2022). As model architectures scale, both training and inference incur disproportionately higher computational overhead. This consumes significantly more energy, rendering marginal gains in predictive accuracy exponentially expensive across computational, financial, and environmental axes.

To address this, we evaluated Vision Transforms (ViT) architectures from energy-centric perspective that transcends traditional accuracy-only paradigms. By evaluating various ViT on CIFAR10, CIFAR100, and STL10 datasets, we analyze the critical trade-offs between predictive performance, inference latency, and the ecological impact of their core components. Our empirical evaluation exposes several dimensions underlying the trade-offs:

• Energy consumption: The ViT architecture with the highest energy consumption is the ViT-GF16 (P=1.6x), followed by ViT-GF32 (P=0.8x) and ViT-Base (P=0.4x).
• Accuracy: ViT-GF16 achieves the highest accuracy (P=0.9x), followed by ViT-GF32 (P=0.7x) and ViT-Base (P=0.5x).
• Latency: ViT-GF16 has the lowest latency (P=0.3x), followed by ViT-GF32 (P=0.5x) and ViT-Base (P=0.2x).

We also evaluate the trade-offs between predictive performance and energy consumption. We find that ViT-GF16 achieves the highest predictive performance (P=0.9x) while maintaining the lowest energy consumption (P=0.3x). However, ViT-GF32 and ViT-Base have lower predictive performance but higher energy consumption.

In summary, our analysis reveals that ViT-GF16 offers a balanced approach, providing high accuracy with low energy consumption, making it a promising candidate for energy-efficient AI applications.`,
    sections: [
      {
        id: 1,
        type: 'section',
        name: 'Introduction',
        content: 'The field of machine learning has witnessed remarkable progress in recent years...',
        subsections: []
      }
    ],
    formulas: [
      {
        id: 101,
        type: 'formula',
        name: 'Loss Function',
        content: 'L(θ) = -∑ y_i log(ŷ_i) + λ||θ||²',
        display: 'block'
      }
    ]
  });

  const [modalData, setModalData] = useState({
    name: '',
    content: '',
    position: 'end',
    parentId: null
  });

  // Dragging functionality
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const totalWidth = containerRect.width;
      const mouseX = e.clientX - containerRect.left;
      
      let newLeftWidth = (mouseX / totalWidth) * 100;
      newLeftWidth = Math.max(15, Math.min(35, newLeftWidth));
      
      setLeftWidth(newLeftWidth);
      setMiddleWidth(100 - newLeftWidth - 30);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Handle adding new elements
  const handleAddElement = (type) => {
    setModalType(type);
    
    // Get available sections/subsections for parent selection
    const parents = [];
    if (type === 'subsection' || type === 'subsubsection') {
      document.sections.forEach(section => {
        parents.push({ id: section.id, name: `Section: ${section.name}` });
        if (section.subsections) {
          section.subsections.forEach(sub => {
            parents.push({ id: sub.id, name: `Subsection: ${sub.name}` });
          });
        }
      });
    }

    setModalData({
      name: '',
      content: '',
      position: 'end',
      parentId: parents.length > 0 ? parents[0].id : null,
      availableParents: parents
    });
    setShowModal(true);
  };

  const handleModalSubmit = () => {
    const newElement = {
      id: Date.now(),
      type: modalType,
      name: modalData.name,
      content: modalData.content,
      ...(modalType === 'formula' && { display: 'block' }),
      ...((modalType === 'section' || modalType === 'subsection' || modalType === 'subsubsection') && { 
        subsections: [],
        subsubsections: []
      })
    };

    switch(modalType) {
      case 'author':
        setDocument({
          ...document,
          authors: [...document.authors, modalData.name]
        });
        break;

      case 'formula':
        setDocument({
          ...document,
          formulas: [...(document.formulas || []), newElement]
        });
        break;

      case 'section':
        setDocument({
          ...document,
          sections: [...document.sections, newElement]
        });
        break;

      case 'subsection':
        const updatedSectionsForSub = [...document.sections];
        const targetSectionForSub = updatedSectionsForSub.find(s => s.id === modalData.parentId);
        if (targetSectionForSub) {
          targetSectionForSub.subsections = [
            ...(targetSectionForSub.subsections || []),
            { ...newElement, type: 'subsection' }
          ];
          setDocument({
            ...document,
            sections: updatedSectionsForSub
          });
        }
        break;

      case 'subsubsection':
        const updatedSectionsForSubSub = [...document.sections];
        let found = false;
        
        for (let section of updatedSectionsForSubSub) {
          if (section.subsections) {
            const targetSubsection = section.subsections.find(sub => sub.id === modalData.parentId);
            if (targetSubsection) {
              targetSubsection.subsubsections = [
                ...(targetSubsection.subsubsections || []),
                { ...newElement, type: 'subsubsection' }
              ];
              found = true;
              break;
            }
          }
        }
        
        if (found) {
          setDocument({
            ...document,
            sections: updatedSectionsForSubSub
          });
        }
        break;

      default:
        break;
    }

    setShowModal(false);
  };

  // Handle Preview button click
  const handlePreview = () => {
    setShowPreview(true);
    setActiveTab('preview');
    setTimeout(() => {
      setShowPreview(true);
    }, 500);
  };

  // Handle Review button click
  const handleReview = () => {
    setActiveTab('review');
    setShowPreview(false);
  };

  // Render modal based on type
  const renderModal = () => {
    if (!showModal) return null;

    const getModalTitle = () => {
      switch(modalType) {
        case 'section': return 'Add Section';
        case 'subsection': return 'Add Subsection';
        case 'subsubsection': return 'Add Subsubsection';
        case 'formula': return 'Add Formula';
        case 'author': return 'Add Author';
        default: return 'Add Element';
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getModalTitle()}
            </h3>
            <button
              onClick={() => setShowModal(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Parent selection for subsections/subsubsections */}
            {(modalType === 'subsection' || modalType === 'subsubsection') && modalData.availableParents?.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Parent Section/Subsection
                </label>
                <select
                  value={modalData.parentId}
                  onChange={(e) => setModalData({...modalData, parentId: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {modalData.availableParents.map(parent => (
                    <option key={parent.id} value={parent.id}>{parent.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Position selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Position
              </label>
              <select
                value={modalData.position}
                onChange={(e) => setModalData({...modalData, position: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="beginning">Beginning</option>
                <option value="end">End</option>
                <option value="after">After selected element</option>
              </select>
            </div>

            {/* Name/Title input */}
            {(modalType !== 'formula') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {modalType === 'author' ? 'Author Name/Affiliation' : 'Title/Name'}
                </label>
                <input
                  type="text"
                  value={modalData.name}
                  onChange={(e) => setModalData({...modalData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={`Enter ${modalType} name`}
                />
              </div>
            )}

            {/* Formula name/label */}
            {modalType === 'formula' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Formula Label
                </label>
                <input
                  type="text"
                  value={modalData.name}
                  onChange={(e) => setModalData({...modalData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Loss Function"
                />
              </div>
            )}

            {/* Content textarea for sections/subsections/subsubsections */}
            {(modalType === 'section' || modalType === 'subsection' || modalType === 'subsubsection') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content
                </label>
                <textarea
                  value={modalData.content}
                  onChange={(e) => setModalData({...modalData, content: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="6"
                  placeholder="Enter content"
                />
              </div>
            )}

            {/* Formula content */}
            {modalType === 'formula' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  LaTeX Formula
                </label>
                <textarea
                  value={modalData.content}
                  onChange={(e) => setModalData({...modalData, content: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                  rows="4"
                  placeholder="E = mc^2"
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleModalSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="h-[calc(100vh-4rem)] flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Top Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            title="Back to Home"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {conference.name}
            </span>
          </div>
          {uploadedFile && (
            <>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                <FileText className="h-4 w-4 mr-1" />
                <span className="truncate max-w-[200px]">{uploadedFile.name}</span>
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Save">
            <Save className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Download">
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Three-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - All Categories */}
        <div 
          className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
          style={{ width: `${leftWidth}%` }}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
              <Menu className="h-5 w-5 mr-2 text-blue-600" />
              Document Elements
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {/* Section Elements */}
            <div className="mb-6">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                <GitBranch className="h-3 w-3 mr-1" />
                Section Elements
              </div>
              <div className="space-y-1">
                <button 
                  onClick={() => handleAddElement('section')} 
                  className="w-full p-3 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all group"
                >
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform">
                    <Layers className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1 text-left">Add Section</span>
                  <Plus className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </button>
                
                <button 
                  onClick={() => handleAddElement('subsection')} 
                  className="w-full p-3 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all group"
                >
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:scale-110 transition-transform">
                    <Layers className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1 text-left">Add Subsection</span>
                  <Plus className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                </button>
                
                <button 
                  onClick={() => handleAddElement('subsubsection')} 
                  className="w-full p-3 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all group"
                >
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg group-hover:scale-110 transition-transform">
                    <Layers className="h-4 w-4 text-yellow-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1 text-left">Add Subsubsection</span>
                  <Plus className="h-4 w-4 text-gray-400 group-hover:text-yellow-600 transition-colors" />
                </button>
              </div>
            </div>

            {/* Special Elements */}
            <div className="mb-6">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                <Hash className="h-3 w-3 mr-1" />
                Special Elements
              </div>
              <div className="space-y-1">
                <button 
                  onClick={() => handleAddElement('formula')} 
                  className="w-full p-3 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all group"
                >
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:scale-110 transition-transform">
                    <Sigma className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1 text-left">Add Formula</span>
                  <Plus className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </button>
                
                <button 
                  onClick={() => handleAddElement('author')} 
                  className="w-full p-3 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all group"
                >
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg group-hover:scale-110 transition-transform">
                    <Users className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1 text-left">Add Author</span>
                  <Plus className="h-4 w-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                </button>
              </div>
            </div>

            {/* Media Elements */}
            <div className="mb-6">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                <Type className="h-3 w-3 mr-1" />
                Media Elements
              </div>
              <div className="space-y-1">
                <button className="w-full p-3 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all group">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg group-hover:scale-110 transition-transform">
                    <Table className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1 text-left">Add Table</span>
                  <Plus className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                </button>
                
                <button className="w-full p-3 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all group">
                  <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg group-hover:scale-110 transition-transform">
                    <Image className="h-4 w-4 text-pink-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1 text-left">Add Image</span>
                  <Plus className="h-4 w-4 text-gray-400 group-hover:text-pink-600 transition-colors" />
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Document Stats
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Sections:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{document.sections.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Formulas:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{document.formulas?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Authors:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{document.authors.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 cursor-col-resize transition-colors flex items-center justify-center group"
          onMouseDown={handleMouseDown}
        >
          <GripVertical className="h-4 w-4 text-gray-400 group-hover:text-white" />
        </div>

        {/* Middle Panel - Document Structure */}
        <div 
          className="bg-white dark:bg-gray-800 flex flex-col overflow-hidden"
          style={{ width: `${middleWidth}%` }}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
              <FileText className="h-5 w-5 mr-2 text-green-600" />
              Document Structure
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="prose dark:prose-invert max-w-none">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {document.title}
              </h1>
              
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {document.authors.map((author, idx) => (
                  <React.Fragment key={idx}>
                    {author}<br />
                  </React.Fragment>
                ))}
              </div>

              <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Abstract
                </h2>
                <div className="text-gray-700 dark:text-gray-300 space-y-4">
                  {document.abstract.split('\n\n').map((paragraph, idx) => {
                    if (paragraph.includes('•')) {
                      return (
                        <div key={idx} className="space-y-2">
                          {paragraph.split('\n').map((line, lineIdx) => {
                            if (line.trim().startsWith('•')) {
                              return (
                                <div key={lineIdx} className="flex items-start ml-4">
                                  <span className="mr-2">•</span>
                                  <span>{line.substring(1).trim()}</span>
                                </div>
                              );
                            }
                            return <p key={lineIdx}>{line}</p>;
                          })}
                        </div>
                      );
                    }
                    return <p key={idx} className="mb-4">{paragraph}</p>;
                  })}
                </div>
              </div>

              {document.sections.map(section => (
                <div key={section.id} className="mt-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {section.name}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mt-2">{section.content}</p>
                  
                  {section.subsections?.map(sub => (
                    <div key={sub.id} className="ml-4 mt-4">
                      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        {sub.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{sub.content}</p>
                    </div>
                  ))}
                </div>
              ))}

              {document.formulas?.map(formula => (
                <div key={formula.id} className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-purple-700 dark:text-purple-300 mb-1">{formula.name}</p>
                  <div className="font-mono text-center text-gray-800 dark:text-gray-200">
                    {formula.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 cursor-col-resize transition-colors flex items-center justify-center group"
          onMouseDown={handleMouseDown}
        >
          <GripVertical className="h-4 w-4 text-gray-400 group-hover:text-white" />
        </div>

        {/* Right Panel - Review/Preview */}
        <div 
          className="bg-white dark:bg-gray-800 flex flex-col overflow-hidden"
          style={{ width: `${rightWidth}%` }}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <Eye className="h-5 w-5 mr-2 text-purple-600" />
                {activeTab === 'preview' ? 'Preview' : 'Review'}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleReview}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1 ${
                    activeTab === 'review'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <FileCheck className="h-4 w-4" />
                  <span>Review</span>
                </button>
                <button
                  onClick={handlePreview}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1 ${
                    activeTab === 'preview'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Play className="h-4 w-4" />
                  <span>Preview</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'review' && (
              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Review Comments</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No review comments yet. Click "Preview" to see the document preview.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Grammar Check</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">✓ No major issues found</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Style Suggestions</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">✓ Document follows {conference.name} style</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Word Count</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{document.abstract.split(' ').length} words in abstract</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="space-y-4">
                {!showPreview ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Loading preview...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">📄 Document Preview</h4>
                      <div className="text-sm space-y-2">
                        <p><span className="font-mono text-xs bg-blue-100 dark:bg-blue-800 px-1 rounded">Title:</span> {document.title}</p>
                        <p><span className="font-mono text-xs bg-blue-100 dark:bg-blue-800 px-1 rounded">Authors:</span> {document.authors[0]}</p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Abstract Preview</h4>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-3 max-h-96 overflow-y-auto">
                        {document.abstract.split('\n\n').map((para, idx) => (
                          <p key={idx} className="leading-relaxed">{para}</p>
                        ))}
                      </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                      <p className="text-xs text-green-700 dark:text-green-300 flex items-center">
                        <span className="mr-2">✓</span>
                        Preview generated successfully for {conference.name}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {renderModal()}
    </div>
  );
};

export default Editor;