/** @jest-environment node */

import express from 'express';
import request from 'supertest';

import products from '../api/products';

const app = express();

app.use(express.json());
app.use(products);

test('POST /api/products returns 201', async () => {
  const res = await request(app)
    .post('/api/products')
    .send({ name: 'x', price: 1 });

  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty('id');
});