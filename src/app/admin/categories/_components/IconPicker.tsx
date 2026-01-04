'use client';

import { 
  Package, Camera, Image, Shirt, Printer, Gift, Tag, 
  Layers, BookOpen, Coffee, Heart, Star, Zap, Trophy,
  Briefcase, Home, Car, Plane, Music, Film, Smartphone
} from 'lucide-react';

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

const AVAILABLE_ICONS = [
  { icon: Package, name: 'Package', emoji: '📦' },
  { icon: Camera, name: 'Camera', emoji: '📷' },
  { icon: Image, name: 'Image', emoji: '🖼️' },
  { icon: Shirt, name: 'Shirt', emoji: '👕' },
  { icon: Printer, name: 'Printer', emoji: '🖨️' },
  { icon: Gift, name: 'Gift', emoji: '🎁' },
  { icon: Tag, name: 'Tag', emoji: '🏷️' },
  { icon: Layers, name: 'Layers', emoji: '📚' },
  { icon: BookOpen, name: 'Book', emoji: '📖' },
  { icon: Coffee, name: 'Coffee', emoji: '☕' },
  { icon: Heart, name: 'Heart', emoji: '❤️' },
  { icon: Star, name: 'Star', emoji: '⭐' },
  { icon: Zap, name: 'Zap', emoji: '⚡' },
  { icon: Trophy, name: 'Trophy', emoji: '🏆' },
  { icon: Briefcase, name: 'Briefcase', emoji: '💼' },
  { icon: Home, name: 'Home', emoji: '🏠' },
  { icon: Car, name: 'Car', emoji: '🚗' },
  { icon: Plane, name: 'Plane', emoji: '✈️' },
  { icon: Music, name: 'Music', emoji: '🎵' },
  { icon: Film, name: 'Film', emoji: '🎬' },
  { icon: Smartphone, name: 'Smartphone', emoji: '📱' },
];

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">Icon</label>
      
      {/* Icon Grid */}
      <div className="grid grid-cols-7 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
        {AVAILABLE_ICONS.map(({ emoji, name }) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onChange(emoji)}
            className={`
              p-3 text-2xl rounded-lg transition-all
              ${value === emoji 
                ? 'bg-purple-100 ring-2 ring-purple-600 scale-110' 
                : 'bg-gray-50 hover:bg-gray-100 hover:scale-105'
              }
            `}
            title={name}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Selected Icon Display */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <span>Selected:</span>
        <span className="text-2xl">{value || '📦'}</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste emoji"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-base"
          maxLength={2}
        />
      </div>
    </div>
  );
}
