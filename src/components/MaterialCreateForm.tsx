"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Material, MaterialType } from '@/models/material';
import { hasMaterialPropForUnit, sanitizeMaterialPayloadByUnit } from '@/config/materialPropsByUnit';

type SupplierOption = {
  id: string;
  name: string;
  email?: string | null;
  contactEmail?: string | null;
  defaultLeadTimeDays?: number | null;
};

type SupplierLink = {
  supplierId: string;
};

type MaterialForm = {
  name: string;
  sku: string;
  formatId: string | null;
  width_mm: string;
  height_mm: string;
  area_m2: string;
  unit: string;
  consumptionRate: string;
  quantityPerPack: string;
  isTemplate: boolean;
};

type ValidationError = { field: string; message: string };

type PreviewResult = {
  ok: boolean;
  preview?: {
    area_m2?: number | null;
    length_m?: number | null;
    estimated_consumption?: { value?: number; unit?: string } | null;
    autoName?: string | null;
  };
  errors?: ValidationError[];
};

const MATERIAL_TYPE_OPTIONS: Array<{ value: MaterialType; label: string; help: string }> = [
  { value: 'SUPORT_FOI', label: 'SUPORT_FOI', help: 'Foi / suport rigid' },
  { value: 'SUPORT_ROLA', label: 'SUPORT_ROLA', help: 'Role / suport lung' },
  { value: 'SUPORT_M2', label: 'SUPORT_M2', help: 'M² / suprafață' },
  { value: 'CERNEALA', label: 'CERNEALA', help: 'Cerneală / consum energetic' },
  { value: 'CONSUMABIL', label: 'CONSUMABIL', help: 'Consumabil / piesă de uzură' },
];

const CANONICAL_UNITS: Record<string, string> = {
  mm: 'mm',
  m: 'm',
  m2: 'm2',
  sqm: 'm2',
  'mL': 'mL',
  ml: 'mL',
  L: 'L',
  l: 'L',
  g: 'g',
  kg: 'kg',
  buc: 'buc',
  pcs: 'buc',
  unit: 'buc',
  piece: 'buc',
  pieces: 'buc',
  sheet: 'mm',
};

const DRAWING_UNITS = ['mm', 'm', 'm2'];
const INK_UNITS = ['mL', 'L', 'g', 'kg'];

const EMPTY_FORM = {
  name: '',
  sku: '',
  formatId: null,
  width_mm: '',
  height_mm: '',
  area_m2: '',
  unit: 'mm',
  consumptionRate: '',
  quantityPerPack: '',
  isTemplate: false,
};

function parseNumber(value: string): number | null {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toFieldErrorList(payload: unknown): ValidationError[] {
  if (Array.isArray(payload)) {
    return payload.filter((item) => item && typeof item === 'object' && 'field' in item && 'message' in item) as ValidationError[];
  }

  if (payload && typeof payload === 'object' && 'field' in payload && 'message' in payload) {
    return [{ field: String((payload as any).field), message: String((payload as any).message) }];
  }

  return [];
}

function getAutoName(materialType: MaterialType | null, width: string, height: string): string {
  if (!materialType) return '';
  const widthValue = parseNumber(width);
  if (!widthValue && widthValue !== 0) return '';

  if (materialType === 'SUPORT_ROLA') {
    return `${Math.round(widthValue)} mm`;
  }

  if (materialType === 'SUPORT_FOI') {
    const heightValue = parseNumber(height);
    if (heightValue === null) return `${Math.round(widthValue)} mm`;
    return `${Math.round(widthValue)}x${Math.round(heightValue)} mm`;
  }

  return '';
}

function normalizePayload(materialType: MaterialType | null, form: MaterialForm) {
  const width_mm = parseNumber(form.width_mm);
  const height_mm = parseNumber(form.height_mm);
  const area_m2 = parseNumber(form.area_m2);
  const consumptionRate = parseNumber(form.consumptionRate);
  const quantityPerPack = parseNumber(form.quantityPerPack);

  const normalizedUnit = CANONICAL_UNITS[String(form.unit ?? '').trim()] ?? String(form.unit ?? '').trim();

  const rawPayload = {
    materialType,
    name: form.name.trim(),
    sku: form.sku.trim() || undefined,
    width_mm: width_mm !== null && width_mm >= 0 ? width_mm : null,
    height_mm: height_mm !== null && height_mm >= 0 ? height_mm : null,
    area_m2: area_m2 !== null && area_m2 >= 0 ? area_m2 : null,
    unit: normalizedUnit || undefined,
    consumptionRate: consumptionRate !== null && consumptionRate >= 0 ? consumptionRate : null,
    quantityPerPack: quantityPerPack !== null && quantityPerPack >= 1 ? Math.round(quantityPerPack) : undefined,
    isTemplate: Boolean(form.isTemplate),
  };

  return sanitizeMaterialPayloadByUnit(rawPayload, normalizedUnit).sanitized;
}

export interface MaterialCreateFormProps {
  initial?: Partial<Material>;
  onSaved?: (material: Material) => void;
}

export default function MaterialCreateForm({ initial, onSaved }: MaterialCreateFormProps) {
  const [materialType, setMaterialType] = useState<MaterialType | null>(initial?.materialType ?? null);
  const [form, setForm] = useState<MaterialForm>({
    ...EMPTY_FORM,
    name: initial?.name ?? '',
    sku: initial?.sku ?? '',
    unit: initial?.unit ?? 'mm',
  });
  const [userEditedName, setUserEditedName] = useState(false);
  const [userEditedDimensions, setUserEditedDimensions] = useState({ width: false, height: false });
  const [formatQuery, setFormatQuery] = useState('');
  const [formats, setFormats] = useState<Array<{ id: string; name: string; width_mm: number; height_mm: number | null; category: string }>>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [primarySupplierId, setPrimarySupplierId] = useState<string | null>(null);
  const [supplierLinks, setSupplierLinks] = useState<SupplierLink[]>([{ supplierId: '' }]);
  const [linkedToFormat, setLinkedToFormat] = useState(false);
  const [formatOverride, setFormatOverride] = useState(false);
  const [formatNotice, setFormatNotice] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    fetch('/api/admin/suppliers', { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to load suppliers');
        }
        const payload = await response.json().catch(() => null);
        const items = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
        setSuppliers(items as SupplierOption[]);
      })
      .catch(() => setSuppliers([]));
  }, []);

  useEffect(() => {
    if (!materialType || userEditedName) return;
    const autoName = getAutoName(materialType, form.width_mm, form.height_mm);
    if (!autoName) return;

    const timeout = window.setTimeout(() => {
      setForm((current) => (current.name === autoName ? current : { ...current, name: autoName }));
    }, 120);

    return () => window.clearTimeout(timeout);
  }, [materialType, form.width_mm, form.height_mm, userEditedName]);

  const previewReady = Boolean(preview?.ok && preview.preview);
  const showFormatField = hasMaterialPropForUnit(form.unit, 'formatId');
  const showWidthField = hasMaterialPropForUnit(form.unit, 'width_mm');
  const showHeightField = hasMaterialPropForUnit(form.unit, 'height_mm');
  const selectedFormat = useMemo(
    () => formats.find((format) => format.id === form.formatId) ?? null,
    [formats, form.formatId]
  );
  const selectedPrimarySupplier = useMemo(
    () => suppliers.find((supplier) => supplier.id === primarySupplierId) ?? null,
    [primarySupplierId, suppliers]
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (formatQuery.trim()) params.set('search', formatQuery.trim());

    fetch(`/api/admin/formats${params.toString() ? `?${params.toString()}` : ''}`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Failed to load formats');
        const data = (await response.json()) as Array<{ id: string; name: string; width_mm: number; height_mm?: number | null; category?: string | null }>;
        setFormats(data);

        if (form.formatId && !data.some((format) => format.id === form.formatId)) {
          setFormatNotice('Formatul selectat nu mai există. Dimensiunile au fost păstrate.');
          setForm((current) => ({ ...current, formatId: null }));
          setLinkedToFormat(false);
          setFormatOverride(false);
        }
      })
      .catch(() => {
        setFormats([]);
      });
  }, [formatQuery, form.formatId]);

  useEffect(() => {
    if (!selectedFormat) {
      setLinkedToFormat(false);
      setFormatOverride(false);
      return;
    }

    setLinkedToFormat(true);
    const widthMatches = form.width_mm === String(selectedFormat.width_mm);
    const heightMatches = selectedFormat.height_mm == null ? form.height_mm === '' || Number(form.height_mm) === 0 : form.height_mm === String(selectedFormat.height_mm);
    setFormatOverride(!widthMatches || !heightMatches);
  }, [selectedFormat, form.width_mm, form.height_mm]);

  const applyFormatSelection = useCallback((format: { id: string; name: string; width_mm: number; height_mm: number | null }) => {
    const nextWidth = String(format.width_mm);
    const nextHeight = format.height_mm == null ? '' : String(format.height_mm);
    const nextName = userEditedName ? form.name : format.name;
    setLinkedToFormat(true);
    setFormatOverride(false);
    setFormatNotice(null);
    setForm((current) => ({
      ...current,
      formatId: format.id,
      width_mm: userEditedDimensions.width ? current.width_mm : nextWidth,
      height_mm: userEditedDimensions.height ? current.height_mm : nextHeight,
      name: nextName,
    }));
    setUserEditedDimensions({ width: false, height: false });
  }, [form.name, userEditedDimensions.height, userEditedDimensions.width, userEditedName]);

  const callPreview = useCallback(async (nextForm: MaterialForm = form) => {
    if (!materialType) {
      setPreview(null);
      setErrors([]);
      return;
    }

    const payload = normalizePayload(materialType, nextForm);

    try {
      const response = await fetch('/api/admin/materials/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const fieldErrors = toFieldErrorList(data);
        setErrors(fieldErrors);
        setPreview({ ok: false, errors: fieldErrors });
        return;
      }

      const previewData = data && typeof data === 'object' && 'preview' in data ? (data as PreviewResult) : { ok: true, preview: data };
      const nextErrors = previewData.errors ?? [];
      setErrors(nextErrors);
      setPreview(previewData);
    } catch (error) {
      const fallback = [{ field: '_general', message: 'Preview-ul nu a putut fi calculat.' }];
      setErrors(fallback);
      setPreview({ ok: false, errors: fallback });
    }
  }, [form, materialType]);

  useEffect(() => {
    if (!materialType) {
      setPreview(null);
      setErrors([]);
      return;
    }

    const timeout = window.setTimeout(() => {
      void callPreview(form);
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [materialType, form.width_mm, form.height_mm, form.area_m2, form.unit, form.consumptionRate, form.quantityPerPack, form.isTemplate, form.name, callPreview]);

  const handleValueChange = (field: keyof MaterialForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));

    if (field === 'width_mm') {
      setUserEditedDimensions((current) => ({ ...current, width: true }));
      if (selectedFormat) {
        setFormatOverride(true);
      }
    }

    if (field === 'height_mm') {
      setUserEditedDimensions((current) => ({ ...current, height: true }));
      if (selectedFormat) {
        setFormatOverride(true);
      }
    }

    if (field === 'name') {
      const nextValue = String(value);
      if (nextValue.trim() === '') {
        setUserEditedName(false);
        return;
      }
      setUserEditedName(true);
    }
  };

  const handleSubmit = async () => {
    if (!materialType) {
      setErrors([{ field: 'materialType', message: 'Selectează tipul materialului.' }]);
      return;
    }

    const payload = normalizePayload(materialType, form);
    if (payload.unit === 'sheet') {
      delete (payload as Record<string, unknown>).width_mm;
      delete (payload as Record<string, unknown>).height_mm;
      delete (payload as Record<string, unknown>).gramaj_g;
      delete (payload as Record<string, unknown>).sheets_per_box;
    }
    if (!payload.name) {
      setErrors([{ field: 'name', message: 'Numele materialului este obligatoriu.' }]);
      return;
    }

    if (selectedFormat && !formatOverride && selectedFormat.width_mm && !payload.width_mm) {
      payload.width_mm = selectedFormat.width_mm;
    }

    const dedupedSupplierLinks = new Map<string, { supplierId: string }>();
    supplierLinks
      .filter((link) => link.supplierId)
      .forEach((link) => {
        const supplierId = link.supplierId;
        dedupedSupplierLinks.set(supplierId, {
          supplierId,
        });
      });

    if (primarySupplierId && !dedupedSupplierLinks.has(primarySupplierId)) {
      dedupedSupplierLinks.set(primarySupplierId, {
        supplierId: primarySupplierId,
      });
    }

    const suppliersPayload = Array.from(dedupedSupplierLinks.values()).map((link) => ({
      supplierId: link.supplierId,
    }));

    setIsSaving(true);
    try {
      const requestBody = sanitizeMaterialPayloadByUnit({
        ...payload,
        primarySupplierId: primarySupplierId || null,
        suppliers: suppliersPayload,
        formatId: form.formatId ?? undefined,
        formatName: selectedFormat?.name ?? form.name,
      }, payload.unit ?? form.unit).sanitized;

      const response = await fetch('/api/admin/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const created = await response.json().catch(() => null);

      if (!response.ok) {
        const fieldErrors = toFieldErrorList(created);
        setErrors(fieldErrors);
        return;
      }

      onSaved?.(created as Material);
    } catch (error) {
      setErrors([{ field: '_general', message: 'Materialul nu a putut fi creat.' }]);
    } finally {
      setIsSaving(false);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLFormElement> = (event) => {
    if (event.key === 'Enter' && !(event.ctrlKey || event.metaKey || event.shiftKey)) {
      event.preventDefault();
      void callPreview(form);
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      void handleSubmit();
    }
  };

  const isCreateDisabled = isSaving || errors.length > 0 || !previewReady || !materialType;
  const formatLinkTarget = selectedFormat ? `/admin/formats?format=${selectedFormat.id}` : '#';

  return (
    <form
      ref={formRef}
      onKeyDown={onKeyDown}
      style={{ display: 'grid', gap: 16, maxWidth: 960, margin: '0 auto' }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: 12 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>MaterialType</span>
          <select
            aria-label="MaterialType"
            value={materialType ?? ''}
            onChange={(event) => {
              const nextType = (event.target.value || null) as MaterialType | null;
              setMaterialType(nextType);
              setErrors([]);
              setPreview(null);
              if (!nextType) return;
              setForm((current) => ({
                ...current,
                unit: nextType === 'CONSUMABIL' ? 'buc' : nextType === 'CERNEALA' ? 'mL' : nextType === 'SUPORT_M2' ? 'm2' : 'mm',
              }));
            }}
          >
            <option value="">Selectează tip</option>
            {MATERIAL_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <div style={{ display: 'grid', alignContent: 'end', gap: 4, color: '#4b5563', fontSize: 13 }}>
          <span>Tip material</span>
          <small>{materialType ? MATERIAL_TYPE_OPTIONS.find((option) => option.value === materialType)?.help : 'Alege tipul de material'}</small>
        </div>
      </div>

      {showFormatField && (
        <div style={{ display: 'grid', gap: 8 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Format</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              aria-label="Format"
              list="material-format-options"
              value={formatQuery}
              placeholder="Caută format..."
              onChange={(event) => {
                const value = event.target.value;
                setFormatQuery(value);
                const match = formats.find((format) => format.name.toLowerCase() === value.trim().toLowerCase());
                if (match) {
                  applyFormatSelection(match);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && formats[0]) {
                  event.preventDefault();
                  applyFormatSelection(formats[0]);
                }
              }}
            />
            {selectedFormat && (
              <button type="button" onClick={() => {
                setForm((current) => ({ ...current, formatId: null }));
                setFormatQuery('');
                setLinkedToFormat(false);
                setFormatOverride(false);
                setFormatNotice(null);
              }}>
                Unlink
              </button>
            )}
          </div>
          <datalist id="material-format-options">
            {formats.map((format) => (
              <option key={format.id} value={format.name}>{`${format.name} — ${format.width_mm}×${format.height_mm ?? 0} mm`}</option>
            ))}
          </datalist>
        </label>

        {selectedFormat && (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', fontSize: 13, color: '#4b5563' }}>
            <a href={formatLinkTarget} style={{ color: '#1d4ed8' }}>Vezi format</a>
            {formatOverride && (
              <button type="button" onClick={() => {
                if (!selectedFormat) return;
                setForm((current) => ({
                  ...current,
                  width_mm: String(selectedFormat.width_mm),
                  height_mm: selectedFormat.height_mm == null ? '' : String(selectedFormat.height_mm),
                }));
                setFormatOverride(false);
                setUserEditedDimensions({ width: false, height: false });
              }}>
                Revert to format
              </button>
            )}
          </div>
        )}

        {formatOverride && selectedFormat && (
          <small style={{ color: '#7c2d12' }}>Dimensiuni modificate față de format</small>
        )}

        {formatNotice && (
          <small style={{ color: '#b45309' }}>{formatNotice}</small>
        )}
        </div>
      )}

      {(showWidthField || showHeightField) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {showWidthField && (
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Width (mm)</span>
            <input
              aria-label="Width (mm)"
              type="number"
              min={0}
              step={1}
              value={form.width_mm}
              onChange={(event) => handleValueChange('width_mm', event.target.value)}
            />
          </label>
        )}

        {showHeightField && (
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Height (mm)</span>
            <input
              aria-label="Height (mm)"
              type="number"
              min={0}
              step={1}
              value={form.height_mm}
              onChange={(event) => handleValueChange('height_mm', event.target.value)}
            />
          </label>
        )}
      </div>
      )}

      {materialType === 'SUPORT_M2' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Area (m²)</span>
            <input
              aria-label="Area (m²)"
              type="number"
              min={0}
              step="0.01"
              value={form.area_m2}
              onChange={(event) => handleValueChange('area_m2', event.target.value)}
            />
          </label>
        </div>
      )}

      {materialType === 'CERNEALA' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Consumption rate</span>
            <input
              aria-label="Consumption rate"
              type="number"
              min={0}
              step="0.01"
              value={form.consumptionRate}
              onChange={(event) => handleValueChange('consumptionRate', event.target.value)}
            />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Unit</span>
            <select
              aria-label="Unit"
              value={form.unit}
              onChange={(event) => handleValueChange('unit', event.target.value)}
            >
              {INK_UNITS.map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      {materialType === 'CONSUMABIL' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Quantity per pack</span>
            <input
              aria-label="Quantity per pack"
              type="number"
              min={1}
              step={1}
              value={form.quantityPerPack}
              onChange={(event) => handleValueChange('quantityPerPack', event.target.value)}
            />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Unit</span>
            <input aria-label="Unit" value="buc" readOnly />
          </label>
        </div>
      )}

      {materialType && materialType !== 'CONSUMABIL' && materialType !== 'CERNEALA' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Unit</span>
            <select
              aria-label="Unit"
              value={form.unit}
              onChange={(event) => handleValueChange('unit', event.target.value)}
            >
              {(materialType === 'CERNEALA' ? INK_UNITS : DRAWING_UNITS).map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Primary supplier</span>
          <select
            aria-label="Primary supplier"
            value={primarySupplierId ?? ''}
            onChange={(event) => setPrimarySupplierId(event.target.value || null)}
          >
            <option value="">No supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
            ))}
          </select>
          {selectedPrimarySupplier ? (
            <div aria-live="polite" style={{ fontSize: 12, color: '#374151' }}>
              {selectedPrimarySupplier.name}
            </div>
          ) : null}
        </label>

        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 600 }}>Suppliers</span>
            <button
              type="button"
              aria-label="Add supplier"
              onClick={() => setSupplierLinks((current) => [...current, { supplierId: '' }])}
            >
              Add supplier
            </button>
          </div>

          {supplierLinks.map((link, index) => (
            <div key={`supplier-link-${index}`} style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) auto', gap: 8, alignItems: 'end' }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Supplier {index + 1}</span>
                <select
                  aria-label={`Supplier ${index + 1}`}
                  value={link.supplierId}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setSupplierLinks((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, supplierId: nextValue } : item));
                  }}
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={`${supplier.id}-${index}`} value={supplier.id}>{supplier.name}</option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                aria-label={`Remove supplier ${index + 1}`}
                onClick={() => {
                  setSupplierLinks((current) => current.length === 1 ? [{ supplierId: '' }] : current.filter((_, itemIndex) => itemIndex !== index));
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <label style={{ display: 'grid', gap: 6 }}>
        <span>Name</span>
        <input
          aria-label="Name"
          value={form.name}
          onChange={(event) => {
            const nextValue = event.target.value;
            setForm((current) => ({ ...current, name: nextValue }));
            setUserEditedName(nextValue.trim().length > 0);
          }}
          onBlur={() => {
            if (form.name.trim() === '') {
              setUserEditedName(false);
            }
          }}
        />
      </label>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" aria-label="Preview" onClick={() => void callPreview(form)}>
          Preview
        </button>
        <button type="button" aria-label="Create material" disabled={isCreateDisabled} onClick={() => void handleSubmit()}>
          {isSaving ? 'Saving...' : 'Create'}
        </button>
        <button type="button" aria-label="Cancel material form" onClick={() => setForm({ ...EMPTY_FORM, unit: materialType === 'CONSUMABIL' ? 'buc' : materialType === 'CERNEALA' ? 'mL' : 'mm' })}>
          Cancel
        </button>
      </div>

      <div aria-live="polite" style={{ border: '1px solid #d1d5db', borderRadius: 8, padding: 12 }}>
        {preview?.preview ? (
          <>
            <div><strong>Area:</strong> {String(preview.preview.area_m2 ?? '—')} m²</div>
            <div><strong>Length:</strong> {preview.preview.length_m == null ? '—' : `${preview.preview.length_m} m`}</div>
            <div><strong>Estimated consumption:</strong> {preview.preview.estimated_consumption ? `${preview.preview.estimated_consumption.value ?? '—'} ${preview.preview.estimated_consumption.unit ?? ''}` : '—'}</div>
            <div><strong>Auto name:</strong> {preview.preview.autoName ?? '—'}</div>
          </>
        ) : (
          <div>No preview yet</div>
        )}

        {errors.length > 0 && (
          <ul style={{ marginTop: 12, paddingLeft: 18, color: '#b91c1c' }}>
            {errors.map((issue, index) => (
              <li key={`${issue.field}-${index}`}>{issue.message}</li>
            ))}
          </ul>
        )}
      </div>
    </form>
  );
}
