'use client';

import { Template } from '@/modules/editor/templates/templateList';
import { EyeIcon } from '@heroicons/react/24/outline';

interface TemplateCardProps {
  template: Template;
  onPreview: (template: Template) => void;
}

export default function TemplateCard({ template, onPreview }: TemplateCardProps) {
  return (
    <div 
      className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden 
                 hover:shadow-xl hover:border-[#0066FF] transition-all duration-300 cursor-pointer"
      onClick={() => onPreview(template)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
        {/* Placeholder pentru thumbnail */}
        <div 
          className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 
                     flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
        >
          <div className="text-center p-4">
            <div className="text-6xl mb-2">🎨</div>
            <p className="text-sm text-gray-500 font-medium">{template.name}</p>
          </div>
        </div>

        {/* Overlay on hover */}
        <div 
          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                     transition-opacity duration-300 flex items-center justify-center"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview(template);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg 
                     hover:bg-gray-100 transition-colors font-medium text-sm"
          >
            <EyeIcon className="w-5 h-5" />
            Previzualizează
          </button>
        </div>

        {/* Category Badge */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded text-xs font-medium text-gray-700">
          {template.category}
        </div>

        {/* Style Badge */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-[#0066FF]/90 backdrop-blur-sm rounded text-xs font-medium text-white capitalize">
          {template.style}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate group-hover:text-[#0066FF] transition-colors">
          {template.name}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2">
          {template.description}
        </p>

        {/* Colors */}
        <div className="flex items-center gap-1 mt-2">
          {template.dominantColors.slice(0, 4).map((color, index) => (
            <div
              key={index}
              className="w-4 h-4 rounded-full border border-gray-200"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
