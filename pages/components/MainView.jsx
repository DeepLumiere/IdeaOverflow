// pages/components/MainView.jsx
import React from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import EditorPane from './EditorPane';
import PDFViewer from './PDFViewer';
import ASTNavigator from './ASTNavigator';
import GeminiChat from './GeminiChat';

export default function MainView() {
  return (
    <div className="h-screen w-screen flex bg-[#1e1e1e] text-white overflow-hidden">
      {/* Sidebar: AST Navigator */}
      <div className="w-64 border-r border-gray-700 bg-[#252526] flex-shrink-0">
        <ASTNavigator />
      </div>

      {/* Main Split Area */}
      <PanelGroup direction="horizontal" className="flex-grow">
        <Panel defaultSize={50} minSize={30}>
          <EditorPane />
        </Panel>

        {/* The Draggable Divider */}
        <PanelResizeHandle className="w-2 bg-gray-700 hover:bg-blue-500 cursor-col-resize transition-colors" />

        <Panel defaultSize={50} minSize={30}>
          <PDFViewer />
        </Panel>
      </PanelGroup>

      {/* Floating AI Assistant */}
      <GeminiChat />
    </div>
  );
}