'use client';

import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { useState } from 'react';
import { CategoryTreeNode } from '@/lib/categoryTree';
import { Category } from '@/types/models';

interface CategoryTreeViewProps {
  nodes: CategoryTreeNode[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryTreeView({ nodes, onEdit, onDelete }: CategoryTreeViewProps) {
  return (
    <div className="space-y-1">
      {nodes.map(node => (
        <CategoryTreeItem
          key={node.id}
          node={node}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

interface CategoryTreeItemProps {
  node: CategoryTreeNode;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

function CategoryTreeItem({ node, onEdit, onDelete }: CategoryTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      {/* Current node */}
      <div
        className="group flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
        style={{ paddingLeft: `${node.level * 24 + 12}px` }}
      >
        {/* Expand/Collapse button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex-shrink-0 w-5 h-5 rounded hover:bg-gray-200 transition-colors ${
            hasChildren ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {hasChildren && (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            )
          )}
        </button>

        {/* Icon */}
        <div 
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: node.color || '#3B82F6' }}
        >
          {hasChildren ? (
            isExpanded ? (
              <FolderOpen className="w-4 h-4 text-white" />
            ) : (
              <Folder className="w-4 h-4 text-white" />
            )
          ) : (
            <span className="text-sm">{node.icon || '📦'}</span>
          )}
        </div>

        {/* Name and info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 truncate">{node.name}</span>
            {!node.active && (
              <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded">
                Inactive
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-500">{node.slug}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{node._count?.products ?? 0} products</span>
            {node.level > 0 && (
              <>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-purple-600 font-medium">
                  Level {node.level + 1}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(node)}
            className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(node)}
            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children.map(child => (
            <CategoryTreeItem
              key={child.id}
              node={child}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
