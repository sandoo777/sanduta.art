/** @jest-environment node */

import express from 'express';
import request from 'supertest';

import products from '../api/products';

const app = express();

app.use(express.json());
app.use(products);

afterEach(() => {
  delete process.env.ENABLE_ADD_PRODUCT_API;
});

test('GET /api/health returns 200', async () => {
  const res = await request(app).get('/api/health');

  expect(res.status).toBe(200);
  expect(res.body).toEqual(
    expect.objectContaining({
      ok: true,
      productsApiEnabled: true,
    })
  );
});

test('POST /api/products returns 201', async () => {
  const res = await request(app)
    .post('/api/products')
    .send({ name: 'x', price: 1 });

  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty('id');
});

test('POST /api/products returns 400 for invalid payload', async () => {
  const res = await request(app)
    .post('/api/products')
    .send({ name: '', price: 'bad' });

  expect(res.status).toBe(400);
  expect(res.body).toHaveProperty('error');
});

test('POST /api/products returns 503 when feature flag is disabled', async () => {
  process.env.ENABLE_ADD_PRODUCT_API = 'false';

  const res = await request(app)
    .post('/api/products')
    .send({ name: 'x', price: 1 });

  expect(res.status).toBe(503);
  expect(res.body).toEqual(
    expect.objectContaining({
      error: 'Products API is disabled',
      flag: 'ENABLE_ADD_PRODUCT_API',
    })
  );
});