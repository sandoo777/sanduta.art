'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEditorStore } from '@/modules/editor/editorStore';
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import ExportPanel from './export/ExportPanel';
import { exportPNG, exportPrintReady } from '@/modules/editor/export/exportEngine';
import { uploadPdf, uploadPreview } from '@/modules/editor/export/uploadExport';
import { buildConfiguratorPayload } from '@/modules/editor/export/buildConfiguratorPayload';
import { toast } from 'react-hot-toast';

export default function EditorTopbar() {
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [finalizeMessage, setFinalizeMessage] = useState('');
  const { 
    undo, 
    redo, 
    canUndo, 
    canRedo, 
    zoom, 
    setZoom, 
    projectName,
    saveStatus,
    hasUnsavedChanges,
    saveProject,
    projectId,
    elements,
    canvasSize,
  } = useEditorStore();
  const router = useRouter();

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
    await saveProject();
  };

  const handleFinalize = () => {
    setShowFinalizeModal(true);
  };

  const handleConfirmFinalize = async () => {
    try {
      setIsFinalizing(true);
      setFinalizeMessage('Se exportă designul...');

      const canvasElement = document.querySelector('[data-canvas-container]') as HTMLElement | null;
      if (!canvasElement) throw new Error('Canvas indisponibil pentru export');

      // Export print-ready PDF
      const pdfBlob = await exportPrintReady(
        canvasElement,
        elements,
        { width: canvasSize.width, height: canvasSize.height },
        { bleed: 3, cropMarks: true, cmyk: true, dpi: 300, background: 'white' }
      );

      // Export low-res PNG preview
      const previewBlob = await exportPNG(
        canvasElement,
        { width: canvasSize.width, height: canvasSize.height },
        { dpi: 72, background: 'white' }
      );

      setFinalizeMessage('Se încarcă fișierul...');

      const baseName = (projectName || 'design').replace(/\s+/g, '-').toLowerCase();
      const pdfUrl = await uploadPdf(pdfBlob, `${baseName}-print-ready.pdf`);
      const previewUrl = await uploadPreview(previewBlob, `${baseName}-preview.png`);

      const payload = buildConfiguratorPayload({
        fileUrl: pdfUrl,
        previewUrl,
        projectId: projectId || `proj-${Date.now()}`,
        projectName: projectName || 'Design',
        width: canvasSize.width,
        height: canvasSize.height,
        bleed: 3,
      });

      // Persist payload pentru configurator (sessionStorage)
      sessionStorage.setItem('editorDesignPayload', JSON.stringify(payload));

      setFinalizeMessage('Gata! Te ducem în configurator...');

      const slug = resolveProductSlugFromPath();
      router.push(`/produse/${slug}/configure?fromEditor=true&projectId=${payload.projectId}`);
    } catch (error) {
      console.error('Finalize error:', error);
      toast.error('Exportul a eșuat. Încearcă din nou.');
      setFinalizeMessage('');
    } finally {
      setIsFinalizing(false);
      setShowFinalizeModal(false);
    }
  };
  
  // Save button status
  const getSaveIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <ArrowPathIcon className="w-4 h-4 animate-spin" />;
      case 'saved':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      default:
        return <CloudArrowUpIcon className="w-4 h-4" />;
    }
  };
  
  const getSaveText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Se salvează...';
      case 'saved':
        return 'Salvat';
      case 'error':
        return 'Eroare';
      default:
        return hasUnsavedChanges ? 'Salvează' : 'Salvat';
    }
  };
  
  const getSaveButtonClass = () => {
    const base = 'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors';
    
    switch (saveStatus) {
      case 'saving':
        return `${base} bg-blue-100 text-blue-600 cursor-wait`;
      case 'saved':
        return `${base} bg-green-100 text-green-600`;
      case 'error':
        return `${base} bg-red-100 text-red-600 hover:bg-red-200`;
      default:
        return hasUnsavedChanges 
          ? `${base} bg-blue-500 text-white hover:bg-blue-600`
          : `${base} bg-gray-100 text-gray-600`;
    }
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
      </div>

      {/* Right Section - Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className={getSaveButtonClass()}
          title={getSaveText()}
        >
          {getSaveIcon()}
          <span className="hidden sm:inline">{getSaveText()}</span>
        </button>
        
        {/* Export Button */}
        <button
          onClick={() => setShowExportPanel(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 
                   bg-white border border-gray-300 rounded-lg hover:bg-gray-50 
                   transition-colors shadow-sm"
          title="Exportă designul"
        >
          <DocumentArrowDownIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Exportă</span>
        </button>
        
        <button
          onClick={handleFinalize}
          className="px-4 py-2 text-sm font-medium text-white bg-[#0066FF] rounded-lg 
                   hover:bg-[#0052CC] transition-colors shadow-sm"
        >
          Finalizează Design
        </button>
      </div>
      
      {/* Export Panel */}
      <ExportPanel 
        isOpen={showExportPanel} 
        onClose={() => setShowExportPanel(false)} 
      />

        {/* Finalize Modal */}
        {showFinalizeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4">
              <div className="flex items-center gap-3">
                <SparklesIcon className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Finalizează designul</h3>
                  <p className="text-sm text-gray-600">Ești sigur că vrei să finalizezi designul și să îl trimiți în configurator?</p>
                </div>
              </div>

              {finalizeMessage && (
                <div className="bg-blue-50 text-blue-800 text-sm px-3 py-2 rounded-lg">
                  {finalizeMessage}
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowFinalizeModal(false)}
                  disabled={isFinalizing}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                >
                  Anulează
                </button>
                <button
                  onClick={handleConfirmFinalize}
                  disabled={isFinalizing}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                >
                  {isFinalizing && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
                  Trimite în configurator
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

  function resolveProductSlugFromPath(): string {
    if (typeof window === 'undefined') return 'custom';
    const segments = window.location.pathname.split('/').filter(Boolean);
    const editorIndex = segments.indexOf('editor');
    if (editorIndex !== -1 && segments[editorIndex + 1]) {
      return segments[editorIndex + 1];
    }
    return 'custom';
  }
