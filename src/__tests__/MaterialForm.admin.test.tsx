import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Material } from '@/modules/materials/types';
import { MaterialForm } from '@/app/admin/materials/_components/MaterialForm';

const createMaterialMock = vi.fn();
const updateMaterialMock = vi.fn();

vi.mock('@/modules/materials/useMaterials', () => ({
  useMaterials: () => ({
    createMaterial: createMaterialMock,
    updateMaterial: updateMaterialMock,
    isLoading: false,
    lastError: null,
  }),
}));

vi.mock('@/app/admin/materials/_components/CategoryTreeSelector', () => ({
  default: ({ value, onChange }: { value: string; onChange: (id: string, category: { id: string; name: string } | null) => void }) => (
    <select
      aria-label="Category"
      value={value}
      onChange={(event) => onChange(event.target.value, { id: event.target.value, name: 'Sheet' })}
    >
      <option value="">Select</option>
      <option value="cat-1">Sheet</option>
    </select>
  ),
}));

const materialFixture: Material = {
  id: 'mat-1',
  name: 'Banner 440g',
  categoryId: 'cat-1',
  category: 'other',
  consumptionType: 'AREA_BASED',
  thickness: null,
  density: 440,
  purchasePrice: 20,
  salePrice: 30,
  salePriceMode: 'amount',
  salePricePercent: null,
  wastePercent: 5,
  active: true,
  printMethods: [{ id: 'pm-1', name: 'UV', type: 'DIGITAL', active: true }],
  printMethodIds: ['pm-1'],
  compatibleMethods: ['pm-1'],
  compatibleEquipment: [],
  compatibleEquipmentIds: [],
  formatId: 'fmt-1',
  formatName: 'A1',
  width_mm: 594,
  height_mm: 841,
  materialType: null,
  consumptionRate: null,
  isTemplate: false,
  primarySupplierId: 'sup-1',
  primarySupplier: { id: 'sup-1', name: 'Acme' },
  suppliers: [{ supplierId: 'sup-1', leadTimeDays: 3, unitCost: 18, isPrimary: true }],
  sku: 'MAT-001',
  unit: 'm2',
  stock: 10,
  minStock: 1,
  notes: null,
  finishType: null,
  packagingLabel: null,
  packagingQty: null,
  packagingPrice: null,
  properties: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('MaterialForm admin flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    updateMaterialMock.mockResolvedValue({ id: 'mat-1' });
    createMaterialMock.mockResolvedValue({ id: 'mat-2' });

    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes('/api/admin/formats_categories')) {
        return {
          ok: true,
          json: async () => [
            { id: 'cat-foi', code: 'FOI', name: 'Foi', enabled: true, usageCount: 1 },
            { id: 'cat-role', code: 'ROLE', name: 'Role', enabled: true, usageCount: 1 },
          ],
        } as Response;
      }

      if (url.includes('/api/admin/formats')) {
        return {
          ok: true,
          json: async () => [
            { id: 'fmt-1', name: 'A1', width_mm: 594, height_mm: 841, category: 'FOI' },
            { id: 'fmt-role-1', name: 'Roll 1370', width_mm: 1370, height_mm: null, category: 'ROLE' },
          ],
        } as Response;
      }

      if (url.includes('/api/admin/suppliers')) {
        return {
          ok: true,
          json: async () => ({ items: [{ id: 'sup-1', name: 'Acme' }, { id: 'sup-2', name: 'Nova' }] }),
        } as Response;
      }

      if (url.includes('/api/admin/print-methods')) {
        return {
          ok: true,
          json: async () => [{ id: 'pm-1', name: 'UV' }, { id: 'pm-2', name: 'Offset' }],
        } as Response;
      }

      if (url.includes('/api/admin/materials/sku')) {
        return {
          ok: true,
          json: async () => ({ sku: 'MAT-NEW' }),
        } as Response;
      }

      if (url.includes('/api/admin/settings/material-lists')) {
        return {
          ok: true,
          json: async () => ({
            lists: {
              finishes: [{ id: 'f-1', value: 'Transparent Mat', enabled: true, usageCount: 0 }],
              colors: [{ id: 'c-1', value: 'Cream', enabled: true, usageCount: 0 }],
              textures: [{ id: 't-1', value: 'Soft grain', enabled: true, usageCount: 0 }],
            },
          }),
        } as Response;
      }

      return {
        ok: true,
        json: async () => ({}),
      } as Response;
    }));
  });

  it('hides compatible print methods UI and omits legacy compatibleMethods from payload', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    render(<MaterialForm material={materialFixture} onClose={() => {}} onSuccess={onSuccess} />);

    expect(screen.queryByText('Metode tipărire compatibile')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /actualizeaza|actualizează/i }));

    await waitFor(() => {
      expect(updateMaterialMock).toHaveBeenCalledTimes(1);
    });

    const [, payload] = updateMaterialMock.mock.calls[0] as [string, Record<string, unknown>];

    expect(payload.formatId).toBe('fmt-1');
    expect(payload.unit).toBe('m2');
    expect(payload).not.toHaveProperty('wastePercent');
    expect(payload.primarySupplierId).toBe('sup-1');
    expect(payload.printMethodIds).toEqual(expect.arrayContaining(['pm-1']));
    expect(payload).not.toHaveProperty('compatibleMethods');
    expect(payload.suppliers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ supplierId: 'sup-1' }),
      ])
    );
    expect((payload.suppliers as Array<Record<string, unknown>>).every((item) => Object.keys(item).length === 1 && 'supplierId' in item)).toBe(true);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('keeps format category visible for all units and includes formatCategoryId in payload', async () => {
    const user = userEvent.setup();

    render(<MaterialForm material={materialFixture} onClose={() => {}} onSuccess={() => {}} />);

    const formatCategorySelect = screen.getByLabelText(/format category/i);
    expect(formatCategorySelect).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/measurement unit/i), 'meter');
    expect(screen.getByLabelText(/format category/i)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/measurement unit/i), 'kg');
    expect(screen.getByLabelText(/format category/i)).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText(/format category/i), 'ROLE');

    expect(screen.queryByLabelText(/Format select/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Format name')).not.toBeInTheDocument();
    expect(screen.queryByText('Lățime (mm)')).not.toBeInTheDocument();
    expect(screen.queryByText('Înălțime (mm)')).not.toBeInTheDocument();
    expect(screen.queryByText('Grosime (mm)')).not.toBeInTheDocument();
    expect(screen.queryByText(/waste/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /actualizeaza|actualizează/i }));

    await waitFor(() => {
      expect(updateMaterialMock).toHaveBeenCalledTimes(1);
    });

    const [, payload] = updateMaterialMock.mock.calls[0] as [string, Record<string, unknown>];

    expect(payload.unit).toBe('kg');
    expect(payload).not.toHaveProperty('formatId');
    expect(payload).not.toHaveProperty('formatName');
    expect(payload).not.toHaveProperty('width_mm');
    expect(payload).not.toHaveProperty('height_mm');
    expect(payload).not.toHaveProperty('thickness');
    expect(payload.formatCategoryId).toBe('ROLE');
  });

  it('keeps supplier payload supplierId-only in tabbed editor', async () => {
    const user = userEvent.setup();

    render(<MaterialForm material={materialFixture} onClose={() => {}} onSuccess={() => {}} />);

    await user.click(screen.getByRole('tab', { name: /furnizori/i }));

    const primarySupplierSelect = screen.getByLabelText(/primary supplier/i);
    await waitFor(() => {
      expect(within(primarySupplierSelect).getByRole('option', { name: 'Acme' })).toBeInTheDocument();
      expect(within(primarySupplierSelect).getByRole('option', { name: 'Nova' })).toBeInTheDocument();
    });

    expect(screen.queryByLabelText(/^Lead time days 1$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^Unit cost 1$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^Supplier notes 1$/i)).not.toBeInTheDocument();

    await user.selectOptions(primarySupplierSelect, 'sup-1');
    await user.click(screen.getByRole('button', { name: /add supplier/i }));
    await user.selectOptions(screen.getByLabelText(/^Supplier 2$/i), 'sup-2');

    await user.click(screen.getByRole('tab', { name: /^note$/i }));
    const notesTextarea = screen.getByPlaceholderText(/Furnizor, condiții de depozitare/i);
    await user.clear(notesTextarea);
    await user.type(notesTextarea, 'note interne de test');

    await user.click(screen.getByRole('button', { name: /actualizeaza|actualizează/i }));

    await waitFor(() => {
      expect(updateMaterialMock).toHaveBeenCalledTimes(1);
    });

    const [, payload] = updateMaterialMock.mock.calls[0] as [string, Record<string, unknown>];
    const suppliersPayload = payload.suppliers as Array<Record<string, unknown>>;

    expect(payload.notes).toBe('note interne de test');
    expect(payload.primarySupplierId).toBe('sup-1');
    expect(suppliersPayload).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ supplierId: 'sup-1' }),
        expect.objectContaining({ supplierId: 'sup-2' }),
      ])
    );
    expect(suppliersPayload.every((item) => Object.keys(item).length === 1 && 'supplierId' in item)).toBe(true);
  });

  it('hides duplicate dimension inputs for COALA(sheet) and keeps submit payload focused on format', async () => {
    const user = userEvent.setup();

    render(<MaterialForm material={materialFixture} onClose={() => {}} onSuccess={() => {}} />);

    await user.selectOptions(screen.getByLabelText(/measurement unit/i), 'sheet');

    expect(screen.getByText(/Pentru COALA, dimensiunile se preiau din Format/i)).toBeInTheDocument();
    expect(screen.queryByText('Lățime (mm)')).not.toBeInTheDocument();
    expect(screen.queryByText('Înălțime (mm)')).not.toBeInTheDocument();
    expect(screen.queryByText('Lățime coală')).not.toBeInTheDocument();
    expect(screen.queryByText('Înălțime coală')).not.toBeInTheDocument();
    expect(screen.queryByText('Gramaj')).not.toBeInTheDocument();
    expect(screen.queryByText('Foi per top/cutie')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /actualizeaza|actualizează/i }));

    await waitFor(() => {
      expect(updateMaterialMock).toHaveBeenCalledTimes(1);
    });

    const [, payload] = updateMaterialMock.mock.calls[0] as [string, Record<string, unknown>];
    expect(payload.unit).toBe('sheet');
    expect(payload.formatId).toBe('fmt-1');
    expect(payload).not.toHaveProperty('width_mm');
    expect(payload).not.toHaveProperty('height_mm');
    expect(payload).not.toHaveProperty('gramaj_g');
    expect(payload).not.toHaveProperty('sheets_per_box');
  });

  it('shows role format fields for meter + ROLE and submits format payload values', async () => {
    const user = userEvent.setup();

    render(<MaterialForm material={materialFixture} onClose={() => {}} onSuccess={() => {}} />);

    await user.selectOptions(screen.getByLabelText(/measurement unit/i), 'meter');
    await user.selectOptions(screen.getByLabelText(/format category/i), 'ROLE');

    await waitFor(() => {
      expect(screen.getByLabelText(/format select/i)).toBeInTheDocument();
      expect(within(screen.getByLabelText(/format select/i)).getByRole('option', { name: /Roll 1370/ })).toBeInTheDocument();
    });

    const formatSelect = screen.getByLabelText(/format select/i);
    expect(formatSelect).toBeInTheDocument();

    await user.selectOptions(formatSelect, 'fmt-role-1');
    await user.click(screen.getByRole('button', { name: /actualizeaza|actualizează/i }));

    await waitFor(() => {
      expect(updateMaterialMock).toHaveBeenCalledTimes(1);
    });

    const [, payload] = updateMaterialMock.mock.calls[0] as [string, Record<string, unknown>];
    expect(payload.unit).toBe('meter');
    expect(payload.formatId).toBe('fmt-role-1');
    expect(payload.formatName).toBe('Roll 1370');
    expect(payload.width_mm).toBe(1370);
  });

  it('submits updated density value from form', async () => {
    const user = userEvent.setup();

    render(<MaterialForm material={materialFixture} onClose={() => {}} onSuccess={() => {}} />);

    await user.click(screen.getByRole('tab', { name: /proprietăți/i }));

    const densityInput = document.querySelector('input[name="density"]') as HTMLInputElement | null;
    expect(densityInput).not.toBeNull();
    if (!densityInput) return;
    await user.clear(densityInput);
    await user.type(densityInput, '80');

    await user.click(screen.getByRole('button', { name: /actualizeaza|actualizează/i }));

    await waitFor(() => {
      expect(updateMaterialMock).toHaveBeenCalledTimes(1);
    });

    const [, payload] = updateMaterialMock.mock.calls[0] as [string, Record<string, unknown>];
    expect(payload.density).toBe(80);
  });

  it('allows edit submit when legacy material has no prices', async () => {
    const user = userEvent.setup();

    const noPriceMaterial: Material = {
      ...materialFixture,
      purchasePrice: null,
      salePrice: null,
      salePricePercent: null,
    };

    render(<MaterialForm material={noPriceMaterial} onClose={() => {}} onSuccess={() => {}} />);

    await user.click(screen.getByRole('tab', { name: /proprietăți/i }));
    await user.selectOptions(screen.getByLabelText('Finisaj suprafață'), 'Transparent Mat');
    await user.click(screen.getByRole('button', { name: /actualizeaza|actualizează/i }));

    await waitFor(() => {
      expect(updateMaterialMock).toHaveBeenCalledTimes(1);
    });
  });

  it('loads finish/color/texture from API lists and persists selected values', async () => {
    const user = userEvent.setup();

    render(<MaterialForm material={materialFixture} onClose={() => {}} onSuccess={() => {}} />);

    await user.click(screen.getByRole('tab', { name: /proprietăți/i }));

    const finishSelect = screen.getByLabelText('Finisaj suprafață');
    const colorSelect = screen.getByLabelText('Culoare');
    const textureSelect = screen.getByLabelText('Textură');

    await waitFor(() => {
      expect(within(finishSelect).getByRole('option', { name: 'Transparent Mat' })).toBeInTheDocument();
      expect(within(colorSelect).getByRole('option', { name: 'Cream' })).toBeInTheDocument();
      expect(within(textureSelect).getByRole('option', { name: 'Soft grain' })).toBeInTheDocument();
    });

    await user.selectOptions(finishSelect, 'Transparent Mat');
    await user.selectOptions(colorSelect, 'Cream');
    await user.selectOptions(textureSelect, 'Soft grain');

    await user.click(screen.getByRole('button', { name: /actualizeaza|actualizează/i }));

    await waitFor(() => {
      expect(updateMaterialMock).toHaveBeenCalledTimes(1);
    });

    const [, payload] = updateMaterialMock.mock.calls[0] as [string, Record<string, unknown>];
    expect(payload.finishType).toBe('Transparent Mat');
    expect(payload.colorName).toBe('Cream');
    expect(payload.texture).toBe('Soft grain');
  });

  it('reopens with persisted finish/color/texture values selected', async () => {
    const user = userEvent.setup();

    const savedMaterial: Material = {
      ...materialFixture,
      finishType: 'Transparent Mat',
      colorName: 'Cream',
      properties: { texture: 'Soft grain' },
    };

    render(<MaterialForm material={savedMaterial} onClose={() => {}} onSuccess={() => {}} />);

    await user.click(screen.getByRole('tab', { name: /proprietăți/i }));

    const finishSelect = screen.getByLabelText('Finisaj suprafață') as HTMLSelectElement;
    const colorSelect = screen.getByLabelText('Culoare') as HTMLSelectElement;
    const textureSelect = screen.getByLabelText('Textură') as HTMLSelectElement;

    await waitFor(() => {
      expect(finishSelect.value).toBe('Transparent Mat');
      expect(colorSelect.value).toBe('Cream');
      expect(textureSelect.value).toBe('Soft grain');
    });
  });

  it('reloads density value when edit material prop changes', async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <MaterialForm material={materialFixture} onClose={() => {}} onSuccess={() => {}} />
    );

    await user.click(screen.getByRole('tab', { name: /proprietăți/i }));

    const initialDensityInput = document.querySelector('input[name="density"]') as HTMLInputElement | null;
    expect(initialDensityInput).not.toBeNull();
    if (!initialDensityInput) return;
    expect(initialDensityInput.value).toBe('440');

    const nextMaterial: Material = {
      ...materialFixture,
      id: 'mat-2',
      density: 210,
      name: 'Paper 210g',
      formatId: 'fmt-role-1',
      formatName: 'Roll 1370',
      unit: 'meter',
    };

    rerender(<MaterialForm material={nextMaterial} onClose={() => {}} onSuccess={() => {}} />);

    await user.click(screen.getByRole('tab', { name: /proprietăți/i }));

    await waitFor(() => {
      const densityInput = document.querySelector('input[name="density"]') as HTMLInputElement | null;
      expect(densityInput).not.toBeNull();
      if (!densityInput) return;
      expect(densityInput.value).toBe('210');
    });

    await user.click(screen.getByRole('tab', { name: /general/i }));
    expect(screen.getByLabelText(/format category/i)).toHaveValue('ROLE');
  });

  it('keeps density when category callback repeats the same category id', async () => {
    const user = userEvent.setup();

    render(<MaterialForm material={materialFixture} onClose={() => {}} onSuccess={() => {}} />);

    await user.click(screen.getByRole('tab', { name: /proprietăți/i }));

    const densityInputBefore = document.querySelector('input[name="density"]') as HTMLInputElement | null;
    expect(densityInputBefore).not.toBeNull();
    if (!densityInputBefore) return;
    expect(densityInputBefore.value).toBe('440');

    await user.click(screen.getByRole('tab', { name: /general/i }));
    await user.selectOptions(screen.getByLabelText(/^Category$/i), 'cat-1');

    await user.click(screen.getByRole('tab', { name: /proprietăți/i }));

    const densityInputAfter = document.querySelector('input[name="density"]') as HTMLInputElement | null;
    expect(densityInputAfter).not.toBeNull();
    if (!densityInputAfter) return;
    expect(densityInputAfter.value).toBe('440');
  });

  it('submits material price breaks as numeric rows', async () => {
    const user = userEvent.setup();

    render(<MaterialForm material={materialFixture} onClose={() => {}} onSuccess={() => {}} />);

    await user.click(screen.getByRole('tab', { name: /prețuri/i }));

    await user.click(screen.getByRole('button', { name: /\+ Adaugă rând/i }));

    const qtyMinInput = document.querySelector('input[name="priceBreaks.0.qtyMin"]') as HTMLInputElement | null;
    const qtyMaxInput = document.querySelector('input[name="priceBreaks.0.qtyMax"]') as HTMLInputElement | null;
    const priceInput = document.querySelector('input[name="priceBreaks.0.price"]') as HTMLInputElement | null;
    const discountInput = document.querySelector('input[name="priceBreaks.0.discount"]') as HTMLInputElement | null;

    expect(qtyMinInput).not.toBeNull();
    expect(qtyMaxInput).not.toBeNull();
    expect(priceInput).not.toBeNull();
    expect(discountInput).not.toBeNull();
    if (!qtyMinInput || !qtyMaxInput || !priceInput || !discountInput) return;

    await user.type(qtyMinInput, '1');
    await user.type(qtyMaxInput, '100');
    await user.type(discountInput, '10');

    const currentBase = Number((screen.getByLabelText(/preț vânzare/i) as HTMLInputElement).value || '0');
    const expectedPrice = (currentBase * 0.9).toFixed(2);
    expect(priceInput.value).toBe(expectedPrice);

    await user.click(screen.getByRole('button', { name: /actualizeaza|actualizează/i }));

    await waitFor(() => {
      expect(updateMaterialMock).toHaveBeenCalledTimes(1);
    });

    const [, payload] = updateMaterialMock.mock.calls[0] as [string, Record<string, unknown>];
    const submittedBasePrice = Number(payload.salePrice);
    expect(payload.priceBreaks).toEqual([
      expect.objectContaining({ qtyMin: 1, qtyMax: 100, price: Number((submittedBasePrice * 0.9).toFixed(2)), discount: 10 }),
    ]);
  });

  it('keeps user-entered discount and shows warning when minimum margin is violated', async () => {
    const user = userEvent.setup();

    render(<MaterialForm material={materialFixture} onClose={() => {}} onSuccess={() => {}} />);

    await user.click(screen.getByRole('tab', { name: /prețuri/i }));

    const minimumMarginInput = screen.getByLabelText(/minimum margin/i);
    expect(minimumMarginInput).toHaveValue('15');

    await user.clear(screen.getByLabelText(/preț achiziție/i));
    await user.type(screen.getByLabelText(/preț achiziție/i), '100');
    await user.clear(screen.getByLabelText(/preț vânzare/i));
    await user.type(screen.getByLabelText(/preț vânzare/i), '135.29');

    await user.click(screen.getByRole('button', { name: /\+ Adaugă rând/i }));

    const qtyMinInput = document.querySelector('input[name="priceBreaks.0.qtyMin"]') as HTMLInputElement | null;
    const qtyMaxInput = document.querySelector('input[name="priceBreaks.0.qtyMax"]') as HTMLInputElement | null;
    const discountInput = document.querySelector('input[name="priceBreaks.0.discount"]') as HTMLInputElement | null;
    const priceInput = document.querySelector('input[name="priceBreaks.0.price"]') as HTMLInputElement | null;

    if (!qtyMinInput || !qtyMaxInput || !discountInput || !priceInput) return;

    await user.type(qtyMinInput, '1');
    await user.type(qtyMaxInput, '50');
    fireEvent.change(discountInput, { target: { value: '50' } });

    const currentSale = Number((screen.getByLabelText(/preț vânzare/i) as HTMLInputElement).value || '0');
    expect(discountInput).toHaveValue(50);
    expect(priceInput.value).toBe((currentSale * (1 - 50 / 100)).toFixed(2));
    expect(screen.getByText('Reducerea depășește marja minimă permisă.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /actualizeaza|actualizează/i }));

    await waitFor(() => {
      expect(updateMaterialMock).not.toHaveBeenCalled();
    });
  });

  it('does not loop when opening the pricing section with discount rows', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(<MaterialForm material={materialFixture} onClose={() => {}} onSuccess={() => {}} />);

    await user.click(screen.getByRole('tab', { name: /prețuri/i }));
    await user.click(screen.getByRole('button', { name: /\+ Adaugă rând/i }));

    const discountInput = document.querySelector('input[name="priceBreaks.0.discount"]') as HTMLInputElement | null;
    if (!discountInput) return;

    await user.clear(discountInput);
    await user.type(discountInput, '90');

    const errorOutput = consoleErrorSpy.mock.calls.flat().join(' ');
    expect(errorOutput).not.toContain('Maximum update depth exceeded');

    consoleErrorSpy.mockRestore();
  });

  it('recalculates tier prices when base selling price changes', async () => {
    const user = userEvent.setup();

    render(<MaterialForm material={materialFixture} onClose={() => {}} onSuccess={() => {}} />);

    await user.click(screen.getByRole('tab', { name: /prețuri/i }));
    fireEvent.change(screen.getByLabelText(/minimum margin/i), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText(/preț achiziție/i), { target: { value: '50' } });
    fireEvent.blur(screen.getByLabelText(/preț achiziție/i));
    fireEvent.change(screen.getByLabelText(/preț vânzare/i), { target: { value: '100' } });
    fireEvent.blur(screen.getByLabelText(/preț vânzare/i));

    await waitFor(() => {
      expect(screen.getByLabelText(/preț achiziție/i)).toHaveValue(50);
      expect(screen.getByLabelText(/preț vânzare/i)).toHaveValue(100);
      expect(screen.getByLabelText(/minimum margin/i)).toHaveValue('0');
    });

    await user.click(screen.getByRole('button', { name: /\+ Adaugă rând/i }));

    const discountInput = document.querySelector('input[name="priceBreaks.0.discount"]') as HTMLInputElement | null;
    const priceInput = document.querySelector('input[name="priceBreaks.0.price"]') as HTMLInputElement | null;
    if (!discountInput || !priceInput) return;

    fireEvent.change(discountInput, { target: { value: '5' } });

    expect(discountInput).toHaveValue(5);

    fireEvent.change(screen.getByLabelText(/preț vânzare/i), { target: { value: '120' } });
    fireEvent.blur(screen.getByLabelText(/preț vânzare/i));

    await waitFor(() => {
      expect(priceInput.value).toBe('114.00');
    });
  });

  it('does not auto-adjust tier discount when purchase cost or minimum margin increases', async () => {
    const user = userEvent.setup();

    render(<MaterialForm material={materialFixture} onClose={() => {}} onSuccess={() => {}} />);

    await user.click(screen.getByRole('tab', { name: /prețuri/i }));
    fireEvent.change(screen.getByLabelText(/preț achiziție/i), { target: { value: '100' } });
    fireEvent.blur(screen.getByLabelText(/preț achiziție/i));
    fireEvent.change(screen.getByLabelText(/preț vânzare/i), { target: { value: '120' } });
    fireEvent.blur(screen.getByLabelText(/preț vânzare/i));
    fireEvent.change(screen.getByLabelText(/minimum margin/i), { target: { value: '10' } });

    await waitFor(() => {
      expect(screen.getByLabelText(/preț achiziție/i)).toHaveValue(100);
      expect(screen.getByLabelText(/preț vânzare/i)).toHaveValue(120);
      expect(screen.getByLabelText(/minimum margin/i)).toHaveValue('10');
    });

    await user.click(screen.getByRole('button', { name: /\+ Adaugă rând/i }));

    const discountInput = document.querySelector('input[name="priceBreaks.0.discount"]') as HTMLInputElement | null;
    const priceInput = document.querySelector('input[name="priceBreaks.0.price"]') as HTMLInputElement | null;
    if (!discountInput || !priceInput) return;

    fireEvent.change(discountInput, { target: { value: '5' } });

    expect(discountInput).toHaveValue(5);

    fireEvent.change(screen.getByLabelText(/preț achiziție/i), { target: { value: '110' } });
    fireEvent.blur(screen.getByLabelText(/preț achiziție/i));

    await waitFor(() => {
      expect(discountInput).toHaveValue(5);
      expect(priceInput.value).toBe('114.00');
      expect(screen.getByText('Reducerea depășește marja minimă permisă.')).toBeInTheDocument();
    });
  });

  it('does not recalculate tier prices on every keystroke while typing, only after blur', async () => {
    const user = userEvent.setup();

    render(<MaterialForm material={materialFixture} onClose={() => {}} onSuccess={() => {}} />);

    await user.click(screen.getByRole('tab', { name: /prețuri/i }));

    const salePriceInput = screen.getByLabelText(/preț vânzare/i);
    fireEvent.change(salePriceInput, { target: { value: '100' } });
    fireEvent.blur(salePriceInput);

    await user.click(screen.getByRole('button', { name: /\+ Adaugă rând/i }));

    const discountInput = document.querySelector('input[name="priceBreaks.0.discount"]') as HTMLInputElement | null;
    const priceInput = document.querySelector('input[name="priceBreaks.0.price"]') as HTMLInputElement | null;
    if (!discountInput || !priceInput) return;

    fireEvent.change(discountInput, { target: { value: '10' } });
    expect(priceInput.value).toBe('90.00');

    await user.clear(salePriceInput);
    await user.type(salePriceInput, '200');

    // While actively typing (no blur yet), the tier price/discount must stay untouched.
    expect(discountInput).toHaveValue(10);
    expect(priceInput.value).toBe('90.00');

    fireEvent.blur(salePriceInput);

    await waitFor(() => {
      expect(discountInput).toHaveValue(10);
      expect(priceInput.value).toBe('180.00');
    });
  });

  it('keeps minimum margin unchanged and persists submitted value', async () => {
    const user = userEvent.setup();

    const materialWithMinimumMargin = {
      ...materialFixture,
      minimumMarginPercent: 25,
    } as Material;

    render(<MaterialForm material={materialWithMinimumMargin} onClose={() => {}} onSuccess={() => {}} />);

    await user.click(screen.getByRole('tab', { name: /prețuri/i }));

    const minimumMarginInput = screen.getByLabelText(/minimum margin/i);
    expect(minimumMarginInput).toHaveValue('25');

    fireEvent.change(screen.getByLabelText(/preț achiziție/i), { target: { value: '150' } });
    fireEvent.change(screen.getByLabelText(/preț vânzare/i), { target: { value: '200' } });

    await waitFor(() => {
      expect(screen.getByLabelText(/minimum margin/i)).toHaveValue('25');
    });

    await user.click(screen.getByRole('button', { name: /actualizeaza|actualizează/i }));

    await waitFor(() => {
      expect(updateMaterialMock).toHaveBeenCalledTimes(1);
    });

    const [, payload] = updateMaterialMock.mock.calls[0] as [string, Record<string, unknown>];
    expect(payload.minimumMarginPercent).toBe(25);
  });
});
