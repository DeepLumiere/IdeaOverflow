import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useEditorStore } from '../store';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// CRITICAL: Initialize PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PDFViewer() {
  const pdfUrl = useEditorStore((state) => state.pdfUrl);
  const [numPages, setNumPages] = useState(null);

  if (!pdfUrl) return <div className="p-4 text-gray-500">Compiling document...</div>;

  return (
    <div className="h-screen overflow-y-auto bg-gray-100 flex justify-center p-4">
      <Document
        file={pdfUrl}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading="Loading PDF..."
      >
        {Array.from(new Array(numPages), (el, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="mb-4 shadow-lg"
          />
        ))}
      </Document>
    </div>
  );
}