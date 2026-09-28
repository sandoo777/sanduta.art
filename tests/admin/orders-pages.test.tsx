import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/app/admin/orders/OrdersList', () => ({
  default: () => <div data-testid="orders-list">Orders List</div>,
}));

vi.mock('../../src/app/admin/orders/OrderDetails', () => ({
  default: ({ params }: { params: { id: string } }) => (
    <div data-testid="order-details">{params.id}</div>
  ),
}));

describe('admin orders smoke pages', () => {
  it('renders orders page shell', async () => {
    const module = await import('../../src/app/admin/orders/page');
    const view = module.default();

    expect(view.props.className).toContain('p-6');
  });

  it('renders order details page shell', async () => {
    const module = await import('../../src/app/admin/orders/[id]/page');
    const view = await module.default({
      params: Promise.resolve({ id: 'order-123' }),
    });

    expect(view.props.className).toContain('p-6');
  });
});