'use client';

import { ReactNode, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAutoSave } from '@/modules/editor/useAutoSave';
import { useEditorStore } from '@/modules/editor/editorStore';

interface EditorLayoutProps {
  topbar: ReactNode;
  leftSidebar: ReactNode;
  canvas: ReactNode;
  rightSidebar: ReactNode;
}

export default function EditorLayout({
  topbar,
  leftSidebar,
  canvas,
  rightSidebar,
}: EditorLayoutProps) {
  // Enable auto-save
  useAutoSave();
  
  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { undo, redo, deleteElement, selectedElementId, saveProject } = useEditorStore.getState();

      // Undo (Ctrl/Cmd + Z)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Redo (Ctrl/Cmd + Shift + Z)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }

      // Save (Ctrl/Cmd + S)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveProject();
      }

      // Delete (Delete or Backspace)
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        const target = e.target as HTMLElement;
        // Don't delete if typing in input/textarea
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
          e.preventDefault();
          deleteElement(selectedElementId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return (
    <div className="fixed inset-0 flex flex-col bg-[#F3F4F6] overflow-hidden">
      {/* Topbar */}
      <div className="h-16 bg-white border-b border-[#E5E7EB] flex-shrink-0 shadow-sm z-20">
        {topbar}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Toolbox */}
        <div className="w-20 bg-white border-r border-[#E5E7EB] flex-shrink-0 shadow-sm z-10 
                        hidden md:block">
          {leftSidebar}
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto relative">
          {canvas}
        </div>

        {/* Right Sidebar - Layers & Properties */}
        <div className="w-80 bg-white border-l border-[#E5E7EB] flex-shrink-0 shadow-sm z-10 
                        hidden lg:block">
          {rightSidebar}
        </div>
      </div>

      {/* Mobile Panels Overlay */}
      <div className="md:hidden fixed inset-0 pointer-events-none z-30">
        {/* Mobile toolbox will slide in from left */}
        {/* Mobile layers/properties will slide in from right */}
      </div>
      
      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#111827',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            borderRadius: '8px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}
