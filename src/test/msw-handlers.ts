import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/health', () => HttpResponse.json({ ok: true })),
  http.get('/api/products', () => HttpResponse.json({ products: [{ id: 'p1', name: 'Produs 1', price: 10 }] })),
  http.get('/api/orders', () => HttpResponse.json({ error: 'unauthenticated' }, { status: 401 })),
  http.get('/api/orders/:id', () => HttpResponse.json({ error: 'unauthenticated' }, { status: 401 })),
  http.get('/api/admin/orders', () => HttpResponse.json({ error: 'forbidden' }, { status: 403 })),
  http.patch('/api/admin/orders/:id/status', () => HttpResponse.json({ error: 'forbidden' }, { status: 403 })),
];
