import { http, HttpResponse } from 'msw';

import { materialsHandlers } from './msw-materials-handlers';

// Match both relative and absolute API URLs (localhost/127.0.0.1/other hosts)
const api = (path: string) => new RegExp(`(^https?://[^/]+)?${path}$`);

export const handlers = [
  http.get(api('/api/health'), () => HttpResponse.json({ ok: true, productsApiEnabled: true })),
  http.get(api('/api/products'), () => HttpResponse.json([{ id: 'p1', name: 'Produs 1', slug: 'produs-1', price: 10, status: 'ACTIVE' }])),
  http.post(api('/api/products'), async ({ request }) => {
    const body = await request.json().catch(() => null) as { name?: string; price?: unknown } | null;

    if (process.env.ENABLE_ADD_PRODUCT_API === 'false') {
      return HttpResponse.json(
        { error: 'Products API is disabled', flag: 'ENABLE_ADD_PRODUCT_API' },
        { status: 503 }
      );
    }

    if (!body || !body.name || typeof body.price !== 'number') {
      return HttpResponse.json({ error: 'invalid' }, { status: 400 });
    }

    return HttpResponse.json({ id: 'p1', ...body }, { status: 201 });
  }),
  http.patch(api('/api/products'), () => HttpResponse.json({ error: 'Method not allowed' }, { status: 405 })),
  http.get(api('/api/products/[^/]+'), ({ request }) => {
    const slug = new URL(request.url).pathname.split('/').pop();
    if (slug === 'produs-1') {
      return HttpResponse.json({ id: 'p1', name: 'Produs 1', slug: 'produs-1', price: 10, status: 'ACTIVE' });
    }

    return HttpResponse.json({ error: 'Product not found' }, { status: 404 });
  }),
  http.get(api('/api/orders'), () => HttpResponse.json({ error: 'unauthenticated' }, { status: 401 })),
  http.get(api('/api/orders/[^/]+'), () => HttpResponse.json({ error: 'unauthenticated' }, { status: 401 })),
  http.post(api('/api/orders'), () => HttpResponse.json({ error: 'unauthenticated' }, { status: 401 })),
  http.post(api('/api/orders/[^/]+/cancel'), () => HttpResponse.json({ error: 'unauthenticated' }, { status: 401 })),
  http.get(api('/api/admin/orders'), () => HttpResponse.json({ error: 'unauthenticated' }, { status: 401 })),
  http.patch(api('/api/admin/orders/[^/]+/status'), () => HttpResponse.json({ error: 'unauthenticated' }, { status: 401 })),
  http.delete(api('/api/admin/orders/[^/]+'), () => HttpResponse.json({ error: 'unauthenticated' }, { status: 401 })),
  http.post(api('/api/admin/products'), () => HttpResponse.json({ error: 'unauthenticated' }, { status: 401 })),
  http.put(api('/api/admin/products/[^/]+'), () => HttpResponse.json({ error: 'unauthenticated' }, { status: 401 })),
  http.delete(api('/api/admin/products/[^/]+'), () => HttpResponse.json({ error: 'unauthenticated' }, { status: 401 })),
  http.get(api('/api/invalid-endpoint-xyz'), () => HttpResponse.json({ error: 'Not Found' }, { status: 404 })),
  ...materialsHandlers,
];
