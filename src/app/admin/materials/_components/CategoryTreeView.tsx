'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus, Edit, Trash2, Lock } from 'lucide-react';
import type { MaterialCategoryTree } from '@/modules/material-categories/types';

interface CategoryTreeViewProps {
  categories: MaterialCategoryTree[];
  onAddSubcategory: (parentId: string) => void;
  onEdit: (category: MaterialCategoryTree) => void;
  onDelete: (categoryId: string) => void;
  level?: number;
}

export default function CategoryTreeView({
  categories,
  onAddSubcategory,
  onEdit,
  onDelete,
  level = 0,
}: CategoryTreeViewProps) {
  return (
    <div className={level > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}>
      {categories.map((category) => (
        <CategoryNode
          key={category.id}
          category={category}
          onAddSubcategory={onAddSubcategory}
          onEdit={onEdit}
          onDelete={onDelete}
          level={level}
        />
      ))}
    </div>
  );
}

interface CategoryNodeProps {
  category: MaterialCategoryTree;
  onAddSubcategory: (parentId: string) => void;
  onEdit: (category: MaterialCategoryTree) => void;
  onDelete: (categoryId: string) => void;
  level: number;
}

function CategoryNode({
  category,
  onAddSubcategory,
  onEdit,
  onDelete,
  level,
}: CategoryNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = category.children && category.children.length > 0;
  const hasMaterials = category._count && category._count.materials > 0;
  const isLocked = hasChildren || hasMaterials;

  const getFieldFlags = () => {
    const flags: Array<{ label: string; color: string; tooltip: string }> = [];
    
    if (category.requiresThickness) {
      flags.push({ label: 'Grosime', color: 'bg-blue-100 text-blue-800', tooltip: 'Necesită câmp Grosime (mm)' });
    }
    if (category.requiresDensity) {
      flags.push({ label: 'Densitate', color: 'bg-purple-100 text-purple-800', tooltip: 'Necesită câmp Densitate (g/m²)' });
    }
    if (category.requiresPricePerSqm) {
      flags.push({ label: 'm²', color: 'bg-blue-500 text-white', tooltip: 'Necesită Preț per m²' });
    }
    if (category.requiresPricePerMeter) {
      flags.push({ label: 'metru', color: 'bg-violet-500 text-white', tooltip: 'Necesită Preț per metru' });
    }
    if (category.requiresPricePerUnit) {
      flags.push({ label: 'buc', color: 'bg-green-500 text-white', tooltip: 'Necesită Preț per unitate' });
    }
    if (category.requiresWastePercent) {
      flags.push({ label: 'waste', color: 'bg-orange-500 text-white', tooltip: 'Necesită Procent waste' });
    }
    
    return flags;
  };

  const flags = getFieldFlags();

  return (
    <div className="mb-2 animate-in fade-in slide-in-from-left-2 duration-200">
      <div className={`
        group relative rounded-lg border transition-all duration-200
        ${category.active 
          ? 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm' 
          : 'border-gray-300 bg-gray-50 opacity-75'}
      `}>
        <div className="p-3 flex items-center gap-3">
          {/* Expand/Collapse Button */}
          <button
            onClick={() => hasChildren && setIsExpanded(!isExpanded)}
            className={`
              flex-shrink-0 w-8 h-8 flex items-center justify-center rounded
              transition-colors duration-150
              ${hasChildren 
                ? 'hover:bg-gray-100 text-gray-600 hover:text-gray-900 cursor-pointer' 
                : 'text-gray-300 cursor-default'}
            `}
            disabled={!hasChildren}
          >
            {hasChildren ? (
              isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />
            ) : (
              <div className="w-5 h-5" />
            )}
          </button>

          {/* Folder Icon */}
          <div className={`
            flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg
            ${hasChildren 
              ? 'bg-amber-100 text-amber-600' 
              : 'bg-gray-100 text-gray-500'}
          `}>
            {hasChildren ? (
              isExpanded ? <FolderOpen className="w-6 h-6" /> : <Folder className="w-6 h-6" />
            ) : (
              <Folder className="w-6 h-6" />
            )}
          </div>

          {/* Category Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">{category.name}</h3>
              {isLocked && (
                <div className="group/lock relative">
                  <Lock className="w-4 h-4 text-gray-400" />
                  <div className="absolute left-0 top-full mt-1 hidden group-hover/lock:block z-10">
                    <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      {hasChildren && `${category._count.children} subcategorii`}
                      {hasChildren && hasMaterials && ' • '}
                      {hasMaterials && `${category._count.materials} materiale`}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {category.description && (
              <p className="text-sm text-gray-600 mt-0.5 truncate">{category.description}</p>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {!category.active && (
              <span className="px-2 py-1 text-xs font-medium rounded bg-gray-200 text-gray-600">
                Inactiv
              </span>
            )}
            {flags.map((flag, index) => (
              <div key={index} className="group/flag relative">
                <span className={`px-2 py-1 text-xs font-medium rounded ${flag.color}`}>
                  {flag.label}
                </span>
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover/flag:block z-10">
                  <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                    {flag.tooltip}
                  </div>
                </div>
              </div>
            ))}
            {category._count && category._count.materials > 0 && (
              <span className="px-2 py-1 text-xs font-medium rounded bg-blue-50 text-blue-700">
                {category._count.materials} {category._count.materials === 1 ? 'material' : 'materiale'}
              </span>
            )}
            {category._count && category._count.children > 0 && (
              <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">
                {category._count.children} {category._count.children === 1 ? 'subcategorie' : 'subcategorii'}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onAddSubcategory(category.id)}
              className="p-2 rounded hover:bg-blue-50 text-blue-600 transition-colors"
              title="Adaugă subcategorie"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(category)}
              className="p-2 rounded hover:bg-gray-100 text-gray-600 transition-colors"
              title="Editează"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(category.id)}
              disabled={isLocked}
              className={`p-2 rounded transition-colors ${
                isLocked
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'hover:bg-red-50 text-red-600'
              }`}
              title={isLocked ? 'Nu poate fi șters (are subcategorii sau materiale)' : 'Șterge'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="pb-2 px-2">
            <CategoryTreeView
              categories={category.children}
              onAddSubcategory={onAddSubcategory}
              onEdit={onEdit}
              onDelete={onDelete}
              level={level + 1}
            />
          </div>
        )}
      </div>
    </div>
  );
}
