import { useState, useCallback } from 'react';

export type AttrType = 'SELECT' | 'MULTISELECT' | 'NUMBER' | 'TOGGLE';
export type PriceModType = 'FIXED' | 'PERCENT' | 'PER_SQM' | 'REPLACE';

export interface AttributeOptionData {
  id: string;
  attributeId: string;
  label: string;
  value: string;
  description: string | null;
  priceModifier: number;
  priceModifierType: PriceModType;
  materialId: string | null;
  material?: { id: string; name: string; finishType: string | null; unit: string } | null;
  sortOrder: number;
  isDefault: boolean;
  active: boolean;
}

export interface ProductAttributeData {
  id: string;
  productId: string;
  name: string;
  label: string;
  type: AttrType;
  required: boolean;
  helpText: string | null;
  sortOrder: number;
  options: AttributeOptionData[];
}

const BASE = (productId: string) => `/api/admin/products/${productId}/attributes`;

export function useProductAttributes(productId: string) {
  const [attributes, setAttributes] = useState<ProductAttributeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttributes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(BASE(productId));
      if (!res.ok) throw new Error('Eroare la preluarea atributelor');
      const data = (await res.json()) as ProductAttributeData[];
      setAttributes(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const createAttribute = useCallback(async (payload: Omit<ProductAttributeData, 'id' | 'productId' | 'options'>) => {
    const res = await fetch(BASE(productId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Eroare la crearea atributului');
    const created = (await res.json()) as ProductAttributeData;
    setAttributes((prev) => [...prev, created]);
    return created;
  }, [productId]);

  const updateAttribute = useCallback(async (
    attrId: string,
    payload: Partial<Omit<ProductAttributeData, 'id' | 'productId' | 'options'>>
  ) => {
    const res = await fetch(`${BASE(productId)}/${attrId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Eroare la actualizarea atributului');
    const updated = (await res.json()) as ProductAttributeData;
    setAttributes((prev) => prev.map((a) => (a.id === attrId ? updated : a)));
    return updated;
  }, [productId]);

  const deleteAttribute = useCallback(async (attrId: string) => {
    const res = await fetch(`${BASE(productId)}/${attrId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Eroare la ștergerea atributului');
    setAttributes((prev) => prev.filter((a) => a.id !== attrId));
  }, [productId]);

  // Option helpers
  const createOption = useCallback(async (
    attrId: string,
    payload: Omit<AttributeOptionData, 'id' | 'attributeId'>
  ) => {
    const res = await fetch(`${BASE(productId)}/${attrId}/options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Eroare la crearea opțiunii');
    const created = (await res.json()) as AttributeOptionData;
    setAttributes((prev) =>
      prev.map((a) => a.id === attrId ? { ...a, options: [...a.options, created] } : a)
    );
    return created;
  }, [productId]);

  const updateOption = useCallback(async (
    attrId: string,
    optId: string,
    payload: Partial<Omit<AttributeOptionData, 'id' | 'attributeId'>>
  ) => {
    const res = await fetch(`${BASE(productId)}/${attrId}/options/${optId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Eroare la actualizarea opțiunii');
    const updated = (await res.json()) as AttributeOptionData;
    setAttributes((prev) =>
      prev.map((a) =>
        a.id === attrId
          ? { ...a, options: a.options.map((o) => (o.id === optId ? updated : o)) }
          : a
      )
    );
    return updated;
  }, [productId]);

  const deleteOption = useCallback(async (attrId: string, optId: string) => {
    const res = await fetch(`${BASE(productId)}/${attrId}/options/${optId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Eroare la ștergerea opțiunii');
    setAttributes((prev) =>
      prev.map((a) =>
        a.id === attrId ? { ...a, options: a.options.filter((o) => o.id !== optId) } : a
      )
    );
  }, [productId]);

  return {
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
  };
}
