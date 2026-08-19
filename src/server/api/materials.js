const express = require('express');
const router = express.Router();
const seed = require('../../../data/materials.json');

router.get('/api/materials', (_req, res) => res.json({ materials: seed }));
router.get('/api/materials/:id', (req, res) => {
  const id = req.params.id;
  const m = seed.find((x) => x.id === id || x.sku === id);
  if (m) return res.json(m);
  return res.status(404).json({ error: 'not found' });
});

module.exports = router;
