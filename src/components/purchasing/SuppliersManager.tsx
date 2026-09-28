'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { normalizeCodFiscal, normalizePhoneMD, type SupplierPhoneEntry } from '@/modules/purchasing/suppliersValidation';

interface SupplierRecord {
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
}

function normalizeWebsiteInput(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function SuppliersManager() {
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phones, setPhones] = useState<SupplierPhoneEntry[]>([buildPhoneEntry()]);
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [codFiscal, setCodFiscal] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

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

  const loadSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers');
      const data = await response.json();
      setSuppliers(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSuppliers();
  }, []);

  const resetCreateForm = () => {
    setName('');
    setPhones([buildPhoneEntry()]);
    setAddress('');
    setWebsite('');
    setCodFiscal('');
    setNotes('');
  };

  const handleCloseForm = () => {
    resetCreateForm();
    setShowForm(false);
  };

  const handleCreate = async () => {
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

    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
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
        toast.error(data?.error || 'Unable to create supplier');
        return;
      }
      toast.success('Supplier created');
      resetCreateForm();
      setShowForm(false);
      void loadSuppliers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to create supplier');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          + Add supplier
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-900">Add supplier</h2>
            <button
              type="button"
              onClick={handleCloseForm}
              className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100"
            >
              Close
            </button>
          </div>
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

          <div className="mt-4 grid gap-2">
            {normalizedPreview.map((item, index) => (
              <div key={`preview-${index}`} className="text-xs text-slate-500">
                Telefon {index + 1}: {item.ok ? item.value : 'invalid'}
              </div>
            ))}
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
          <button type="button" onClick={handleCreate} className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
            Save supplier
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Suppliers</h2>
        {loading ? <div className="mt-4 text-sm text-slate-500">Loading suppliers...</div> : null}
        {!loading && !suppliers.length ? <div className="mt-4 text-sm text-slate-500">No suppliers yet.</div> : null}

        <div className="mt-4 space-y-3">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold text-slate-900">{supplier.name}</div>
                <div className="text-xs text-slate-500">{(Array.isArray(supplier.phones) ? supplier.phones.map((phone) => typeof phone === 'string' ? phone : phone?.number ?? '').filter(Boolean).join(', ') : 'No phones') || 'No phones'} · {supplier.website ?? 'No website'}</div>
                <div className="text-xs text-slate-500">Cod fiscal: {supplier.codFiscal ?? '—'}</div>
                <div className="text-xs text-slate-500">{supplier.address ?? 'No address'}</div>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/suppliers/${supplier.id}/edit`} className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">
                  Edit
                </Link>
                <a href={`/suppliers/${supplier.id}`} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                  Details
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
