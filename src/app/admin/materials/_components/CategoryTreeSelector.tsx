'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, Folder, FolderOpen, Check } from 'lucide-react';
import type { MaterialCategoryTree } from '@/modules/material-categories/types';

interface CategoryTreeSelectorProps {
  value: string | null;
  onChange: (categoryId: string, category: MaterialCategoryTree | null) => void;
  error?: string;
}

export default function CategoryTreeSelector({ value, onChange, error }: CategoryTreeSelectorProps) {
  const [categories, setCategories] = useState<MaterialCategoryTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategoryTree | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch categories on mount and when key changes
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (value && categories.length > 0) {
      const found = findCategoryById(categories, value);
      setSelectedCategory(found);
      // Notify parent component when category is found on load - only once
      if (found && found.id === value) {
        onChange(found.id, found);
      }
    }
  }, [value, categories]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  async function fetchCategories() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/material-categories/tree');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    } finally {
      setLoading(false);
    }
  }

  function findCategoryById(cats: MaterialCategoryTree[], id: string): MaterialCategoryTree | null {
    for (const cat of cats) {
      if (cat.id === id) return cat;
      if (cat.children) {
        const found = findCategoryById(cat.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  function handleSelect(category: MaterialCategoryTree) {
    setSelectedCategory(category);
    onChange(category.id, category);
    setIsOpen(false);
  }

  function getCategoryPath(category: MaterialCategoryTree): string {
    // Simple path display - just show the name for now
    // In a full implementation, you'd traverse up the parent chain
    return category.name;
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        Se încarcă categoriile...
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Display Selected */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-2.5 border rounded-lg text-left flex items-center justify-between
          transition-all duration-150
          ${error 
            ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
            : 'border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-blue-500/20'}
          ${isOpen ? 'ring-2 ring-blue-500/20 border-blue-500' : ''}
        `}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {selectedCategory ? (
            <>
              <Folder className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="text-gray-900 truncate">{getCategoryPath(selectedCategory)}</span>
            </>
          ) : (
            <>
              <Folder className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-400">Selectează categoria...</span>
            </>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {error && (
        <p className="text-sm text-red-500 mt-1.5 flex items-center gap-1">
          <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
          {error}
        </p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {categories.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              Nu există categorii disponibile
            </div>
          ) : (
            <TreeOptions
              categories={categories}
              onSelect={handleSelect}
              selectedId={value}
              level={0}
            />
          )}
        </div>
      )}
    </div>
  );
}

interface TreeOptionsProps {
  categories: MaterialCategoryTree[];
  onSelect: (category: MaterialCategoryTree) => void;
  selectedId: string | null;
  level: number;
}

function TreeOptions({ categories, onSelect, selectedId, level }: TreeOptionsProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Auto-expand all categories by default for better UX
    const allIds = new Set<string>();
    function collectIds(cats: MaterialCategoryTree[]) {
      cats.forEach(cat => {
        if (cat.children && cat.children.length > 0) {
          allIds.add(cat.id);
          collectIds(cat.children);
        }
      });
    }
    collectIds(categories);
    return allIds;
  });

  function toggleExpand(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="py-1">
      {categories.map((category) => {
        const hasChildren = category.children && category.children.length > 0;
        const isExpanded = expandedIds.has(category.id);
        const isSelected = category.id === selectedId;
        const isInactive = !category.active;

        return (
          <div key={category.id}>
            <button
              type="button"
              onClick={() => !isInactive && onSelect(category)}
              disabled={isInactive}
              className={`
                w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors
                ${isInactive 
                  ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                  : 'hover:bg-gray-50 cursor-pointer'}
                ${isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}
              `}
              style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
            >
              {/* Expand/Collapse Button */}
              {hasChildren ? (
                <button
                  onClick={(e) => toggleExpand(category.id, e)}
                  className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              ) : (
                <div className="w-4" />
              )}

              {/* Folder Icon */}
              {hasChildren ? (
                isExpanded ? (
                  <FolderOpen className="w-4 h-4 text-amber-600" />
                ) : (
                  <Folder className="w-4 h-4 text-amber-600" />
                )
              ) : (
                <Folder className="w-4 h-4 text-gray-400" />
              )}

              {/* Category Name */}
              <span className="flex-1 text-left truncate">
                {category.name}
              </span>

              {/* Count Badge */}
              {category._count && category._count.materials > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600">
                  {category._count.materials}
                </span>
              )}

              {/* Selected Check */}
              {isSelected && (
                <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
              )}

              {/* Inactive Badge */}
              {isInactive && (
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-200 text-gray-600">
                  Inactiv
                </span>
              )}
            </button>

            {/* Children */}
            {hasChildren && isExpanded && (
              <TreeOptions
                categories={category.children}
                onSelect={onSelect}
                selectedId={selectedId}
                level={level + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
