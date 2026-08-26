import { Router } from 'express';

import { logger } from '../lib/logger';

const router = Router();

const PRODUCTS_FLAG = 'ENABLE_ADD_PRODUCT_API';

function isProductsApiEnabled() {
  return process.env[PRODUCTS_FLAG] !== 'false';
}

function handleFeatureDisabled(route: string, res: Parameters<typeof router.get>[1] extends never ? never : any) {
  logger.warn('API:Products', 'Feature flag disabled request blocked', {
    route,
    flag: PRODUCTS_FLAG,
  });

  return res.status(503).json({
    error: 'Products API is disabled',
    flag: PRODUCTS_FLAG,
  });
}

router.get('/api/health', (_req, res) => {
  logger.info('API:Health', 'Health check requested', {
    productsApiEnabled: isProductsApiEnabled(),
  });

  res.status(200).json({
    ok: true,
    productsApiEnabled: isProductsApiEnabled(),
  });
});

router.get('/api/products', (_req, res) => {
  if (!isProductsApiEnabled()) {
    return handleFeatureDisabled('/api/products', res);
  }

  logger.info('API:Products', 'Listing stub products');

  return res.status(200).json([
    { id: 'p_test', name: 'Sample product', price: 1 },
  ]);
});

router.post('/api/products', (req, res) => {
  if (!isProductsApiEnabled()) {
    return handleFeatureDisabled('/api/products', res);
  }

  const { name, price } = req.body;

  logger.info('API:Products', 'Create product request received', {
    name,
    price,
  });

  if (typeof name !== 'string' || name.trim().length === 0 || typeof price !== 'number' || !Number.isFinite(price)) {
    logger.warn('API:Products', 'Invalid product payload', { name, price });

    return res.status(400).json({
      error: 'Invalid product payload',
    });
  }

  return res.status(201).json({ id: 'p_test', name, price });
});

export default router;