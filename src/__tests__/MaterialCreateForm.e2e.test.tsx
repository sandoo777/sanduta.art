import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import MaterialCreateForm from '@/components/MaterialCreateForm';

describe('MaterialCreateForm E2E regression', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input.toString();

        if (url.includes('/api/admin/formats')) {
          return {
            ok: true,
            json: async () => [
              { id: 'fmt-a4', name: 'A4', width_mm: 210, height_mm: 297, category: 'FOI' },
              { id: 'fmt-a3', name: 'A3', width_mm: 297, height_mm: 420, category: 'FOI' },
            ],
          } as Response;
        }

        if (url.includes('/api/admin/materials/preview')) {
          const body = init?.body ? JSON.parse(String(init.body)) : {};
          const width = Number(body.width_mm ?? 0);
          const height = Number(body.height_mm ?? 0);
          const area_m2 = (width * height) / 1_000_000;

          if (width === 220 && height === 297) {
            return {
              ok: true,
              json: async () => ({
                ok: true,
                preview: {
                  area_m2: Number(area_m2.toFixed(5)),
                  length_m: null,
                  estimated_consumption: { value: 0.0132, unit: 'L' },
                  autoName: '220x297 mm',
                },
              }),
            } as Response;
          }

          return {
            ok: true,
            json: async () => ({
              ok: true,
              preview: {
                area_m2: Number(area_m2.toFixed(5)),
                length_m: null,
                estimated_consumption: { value: 0, unit: 'L' },
                autoName: `${width}x${height} mm`,
              },
            }),
          } as Response;
        }

        if (url.includes('/api/admin/materials')) {
          const body = init?.body ? JSON.parse(String(init.body)) : {};
          return {
            ok: true,
            status: 201,
            json: async () => ({
              id: 'mat-1',
              ...body,
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

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps the manual name when dimensions change after auto-fill', async () => {
    const user = userEvent.setup();
    render(<MaterialCreateForm />);

    await user.selectOptions(screen.getByLabelText(/MaterialType/i), 'SUPORT_FOI');

    const widthInput = screen.getByLabelText(/Width \(mm\)/i);
    const heightInput = screen.getByLabelText(/Height \(mm\)/i);
    const nameInput = screen.getByLabelText(/Name/i);

    await user.clear(widthInput);
    await user.type(widthInput, '210');
    await user.clear(heightInput);
    await user.type(heightInput, '297');

    await waitFor(() => expect(nameInput).toHaveValue('210x297 mm'));

    await user.clear(nameInput);
    await user.type(nameInput, 'My custom name');

    await user.clear(widthInput);
    await user.type(widthInput, '220');

    await waitFor(() => expect(nameInput).toHaveValue('My custom name'));
    expect(widthInput).toHaveValue(220);
    expect(heightInput).toHaveValue(297);
  });

  it('supports format selection, unlink, preview and create payload', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    render(<MaterialCreateForm onSaved={onSaved} />);

    await user.selectOptions(screen.getByLabelText(/MaterialType/i), 'SUPORT_FOI');

    const widthInput = screen.getByLabelText(/Width \(mm\)/i);
    const heightInput = screen.getByLabelText(/Height \(mm\)/i);
    const formatInput = screen.getByLabelText(/Format/i);

    await user.clear(widthInput);
    await user.type(widthInput, '210');
    await user.clear(heightInput);
    await user.type(heightInput, '297');

    await user.type(formatInput, 'A4');

    await waitFor(() => {
      expect(widthInput).toHaveValue(210);
      expect(heightInput).toHaveValue(297);
      expect(screen.getByRole('button', { name: /Unlink/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Unlink/i }));
    expect(screen.getByLabelText(/Format/i)).toHaveValue('');

    await waitFor(() => {
      expect(screen.getByText(/0\.06237|0\.06534/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Create/i }));

    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledWith(expect.objectContaining({
        name: '210x297 mm',
        width_mm: 210,
        height_mm: 297,
      }));
    });

    const fetchMock = vi.mocked(fetch);
    const createCall = fetchMock.mock.calls.find(
      ([url]) => String(url).includes('/api/admin/materials') && !String(url).includes('/api/admin/materials/preview')
    );

    expect(createCall).toBeDefined();

    const body = JSON.parse(String(createCall?.[1]?.body ?? '{}'));
    expect(body.name).toBe('210x297 mm');
    expect(body.width_mm).toBe(210);
    expect(body.height_mm).toBe(297);
    expect(body.formatId == null).toBe(true);
  });
});
