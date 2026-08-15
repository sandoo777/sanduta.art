import { Router } from 'express';

const router = Router();

router.post('/api/products', (req, res) => {
  const { name, price } = req.body;

  res.status(201).json({ id: 'p_test', name, price });
});

export default router;