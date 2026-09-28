import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormatsPage from '@/app/admin/formats/page';

const mockFormats = [
  {
    id: 'fmt-1',
    category: 'FOI',
    width_mm: 210,
    height_mm: 297,
    name: '210x297 mm',
  },
  {
    id: 'fmt-2',
    category: 'FOI',
    width_mm: 420,
    height_mm: 594,
    name: '420x594 mm',
  },
  {
    id: 'fmt-3',
    category: 'ROLE',
    width_mm: 1370,
    height_mm: null,
    name: '1370 mm',
  },
];

describe('Formats admin list filters', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = typeof input === 'string' ? input : input.toString();

        if (url.endsWith('/api/admin/formats')) {
          return {
            ok: true,
            json: async () => mockFormats,
          } as Response;
        }

        if (url.endsWith('/api/admin/formats_categories')) {
          return {
            ok: true,
            json: async () => [
              { id: 'cat-foi', code: 'FOI', name: 'Foi', enabled: true, usageCount: 2 },
              { id: 'cat-role', code: 'ROLE', name: 'Role', enabled: true, usageCount: 1 },
            ],
          } as Response;
        }

        return {
          ok: true,
          json: async () => ({}),
        } as Response;
      })
    );
  });

  it('clicking FOI shows only FOI formats', async () => {
    const user = userEvent.setup();
    render(<FormatsPage />);

    await waitFor(() => {
      expect(screen.getAllByText('210x297 mm').length).toBeGreaterThan(0);
      expect(screen.getAllByText('1370 mm').length).toBeGreaterThan(0);
    });

    await user.click(screen.getByRole('button', { name: /filter by FOI/i }));

    expect(screen.getAllByText('210x297 mm').length).toBeGreaterThan(0);
    expect(screen.getAllByText('420x594 mm').length).toBeGreaterThan(0);
    expect(screen.queryAllByText('1370 mm')).toHaveLength(0);
  });

  it('clicking ROLE shows only ROLE formats', async () => {
    const user = userEvent.setup();
    render(<FormatsPage />);

    await waitFor(() => {
      expect(screen.getAllByText('1370 mm').length).toBeGreaterThan(0);
    });

    await user.click(screen.getByRole('button', { name: /filter by ROLE/i }));

    expect(screen.getAllByText('1370 mm').length).toBeGreaterThan(0);
    expect(screen.queryAllByText('210x297 mm')).toHaveLength(0);
    expect(screen.queryAllByText('420x594 mm')).toHaveLength(0);
  });

  it('clicking the same filter again resets the filter', async () => {
    const user = userEvent.setup();
    render(<FormatsPage />);

    await waitFor(() => {
      expect(screen.getAllByText('210x297 mm').length).toBeGreaterThan(0);
      expect(screen.getAllByText('1370 mm').length).toBeGreaterThan(0);
    });

    const foiButton = screen.getByRole('button', { name: /filter by FOI/i });
    await user.click(foiButton);
    expect(screen.queryAllByText('1370 mm')).toHaveLength(0);

    await user.click(foiButton);
    expect(screen.getAllByText('1370 mm').length).toBeGreaterThan(0);
  });
});
