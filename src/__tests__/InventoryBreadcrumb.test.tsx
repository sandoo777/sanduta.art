import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import InventoryPage from '@/app/inventory/page';

describe('Inventory breadcrumb', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          items: [
            { material: 'Paper', quantity: 120, unit: 'kg', location: 'Warehouse A' },
          ],
        }),
      }))
    );
  });

  it('shows the Admin > Depozit > Inventar breadcrumb on the inventory page', async () => {
    render(<InventoryPage />);

    expect(await screen.findByLabelText('Breadcrumb')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Admin' })).toHaveAttribute('href', '/admin');
    expect(screen.getByText('Depozit')).toBeInTheDocument();
    expect(screen.getByText('Inventar')).toBeInTheDocument();
  });
});
