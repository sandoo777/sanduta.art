import { render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PropertiesSection } from '@/components/material/PropertiesSection';
import type { MaterialFormData } from '@/lib/validations/admin';

const { findUniqueMock, findManyMock, createMock, upsertMock } = vi.hoisted(() => ({
  findUniqueMock: vi.fn(),
  findManyMock: vi.fn(),
  createMock: vi.fn(),
  upsertMock: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    systemSetting: {
      findMany: findManyMock,
      findUnique: findUniqueMock,
      create: createMock,
      upsert: upsertMock,
    },
    material: {
      findMany: vi.fn(async () => []),
      updateMany: vi.fn(async () => ({ count: 0 })),
      update: vi.fn(async () => ({ id: 'material-1' })),
    },
  },
}));

vi.mock('@/lib/auth-helpers', () => ({
  requireRole: vi.fn(async () => ({ user: { id: 'admin-1', role: 'ADMIN' }, error: null })),
}));

function TestForm() {
  const form = useForm<MaterialFormData>({
    defaultValues: {
      name: 'Test Material',
      categoryId: 'cat-1',
      unit: 'm2',
      stock: '0',
      minStock: '0',
      colorName: '',
      colorCode: '',
      finishType: '',
      thickness: '',
      density: '',
      texture: '',
      consumptionType: 'AREA_BASED',
      active: true,
      sku: '',
      purchasePrice: '',
      salePrice: '',
      salePriceMode: 'amount',
      salePricePercent: '',
      minimumMarginPercent: '15',
      formatId: '',
      formatName: '',
      width_mm: '',
      height_mm: '',
      notes: '',
      compatibleEquipment: [],
      priceBreaks: [],
      packagingLabel: '',
      packagingQty: '',
      packagingPrice: '',
    },
  });

  return (
    <FormProvider {...form}>
      <PropertiesSection
        unit="m2"
        showThicknessField
        showDensityField
      />
    </FormProvider>
  );
}

import { GET, POST } from '@/app/api/admin/settings/material-lists/route';

describe('PropertiesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({
        lists: {
          finishes: [{ id: 'f1', value: 'Transparent Mat', enabled: true, usageCount: 0 }],
          colors: [{ id: 'c1', value: 'Cream', enabled: true, usageCount: 0 }],
          textures: [{ id: 't1', value: 'Soft grain', enabled: true, usageCount: 0 }],
        },
      }),
    })) as any);
  });

  it('renders only the essential physical properties and hides the legacy technical panel', async () => {
    render(<TestForm />);

    await waitFor(() => {
      expect(screen.getByLabelText('Finisaj suprafață')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Grosime (mm)')).toBeInTheDocument();
    expect(screen.getByLabelText('Densitate (g/m²)')).toBeInTheDocument();
    expect(screen.getByLabelText('Culoare')).toBeInTheDocument();
    expect(screen.getByLabelText('Textură')).toBeInTheDocument();
    expect(screen.queryByText('Proprietăți tehnice')).not.toBeInTheDocument();
    expect(screen.queryByText('Adaugă proprietate')).not.toBeInTheDocument();
  });

  it('returns database-backed material property lists without hardcoded fallback values', async () => {
    findManyMock.mockResolvedValue([
      { key: 'material_property_lists.finishes' },
      { key: 'material_property_lists.colors' },
      { key: 'material_property_lists.textures' },
    ]);
    findUniqueMock.mockImplementation(async ({ where }: { where: { key?: string } }) => {
      const payload = {
        'material_property_lists.finishes': [{ id: 'f1', value: 'Transparent Mat', enabled: true, usageCount: 0 }],
        'material_property_lists.colors': [{ id: 'c1', value: 'Cream', enabled: true, usageCount: 0 }],
        'material_property_lists.textures': [{ id: 't1', value: 'Soft grain', enabled: true, usageCount: 0 }],
      };

      const list = payload[where.key as keyof typeof payload];
      return list ? { key: where.key, value: JSON.stringify(list) } : null;
    });

    const response = await GET();
    const payload = await response.json();

    expect(payload.lists.finishes).toContainEqual(expect.objectContaining({ value: 'Transparent Mat' }));
    expect(payload.lists.colors).toContainEqual(expect.objectContaining({ value: 'Cream' }));
    expect(payload.lists.textures).toContainEqual(expect.objectContaining({ value: 'Soft grain' }));
    expect(payload.lists.finishes).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ value: 'Mat' }),
      expect.objectContaining({ value: 'Lucios' }),
      expect.objectContaining({ value: 'Smooth' }),
    ]));
  });

  it('persists TEST_FINISH_123 in DB settings list and serves it to Material Editor consumers', async () => {
    const settingsStore: Record<string, string> = {
      'material_property_lists.finishes': JSON.stringify([]),
      'material_property_lists.colors': JSON.stringify([]),
      'material_property_lists.textures': JSON.stringify([]),
    };

    findManyMock.mockImplementation(async ({ where }: { where?: { key?: { in?: string[] } } }) => {
      const requested = where?.key?.in ?? [];
      return requested
        .filter((key) => key in settingsStore)
        .map((key) => ({ key }));
    });

    findUniqueMock.mockImplementation(async ({ where }: { where: { key?: string } }) => {
      const key = where.key;
      if (!key || !(key in settingsStore)) return null;
      return { key, value: settingsStore[key] };
    });

    createMock.mockImplementation(async ({ data }: { data: { key: string; value: string } }) => {
      settingsStore[data.key] = data.value;
      return { id: data.key, ...data };
    });

    upsertMock.mockImplementation(async ({ where, update, create }: {
      where: { key: string };
      update: { value: string };
      create: { key: string; value: string };
    }) => {
      settingsStore[where.key] = update?.value ?? create.value;
      return { key: where.key, value: settingsStore[where.key] };
    });

    const createResponse = await POST(new Request('http://localhost/api/admin/settings/material-lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'finishes', value: 'TEST_FINISH_123' }),
    }));

    expect(createResponse.status).toBe(200);

    const listResponse = await GET();
    const listPayload = await listResponse.json();

    expect(listPayload.lists.finishes).toContainEqual(expect.objectContaining({ value: 'TEST_FINISH_123', enabled: true }));
  });
});
