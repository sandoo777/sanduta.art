'use client';

import { useState } from 'react';
import { XMarkIcon, DocumentArrowDownIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { ExportOptions, ExportFormat } from '@/modules/editor/export/exportTypes';
import { validateExport, exportPNG, exportPDF, exportSVG, exportPrintReady } from '@/modules/editor/export/exportEngine';
import { useEditorStore } from '@/modules/editor/editorStore';
import { toast } from 'react-hot-toast';
import ExportPreview from './ExportPreview';

interface ExportPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportPanel({ isOpen, onClose }: ExportPanelProps) {
  const { elements, canvasSize } = useEditorStore();
  const canvasWidth = canvasSize.width;
  const canvasHeight = canvasSize.height;
  
  const [options, setOptions] = useState<ExportOptions>({
    format: 'png',
    dpi: 300,
    background: 'white',
    bleed: 3,
    cropMarks: true,
    cmyk: false,
    flattenText: false,
    quality: 'high',
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Validare
      const validation = validateExport(
        elements,
        { width: canvasWidth, height: canvasHeight },
        options
      );

      // Afișăm warnings
      if (validation.warnings.length > 0) {
        validation.warnings.forEach((warning) => {
          toast(warning.message, {
            icon: '⚠️',
            duration: 4000,
          });
        });
      }

      // Erori blocante
      if (!validation.valid) {
        validation.errors.forEach((error) => {
          toast.error(error.message);
        });
        setIsExporting(false);
        return;
      }

      setExportProgress(20);

      // Obținem canvas-ul DOM
      const canvasElement = document.querySelector('[data-canvas-container]') as HTMLElement;
      if (!canvasElement) {
        throw new Error('Canvas nu a fost găsit');
      }

      setExportProgress(40);

      let blob: Blob;
      let filename: string;

      // Export în funcție de format
      switch (options.format) {
        case 'png':
          blob = await exportPNG(canvasElement, { width: canvasWidth, height: canvasHeight }, options);
          filename = `design-${Date.now()}.png`;
          break;

        case 'svg':
          const svgContent = exportSVG(elements, { width: canvasWidth, height: canvasHeight }, options);
          blob = new Blob([svgContent], { type: 'image/svg+xml' });
          filename = `design-${Date.now()}.svg`;
          break;

        case 'pdf':
          blob = await exportPDF(canvasElement, { width: canvasWidth, height: canvasHeight }, options);
          filename = `design-${Date.now()}.pdf`;
          break;

        case 'print-ready':
          blob = await exportPrintReady(
            canvasElement,
            elements,
            { width: canvasWidth, height: canvasHeight },
            options
          );
          filename = `design-print-ready-${Date.now()}.pdf`;
          break;

        default:
          throw new Error('Format necunoscut');
      }

      setExportProgress(80);

      // Download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportProgress(100);

      toast.success('Export finalizat cu succes!');
      
      // Închide panoul după 1 secundă
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (_error) {
      console.error('Export error:', error);
      toast.error('Eroare la export. Încearcă din nou.');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <DocumentArrowDownIcon className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Exportă designul</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isExporting}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Format fișier
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['png', 'pdf', 'svg', 'print-ready'] as ExportFormat[]).map((format) => (
                <button
                  key={format}
                  onClick={() => setOptions({ ...options, format })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    options.format === format
                      ? 'border-primary bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={isExporting}
                >
                  <div className="font-medium">
                    {format === 'png' && 'PNG'}
                    {format === 'pdf' && 'PDF'}
                    {format === 'svg' && 'SVG (Vector)'}
                    {format === 'print-ready' && 'Print Ready PDF'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {format === 'png' && 'Imagine raster de înaltă calitate'}
                    {format === 'pdf' && 'Document PDF standard'}
                    {format === 'svg' && 'Grafică vectorială editabilă'}
                    {format === 'print-ready' && 'Cu bleed, crop marks, CMYK'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* DPI Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rezoluție (DPI)
            </label>
            <div className="flex gap-3">
              {[72, 150, 300].map((dpi) => (
                <button
                  key={dpi}
                  onClick={() => setOptions({ ...options, dpi: dpi as 72 | 150 | 300 })}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                    options.dpi === dpi
                      ? 'border-primary bg-blue-50 font-medium'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={isExporting}
                >
                  {dpi} DPI
                  {dpi === 300 && <span className="text-xs block text-green-600">Recomandat</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Background */}
          {(options.format === 'png' || options.format === 'svg') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Fundal
              </label>
              <div className="flex gap-3">
                {(['white', 'transparent'] as const).map((bg) => (
                  <button
                    key={bg}
                    onClick={() => setOptions({ ...options, background: bg })}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                      options.background === bg
                        ? 'border-primary bg-blue-50 font-medium'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    disabled={isExporting}
                  >
                    {bg === 'white' ? 'Alb' : 'Transparent'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Print-Ready Options */}
          {options.format === 'print-ready' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Bleed (margine de siguranță)
                </label>
                <div className="flex gap-3">
                  {[0, 3, 5].map((bleed) => (
                    <button
                      key={bleed}
                      onClick={() => setOptions({ ...options, bleed: bleed as 0 | 3 | 5 })}
                      className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                        options.bleed === bleed
                          ? 'border-primary bg-blue-50 font-medium'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      disabled={isExporting}
                    >
                      {bleed === 0 ? 'Fără' : `${bleed}mm`}
                      {bleed === 3 && <span className="text-xs block text-green-600">Standard</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Crop marks (repere de tăiere)</div>
                  <div className="text-sm text-gray-600">Adaugă linii de tăiere pentru tipografie</div>
                </div>
                <input
                  type="checkbox"
                  checked={options.cropMarks}
                  onChange={(e) => setOptions({ ...options, cropMarks: e.target.checked })}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                  disabled={isExporting}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Conversie CMYK</div>
                  <div className="text-sm text-gray-600">Convertește culorile pentru tipar offset</div>
                </div>
                <input
                  type="checkbox"
                  checked={options.cmyk}
                  onChange={(e) => setOptions({ ...options, cmyk: e.target.checked })}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                  disabled={isExporting}
                />
              </div>
            </>
          )}

          {/* SVG Options */}
          {options.format === 'svg' && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Flatten text (convertește textul în trasee)</div>
                <div className="text-sm text-gray-600">Util dacă fonturile nu sunt disponibile</div>
              </div>
              <input
                type="checkbox"
                checked={options.flattenText}
                onChange={(e) => setOptions({ ...options, flattenText: e.target.checked })}
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                disabled={isExporting}
              />
            </div>
          )}

          {/* Progress Bar */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Se generează fișierul...</span>
                <span className="font-medium">{exportProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Preview */}
          {!isExporting && (
            <ExportPreview
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              options={options}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isExporting}
          >
            Anulează
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="min-w-[150px]"
          >
            {isExporting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Export în curs...
              </>
            ) : (
              <>
                <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                Exportă fișierul
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
