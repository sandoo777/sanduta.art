import { useEffect, useRef } from 'react';
import { useEditorStore } from './editorStore';

const AUTO_SAVE_DELAY = 5000; // 5 seconds

export function useAutoSave() {
  const { 
    elements, 
    canvasSize, 
    projectId, 
    saveProject,
    saveStatus,
    hasUnsavedChanges,
  } = useEditorStore();
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<string>('');

  useEffect(() => {
    if (!projectId || !hasUnsavedChanges || saveStatus === 'saving') {
      return;
    }

    // Create a snapshot of current state
    const currentSnapshot = JSON.stringify({ elements, canvasSize });
    
    // Skip if nothing changed since last save
    if (currentSnapshot === lastSaveRef.current) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(async () => {
      try {
        await saveProject();
        lastSaveRef.current = currentSnapshot;
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, AUTO_SAVE_DELAY);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [elements, canvasSize, projectId, hasUnsavedChanges, saveProject, saveStatus]);
}
