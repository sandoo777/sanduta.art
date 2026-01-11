'use client';

/**
 * Components Customization
 * Stilizare butoane, carduri, inputuri și alte componente UI
 */

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { ComponentsConfig } from '@/types/theme';

interface ComponentsCustomizationProps {
  value: ComponentsConfig;
  onChange: (components: ComponentsConfig) => void;
}

export function ComponentsCustomization({ value, onChange }: ComponentsCustomizationProps) {
  const [components, setComponents] = useState<ComponentsConfig>(value);

  const updateButton = (field: string, value: unknown) => {
    const newComponents = {
      ...components,
      button: {
        ...components.button,
        [field]: value,
      },
    };
    setComponents(newComponents);
    onChange(newComponents);
  };

  const updateCard = (field: string, value: unknown) => {
    const newComponents = {
      ...components,
      card: {
        ...components.card,
        [field]: value,
      },
    };
    setComponents(newComponents);
    onChange(newComponents);
  };

  const updateInput = (field: string, value: unknown) => {
    const newComponents = {
      ...components,
      input: {
        ...components.input,
        [field]: value,
      },
    };
    setComponents(newComponents);
    onChange(newComponents);
  };

  const updateBadge = (field: string, value: unknown) => {
    const newComponents = {
      ...components,
      badge: {
        ...components.badge,
        [field]: value,
      },
    };
    setComponents(newComponents);
    onChange(newComponents);
  };

  const updateAlert = (field: string, value: unknown) => {
    const newComponents = {
      ...components,
      alert: {
        ...components.alert,
        [field]: value,
      },
    };
    setComponents(newComponents);
    onChange(newComponents);
  };

  const updateModal = (field: string, value: unknown) => {
    const newComponents = {
      ...components,
      modal: {
        ...components.modal,
        [field]: value,
      },
    };
    setComponents(newComponents);
    onChange(newComponents);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Component Styles</h2>

      {/* Buttons */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Buttons</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Border Radius
              </label>
              <Input
                type="text"
                value={components.button.borderRadius}
                onChange={(e) => updateButton('borderRadius', e.target.value)}
                placeholder="0.375rem"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Padding
              </label>
              <Input
                type="text"
                value={components.button.padding}
                onChange={(e) => updateButton('padding', e.target.value)}
                placeholder="0.5rem 1rem"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Weight
              </label>
              <Select
                value={components.button.fontWeight}
                onChange={(e) => updateButton('fontWeight', e.target.value)}
              >
                <option value="400">Normal (400)</option>
                <option value="500">Medium (500)</option>
                <option value="600">Semibold (600)</option>
                <option value="700">Bold (700)</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Transform
              </label>
              <Select
                value={components.button.textTransform}
                onChange={(e) => updateButton('textTransform', e.target.value as 'none' | 'uppercase' | 'capitalize')}
              >
                <option value="none">None</option>
                <option value="uppercase">Uppercase</option>
                <option value="capitalize">Capitalize</option>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={components.button.shadow}
                onChange={(e) => updateButton('shadow', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300"
                id="button-shadow"
              />
              <label htmlFor="button-shadow" className="text-sm font-medium text-gray-700">
                Enable Shadow
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            <div className="space-y-3">
              <Button
                variant="primary"
                style={{
                  borderRadius: components.button.borderRadius,
                  padding: components.button.padding,
                  fontWeight: components.button.fontWeight,
                  textTransform: components.button.textTransform,
                  boxShadow: components.button.shadow ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                Primary Button
              </Button>
              <Button
                variant="secondary"
                style={{
                  borderRadius: components.button.borderRadius,
                  padding: components.button.padding,
                  fontWeight: components.button.fontWeight,
                  textTransform: components.button.textTransform,
                  boxShadow: components.button.shadow ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                Secondary Button
              </Button>
              <Button
                variant="ghost"
                style={{
                  borderRadius: components.button.borderRadius,
                  padding: components.button.padding,
                  fontWeight: components.button.fontWeight,
                  textTransform: components.button.textTransform,
                }}
              >
                Ghost Button
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Cards */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Cards</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Border Radius
              </label>
              <Input
                type="text"
                value={components.card.borderRadius}
                onChange={(e) => updateCard('borderRadius', e.target.value)}
                placeholder="0.5rem"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Padding
              </label>
              <Input
                type="text"
                value={components.card.padding}
                onChange={(e) => updateCard('padding', e.target.value)}
                placeholder="1.5rem"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shadow
              </label>
              <Select
                value={components.card.shadow}
                onChange={(e) => updateCard('shadow', e.target.value as 'none' | 'sm' | 'md' | 'lg')}
              >
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={components.card.border}
                onChange={(e) => updateCard('border', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300"
                id="card-border"
              />
              <label htmlFor="card-border" className="text-sm font-medium text-gray-700">
                Show Border
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={components.card.hoverEffect}
                onChange={(e) => updateCard('hoverEffect', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300"
                id="card-hover"
              />
              <label htmlFor="card-hover" className="text-sm font-medium text-gray-700">
                Hover Effect
              </label>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            <div
              className={`p-${components.card.padding} bg-white transition-all ${
                components.card.hoverEffect ? 'hover:scale-105' : ''
              }`}
              style={{
                borderRadius: components.card.borderRadius,
                padding: components.card.padding,
                boxShadow: {
                  none: 'none',
                  sm: '0 1px 2px rgba(0,0,0,0.05)',
                  md: '0 4px 6px rgba(0,0,0,0.1)',
                  lg: '0 10px 15px rgba(0,0,0,0.1)',
                }[components.card.shadow],
                border: components.card.border ? '1px solid #e5e7eb' : 'none',
              }}
            >
              <h4 className="text-lg font-semibold mb-2">Card Title</h4>
              <p className="text-gray-600">
                This is a sample card with customizable styling options.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Inputs */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Input Fields</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Border Radius
              </label>
              <Input
                type="text"
                value={components.input.borderRadius}
                onChange={(e) => updateInput('borderRadius', e.target.value)}
                placeholder="0.375rem"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Padding
              </label>
              <Input
                type="text"
                value={components.input.padding}
                onChange={(e) => updateInput('padding', e.target.value)}
                placeholder="0.5rem 0.75rem"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Border Width
              </label>
              <Input
                type="text"
                value={components.input.borderWidth}
                onChange={(e) => updateInput('borderWidth', e.target.value)}
                placeholder="1px"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Focus Ring Width
              </label>
              <Input
                type="text"
                value={components.input.focusRing}
                onChange={(e) => updateInput('focusRing', e.target.value)}
                placeholder="2px"
              />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            <Input
              type="text"
              placeholder="Sample input field"
              style={{
                borderRadius: components.input.borderRadius,
                padding: components.input.padding,
                borderWidth: components.input.borderWidth,
              }}
            />
            <Input
              type="email"
              placeholder="Email address"
              style={{
                borderRadius: components.input.borderRadius,
                padding: components.input.padding,
                borderWidth: components.input.borderWidth,
              }}
            />
            <textarea
              placeholder="Textarea"
              rows={3}
              className="w-full border border-gray-300"
              style={{
                borderRadius: components.input.borderRadius,
                padding: components.input.padding,
                borderWidth: components.input.borderWidth,
              }}
            />
          </div>
        </div>
      </Card>

      {/* Badges */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Badges</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Border Radius
              </label>
              <Input
                type="text"
                value={components.badge.borderRadius}
                onChange={(e) => updateBadge('borderRadius', e.target.value)}
                placeholder="9999px"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Padding
              </label>
              <Input
                type="text"
                value={components.badge.padding}
                onChange={(e) => updateBadge('padding', e.target.value)}
                placeholder="0.25rem 0.75rem"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Size
              </label>
              <Input
                type="text"
                value={components.badge.fontSize}
                onChange={(e) => updateBadge('fontSize', e.target.value)}
                placeholder="0.75rem"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Weight
              </label>
              <Select
                value={components.badge.fontWeight}
                onChange={(e) => updateBadge('fontWeight', e.target.value)}
              >
                <option value="400">Normal (400)</option>
                <option value="500">Medium (500)</option>
                <option value="600">Semibold (600)</option>
                <option value="700">Bold (700)</option>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            <div className="flex flex-wrap gap-2">
              {['Primary', 'Success', 'Warning', 'Error', 'Info'].map((label) => (
                <span
                  key={label}
                  className={`inline-flex items-center bg-blue-100 text-blue-800`}
                  style={{
                    borderRadius: components.badge.borderRadius,
                    padding: components.badge.padding,
                    fontSize: components.badge.fontSize,
                    fontWeight: components.badge.fontWeight,
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Alerts */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Alerts</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Border Radius
              </label>
              <Input
                type="text"
                value={components.alert.borderRadius}
                onChange={(e) => updateAlert('borderRadius', e.target.value)}
                placeholder="0.5rem"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Padding
              </label>
              <Input
                type="text"
                value={components.alert.padding}
                onChange={(e) => updateAlert('padding', e.target.value)}
                placeholder="1rem"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={components.alert.border}
                onChange={(e) => updateAlert('border', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300"
                id="alert-border"
              />
              <label htmlFor="alert-border" className="text-sm font-medium text-gray-700">
                Show Border
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={components.alert.icon}
                onChange={(e) => updateAlert('icon', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300"
                id="alert-icon"
              />
              <label htmlFor="alert-icon" className="text-sm font-medium text-gray-700">
                Show Icon
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            <div
              className="bg-green-50 text-green-800"
              style={{
                borderRadius: components.alert.borderRadius,
                padding: components.alert.padding,
                border: components.alert.border ? '1px solid currentColor' : 'none',
              }}
            >
              {components.alert.icon && <span className="mr-2">✓</span>}
              Success alert message
            </div>
            <div
              className="bg-red-50 text-red-800"
              style={{
                borderRadius: components.alert.borderRadius,
                padding: components.alert.padding,
                border: components.alert.border ? '1px solid currentColor' : 'none',
              }}
            >
              {components.alert.icon && <span className="mr-2">✕</span>}
              Error alert message
            </div>
          </div>
        </div>
      </Card>

      {/* Modals */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Modals</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Border Radius
              </label>
              <Input
                type="text"
                value={components.modal.borderRadius}
                onChange={(e) => updateModal('borderRadius', e.target.value)}
                placeholder="0.5rem"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Width
              </label>
              <Input
                type="text"
                value={components.modal.maxWidth}
                onChange={(e) => updateModal('maxWidth', e.target.value)}
                placeholder="32rem"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backdrop Blur
              </label>
              <Input
                type="text"
                value={components.modal.backdropBlur}
                onChange={(e) => updateModal('backdropBlur', e.target.value)}
                placeholder="4px"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={components.modal.closeOnBackdrop}
                onChange={(e) => updateModal('closeOnBackdrop', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300"
                id="modal-close-backdrop"
              />
              <label htmlFor="modal-close-backdrop" className="text-sm font-medium text-gray-700">
                Close on Backdrop Click
              </label>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
