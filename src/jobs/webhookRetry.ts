import { PaymentStatus, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

const MAX_RETRIES = 5;
const BASE_BACKOFF_MS = 1_000;

export interface RetryResult {
  scanned: number;
  processed: number;
  failed: number;
}

export function calculateBackoffMs(attempt: number, baseMs: number = BASE_BACKOFF_MS): number {
  const safeAttempt = Math.max(0, attempt);
  return baseMs * 2 ** safeAttempt;
}

function mapStatus(status: string | null | undefined): PaymentStatus {
  const normalized = String(status ?? '').toLowerCase();
  if (normalized === 'completed' || normalized === 'paid' || normalized === 'success') return 'PAID';
  if (normalized === 'failed' || normalized === 'cancelled' || normalized === 'canceled') return 'FAILED';
  return 'PENDING';
}

async function sendAlertIfConfigured(message: string) {
  const webhook = process.env.SLACK_WEBHOOK_URL || process.env.ALERT_WEBHOOK_URL;
  if (!webhook) return;

  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    });
  } catch (error) {
    logger.error('Jobs:WebhookRetry', 'Failed to send alert', {
      error: error instanceof Error ? error.message : 'Unknown alert error',
    });
  }
}

export async function processWebhookRetries(): Promise<RetryResult> {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS webhook_events (
      id TEXT PRIMARY KEY,
      idempotency_key TEXT UNIQUE NOT NULL,
      event_type TEXT NOT NULL,
      payload JSONB NOT NULL,
      status TEXT NOT NULL,
      attempts INT NOT NULL DEFAULT 0,
      next_retry_at TIMESTAMPTZ,
      last_error TEXT,
      processed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  const pending = await prisma.$queryRaw<Array<{
    id: string;
    payload: Record<string, unknown>;
    attempts: number;
  }>>`
    SELECT id, payload, attempts
    FROM webhook_events
    WHERE status IN ('pending', 'failed')
      AND attempts < ${MAX_RETRIES}
      AND (next_retry_at IS NULL OR next_retry_at <= NOW())
    ORDER BY created_at ASC
    LIMIT 100
  `;

  const result: RetryResult = {
    scanned: pending.length,
    processed: 0,
    failed: 0,
  };

  for (const event of pending) {
    const payload = event.payload;
    const orderId = String(payload.order_id ?? '');
    const sessionId = String(payload.session_id ?? '');
    const status = String(payload.status ?? '');

    if (!orderId || !sessionId) {
      result.failed += 1;
      await prisma.$executeRaw`
        UPDATE webhook_events
        SET status = 'failed',
            attempts = attempts + 1,
            last_error = 'Missing order_id or session_id',
            next_retry_at = NOW() + make_interval(secs => ${Math.floor(calculateBackoffMs(event.attempts + 1) / 1000)}),
            updated_at = NOW()
        WHERE id = ${event.id}
      `;
      continue;
    }

    try {
      const paymentStatus = mapStatus(status);
      const orderStatus = paymentStatus === 'PAID' ? 'IN_PREPRODUCTION' : 'PENDING';

      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus, status: orderStatus },
        }),
        prisma.orderTimeline.create({
          data: {
            orderId,
            eventType: 'payment_update_retry',
            description: `Retry processed payment status ${paymentStatus}`,
            eventData: {
              sessionId,
              paymentStatus,
              source: 'webhook_retry',
            } as Prisma.InputJsonValue,
          },
        }),
      ]);

      await prisma.$executeRaw`
        UPDATE webhook_events
        SET status = 'processed',
            processed_at = NOW(),
            updated_at = NOW()
        WHERE id = ${event.id}
      `;

      result.processed += 1;
    } catch (error) {
      result.failed += 1;
      const message = error instanceof Error ? error.message : 'Unknown retry error';
      const nextSeconds = Math.floor(calculateBackoffMs(event.attempts + 1) / 1000);

      await prisma.$executeRaw`
        UPDATE webhook_events
        SET status = 'failed',
            attempts = attempts + 1,
            last_error = ${message},
            next_retry_at = NOW() + make_interval(secs => ${nextSeconds}),
            updated_at = NOW()
        WHERE id = ${event.id}
      `;

      if (event.attempts + 1 >= MAX_RETRIES) {
        await sendAlertIfConfigured(`Webhook retry exhausted for event ${event.id}: ${message}`);
      }
    }
  }

  return result;
}
