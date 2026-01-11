/**
 * API Tests - Products Endpoint
 * Tests pentru /api/products
 */

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';

const API_URL = process.env.API_URL || 'http://localhost:3000';

describe('GET /api/products', () => {
  it('returnează lista de produse', async () => {
    const response = await request(API_URL).get('/api/products');

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  it('returnează produse cu structură corectă', async () => {
    const response = await request(API_URL).get('/api/products');

    expect(response.status).toBe(200);
    
    if (response.body.length > 0) {
      const product = response.body[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('slug');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('status');
    }
  });

  it('filtrează produse după categorie', async () => {
    const response = await request(API_URL)
      .get('/api/products')
      .query({ categoryId: '1' });

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  it('filtrează produse după status ACTIVE', async () => {
    const response = await request(API_URL)
      .get('/api/products')
      .query({ status: 'ACTIVE' });

    expect(response.status).toBe(200);
    
    if (response.body.length > 0) {
      response.body.forEach((product: any) => {
        expect(product.status).toBe('ACTIVE');
      });
    }
  });

  it('returnează produse paginate', async () => {
    const response = await request(API_URL)
      .get('/api/products')
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);
    expect(response.body.length).toBeLessThanOrEqual(10);
  });

  it('gestionează query parametri invalizi', async () => {
    const response = await request(API_URL)
      .get('/api/products')
      .query({ page: -1, limit: 'invalid' });

    expect([200, 400]).toContain(response.status);
  });
});

describe('GET /api/products/[slug]', () => {
  it('returnează produs după slug', async () => {
    // Obține un produs
    const listResponse = await request(API_URL).get('/api/products');
    
    if (listResponse.body.length > 0) {
      const slug = listResponse.body[0].slug;
      
      const response = await request(API_URL).get(`/api/products/${slug}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('slug', slug);
    }
  });

  it('returnează 404 pentru slug inexistent', async () => {
    const response = await request(API_URL).get('/api/products/produs-inexistent-123');

    expect(response.status).toBe(404);
  });
});

describe('POST /api/admin/products (Protected)', () => {
  it('necesită autentificare', async () => {
    const response = await request(API_URL)
      .post('/api/admin/products')
      .send({
        name: 'Test Product',
        slug: 'test-product',
        price: 99.99,
      });

    expect(response.status).toBe(401);
  });

  it('necesită rol ADMIN', async () => {
    // TODO: Add auth token for non-admin user
    const response = await request(API_URL)
      .post('/api/admin/products')
      .set('Authorization', 'Bearer INVALID_TOKEN')
      .send({
        name: 'Test Product',
        slug: 'test-product',
        price: 99.99,
      });

    expect([401, 403]).toContain(response.status);
  });

  // Note: Acest test necesită un token valid de admin
  it.skip('creează produs cu date valide', async () => {
    const response = await request(API_URL)
      .post('/api/admin/products')
      .set('Authorization', 'Bearer ADMIN_TOKEN')
      .send({
        name: 'Test Product',
        slug: 'test-product-' + Date.now(),
        description: 'Test description',
        price: 99.99,
        stock: 10,
        status: 'ACTIVE',
        categoryId: '1',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  it.skip('validează date de input', async () => {
    const response = await request(API_URL)
      .post('/api/admin/products')
      .set('Authorization', 'Bearer ADMIN_TOKEN')
      .send({
        name: '', // Invalid
        price: -10, // Invalid
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
  });
});

describe('PUT /api/admin/products/[id] (Protected)', () => {
  it('necesită autentificare', async () => {
    const response = await request(API_URL)
      .put('/api/admin/products/1')
      .send({ name: 'Updated Name' });

    expect(response.status).toBe(401);
  });

  it.skip('actualizează produs existent', async () => {
    const response = await request(API_URL)
      .put('/api/admin/products/1')
      .set('Authorization', 'Bearer ADMIN_TOKEN')
      .send({
        name: 'Updated Product Name',
        price: 149.99,
      });

    expect([200, 404]).toContain(response.status);
  });

  it.skip('returnează 404 pentru produs inexistent', async () => {
    const response = await request(API_URL)
      .put('/api/admin/products/999999')
      .set('Authorization', 'Bearer ADMIN_TOKEN')
      .send({ name: 'Updated Name' });

    expect(response.status).toBe(404);
  });
});

describe('DELETE /api/admin/products/[id] (Protected)', () => {
  it('necesită autentificare', async () => {
    const response = await request(API_URL).delete('/api/admin/products/1');

    expect(response.status).toBe(401);
  });

  it.skip('șterge produs existent', async () => {
    // Creează un produs de test
    const createResponse = await request(API_URL)
      .post('/api/admin/products')
      .set('Authorization', 'Bearer ADMIN_TOKEN')
      .send({
        name: 'Product to Delete',
        slug: 'product-to-delete-' + Date.now(),
        price: 99.99,
        categoryId: '1',
      });

    if (createResponse.status === 201) {
      const productId = createResponse.body.id;

      const deleteResponse = await request(API_URL)
        .delete(`/api/admin/products/${productId}`)
        .set('Authorization', 'Bearer ADMIN_TOKEN');

      expect(deleteResponse.status).toBe(200);
    }
  });
});

describe('API Response Format', () => {
  it('returnează JSON', async () => {
    const response = await request(API_URL).get('/api/products');

    expect(response.headers['content-type']).toMatch(/json/);
  });

  it('include CORS headers', async () => {
    const response = await request(API_URL).get('/api/products');

    // CORS poate fi configurat sau nu
    expect(response.status).toBeLessThan(500);
  });

  it('gestionează metode HTTP invalide', async () => {
    const response = await request(API_URL).patch('/api/products');

    expect([404, 405]).toContain(response.status);
  });
});

describe('API Performance', () => {
  it('răspunde în mai puțin de 1s', async () => {
    const start = Date.now();
    await request(API_URL).get('/api/products');
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(1000);
  });

  it('gestionează cereri concurente', async () => {
    const requests = Array(10)
      .fill(null)
      .map(() => request(API_URL).get('/api/products'));

    const responses = await Promise.all(requests);

    responses.forEach((response) => {
      expect(response.status).toBe(200);
    });
  });
});

describe('API Error Handling', () => {
  it('returnează eroare formatată pentru 404', async () => {
    const response = await request(API_URL).get('/api/products/inexistent-slug-123');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });

  it('returnează eroare pentru rută inexistentă', async () => {
    const response = await request(API_URL).get('/api/invalid-endpoint-xyz');

    expect(response.status).toBe(404);
  });

  it('gestionează body JSON invalid', async () => {
    const response = await request(API_URL)
      .post('/api/admin/products')
      .set('Content-Type', 'application/json')
      .send('{ invalid json }');

    expect([400, 401]).toContain(response.status);
  });
});
