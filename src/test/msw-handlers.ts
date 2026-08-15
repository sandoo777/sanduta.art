import { rest } from 'msw';

export const handlers = [
  rest.get('/api/health', (req, res, ctx) => res(ctx.json({ ok: true }))),
  rest.get('/api/items', (req, res, ctx) => res(ctx.json([]))),
  rest.post('/api/auth', (req, res, ctx) => res(ctx.json({ token: 'test-token' }))),
  rest.get('/api/users', (req, res, ctx) => res(ctx.json([]))),
  rest.post('/api/orders', (req, res, ctx) => res(ctx.json({ id: 'order-test' }))),
  rest.get('/api/products/:productId/attributes', (req, res, ctx) =>
    res(
      ctx.json([
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
    )
  ),
];
