'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { normalizeCodFiscal, normalizePhoneMD, type SupplierPhoneEntry } from '@/modules/purchasing/suppliersValidation';

type SupplierDetail = {
  id: string;
  name: string;
  phones?: Array<string | SupplierPhoneEntry>;
  address?: string | null;
  website?: string | null;
  codFiscal?: string | null;
  notes?: string | null;
}

function buildPhoneEntry(number = '', name = ''): SupplierPhoneEntry {
  return { number, name: name.trim() || null };
};

function normalizeWebsiteInput(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export default function EditSupplierPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supplierId = useMemo(() => String(params?.id ?? ''), [params]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [phones, setPhones] = useState<SupplierPhoneEntry[]>([buildPhoneEntry()]);
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [codFiscal, setCodFiscal] = useState('');
  const [notes, setNotes] = useState('');

  const normalizedPreview = phones.map((phone) => {
    if (!phone.number.trim()) return { ok: false, value: '' };
    try {
      return { ok: true, value: normalizePhoneMD(phone.number) };
    } catch {
      return { ok: false, value: phone.number };
    }
  });

  const hasInvalidPhone = normalizedPreview.some((item) => !item.ok);
  const nonEmptyPhoneCount = phones.filter((phone) => phone.number.trim().length > 0).length;

  useEffect(() => {
    const load = async () => {
      if (!supplierId) return;
      try {
        const response = await fetch(`/api/admin/suppliers/${supplierId}`);
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.item) {
          toast.error(data?.error || 'Supplier not found');
          return;
        }

        const supplier = data.item as SupplierDetail;
        const loadedPhones = (Array.isArray(supplier.phones) ? supplier.phones : []).map((phone) =>
          typeof phone === 'string'
            ? buildPhoneEntry(phone)
            : buildPhoneEntry(phone?.number ?? '', phone?.name ?? '')
        );
        setName(supplier.name ?? '');
        setPhones(loadedPhones.length > 0 ? loadedPhones : [buildPhoneEntry()]);
        setAddress(supplier.address ?? '');
        setWebsite(supplier.website ?? '');
        setCodFiscal(supplier.codFiscal ?? '');
        setNotes(supplier.notes ?? '');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load supplier');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [supplierId]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Numele furnizorului este obligatoriu');
      return;
    }

    if (nonEmptyPhoneCount < 1 || nonEmptyPhoneCount > 5 || hasInvalidPhone) {
      toast.error('Introduceți număr cu prefix MD +373 sau fără prefix — vom normaliza');
      return;
    }

    let normalizedCodFiscal: string | null = null;
    if (codFiscal.trim()) {
      try {
        normalizedCodFiscal = normalizeCodFiscal(codFiscal);
      } catch {
        toast.error('Cod fiscal invalid');
        return;
      }
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/suppliers/${supplierId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phones: normalizedPreview
            .map((item, index) => ({
              number: item.ok ? item.value : phones[index]?.number ?? '',
              name: phones[index]?.name ?? null,
            }))
            .filter((item) => item.number.trim().length > 0),
          address: address.trim() || null,
          website: normalizeWebsiteInput(website) || null,
          codFiscal: normalizedCodFiscal,
          notes: notes.trim() || null,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data?.error || 'Failed to update supplier');
        return;
      }

      toast.success('Supplier updated');
      router.push('/admin/suppliers');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update supplier');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 p-8 text-slate-600">Loading supplier...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/admin" className="hover:text-slate-700">Admin</Link>
          <span>/</span>
          <Link href="/admin/suppliers" className="hover:text-slate-700">Furnizori</Link>
          <span>/</span>
          <span className="font-medium text-slate-700">Edit</span>
        </nav>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Edit supplier</h1>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Supplier name" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Address" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="Website (https://...)" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input value={codFiscal} onChange={(event) => setCodFiscal(event.target.value)} placeholder="Cod fiscal" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 p-4">
            <div className="mb-2 text-sm font-medium text-slate-800">Numere de telefon</div>
            <div className="space-y-2">
              {phones.map((phone, index) => (
                <div key={`phone-${index}`} className="grid grid-cols-[1fr_1fr_auto_auto_auto] items-center gap-2">
                  <input
                    value={phone.number}
                    onChange={(event) => {
                      const next = [...phones];
                      next[index] = { ...next[index], number: event.target.value };
                      setPhones(next);
                    }}
                    placeholder="+373..."
                    aria-label={`Telefon ${index + 1}`}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                  <input
                    value={phone.name ?? ''}
                    onChange={(event) => {
                      const next = [...phones];
                      next[index] = { ...next[index], name: event.target.value };
                      setPhones(next);
                    }}
                    placeholder="Nume contact"
                    aria-label={`Nume contact ${index + 1}`}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (index === 0) return;
                      const next = [...phones];
                      [next[index - 1], next[index]] = [next[index], next[index - 1]];
                      setPhones(next);
                    }}
                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (index === phones.length - 1) return;
                      const next = [...phones];
                      [next[index + 1], next[index]] = [next[index], next[index + 1]];
                      setPhones(next);
                    }}
                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (phones.length === 1) {
                        setPhones([buildPhoneEntry()]);
                        return;
                      }
                      setPhones((current) => current.filter((_, idx) => idx !== index));
                    }}
                    className="rounded-lg border border-rose-300 px-2 py-1 text-xs text-rose-700"
                  >
                    Șterge
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (phones.length >= 5) return;
                  setPhones((current) => [...current, buildPhoneEntry()]);
                }}
                className="rounded-lg border border-slate-300 px-3 py-1 text-sm"
              >
                Add phone
              </button>
              <span className="text-xs text-slate-500">Minim 1, maxim 5</span>
            </div>
            {(hasInvalidPhone || nonEmptyPhoneCount < 1) && (
              <p className="mt-2 text-xs text-amber-700">Introduceți număr cu prefix MD +373 sau fără prefix — vom normaliza</p>
            )}
          </div>

          <div className="mt-4">
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Notes"
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Update supplier'}
            </button>
            <Link href="/admin/suppliers" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
