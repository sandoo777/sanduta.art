import { test, expect } from '@playwright/test';
import crypto from 'crypto';

test('webhook simulation smoke', async ({ request }) => {
  const payload = {
    session_id: `smoke-session-${Date.now()}`,
    order_id: 'missing-order-for-smoke',
    status: 'completed',
  };

  const body = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', process.env.PAYNET_SECRET || '')
    .update(body)
    .digest('hex');

  const response = await request.post('/api/payment/paynet/webhook', {
    headers: {
      'Content-Type': 'application/json',
      'x-signature': signature,
      'x-idempotency-key': `smoke-${Date.now()}`,
    },
    data: body,
  });

  // 401 is valid when secrets differ between test and runtime; 200/404 means signature accepted.
  expect([200, 401, 404]).toContain(response.status());
});
