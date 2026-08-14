import { rest } from 'msw';

export const handlers = [
  rest.get('/api/health', (req, res, ctx) => res(ctx.json({ ok: true }))),
  rest.get('/api/items', (req, res, ctx) => res(ctx.json([]))),
  rest.post('/api/auth', (req, res, ctx) => res(ctx.json({ token: 'test-token' }))),
  rest.get('/api/users', (req, res, ctx) => res(ctx.json([]))),
  rest.post('/api/orders', (req, res, ctx) => res(ctx.json({ id: 'order-test' }))),
];
