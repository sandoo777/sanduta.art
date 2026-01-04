"use client";

interface DesignEntryProps {
  onSelectTemplate?: (templateId: string) => void;
  onOpenEditor?: () => void;
}

const templates = [
  { id: 'bold-blue', name: 'Bold Blue', desc: 'Headline mare, accente albastre', badge: 'Recomandat' },
  { id: 'minimal', name: 'Minimal Clean', desc: 'Spațiu alb, tipografie elegantă', badge: 'Popular' },
  { id: 'promo', name: 'Promo Pack', desc: 'Layout promoțional cu CTA clar', badge: 'Nou' },
];

export function DesignEntry({ onSelectTemplate, onOpenEditor }: DesignEntryProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-gray-900">Nu ai fișier? Creează designul aici</p>
            <p className="text-sm text-gray-600">Deschide editorul și personalizează rapid cu elemente gata de folosit.</p>
          </div>
          <button
            type="button"
            onClick={onOpenEditor}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-sm"
          >
            Deschide editorul de design
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div key={template.id} className="border border-gray-200 rounded-lg bg-white p-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">{template.name}</h4>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold">{template.badge}</span>
            </div>
            <div className="aspect-video bg-gray-50 border border-dashed border-gray-200 rounded-md mb-3 flex items-center justify-center text-gray-400 text-sm">
              Previzualizare template
            </div>
            <p className="text-sm text-gray-600 mb-3">{template.desc}</p>
            <button
              type="button"
              onClick={() => onSelectTemplate?.(template.id)}
              className="w-full px-3 py-2 border border-blue-200 text-blue-700 font-semibold rounded-lg hover:bg-blue-50"
            >
              Alege template
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
