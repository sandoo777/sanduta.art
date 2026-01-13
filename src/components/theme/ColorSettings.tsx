'use client';

/**
 * Color Settings Component
 * Configurare paleta de culori cu color picker și contrast checker
 */

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ColorPalette } from '@/types/theme';

interface ColorSettingsProps {
  value: ColorPalette;
  onChange: (colors: ColorPalette) => void;
}

export function ColorSettings({ value, onChange }: ColorSettingsProps) {
  const [colors, setColors] = useState<ColorPalette>(value);

  const updateColor = (path: string, color: string) => {
    const keys = path.split('.');
    const newColors = { ...colors };
    let current: any = newColors;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = color;
    setColors(newColors);
    onChange(newColors);
  };

  const checkContrast = (bg: string, fg: string): number => {
    // Simplified contrast ratio calculation
    const getLuminance = (hex: string) => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = ((rgb >> 16) & 0xff) / 255;
      const g = ((rgb >> 8) & 0xff) / 255;
      const b = (rgb & 0xff) / 255;
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    
    const l1 = getLuminance(bg);
    const l2 = getLuminance(fg);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  const getContrastRating = (ratio: number): { label: string; color: string } => {
    if (ratio >= 7) return { label: 'AAA', color: 'text-green-600' };
    if (ratio >= 4.5) return { label: 'AA', color: 'text-blue-600' };
    return { label: 'Fail', color: 'text-red-600' };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Colors</h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            // Generate color palette from primary color
            // This is a placeholder - implement actual palette generation
            alert('Color palette generation coming soon!');
          }}
        >
          🎨 Generate Palette
        </Button>
      </div>

      {/* Brand Colors */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Brand Colors</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ColorPicker
            label="Primary"
            value={colors.primary}
            onChange={(color) => updateColor('primary', color)}
            preview
          />
          <ColorPicker
            label="Secondary"
            value={colors.secondary}
            onChange={(color) => updateColor('secondary', color)}
            preview
          />
          <ColorPicker
            label="Accent"
            value={colors.accent}
            onChange={(color) => updateColor('accent', color)}
            preview
          />
        </div>
      </Card>

      {/* Status Colors */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Status Colors</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ColorPicker
            label="Success"
            value={colors.success}
            onChange={(color) => updateColor('success', color)}
          />
          <ColorPicker
            label="Warning"
            value={colors.warning}
            onChange={(color) => updateColor('warning', color)}
          />
          <ColorPicker
            label="Error"
            value={colors.error}
            onChange={(color) => updateColor('error', color)}
          />
          <ColorPicker
            label="Info"
            value={colors.info}
            onChange={(color) => updateColor('info', color)}
          />
        </div>
      </Card>

      {/* Background Colors */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Background Colors</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ColorPicker
            label="Primary Background"
            value={colors.background.primary}
            onChange={(color) => updateColor('background.primary', color)}
          />
          <ColorPicker
            label="Secondary Background"
            value={colors.background.secondary}
            onChange={(color) => updateColor('background.secondary', color)}
          />
          <ColorPicker
            label="Tertiary Background"
            value={colors.background.tertiary}
            onChange={(color) => updateColor('background.tertiary', color)}
          />
        </div>
      </Card>

      {/* Surface Colors */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Surface Colors</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ColorPicker
            label="Default Surface"
            value={colors.surface.default}
            onChange={(color) => updateColor('surface.default', color)}
          />
          <ColorPicker
            label="Paper"
            value={colors.surface.paper}
            onChange={(color) => updateColor('surface.paper', color)}
          />
          <ColorPicker
            label="Elevated"
            value={colors.surface.elevated}
            onChange={(color) => updateColor('surface.elevated', color)}
          />
        </div>
      </Card>

      {/* Text Colors */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Text Colors</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ColorPicker
            label="Primary Text"
            value={colors.text.primary}
            onChange={(color) => updateColor('text.primary', color)}
          />
          <ColorPicker
            label="Secondary Text"
            value={colors.text.secondary}
            onChange={(color) => updateColor('text.secondary', color)}
          />
          <ColorPicker
            label="Disabled Text"
            value={colors.text.disabled}
            onChange={(color) => updateColor('text.disabled', color)}
          />
          <ColorPicker
            label="Inverse Text"
            value={colors.text.inverse}
            onChange={(color) => updateColor('text.inverse', color)}
          />
        </div>
      </Card>

      {/* Border Colors */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Border Colors</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ColorPicker
            label="Default Border"
            value={colors.border.default}
            onChange={(color) => updateColor('border.default', color)}
          />
          <ColorPicker
            label="Light Border"
            value={colors.border.light}
            onChange={(color) => updateColor('border.light', color)}
          />
          <ColorPicker
            label="Dark Border"
            value={colors.border.dark}
            onChange={(color) => updateColor('border.dark', color)}
          />
        </div>
      </Card>

      {/* Contrast Checker */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Contrast Checker</h3>
        
        <div className="space-y-4">
          {[
            {
              label: 'Primary Button',
              bg: colors.primary,
              fg: colors.text.inverse,
            },
            {
              label: 'Primary Text on Background',
              bg: colors.background.primary,
              fg: colors.text.primary,
            },
            {
              label: 'Secondary Text on Background',
              bg: colors.background.primary,
              fg: colors.text.secondary,
            },
          ].map(({ label, bg, fg }) => {
            const ratio = checkContrast(bg, fg);
            const rating = getContrastRating(ratio);
            
            return (
              <div
                key={label}
                className="flex items-center justify-between p-4 border rounded-lg"
                style={{ backgroundColor: bg, color: fg }}
              >
                <div>
                  <div className="font-medium">{label}</div>
                  <div className="text-sm opacity-75">Sample text</div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${rating.color}`}>
                    {rating.label}
                  </div>
                  <div className="text-sm">{ratio.toFixed(2)}:1</div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>AAA:</strong> Enhanced contrast (7:1)</p>
          <p><strong>AA:</strong> Minimum contrast (4.5:1)</p>
          <p><strong>Fail:</strong> Below minimum standards</p>
        </div>
      </Card>
    </div>
  );
}

// Color Picker Component
interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  preview?: boolean;
}

function ColorPicker({ label, value, onChange, preview }: ColorPickerProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
        />
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="#000000"
          />
        </div>
      </div>
      {preview && (
        <div
          className="mt-2 h-16 rounded-lg border border-gray-300"
          style={{ backgroundColor: value }}
        />
      )}
    </div>
  );
}
