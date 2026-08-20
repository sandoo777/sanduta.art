import { http, HttpResponse } from 'msw';

import { materialsHandlers } from './msw-materials-handlers';

// Match both relative and absolute API URLs (localhost/127.0.0.1/other hosts)
const api = (path: string) => new RegExp(`(^https?://[^/]+)?${path}$`);

export const handlers = [
  http.get(api('/api/health'), () => HttpResponse.json({ ok: true, productsApiEnabled: true })),
  http.get(api('/api/products'), () => HttpResponse.json([{ id: 'p1', name: 'Produs 1', slug: 'produs-1', price: 10, status: 'ACTIVE' }])),
  http.get(api('/api/orders'), () => HttpResponse.json({ error: 'unauthenticated' }, { status: 401 })),
  http.get(api('/api/orders/[^/]+'), () => HttpResponse.json({ error: 'unauthenticated' }, { status: 401 })),
  http.get(api('/api/admin/orders'), () => HttpResponse.json({ error: 'unauthenticated' }, { status: 401 })),
  http.patch(api('/api/admin/orders/[^/]+/status'), () => HttpResponse.json({ error: 'unauthenticated' }, { status: 401 })),
  http.delete(api('/api/admin/orders/[^/]+'), () => HttpResponse.json({ error: 'unauthenticated' }, { status: 401 })),
  ...materialsHandlers,
];
