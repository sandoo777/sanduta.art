const express = require('express');

const app = express();
app.use(express.json());

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

const isAuthorized = (request) => Boolean(request.headers.authorization);
const isAdminToken = (request) => request.headers.authorization === 'Bearer ADMIN_TOKEN';

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.get('/api/items', (req, res) => res.json([]));
app.post('/api/auth', (req, res) => res.json({ token: 'test-token' }));

app.get('/api/products', (req, res) => {
  const { status } = req.query;
  const filteredProducts = status ? products.filter((product) => product.status === status) : products;

  res.json(filteredProducts);
});

app.get('/api/products/:slug', (req, res) => {
  const product = products.find((item) => item.slug === req.params.slug);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  return res.json(product);
});

app.post('/api/admin/products', (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!isAdminToken(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return res.status(201).json({ id: 'new-product-id' });
});

app.put('/api/admin/products/:id', (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!isAdminToken(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return res.json({ id: req.params.id });
});

app.delete('/api/admin/products/:id', (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!isAdminToken(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return res.json({ success: true });
});

app.get('/api/orders', (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.json([{ id: '1', userId: 'user-1', status: 'PENDING', total: 100, items: [] }]);
});

app.get('/api/orders/:id', (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.json({ id: req.params.id, userId: 'user-1', status: 'PENDING', total: 100, items: [] });
});

app.post('/api/orders', (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.status(201).json({ id: 'order-1', orderNumber: 'ORD-1', status: 'PENDING' });
});

app.post('/api/orders/:id/cancel', (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.json({ success: true });
});

app.get('/api/orders/stats', (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.json({ totalOrders: 1, totalSpent: 100 });
});

app.get('/api/admin/orders', (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!isAdminToken(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return res.json([{ id: '1', status: 'PENDING' }]);
});

app.patch('/api/admin/orders/:id/status', (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!isAdminToken(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return res.json({ id: req.params.id, status: 'CONFIRMED' });
});

app.delete('/api/admin/orders/:id', (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!isAdminToken(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return res.json({ success: true });
});

app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  return next(err);
});

const port = Number(process.env.TEST_SERVER_PORT || 3000);
const server = app.listen(port, () => {
  console.log('Test server listening on', port);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));
