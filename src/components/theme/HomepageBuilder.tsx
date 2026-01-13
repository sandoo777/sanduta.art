'use client';

/**
 * Homepage Builder
 * Drag & drop interface pentru construirea paginii principale
 */

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { HomepageBlock } from '@/types/theme';

interface HomepageBuilderProps {
  value: HomepageBlock[];
  onChange: (blocks: HomepageBlock[]) => void;
}

const BLOCK_TEMPLATES = [
  { type: 'hero', label: 'Hero Banner', icon: '🎯' },
  { type: 'grid-banners', label: 'Grid Banners', icon: '📋' },
  { type: 'featured-products', label: 'Featured Products', icon: '⭐' },
  { type: 'categories', label: 'Categories Grid', icon: '📦' },
  { type: 'testimonials', label: 'Testimonials', icon: '💬' },
  { type: 'text-image', label: 'Text + Image', icon: '📝' },
  { type: 'newsletter', label: 'Newsletter Signup', icon: '✉️' },
  { type: 'custom-html', label: 'Custom HTML', icon: '🔧' },
];

export function HomepageBuilder({ value, onChange }: HomepageBuilderProps) {
  const [blocks, setBlocks] = useState<HomepageBlock[]>(value);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((block) => block.id === active.id);
      const newIndex = blocks.findIndex((block) => block.id === over.id);
      const newBlocks = arrayMove(blocks, oldIndex, newIndex);
      setBlocks(newBlocks);
      onChange(newBlocks);
    }
  };

  const addBlock = (type: HomepageBlock['type']) => {
    const newBlock: HomepageBlock = {
      id: `block-${Date.now()}`,
      type,
      enabled: true,
      order: blocks.length,
      config: getDefaultConfig(type),
    };
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    onChange(newBlocks);
    setSelectedBlock(newBlock.id);
  };

  const updateBlock = (id: string, updates: Partial<HomepageBlock>) => {
    const newBlocks = blocks.map((block) =>
      block.id === id ? { ...block, ...updates } : block
    );
    setBlocks(newBlocks);
    onChange(newBlocks);
  };

  const deleteBlock = (id: string) => {
    const newBlocks = blocks.filter((block) => block.id !== id);
    setBlocks(newBlocks);
    onChange(newBlocks);
    if (selectedBlock === id) {
      setSelectedBlock(null);
    }
  };

  const duplicateBlock = (id: string) => {
    const block = blocks.find((b) => b.id === id);
    if (block) {
      const newBlock = {
        ...block,
        id: `block-${Date.now()}`,
        order: blocks.length,
      };
      const newBlocks = [...blocks, newBlock];
      setBlocks(newBlocks);
      onChange(newBlocks);
    }
  };

  const selectedBlockData = blocks.find((b) => b.id === selectedBlock);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Homepage Builder</h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            const confirmed = confirm('Are you sure you want to reset all blocks?');
            if (confirmed) {
              setBlocks([]);
              onChange([]);
              setSelectedBlock(null);
            }
          }}
        >
          🗑️ Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Block Templates */}
        <Card className="p-4 lg:col-span-1">
          <h3 className="font-semibold mb-4">Add Blocks</h3>
          <div className="space-y-2">
            {BLOCK_TEMPLATES.map((template) => (
              <button
                key={template.type}
                onClick={() => addBlock(template.type as HomepageBlock['type'])}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <span className="text-2xl">{template.icon}</span>
                <span className="text-sm font-medium">{template.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Blocks List */}
        <Card className="p-4 lg:col-span-1">
          <h3 className="font-semibold mb-4">
            Current Blocks ({blocks.length})
          </h3>
          
          {blocks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No blocks added yet.</p>
              <p className="text-xs mt-1">Add blocks from the left panel.</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {blocks.map((block) => (
                    <SortableBlockItem
                      key={block.id}
                      block={block}
                      isSelected={selectedBlock === block.id}
                      onSelect={() => setSelectedBlock(block.id)}
                      onToggle={() =>
                        updateBlock(block.id, { enabled: !block.enabled })
                      }
                      onDuplicate={() => duplicateBlock(block.id)}
                      onDelete={() => deleteBlock(block.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </Card>

        {/* Block Editor */}
        <Card className="p-4 lg:col-span-1">
          <h3 className="font-semibold mb-4">Block Settings</h3>
          
          {selectedBlockData ? (
            <BlockEditor
              block={selectedBlockData}
              onUpdate={(updates) => updateBlock(selectedBlockData.id, updates)}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No block selected.</p>
              <p className="text-xs mt-1">Select a block to edit its settings.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// Sortable Block Item
interface SortableBlockItemProps {
  block: HomepageBlock;
  isSelected: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function SortableBlockItem({
  block,
  isSelected,
  onSelect,
  onToggle,
  onDuplicate,
  onDelete,
}: SortableBlockItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const blockTemplate = BLOCK_TEMPLATES.find((t) => t.type === block.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 rounded-lg border ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : block.enabled
          ? 'border-gray-300 bg-white'
          : 'border-gray-200 bg-gray-50 opacity-50'
      } cursor-pointer transition-all`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab hover:bg-gray-200 p-1 rounded"
        >
          ⋮⋮
        </button>
        
        <span className="text-lg">{blockTemplate?.icon}</span>
        
        <div className="flex-1">
          <p className="text-sm font-medium">{blockTemplate?.label}</p>
          <p className="text-xs text-gray-500">#{block.id}</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="p-1 hover:bg-gray-200 rounded"
            title={block.enabled ? 'Disable' : 'Enable'}
          >
            {block.enabled ? '👁️' : '👁️‍🗨️'}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1 hover:bg-gray-200 rounded"
            title="Duplicate"
          >
            📋
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 hover:bg-red-100 rounded text-red-600"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

// Block Editor
interface BlockEditorProps {
  block: HomepageBlock;
  onUpdate: (updates: Partial<HomepageBlock>) => void;
}

function BlockEditor({ block, onUpdate }: BlockEditorProps) {
  const updateConfig = (key: string, value: any) => {
    onUpdate({
      config: {
        ...block.config,
        [key]: value,
      },
    });
  };

  // Render different editors based on block type
  switch (block.type) {
    case 'hero':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <Input
              value={(block.config as any).title || ''}
              onChange={(e) => updateConfig('title', e.target.value)}
              placeholder="Hero title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Subtitle</label>
            <Input
              value={(block.config as any).subtitle || ''}
              onChange={(e) => updateConfig('subtitle', e.target.value)}
              placeholder="Hero subtitle"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Background Image URL</label>
            <Input
              value={(block.config as any).backgroundImage || ''}
              onChange={(e) => updateConfig('backgroundImage', e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">CTA Text</label>
            <Input
              value={(block.config as any).ctaText || ''}
              onChange={(e) => updateConfig('ctaText', e.target.value)}
              placeholder="Shop Now"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">CTA Link</label>
            <Input
              value={(block.config as any).ctaLink || ''}
              onChange={(e) => updateConfig('ctaLink', e.target.value)}
              placeholder="/products"
            />
          </div>
        </div>
      );

    case 'featured-products':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Section Title</label>
            <Input
              value={(block.config as any).title || ''}
              onChange={(e) => updateConfig('title', e.target.value)}
              placeholder="Featured Products"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Product IDs (comma-separated)</label>
            <Input
              value={(block.config as any).productIds || ''}
              onChange={(e) => updateConfig('productIds', e.target.value)}
              placeholder="1,2,3,4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Limit</label>
            <Input
              type="number"
              value={(block.config as any).limit || 8}
              onChange={(e) => updateConfig('limit', parseInt(e.target.value))}
            />
          </div>
        </div>
      );

    case 'newsletter':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <Input
              value={(block.config as any).title || ''}
              onChange={(e) => updateConfig('title', e.target.value)}
              placeholder="Subscribe to our newsletter"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              value={(block.config as any).description || ''}
              onChange={(e) => updateConfig('description', e.target.value)}
              placeholder="Get updates about new products..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Button Text</label>
            <Input
              value={(block.config as any).buttonText || ''}
              onChange={(e) => updateConfig('buttonText', e.target.value)}
              placeholder="Subscribe"
            />
          </div>
        </div>
      );

    case 'custom-html':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">HTML Code</label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
              rows={10}
              value={(block.config as any).html || ''}
              onChange={(e) => updateConfig('html', e.target.value)}
              placeholder="<div>Custom HTML...</div>"
            />
          </div>
        </div>
      );

    default:
      return (
        <div className="text-sm text-gray-500">
          Editor for {block.type} coming soon...
        </div>
      );
  }
}

// Get default config for each block type
function getDefaultConfig(type: HomepageBlock['type']): any {
  const defaults: Record<string, any> = {
    hero: {
      title: 'Welcome to Our Store',
      subtitle: 'Discover amazing products',
      backgroundImage: '',
      ctaText: 'Shop Now',
      ctaLink: '/products',
    },
    'featured-products': {
      title: 'Featured Products',
      productIds: '',
      limit: 8,
    },
    categories: {
      title: 'Shop by Category',
      categoryIds: '',
    },
    testimonials: {
      title: 'What Our Customers Say',
      items: [],
    },
    newsletter: {
      title: 'Subscribe to our newsletter',
      description: 'Get updates about new products and special offers',
      buttonText: 'Subscribe',
    },
    'custom-html': {
      html: '<div class="text-center p-8">Custom content here</div>',
    },
  };

  return defaults[type] || {};
}
