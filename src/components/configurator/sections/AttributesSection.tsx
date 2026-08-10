'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';

type PriceModType = 'FIXED' | 'PERCENT' | 'PER_SQM' | 'REPLACE';
type AttrType = 'SELECT' | 'MULTISELECT' | 'NUMBER' | 'TOGGLE';

interface PublicOption {
  id: string;
  label: string;
  value: string;
  description: string | null;
  priceModifier: number | string;
  priceModifierType: PriceModType;
  isDefault: boolean;
}

interface PublicAttribute {
  id: string;
  name: string;
  label: string;
  type: AttrType;
  required: boolean;
  helpText: string | null;
  options: PublicOption[];
}

export type AttributeSelections = Record<string, string | string[]>;

interface AttributesSectionProps {
  productId: string;
  onChange?: (selections: AttributeSelections) => void;
}

function priceModLabel(mod: number, type: PriceModType): string {
  const n = parseFloat(String(mod));
  if (!n) return '';
  if (type === 'FIXED') return n > 0 ? ` +${n} MDL` : ` ${n} MDL`;
  if (type === 'PERCENT') return n > 0 ? ` +${n}%` : ` ${n}%`;
  if (type === 'PER_SQM') return ` +${n} MDL/m²`;
  return '';
}

export function AttributesSection({ productId, onChange }: AttributesSectionProps) {
  const [attributes, setAttributes] = useState<PublicAttribute[]>([]);
  const [selections, setSelections] = useState<AttributeSelections>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`/api/products/${productId}/attributes`)
      .then((r) => r.json())
      .then((data: PublicAttribute[]) => {
        if (!active) return;
        setAttributes(data);
        // pre-select defaults
        const defaults: AttributeSelections = {};
        for (const attr of data) {
          if (attr.type === 'TOGGLE') {
            defaults[attr.id] = 'false';
          } else if (attr.type === 'MULTISELECT') {
            const def = attr.options.filter((o) => o.isDefault).map((o) => o.value);
            if (def.length) defaults[attr.id] = def;
          } else {
            const def = attr.options.find((o) => o.isDefault);
            if (def) defaults[attr.id] = def.value;
          }
        }
        setSelections(defaults);
        onChange?.(defaults);
      })
      .catch(() => {/* silently skip */})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [productId, onChange]);

  const updateSelection = (attrId: string, value: string | string[]) => {
    const next = { ...selections, [attrId]: value };
    setSelections(next);
    onChange?.(next);
  };

  if (loading || attributes.length === 0) return null;

  return (
    <div className="space-y-5">
      {attributes.map((attr) => (
        <div key={attr.id} className="space-y-2">
          <div className="flex items-center gap-1.5">
            <label className="text-sm font-semibold text-slate-800">
              {attr.label}
              {attr.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {attr.helpText && (
              <span title={attr.helpText} className="text-slate-400 cursor-help">
                <Info className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          {/* SELECT — radio cards */}
          {attr.type === 'SELECT' && attr.options.length <= 6 && (
            <div className="flex flex-wrap gap-2">
              {attr.options.map((opt) => {
                const selected = selections[attr.id] === opt.value;
                const modLabel = priceModLabel(parseFloat(String(opt.priceModifier)), opt.priceModifierType);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateSelection(attr.id, opt.value)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      selected
                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-400'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {opt.label}
                    {modLabel && <span className="ml-1 text-xs font-normal opacity-70">{modLabel}</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* SELECT — dropdown (many options) */}
          {attr.type === 'SELECT' && attr.options.length > 6 && (
            <div className="relative">
              <select
                value={String(selections[attr.id] ?? '')}
                onChange={(e) => updateSelection(attr.id, e.target.value)}
                className="w-full appearance-none border border-slate-200 rounded-lg px-3 py-2.5 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Selectează…</option>
                {attr.options.map((opt) => {
                  const modLabel = priceModLabel(parseFloat(String(opt.priceModifier)), opt.priceModifierType);
                  return (
                    <option key={opt.id} value={opt.value}>
                      {opt.label}{modLabel}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          )}

          {/* MULTISELECT */}
          {attr.type === 'MULTISELECT' && (
            <div className="flex flex-wrap gap-2">
              {attr.options.map((opt) => {
                const current = (selections[attr.id] ?? []) as string[];
                const selected = current.includes(opt.value);
                const modLabel = priceModLabel(parseFloat(String(opt.priceModifier)), opt.priceModifierType);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      const next = selected
                        ? current.filter((v) => v !== opt.value)
                        : [...current, opt.value];
                      updateSelection(attr.id, next);
                    }}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      selected
                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-400'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {opt.label}
                    {modLabel && <span className="ml-1 text-xs font-normal opacity-70">{modLabel}</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* NUMBER */}
          {attr.type === 'NUMBER' && (
            <input
              type="number"
              value={String(selections[attr.id] ?? '')}
              onChange={(e) => updateSelection(attr.id, e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min={attr.options[0]?.value ? parseFloat(attr.options[0].value) : undefined}
              max={attr.options[1]?.value ? parseFloat(attr.options[1].value) : undefined}
            />
          )}

          {/* TOGGLE */}
          {attr.type === 'TOGGLE' && (
            <label className="inline-flex items-center gap-3 cursor-pointer">
              <div
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  selections[attr.id] === 'true' ? 'bg-blue-600' : 'bg-slate-300'
                }`}
                onClick={() =>
                  updateSelection(attr.id, selections[attr.id] === 'true' ? 'false' : 'true')
                }
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    selections[attr.id] === 'true' ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </div>
              <span className="text-sm text-slate-700">
                {selections[attr.id] === 'true' ? 'Activat' : 'Dezactivat'}
              </span>
            </label>
          )}
        </div>
      ))}
    </div>
  );
}
