import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MaterialCreateForm from '@/components/MaterialCreateForm';

describe('MaterialCreateForm', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input.toString();

        if (url.includes('/api/admin/formats')) {
          return {
            ok: true,
            json: async () => [
              { id: 'fmt-1', name: '210x297 mm', width_mm: 210, height_mm: 297, category: 'FOI' },
              { id: 'fmt-2', name: '420x594 mm', width_mm: 420, height_mm: 594, category: 'FOI' },
            ],
          } as Response;
        }

        if (url.includes('/api/admin/suppliers')) {
          return {
            ok: true,
            json: async () => [
              { id: 'sup-1', name: 'North Print Supply', contactEmail: 'sales@northprint.example' },
              { id: 'sup-2', name: 'Paperhouse SRL', contactEmail: 'hello@paperhouse.example' },
            ],
          } as Response;
        }

        if (url.includes('/api/admin/materials/preview')) {
          const body = init?.body ? JSON.parse(String(init.body)) : {};

          if (body.materialType === 'SUPORT_FOI' && Number(body.width_mm) === 210 && Number(body.height_mm) === 297) {
            return {
              ok: true,
              json: async () => ({
                ok: true,
                preview: {
                  area_m2: 0.06237,
                  length_m: null,
                  estimated_consumption: { value: 0, unit: 'L' },
                  autoName: '210x297 mm',
                },
              }),
            } as Response;
          }

          if (body.materialType === 'SUPORT_FOI' && Number(body.width_mm) === 0) {
            return {
              ok: false,
              json: async () => [{ field: 'width_mm', message: 'Lățimea este obligatorie' }],
            } as Response;
          }

          return {
            ok: true,
            json: async () => ({
              ok: true,
              preview: {
                area_m2: 0.01,
                length_m: null,
                estimated_consumption: { value: 0, unit: 'L' },
                autoName: 'preview',
              },
            }),
          } as Response;
        }

        if (url.includes('/api/admin/materials')) {
          return {
            ok: true,
            status: 201,
            json: async () => ({
              id: 'm-1',
              name: '210x297 mm',
              materialType: 'SUPORT_FOI',
            }),
          } as Response;
        }

        return {
          ok: true,
          json: async () => ({}),
        } as Response;
      })
    );
  });

  it('autofills the name from dimensions and shows preview', async () => {
    const user = userEvent.setup();
    render(<MaterialCreateForm />);

    await user.selectOptions(screen.getByLabelText(/materialtype/i), 'SUPORT_FOI');

    await user.clear(screen.getByLabelText(/width \(mm\)/i));
    await user.type(screen.getByLabelText(/width \(mm\)/i), '210');
    await user.clear(screen.getByLabelText(/height \(mm\)/i));
    await user.type(screen.getByLabelText(/height \(mm\)/i), '297');

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toHaveValue('210x297 mm');
    });

    await waitFor(() => {
      expect(screen.getByText(/0\.06237/)).toBeInTheDocument();
    });
  });

  it('loads a format by name and copies its dimensions into the form', async () => {
    const user = userEvent.setup();
    render(<MaterialCreateForm />);

    await user.selectOptions(screen.getByLabelText(/materialtype/i), 'SUPORT_FOI');
    const formatInput = screen.getByLabelText(/format/i);
    await user.type(formatInput, '210x297 mm');

    await waitFor(() => {
      expect(screen.getByLabelText(/width \(mm\)/i)).toHaveValue(210);
      expect(screen.getByLabelText(/height \(mm\)/i)).toHaveValue(297);
    });
  });

  it('stops auto-fill after a manual name edit', async () => {
    const user = userEvent.setup();
    render(<MaterialCreateForm />);

    await user.selectOptions(screen.getByLabelText(/materialtype/i), 'SUPORT_FOI');
    await user.clear(screen.getByLabelText(/width \(mm\)/i));
    await user.type(screen.getByLabelText(/width \(mm\)/i), '210');
    await user.clear(screen.getByLabelText(/height \(mm\)/i));
    await user.type(screen.getByLabelText(/height \(mm\)/i), '297');

    const nameInput = screen.getByLabelText(/name/i);
    await waitFor(() => expect(nameInput).toHaveValue('210x297 mm'));

    await user.clear(nameInput);
    await user.type(nameInput, 'Custom label');
    expect(nameInput).toHaveValue('Custom label');

    await user.clear(screen.getByLabelText(/width \(mm\)/i));
    await user.type(screen.getByLabelText(/width \(mm\)/i), '420');

    await waitFor(() => {
      expect(nameInput).toHaveValue('Custom label');
    });
  });

  it('disables create while preview returns validation errors and enables when it is valid', async () => {
    const user = userEvent.setup();
    render(<MaterialCreateForm />);

    await user.selectOptions(screen.getByLabelText(/materialtype/i), 'SUPORT_FOI');
    await user.clear(screen.getByLabelText(/width \(mm\)/i));
    await user.type(screen.getByLabelText(/width \(mm\)/i), '0');

    await waitFor(() => {
      expect(screen.getByText(/Lățimea este obligatorie/i)).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /create material/i });
    expect(createButton).toBeDisabled();

    await user.clear(screen.getByLabelText(/width \(mm\)/i));
    await user.type(screen.getByLabelText(/width \(mm\)/i), '210');
    await user.clear(screen.getByLabelText(/height \(mm\)/i));
    await user.type(screen.getByLabelText(/height \(mm\)/i), '297');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create material/i })).not.toBeDisabled();
    });
  });

  it('shows secondary suppliers with supplier-only fields and sends supplierId-only payload', async () => {
    const user = userEvent.setup();
    render(<MaterialCreateForm />);

    await user.selectOptions(screen.getByLabelText(/materialtype/i), 'SUPORT_FOI');
    await user.clear(screen.getByLabelText(/width \(mm\)/i));
    await user.type(screen.getByLabelText(/width \(mm\)/i), '210');
    await user.clear(screen.getByLabelText(/height \(mm\)/i));
    await user.type(screen.getByLabelText(/height \(mm\)/i), '297');

    const supplierSelect = await screen.findByLabelText(/primary supplier/i);
    await user.selectOptions(supplierSelect, 'sup-1');
    await user.click(screen.getByRole('button', { name: /add supplier/i }));
    await user.selectOptions(screen.getByLabelText(/^Supplier 2$/i), 'sup-2');

    expect(screen.queryByLabelText(/^Lead time days 1$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^Unit cost 1$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^Supplier notes 1$/i)).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText(/north print supply/i).length).toBeGreaterThan(0);
    });

    const createButton = screen.getByRole('button', { name: /create material/i });
    await waitFor(() => {
      expect(createButton).not.toBeDisabled();
    });
    await user.click(createButton);

    await waitFor(() => {
      const fetchMock = vi.mocked(fetch);
      const createCall = fetchMock.mock.calls.find(
        ([url]) => String(url).includes('/api/admin/materials') && !String(url).includes('/api/admin/materials/preview')
      );

      expect(createCall).toBeDefined();
      const body = JSON.parse(String(createCall?.[1]?.body ?? '{}'));
      expect(body.primarySupplierId).toBe('sup-1');
      expect(Array.isArray(body.suppliers)).toBe(true);
      expect(body.suppliers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ supplierId: 'sup-1' }),
          expect.objectContaining({ supplierId: 'sup-2' }),
        ])
      );
      expect(body.suppliers.every((item: Record<string, unknown>) => Object.keys(item).length === 1 && 'supplierId' in item)).toBe(true);
    });
  });

  it('removes stale dimensions when switched to ink kg flow', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    render(<MaterialCreateForm onSaved={onSaved} />);

    await user.selectOptions(screen.getByLabelText(/materialtype/i), 'SUPORT_FOI');
    await user.clear(screen.getByLabelText(/width \(mm\)/i));
    await user.type(screen.getByLabelText(/width \(mm\)/i), '210');
    await user.clear(screen.getByLabelText(/height \(mm\)/i));
    await user.type(screen.getByLabelText(/height \(mm\)/i), '297');

    await waitFor(() => {
      expect(screen.getByLabelText('Name')).toHaveValue('210x297 mm');
    });

    await user.selectOptions(screen.getByLabelText(/materialtype/i), 'CERNEALA');
    await user.selectOptions(screen.getByLabelText(/^Unit$/i), 'kg');
    await user.clear(screen.getByLabelText(/consumption rate/i));
    await user.type(screen.getByLabelText(/consumption rate/i), '2.5');
    const nameInput = screen.getByLabelText('Name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Ink Black');

    const createButton = screen.getByRole('button', { name: /create material/i });
    await waitFor(() => {
      expect(createButton).not.toBeDisabled();
    });

    await user.click(createButton);

    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledTimes(1);

      const fetchMock = vi.mocked(fetch);
      const createCall = fetchMock.mock.calls.find(
        ([url]) => String(url).includes('/api/admin/materials') && !String(url).includes('/api/admin/materials/preview')
      );

      expect(createCall).toBeDefined();
      const body = JSON.parse(String(createCall?.[1]?.body ?? '{}'));
      expect(body.unit).toBe('kg');
      expect(body).not.toHaveProperty('width_mm');
      expect(body).not.toHaveProperty('height_mm');
    });
  });
});
