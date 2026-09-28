import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PurchaseOrdersList } from '@/components/purchasing/PurchaseOrdersList';

describe('PurchaseOrdersList', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input.toString();

        if (url.includes('/api/suppliers')) {
          return {
            ok: true,
            json: async () => ({
              items: [{ id: 'supplier-1', name: 'Acme Supply' }],
            }),
          } as Response;
        }

        if (url.includes('/api/purchase-orders')) {
          return {
            ok: true,
            json: async () => ({
              items: [
                {
                  id: 'po-1',
                  poNumber: 'PO-1001',
                  status: 'DRAFT',
                  totalCost: 2450,
                  currency: 'MDL',
                  expectedDeliveryDate: '2026-09-20T00:00:00.000Z',
                  createdAt: '2026-09-08T12:00:00.000Z',
                  supplier: { id: 'supplier-1', name: 'Acme Supply' },
                },
              ],
            }),
          } as Response;
        }

        return {
          ok: true,
          json: async () => ({ ok: true }),
        } as Response;
      })
    );
  });

  it('renders the PO list and status actions', async () => {
    const user = userEvent.setup();
    render(<PurchaseOrdersList />);

    expect(await screen.findByText('PO-1001')).toBeInTheDocument();
    expect(screen.getAllByText('Acme Supply').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Approve/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Approve/i }));
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/purchase-orders/po-1/approve',
      expect.objectContaining({ method: 'POST' })
    );
  });
});
