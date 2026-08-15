import { HttpResponse, http } from 'msw';

export const handlers = [
  http.get('/api/health', () => HttpResponse.json({ ok: true })),
  http.get('/api/items', () => HttpResponse.json([])),
  http.post('/api/auth', () => HttpResponse.json({ token: 'test-token' })),
  http.get('/api/users', () => HttpResponse.json([])),
  http.post('/api/orders', () => HttpResponse.json({ id: 'order-test' })),
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
