'use client';

import { use, useEffect } from 'react';
import { useEditorStore } from '@/modules/editor/editorStore';
import EditorLayout from '@/components/public/editor/EditorLayout';
import EditorTopbar from '@/components/public/editor/EditorTopbar';
import EditorSidebarLeft from '@/components/public/editor/EditorSidebarLeft';
import EditorCanvas from '@/components/public/editor/EditorCanvas';
import EditorSidebarRight from '@/components/public/editor/EditorSidebarRight';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function EditorPage({ params }: PageProps) {
  const { projectId } = use(params);
  const { setProjectName, addElement } = useEditorStore();

  useEffect(() => {
    // Initialize project
    setProjectName(`Proiect #${projectId}`);

    // Add some demo elements for testing
    addElement({
      id: 'demo-text-1',
      type: 'text',
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      content: 'Bun venit în Editor!',
      fontSize: 24,
      color: '#0066FF',
      fontFamily: 'Arial',
      textAlign: 'center',
      zIndex: 1,
      visible: true,
      locked: false,
      rotation: 0,
      opacity: 1,
    });

    addElement({
      id: 'demo-shape-1',
      type: 'shape',
      x: 350,
      y: 150,
      width: 150,
      height: 150,
      shape: 'rectangle',
      fill: '#FACC15',
      borderRadius: 12,
      zIndex: 0,
      visible: true,
      locked: false,
      rotation: 0,
      opacity: 0.8,
    });

    addElement({
      id: 'demo-shape-2',
      type: 'shape',
      x: 200,
      y: 300,
      width: 100,
      height: 100,
      shape: 'circle',
      fill: '#0066FF',
      borderRadius: 0,
      zIndex: 0,
      visible: true,
      locked: false,
      rotation: 0,
      opacity: 0.6,
    });

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const { undo, redo, deleteElement, selectedElementId } = useEditorStore.getState();

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

      // Delete (Delete or Backspace)
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        e.preventDefault();
        deleteElement(selectedElementId);
      }

      // TODO: Add more shortcuts
      // Ctrl/Cmd + G → Group
      // Ctrl/Cmd + Shift + G → Ungroup
      // Arrow keys → Nudge
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [projectId, setProjectName, addElement]);

  return (
    <EditorLayout
      topbar={<EditorTopbar />}
      leftSidebar={<EditorSidebarLeft />}
      canvas={<EditorCanvas />}
      rightSidebar={<EditorSidebarRight />}
    />
  );
}
