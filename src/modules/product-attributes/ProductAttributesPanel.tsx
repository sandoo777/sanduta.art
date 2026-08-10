'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, Edit2, Check, X, GripVertical } from 'lucide-react';
import {
  useProductAttributes,
  type ProductAttributeData,
  type AttributeOptionData,
  type AttrType,
  type PriceModType,
} from '@/modules/product-attributes/useProductAttributes';

// ─── tiny helpers ────────────────────────────────────────────────────────────
const ATTR_TYPE_LABELS: Record<AttrType, string> = {
  SELECT: 'Selecție unică',
  MULTISELECT: 'Selecție multiplă',
  NUMBER: 'Număr',
  TOGGLE: 'Activat/Dezactivat',
};

const PRICE_MOD_LABELS: Record<PriceModType, string> = {
  FIXED: '+/- Fix (MDL)',
  PERCENT: '% din preț',
  PER_SQM: 'MDL/m²',
  REPLACE: 'Înlocuiește prețul',
};

// ─── Inline editable text ────────────────────────────────────────────────────
function InlineEdit({
  value,
  onSave,
  className = '',
}: {
  value: string;
  onSave: (v: string) => void;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!editing)
    return (
      <span
        className={`cursor-pointer hover:text-blue-600 ${className}`}
        onClick={() => { setDraft(value); setEditing(true); }}
      >
        {value}
      </span>
    );

  return (
    <span className="inline-flex items-center gap-1">
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { onSave(draft); setEditing(false); }
          if (e.key === 'Escape') setEditing(false);
        }}
        className="border border-blue-400 rounded px-1 py-0.5 text-sm w-40"
      />
      <button onClick={() => { onSave(draft); setEditing(false); }} className="text-green-600 hover:text-green-700">
        <Check className="w-4 h-4" />
      </button>
      <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600">
        <X className="w-4 h-4" />
      </button>
    </span>
  );
}

// ─── Option row ───────────────────────────────────────────────────────────────
function OptionRow({
  opt,
  onUpdate,
  onDelete,
}: {
  opt: AttributeOptionData;
  onUpdate: (payload: Partial<AttributeOptionData>) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-gray-50 group">
      <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
      <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <InlineEdit value={opt.label} onSave={(v) => onUpdate({ label: v })} className="font-medium truncate" />
        <span className="text-gray-400 text-xs truncate">{opt.value}</span>
        <div className="flex items-center gap-1">
          <select
            value={opt.priceModifierType}
            onChange={(e) => onUpdate({ priceModifierType: e.target.value as PriceModType })}
            className="text-xs border border-gray-200 rounded px-1 py-0.5"
          >
            {(Object.entries(PRICE_MOD_LABELS) as [PriceModType, string][]).map(([k, l]) => (
              <option key={k} value={k}>{l}</option>
            ))}
          </select>
          <input
            type="number"
            value={opt.priceModifier}
            onChange={(e) => onUpdate({ priceModifier: parseFloat(e.target.value) || 0 })}
            className="w-16 text-xs border border-gray-200 rounded px-1 py-0.5"
            step="0.01"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={opt.isDefault}
              onChange={(e) => onUpdate({ isDefault: e.target.checked })}
              className="rounded"
            />
            Default
          </label>
          <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={opt.active}
              onChange={(e) => onUpdate({ active: e.target.checked })}
              className="rounded"
            />
            Activ
          </label>
        </div>
      </div>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Add Option form ──────────────────────────────────────────────────────────
function AddOptionForm({ onAdd }: { onAdd: (data: { label: string; value: string; priceModifier: number; priceModifierType: PriceModType }) => void }) {
  const [label, setLabel] = useState('');
  const [value, setValue] = useState('');
  const [mod, setMod] = useState<number>(0);
  const [modType, setModType] = useState<PriceModType>('FIXED');

  const submit = () => {
    if (!label.trim() || !value.trim()) return;
    onAdd({ label, value, priceModifier: mod, priceModifierType: modType });
    setLabel(''); setValue(''); setMod(0);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2 mt-1 border-t border-dashed border-gray-200">
      <input
        placeholder="Eticheta afișată"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="text-sm border border-gray-300 rounded px-2 py-1 w-36"
      />
      <input
        placeholder="Valoare internă"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="text-sm border border-gray-300 rounded px-2 py-1 w-28"
      />
      <select
        value={modType}
        onChange={(e) => setModType(e.target.value as PriceModType)}
        className="text-sm border border-gray-300 rounded px-2 py-1"
      >
        {(Object.entries(PRICE_MOD_LABELS) as [PriceModType, string][]).map(([k, l]) => (
          <option key={k} value={k}>{l}</option>
        ))}
      </select>
      <input
        type="number"
        placeholder="0.00"
        value={mod}
        onChange={(e) => setMod(parseFloat(e.target.value) || 0)}
        className="text-sm border border-gray-300 rounded px-2 py-1 w-20"
        step="0.01"
      />
      <button
        onClick={submit}
        className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
      >
        <Plus className="w-3.5 h-3.5" /> Adaugă
      </button>
    </div>
  );
}

// ─── Attribute card ───────────────────────────────────────────────────────────
function AttributeCard({
  attr,
  onUpdate,
  onDelete,
  onCreateOption,
  onUpdateOption,
  onDeleteOption,
}: {
  attr: ProductAttributeData;
  onUpdate: (payload: Partial<ProductAttributeData>) => void;
  onDelete: () => void;
  onCreateOption: (data: Omit<AttributeOptionData, 'id' | 'attributeId'>) => void;
  onUpdateOption: (optId: string, data: Partial<AttributeOptionData>) => void;
  onDeleteOption: (optId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-gray-400 hover:text-gray-600"
          type="button"
        >
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <div className="flex-1 min-w-0">
          <InlineEdit
            value={attr.label}
            onSave={(v) => onUpdate({ label: v })}
            className="font-semibold text-gray-800"
          />
          <span className="ml-2 text-xs text-gray-400 font-mono">{attr.name}</span>
        </div>
        <span className="hidden sm:inline text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
          {ATTR_TYPE_LABELS[attr.type]}
        </span>
        <select
          value={attr.type}
          onChange={(e) => onUpdate({ type: e.target.value as AttrType })}
          className="text-xs border border-gray-200 rounded px-1 py-0.5"
        >
          {(Object.entries(ATTR_TYPE_LABELS) as [AttrType, string][]).map(([k, l]) => (
            <option key={k} value={k}>{l}</option>
          ))}
        </select>
        <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
          <input
            type="checkbox"
            checked={attr.required}
            onChange={(e) => onUpdate({ required: e.target.checked })}
            className="rounded"
          />
          Obligatoriu
        </label>
        <button onClick={onDelete} className="text-red-300 hover:text-red-600">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Help text */}
      {expanded && (
        <div className="px-4 pb-1">
          <InlineEdit
            value={attr.helpText ?? '(fără descriere)'}
            onSave={(v) => onUpdate({ helpText: v === '(fără descriere)' ? '' : v })}
            className="text-xs text-gray-400 italic"
          />
        </div>
      )}

      {/* Options */}
      {expanded && (
        <div className="px-4 pb-4">
          {attr.options.length === 0 && (
            <p className="text-xs text-gray-400 py-2">Nicio opțiune. Adaugă mai jos.</p>
          )}
          {attr.options.map((opt) => (
            <OptionRow
              key={opt.id}
              opt={opt}
              onUpdate={(p) => onUpdateOption(opt.id, p)}
              onDelete={() => onDeleteOption(opt.id)}
            />
          ))}
          <AddOptionForm
            onAdd={(data) =>
              onCreateOption({
                ...data,
                description: null,
                materialId: null,
                sortOrder: attr.options.length,
                isDefault: false,
                active: true,
              })
            }
          />
        </div>
      )}
    </div>
  );
}

// ─── Add Attribute form ───────────────────────────────────────────────────────
function AddAttributeForm({ onAdd }: { onAdd: (data: { name: string; label: string; type: AttrType }) => void }) {
  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [type, setType] = useState<AttrType>('SELECT');
  const [open, setOpen] = useState(false);

  const submit = () => {
    if (!name.trim() || !label.trim()) return;
    onAdd({ name, label, type });
    setName(''); setLabel(''); setType('SELECT'); setOpen(false);
  };

  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium px-1 py-2"
        type="button"
      >
        <Plus className="w-4 h-4" /> Adaugă atribut nou
      </button>
    );

  return (
    <div className="border border-blue-200 rounded-xl bg-blue-50 px-4 py-3 flex flex-wrap items-center gap-2">
      <input
        placeholder="Cheie internă (ex: format)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="text-sm border border-gray-300 rounded px-2 py-1.5 w-44"
      />
      <input
        placeholder="Eticheta clientului (ex: Format)"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="text-sm border border-gray-300 rounded px-2 py-1.5 w-48"
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value as AttrType)}
        className="text-sm border border-gray-300 rounded px-2 py-1.5"
      >
        {(Object.entries(ATTR_TYPE_LABELS) as [AttrType, string][]).map(([k, l]) => (
          <option key={k} value={k}>{l}</option>
        ))}
      </select>
      <button
        onClick={submit}
        className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded hover:bg-blue-700"
        type="button"
      >
        Creează
      </button>
      <button
        onClick={() => setOpen(false)}
        className="text-gray-400 hover:text-gray-600"
        type="button"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Main exported component ──────────────────────────────────────────────────
export function ProductAttributesPanel({ productId }: { productId: string }) {
  const {
    attributes,
    loading,
    error,
    fetchAttributes,
    createAttribute,
    updateAttribute,
    deleteAttribute,
    createOption,
    updateOption,
    deleteOption,
  } = useProductAttributes(productId);

  useEffect(() => {
    fetchAttributes();
  }, [fetchAttributes]);

  if (loading) return <p className="text-sm text-gray-400 py-4">Se încarcă atributele…</p>;
  if (error) return <p className="text-sm text-red-500 py-4">{error}</p>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-700">Atribute Configurabile</h3>
        <span className="text-xs text-gray-400">{attributes.length} atribute</span>
      </div>

      {attributes.map((attr) => (
        <AttributeCard
          key={attr.id}
          attr={attr}
          onUpdate={(p) => updateAttribute(attr.id, p)}
          onDelete={() => deleteAttribute(attr.id)}
          onCreateOption={(d) => createOption(attr.id, d)}
          onUpdateOption={(optId, d) => updateOption(attr.id, optId, d)}
          onDeleteOption={(optId) => deleteOption(attr.id, optId)}
        />
      ))}

      <AddAttributeForm
        onAdd={({ name, label, type }) =>
          createAttribute({ name, label, type, required: true, helpText: null, sortOrder: attributes.length })
        }
      />
    </div>
  );
}
