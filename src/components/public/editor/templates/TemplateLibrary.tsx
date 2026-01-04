'use client';

import { useState, useMemo } from 'react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { templates, categories, styles, filterTemplates, TemplateCategory, TemplateStyle, Template } from '@/modules/editor/templates/templateList';
import TemplateCard from './TemplateCard';
import TemplatePreviewModal from './TemplatePreviewModal';

interface TemplateLibraryProps {
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
}

export default function TemplateLibrary({ onClose, onSelectTemplate }: TemplateLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [selectedStyle, setSelectedStyle] = useState<TemplateStyle | 'all'>('all');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    return filterTemplates({
      searchQuery: searchQuery,
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      style: selectedStyle === 'all' ? undefined : selectedStyle,
    });
  }, [searchQuery, selectedCategory, selectedStyle]);

  const handleUseTemplate = (template: Template) => {
    onSelectTemplate(template);
    setPreviewTemplate(null);
    onClose();
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Biblioteca de Template-uri</h2>
              <p className="text-sm text-gray-600 mt-1">
                Alege un template pentru a începe rapid designul tău
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Filters */}
          <div className="p-6 space-y-4 border-b border-gray-200 bg-gray-50">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Caută template-uri..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none 
                         focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
              />
            </div>

            {/* Category and Style Filters */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categorie
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-[#0066FF] text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Toate
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-[#0066FF] text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Styles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stil
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedStyle('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                      selectedStyle === 'all'
                        ? 'bg-[#0066FF] text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Toate
                  </button>
                  {styles.map((style) => (
                    <button
                      key={style}
                      onClick={() => setSelectedStyle(style)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                        selectedStyle === style
                          ? 'bg-[#0066FF] text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-600">
              {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template găsit' : 'template-uri găsite'}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onPreview={setPreviewTemplate}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Niciun template găsit
                </h3>
                <p className="text-sm text-gray-600 max-w-md">
                  Încearcă să schimbi criteriile de căutare sau filtrele pentru a găsi template-uri.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedStyle('all');
                  }}
                  className="mt-4 px-4 py-2 bg-[#0066FF] text-white rounded-lg hover:bg-[#0052CC] 
                           transition-colors text-sm font-medium"
                >
                  Resetează filtrele
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onUseTemplate={handleUseTemplate}
        />
      )}
    </>
  );
}
