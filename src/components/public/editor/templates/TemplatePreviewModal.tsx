'use client';

import { Template } from '@/modules/editor/templates/templateList';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface TemplatePreviewModalProps {
  template: Template;
  onClose: () => void;
  onUseTemplate: (template: Template) => void;
}

export default function TemplatePreviewModal({
  template,
  onClose,
  onUseTemplate,
}: TemplatePreviewModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUseTemplate = async () => {
    setIsLoading(true);
    // Simulare delay pentru UX
    await new Promise((resolve) => setTimeout(resolve, 500));
    onUseTemplate(template);
    setIsLoading(false);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden 
                   animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-600">{template.category}</span>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-600 capitalize">{template.style}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Preview */}
            <div className="space-y-4">
              <div className="aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                {/* Placeholder pentru preview mare */}
                <div 
                  className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 
                           flex items-center justify-center"
                >
                  <div className="text-center p-8">
                    <div className="text-8xl mb-4">🎨</div>
                    <p className="text-lg text-gray-600 font-medium">{template.name}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {template.canvasSize.width} × {template.canvasSize.height} px
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Descriere</h3>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>

              {/* Canvas Size */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Dimensiuni Canvas</h3>
                <p className="text-sm text-gray-600">
                  {template.canvasSize.width} × {template.canvasSize.height} pixeli
                </p>
              </div>

              {/* Elements */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Elemente</h3>
                <div className="flex flex-wrap gap-2">
                  {template.elements.map((element, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {element.type === 'text' ? '📝 Text' : 
                       element.type === 'image' ? '🖼️ Imagine' : 
                       '⬜ Formă'}
                    </span>
                  ))}
                  <span className="px-2 py-1 bg-[#0066FF]/10 text-[#0066FF] text-xs rounded font-medium">
                    {template.elements.length} elemente total
                  </span>
                </div>
              </div>

              {/* Dominant Colors */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Culori Dominante</h3>
                <div className="flex flex-wrap gap-2">
                  {template.dominantColors.map((color, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs font-mono text-gray-700">{color}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-[#0066FF] flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium mb-1">Ce include acest template:</p>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Structură completă de design</li>
                      <li>• Toate elementele sunt editabile</li>
                      <li>• Dimensiuni optimizate pentru imprimare</li>
                      <li>• Gata de personalizare</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 
                     rounded-lg hover:bg-gray-50 transition-colors"
          >
            Anulează
          </button>
          <button
            onClick={handleUseTemplate}
            disabled={isLoading}
            className="px-6 py-3 text-sm font-medium text-white bg-[#0066FF] rounded-lg 
                     hover:bg-[#0052CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center gap-2 shadow-lg shadow-[#0066FF]/20"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Se încarcă...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                Folosește acest template
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
