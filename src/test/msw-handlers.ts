const msw = require('msw');
const rest = msw.rest || msw.http;

export const handlers = [
  rest.get('/api/health', (req, res, ctx) => res(ctx.json({ ok: true }))),
  rest.get('/api/products', (req, res, ctx) => res(ctx.json({ products: [{ id: 'p1', name: 'Produs 1', price: 10 }] }))),
  rest.get('/api/orders', (req, res, ctx) => res(ctx.status(401), ctx.json({ error: 'unauthenticated' }))),
  rest.get('/api/orders/:id', (req, res, ctx) => res(ctx.status(401), ctx.json({ error: 'unauthenticated' }))),
  rest.get('/api/admin/orders', (req, res, ctx) => res(ctx.status(403), ctx.json({ error: 'forbidden' }))),
  rest.patch('/api/admin/orders/:id/status', (req, res, ctx) => res(ctx.status(403), ctx.json({ error: 'forbidden' }))),
];
