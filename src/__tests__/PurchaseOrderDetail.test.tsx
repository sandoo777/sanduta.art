import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PurchaseOrderDetail } from '@/components/purchasing/PurchaseOrderDetail';

describe('PurchaseOrderDetail', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input.toString();

        if (url.includes('/api/purchase-orders/po-1')) {
          if (init?.method === 'POST') {
            return {
              ok: true,
              json: async () => ({ ok: true }),
            } as Response;
          }

          return {
            ok: true,
            json: async () => ({
              item: {
                id: 'po-1',
                poNumber: 'PO-1001',
                status: 'DRAFT',
                totalCost: 1200,
                currency: 'MDL',
                expectedDeliveryDate: '2026-09-21T00:00:00.000Z',
                createdAt: '2026-09-08T10:00:00.000Z',
                lastResponse: null,
                supplier: {
                  id: 'supplier-1',
                  name: 'Acme Supply',
                  email: 'ops@acme.io',
                  phones: ['+37360111222'],
                  website: 'https://acme.example',
                  preferredChannel: 'email',
                },
                lines: [
                  { id: 'line-1', materialId: 'm-1', quantity: 10, unit: 'unit', unitCost: 120, lineTotal: 1200, material: { name: 'Paper A3', sku: 'PAPER-01' } },
                ],
                events: [{ id: 'e-1', eventType: 'CREATED', message: 'PO created', createdAt: '2026-09-08T10:00:00.000Z' }],
              },
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

  it('shows PO detail and approves the order', async () => {
    const user = userEvent.setup();
    render(<PurchaseOrderDetail purchaseOrderId="po-1" />);

    expect(await screen.findByText('PO-1001')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Approve/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Approve/i }));
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/purchase-orders/po-1/approve',
      expect.objectContaining({ method: 'POST' })
    );
  });
});
