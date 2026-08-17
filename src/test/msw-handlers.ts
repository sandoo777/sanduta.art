import { http, HttpResponse } from 'msw';

// Match both relative and absolute API URLs (localhost/127.0.0.1/other hosts)
const api = (path: string) => new RegExp(`(^https?://[^/]+)?${path}$`);

export const handlers = [
  http.get(api('/api/health'), () => HttpResponse.json({ ok: true })),
  http.get(api('/api/products'), () => HttpResponse.json({ products: [{ id: 'p1', name: 'Produs 1', price: 10 }] })),
  http.get(api('/api/orders'), () => HttpResponse.json({ error: 'unauthenticated' }, { status: 401 })),
  http.get(api('/api/orders/[^/]+'), () => HttpResponse.json({ error: 'unauthenticated' }, { status: 401 })),
  http.get(api('/api/admin/orders'), () => HttpResponse.json({ error: 'forbidden' }, { status: 403 })),
  http.patch(api('/api/admin/orders/[^/]+/status'), () => HttpResponse.json({ error: 'forbidden' }, { status: 403 })),
];
