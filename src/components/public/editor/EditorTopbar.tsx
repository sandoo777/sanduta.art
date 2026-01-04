'use client';

import { useState } from 'react';
import { useEditorStore } from '@/modules/editor/editorStore';
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

export default function EditorTopbar() {
  const { undo, redo, canUndo, canRedo, zoom, setZoom, projectName } = useEditorStore();
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  const handleUndo = () => {
    if (canUndo()) undo();
  };

  const handleRedo = () => {
    if (canRedo()) redo();
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.1, 0.1));
  };

  const handleFitToScreen = () => {
    setZoom(1);
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    // Simulare salvare
    setTimeout(() => {
      setSaveStatus('saved');
    }, 1000);
  };

  const handleFinalize = () => {
    // TODO: Redirect to checkout sau review
    console.log('Finalizează designul');
  };

  return (
    <div className="h-full px-4 flex items-center justify-between">
      {/* Left Section - Logo & Project Name */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0066FF] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-semibold text-gray-900 hidden md:inline">
            {projectName || 'Proiect Nou'}
          </span>
        </div>
      </div>

      {/* Center Section - Main Controls */}
      <div className="flex items-center gap-2">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
          <button
            onClick={handleUndo}
            disabled={!canUndo()}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed
                     transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <ArrowUturnLeftIcon className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo()}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed
                     transition-colors"
            title="Redo (Ctrl+Shift+Z)"
          >
            <ArrowUturnRightIcon className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Zoom Out"
          >
            <MagnifyingGlassMinusIcon className="w-5 h-5 text-gray-700" />
          </button>
          <span className="text-sm text-gray-700 font-medium min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Zoom In"
          >
            <MagnifyingGlassPlusIcon className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={handleFitToScreen}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Fit to Screen"
          >
            <ArrowsPointingOutIcon className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Save Status */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {saveStatus === 'saved' && (
            <>
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span className="hidden sm:inline">Salvat</span>
            </>
          )}
          {saveStatus === 'saving' && (
            <>
              <ArrowPathIcon className="w-4 h-4 text-blue-500 animate-spin" />
              <span className="hidden sm:inline">Salvare...</span>
            </>
          )}
        </div>
      </div>

      {/* Right Section - Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 
                   rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          Salvează
        </button>
        <button
          onClick={handleFinalize}
          className="px-4 py-2 text-sm font-medium text-white bg-[#0066FF] rounded-lg 
                   hover:bg-[#0052CC] transition-colors shadow-sm"
        >
          Finalizează Design
        </button>
      </div>
    </div>
  );
}
