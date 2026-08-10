'use client';

import { useState, useMemo } from 'react';
import { Plus, X, ChevronDown } from 'lucide-react';
import {
  getTemplateForUnit,
  DEFAULT_ACTIVE_KEYS,
  type PropertyTemplate,
  type MaterialUnit,
} from '@/modules/materials/propertyTemplates';

type PropValue = string | number | boolean;
type PropertiesMap = Record<string, PropValue>;

interface MaterialPropertiesEditorProps {
  unit: MaterialUnit | string;
  value: PropertiesMap | null;
  onChange: (val: PropertiesMap) => void;
}

function PropertyRow({
  tpl,
  value,
  onChange,
  onRemove,
}: {
  tpl: PropertyTemplate;
  value: PropValue | undefined;
  onChange: (v: PropValue) => void;
  onRemove: () => void;
}) {
  const isEmpty = value === undefined || value === '' || value === null;

  return (
    <div className="flex items-start gap-2 group py-1.5">
      {/* Label */}
      <div className="w-44 shrink-0 pt-2">
        <span className="text-sm font-medium text-gray-700">{tpl.label}</span>
        {tpl.unit && (
          <span className="ml-1 text-xs text-gray-400">({tpl.unit})</span>
        )}
        {tpl.hint && (
          <p className="text-xs text-gray-400 leading-tight mt-0.5">{tpl.hint}</p>
        )}
      </div>

      {/* Input */}
      <div className="flex-1">
        {tpl.type === 'select' && (
          <div className="relative">
            <select
              value={String(value ?? '')}
              onChange={(e) => onChange(e.target.value)}
              className={`w-full appearance-none px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8
                ${isEmpty ? 'border-dashed border-gray-300 text-gray-400 bg-gray-50' : 'border-gray-300 bg-white text-gray-800'}`}
            >
              <option value="">— selectează —</option>
              {tpl.options?.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        )}
        {tpl.type === 'number' && (
          <input
            type="number"
            value={value !== undefined && value !== '' ? String(value) : ''}
            onChange={(e) => {
              const v = e.target.value;
              onChange(v === '' ? '' : parseFloat(v));
            }}
            placeholder={tpl.placeholder ?? ''}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${isEmpty ? 'border-dashed border-gray-300 bg-gray-50' : 'border-gray-300 bg-white'}`}
            step="any"
          />
        )}
        {tpl.type === 'text' && (
          <input
            type="text"
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
            placeholder={tpl.placeholder ?? ''}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${isEmpty ? 'border-dashed border-gray-300 bg-gray-50' : 'border-gray-300 bg-white'}`}
          />
        )}
        {tpl.type === 'boolean' && (
          <label className="inline-flex items-center gap-2 cursor-pointer mt-2">
            <div
              className={`relative w-10 h-5 rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-300'}`}
              onClick={() => onChange(!value)}
            >
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
            </div>
            <span className="text-sm text-gray-600">{value ? 'Da' : 'Nu'}</span>
          </label>
        )}
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        title="Elimină proprietatea"
        className="mt-2 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-opacity shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Custom property row (key + value free text) ──────────────────────────────
function CustomPropertyRow({
  propKey,
  value,
  onChangeKey,
  onChangeValue,
  onRemove,
}: {
  propKey: string;
  value: PropValue;
  onChangeKey: (k: string) => void;
  onChangeValue: (v: PropValue) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 group py-1">
      <input
        type="text"
        value={propKey}
        onChange={(e) => onChangeKey(e.target.value)}
        placeholder="Cheie"
        className="w-40 px-2 py-1.5 border border-dashed border-gray-300 rounded-lg text-sm bg-gray-50 focus:ring-1 focus:ring-blue-400"
      />
      <input
        type="text"
        value={String(value)}
        onChange={(e) => onChangeValue(e.target.value)}
        placeholder="Valoare"
        className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-400"
      />
      <button type="button" onClick={onRemove} className="text-gray-300 hover:text-red-500">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Add property button with dropdown ────────────────────────────────────────
function AddPropertyMenu({
  available,
  onAdd,
}: {
  available: PropertyTemplate[];
  onAdd: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);

  if (available.length === 0 && !open) {
    return (
      <button
        type="button"
        onClick={() => onAdd('__custom__')}
        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-1"
      >
        <Plus className="w-4 h-4" /> Proprietate personalizată
      </button>
    );
  }

  return (
    <div className="relative mt-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
      >
        <Plus className="w-4 h-4" /> Adaugă proprietate
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-20 top-7 left-0 bg-white border border-gray-200 rounded-xl shadow-lg w-64 py-1 max-h-64 overflow-auto">
          {available.map((tpl) => (
            <button
              key={tpl.key}
              type="button"
              onClick={() => { onAdd(tpl.key); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between"
            >
              <span>{tpl.label}</span>
              {tpl.unit && <span className="text-xs text-gray-400">{tpl.unit}</span>}
            </button>
          ))}
          <div className="border-t border-gray-100 mt-1 pt-1">
            <button
              type="button"
              onClick={() => { onAdd('__custom__'); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50"
            >
              + Proprietate personalizată...
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function MaterialPropertiesEditor({
  unit,
  value,
  onChange,
}: MaterialPropertiesEditorProps) {
  const [customProps, setCustomProps] = useState<Array<{ key: string; value: PropValue }>>(
    () => {
      if (!value) return [];
      const templateKeys = new Set(getTemplateForUnit(unit as MaterialUnit).map((t) => t.key));
      return Object.entries(value)
        .filter(([k]) => !templateKeys.has(k))
        .map(([k, v]) => ({ key: k, value: v }));
    }
  );

  const template = useMemo(() => getTemplateForUnit(unit as MaterialUnit), [unit]);

  // Keys currently active in the template section
  const [activeKeys, setActiveKeys] = useState<Set<string>>(() => {
    const defaults = new Set(DEFAULT_ACTIVE_KEYS[unit as MaterialUnit] ?? []);
    // Also activate keys that already have values
    if (value) {
      const templateKeys = new Set(template.map((t) => t.key));
      Object.keys(value).forEach((k) => { if (templateKeys.has(k)) defaults.add(k); });
    }
    return defaults;
  });

  const activeTemplates = template.filter((t) => activeKeys.has(t.key));
  const availableToAdd = template.filter((t) => !activeKeys.has(t.key));

  const updateTemplateValue = (key: string, val: PropValue) => {
    const next = { ...(value ?? {}) };
    if (val === '' || val === undefined) {
      delete next[key];
    } else {
      next[key] = val;
    }
    onChange(next);
  };

  const removeTemplateKey = (key: string) => {
    setActiveKeys((prev) => { const s = new Set(prev); s.delete(key); return s; });
    const next = { ...(value ?? {}) };
    delete next[key];
    onChange(next);
  };

  const addKey = (key: string) => {
    if (key === '__custom__') {
      setCustomProps((p) => [...p, { key: '', value: '' }]);
      return;
    }
    setActiveKeys((prev) => new Set([...prev, key]));
  };

  const updateCustomProp = (idx: number, newKey: string, newVal: PropValue) => {
    const updated = customProps.map((p, i) => i === idx ? { key: newKey, value: newVal } : p);
    setCustomProps(updated);
    // sync to parent
    const next = { ...(value ?? {}) };
    // remove old key if changed
    if (customProps[idx].key && customProps[idx].key !== newKey) {
      delete next[customProps[idx].key];
    }
    if (newKey) next[newKey] = newVal;
    onChange(next);
  };

  const removeCustomProp = (idx: number) => {
    const removed = customProps[idx];
    setCustomProps((p) => p.filter((_, i) => i !== idx));
    const next = { ...(value ?? {}) };
    if (removed.key) delete next[removed.key];
    onChange(next);
  };

  if (template.length === 0 && customProps.length === 0) {
    return (
      <div className="text-sm text-gray-400 italic">
        Selectează o unitate de măsură pentru a vedea proprietățile disponibile.
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {/* Template properties */}
      {activeTemplates.map((tpl) => (
        <PropertyRow
          key={tpl.key}
          tpl={tpl}
          value={value?.[tpl.key]}
          onChange={(v) => updateTemplateValue(tpl.key, v)}
          onRemove={() => removeTemplateKey(tpl.key)}
        />
      ))}

      {/* Divider before custom */}
      {customProps.length > 0 && activeTemplates.length > 0 && (
        <div className="border-t border-dashed border-gray-200 my-2" />
      )}

      {/* Custom properties */}
      {customProps.map((cp, idx) => (
        <CustomPropertyRow
          key={idx}
          propKey={cp.key}
          value={cp.value}
          onChangeKey={(k) => updateCustomProp(idx, k, cp.value)}
          onChangeValue={(v) => updateCustomProp(idx, cp.key, v)}
          onRemove={() => removeCustomProp(idx)}
        />
      ))}

      {/* Add button */}
      <AddPropertyMenu available={availableToAdd} onAdd={addKey} />
    </div>
  );
}
