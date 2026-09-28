"use client";

import { FormEvent, useEffect, useMemo, useState } from 'react';

export interface MaterialOption {
  id: string;
  name: string;
  unit?: string | null;
}

interface ConsumeMaterialModalProps {
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
  materials: MaterialOption[];
  onConsumed?: () => void;
}

export function ConsumeMaterialModal({
  jobId,
  isOpen,
  onClose,
  materials,
  onConsumed,
}: ConsumeMaterialModalProps) {
  const [materialId, setMaterialId] = useState(materials[0]?.id ?? '');
  const [quantity, setQuantity] = useState('');
  const [widthMm, setWidthMm] = useState('');
  const [heightMm, setHeightMm] = useState('');
  const [lengthMm, setLengthMm] = useState('');
  const [unit, setUnit] = useState('');
  const [preview, setPreview] = useState<{ quantity: number; unit: string; available: number; shortage: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (materials.length > 0 && !materialId) {
      setMaterialId(materials[0].id);
    }
    if (materials.length > 0 && !unit) {
      setUnit(materials[0].unit ?? 'unit');
    }
  }, [materialId, materials, unit]);

  const selectedMaterial = useMemo(
    () => materials.find((material) => material.id === materialId) ?? materials[0],
    [materialId, materials]
  );

  const updatePreview = async () => {
    if (!materialId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/jobs/${jobId}/preview-consume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materialId,
          quantity: quantity ? Number(quantity) : null,
          width_mm: widthMm ? Number(widthMm) : null,
          height_mm: heightMm ? Number(heightMm) : null,
          length_mm: lengthMm ? Number(lengthMm) : null,
          unit: unit || selectedMaterial?.unit || 'unit',
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error || 'Unable to calculate preview');
        setPreview(null);
        return;
      }

      setPreview(payload.preview ?? null);
    } catch {
      setError('Preview failed');
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    void updatePreview();
  }, [isOpen, materialId, quantity, widthMm, heightMm, lengthMm, unit]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!materialId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/jobs/${jobId}/consume-material`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materialId,
          quantity: quantity ? Number(quantity) : preview?.quantity ?? 0,
          width_mm: widthMm ? Number(widthMm) : null,
          height_mm: heightMm ? Number(heightMm) : null,
          length_mm: lengthMm ? Number(lengthMm) : null,
          unit: unit || selectedMaterial?.unit || 'unit',
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error || payload?.errors?.[0]?.message || 'Unable to consume material');
        return;
      }

      onConsumed?.();
      onClose();
    } catch {
      setError('Consumption failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Consume material</h3>
          <button type="button" onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700">Close</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Material</label>
            <select value={materialId} onChange={(event) => setMaterialId(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2">
              {materials.map((material) => (
                <option key={material.id} value={material.id}>{material.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Quantity</label>
              <input type="number" min="0" step="0.01" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="0.00" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Unit</label>
              <input value={unit || selectedMaterial?.unit || 'unit'} onChange={(event) => setUnit(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Width (mm)</label>
              <input type="number" min="0" step="1" value={widthMm} onChange={(event) => setWidthMm(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="0" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Height (mm)</label>
              <input type="number" min="0" step="1" value={heightMm} onChange={(event) => setHeightMm(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="0" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Length (mm)</label>
            <input type="number" min="0" step="1" value={lengthMm} onChange={(event) => setLengthMm(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="0" />
          </div>

          {preview && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              <div><strong>Calculated:</strong> {preview.quantity} {preview.unit}</div>
              <div><strong>Available:</strong> {preview.available} {preview.unit}</div>
              {preview.shortage > 0 && <div><strong>Shortage:</strong> {preview.shortage} {preview.unit}</div>}
            </div>
          )}

          {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={loading} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
              {loading ? 'Processing…' : 'Consume'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
