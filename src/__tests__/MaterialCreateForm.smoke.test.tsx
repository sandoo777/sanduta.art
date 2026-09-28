import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MaterialCreateForm from '@/components/MaterialCreateForm';

describe('MaterialCreateForm smoke', () => {
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
            ],
          } as Response;
        }

        if (url.includes('/api/admin/suppliers')) {
          return {
            ok: true,
            json: async () => [
              { id: 'sup-1', name: 'Acme Supplies', contactEmail: 'sales@acme.example' },
              { id: 'sup-2', name: 'North Print Supply', contactEmail: 'hello@northprint.example' },
            ],
          } as Response;
        }

        if (url.includes('/api/admin/materials/preview')) {
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

        if (url.includes('/api/admin/materials') && !url.includes('/preview')) {
          const body = init?.body ? JSON.parse(String(init.body)) : {};

          expect(body).toEqual(
            expect.objectContaining({
              materialType: 'SUPORT_FOI',
              width_mm: 210,
              height_mm: 297,
              primarySupplierId: 'sup-1',
              suppliers: expect.arrayContaining([
                expect.objectContaining({ supplierId: 'sup-1' }),
              ]),
            })
          );

          // If your material form includes gramaj_g in the UI, keep the assertion below enabled:
          // expect(body.gramaj_g).toBe(170);

          return {
            ok: true,
            status: 201,
            json: async () => ({ id: 'm-smoke', ...body }),
          } as Response;
        }

        return {
          ok: true,
          json: async () => ({}),
        } as Response;
      })
    );
  });

  it('creates a material with primary supplier and supplier payload intact', async () => {
    const user = userEvent.setup();
    render(<MaterialCreateForm />);

    const materialTypeSelect = screen.getByLabelText(/materialtype/i);
    await user.selectOptions(materialTypeSelect, 'SUPORT_FOI');

    await user.clear(screen.getByLabelText(/width \(mm\)/i));
    await user.type(screen.getByLabelText(/width \(mm\)/i), '210');
    await user.clear(screen.getByLabelText(/height \(mm\)/i));
    await user.type(screen.getByLabelText(/height \(mm\)/i), '297');

    const primarySelect = await screen.findByLabelText(/primary supplier/i);
    await waitFor(() => {
      expect(Array.from((primarySelect as HTMLSelectElement).options).map((option) => option.value)).toContain('sup-1');
    });
    await user.selectOptions(primarySelect, 'sup-1');

    const createButton = screen.getByRole('button', { name: /create material/i });
    await waitFor(() => {
      expect(createButton).not.toBeDisabled();
    });

    await user.click(createButton);

    await waitFor(() => {
      const fetchMock = vi.mocked(fetch);
      const createCall = fetchMock.mock.calls.find(
        ([url]) => String(url).includes('/api/admin/materials') && !String(url).includes('/preview')
      );
      expect(createCall).toBeDefined();
    });
  });
});
