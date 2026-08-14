import { http, HttpResponse } from 'msw';

const products = [
  {
    id: '1',
    name: 'Test Product A',
    slug: 'test-product-a',
    price: 99.99,
    status: 'ACTIVE',
  },
  {
    id: '2',
    name: 'Test Product B',
    slug: 'test-product-b',
    price: 149.99,
    status: 'ACTIVE',
  },
];

const hasAuth = (request: Request) => Boolean(request.headers.get('authorization'));
const isAdminToken = (request: Request) => request.headers.get('authorization') === 'Bearer ADMIN_TOKEN';
const isUserToken = (request: Request) => request.headers.get('authorization') === 'Bearer USER_TOKEN';

export const handlers = [
  http.get('/api/health', () => HttpResponse.json({ ok: true })),
  http.get('/api/items', () => HttpResponse.json([])),
  http.post('/api/auth', () => HttpResponse.json({ token: 'test-token' })),
  http.get('*/api/products', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const filteredProducts = status ? products.filter((product) => product.status === status) : products;

    return HttpResponse.json(filteredProducts);
  }),
  http.get('*/api/products/:slug', ({ params }) => {
    const product = products.find((item) => item.slug === params.slug);

    if (!product) {
      return HttpResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return HttpResponse.json(product);
  }),
  http.post('*/api/admin/products', ({ request }) => {
    if (!hasAuth(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdminToken(request)) {
      return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return HttpResponse.json({ id: 'new-product-id' }, { status: 201 });
  }),
  http.put('*/api/admin/products/:id', ({ request }) => {
    if (!hasAuth(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdminToken(request)) {
      return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return HttpResponse.json({ id: '1' });
  }),
  http.delete('*/api/admin/products/:id', ({ request }) => {
    if (!hasAuth(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdminToken(request)) {
      return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return HttpResponse.json({ success: true });
  }),
  http.get('*/api/orders', ({ request }) => {
    if (!hasAuth(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return HttpResponse.json([{ id: '1', userId: 'user-1', status: 'PENDING', total: 100, items: [] }]);
  }),
  http.get('*/api/orders/:id', ({ request, params }) => {
    if (!hasAuth(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return HttpResponse.json({ id: params.id, userId: 'user-1', status: 'PENDING', total: 100, items: [] });
  }),
  http.post('*/api/orders', ({ request }) => {
    if (!hasAuth(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return HttpResponse.json({ id: 'order-1', orderNumber: 'ORD-1', status: 'PENDING' }, { status: 201 });
  }),
  http.post('*/api/orders/:id/cancel', ({ request }) => {
    if (!hasAuth(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return HttpResponse.json({ success: true });
  }),
  http.get('*/api/orders/stats', ({ request }) => {
    if (!hasAuth(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return HttpResponse.json({ totalOrders: 1, totalSpent: 100 });
  }),
  http.get('*/api/admin/orders', ({ request }) => {
    if (!hasAuth(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdminToken(request)) {
      return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return HttpResponse.json([{ id: '1', status: 'PENDING' }]);
  }),
  http.patch('*/api/admin/orders/:id/status', ({ request }) => {
    if (!hasAuth(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdminToken(request)) {
      return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return HttpResponse.json({ id: '1', status: 'CONFIRMED' });
  }),
  http.delete('*/api/admin/orders/:id', ({ request }) => {
    if (!hasAuth(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdminToken(request)) {
      return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return HttpResponse.json({ success: true });
  }),
];

import { rest } from 'msw';

export const handlers = [
  rest.get('/api/health', (req, res, ctx) => res(ctx.json({ ok: true }))),
  rest.get('/api/items', (req, res, ctx) => res(ctx.json([]))),
  rest.post('/api/auth', (req, res, ctx) => res(ctx.json({ token: 'test-token' }))),
  rest.get('/api/users', (req, res, ctx) => res(ctx.json([]))),
  rest.post('/api/orders', (req, res, ctx) => res(ctx.json({ id: 'order-test' }))),
];
