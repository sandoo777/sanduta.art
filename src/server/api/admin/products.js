const express = require('express');

const router = express.Router();

router.use(express.json());

router.post('/api/admin/products', (req, res) => {
  const body = req.body || {};

  if (!body.name || !body.pricing) {
    return res.status(400).json({ error: 'missing fields' });
  }

  const created = {
    id: body.id || `prod-test-${Date.now()}`,
    ...body,
  };

  return res.status(201).json(created);
});

module.exports = router;