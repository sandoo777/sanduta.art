import { HttpResponse, http } from 'msw';

export const handlers = [
  http.get('/api/health', () => HttpResponse.json({ ok: true })),
  http.get('/api/products', () =>
    HttpResponse.json({
      products: [
        { id: 'p1', name: 'Produs 1', price: 10 },
        { id: 'p2', name: 'Produs 2', price: 20 },
      ],
    })
  ),
  http.get('/api/orders', () => HttpResponse.json({ error: 'unauthenticated' }, { status: 401 })),
  http.get('/api/orders/:id', () => HttpResponse.json({ error: 'unauthenticated' }, { status: 401 })),
  http.get('/api/admin/orders', () => HttpResponse.json({ error: 'forbidden' }, { status: 403 })),
  http.patch('/api/admin/orders/:id/status', () => HttpResponse.json({ error: 'forbidden' }, { status: 403 })),
  http.get('/api/products/:productId/attributes', () =>
    HttpResponse.json([
      {
        id: 'attr-finish',
        name: 'finish',
        label: 'Finisaj',
        type: 'SELECT',
        required: false,
        helpText: 'Mock attribute for configurator tests',
        options: [
          {
            id: 'attr-finish-mat',
            label: 'Mat',
            value: 'mat',
            description: null,
            priceModifier: 0,
            priceModifierType: 'FIXED',
            isDefault: true,
          },
        ],
      },
    ])
  ),
];
