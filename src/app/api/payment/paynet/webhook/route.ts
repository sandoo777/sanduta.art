import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paynetClient } from '@/lib/paynet';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const MAX_RETRIES = 5;

function calculateBackoffSeconds(attempt: number): number {
  const safeAttempt = Math.max(0, attempt);
  return 2 ** safeAttempt;
}

function deriveIdempotencyKey(request: NextRequest, body: string, sessionId?: string): string {
  const explicit = request.headers.get('x-idempotency-key');
  if (explicit) {
    return explicit;
  }

  const nonce = request.headers.get('x-webhook-id');
  if (nonce) {
    return nonce;
  }

  return `paynet:${sessionId ?? 'unknown'}:${Buffer.from(body).toString('base64').slice(0, 64)}`;
}

async function ensureWebhookEventsTable() {
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
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-signature') || '';
    const body = await request.text();

    // Verify webhook signature
    const isValid = await paynetClient.verifyWebhook(signature, body);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data = JSON.parse(body);
    const { session_id, order_id, status } = data;
    const idempotencyKey = deriveIdempotencyKey(request, body, session_id);

    if (!session_id || !order_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await ensureWebhookEventsTable();

    const inserted = await prisma.$queryRaw<Array<{ id: string }>>`
      INSERT INTO webhook_events (id, idempotency_key, event_type, payload, status)
      VALUES (${idempotencyKey}, ${idempotencyKey}, 'paynet_webhook', ${JSON.stringify(data)}::jsonb, 'pending')
      ON CONFLICT (idempotency_key) DO NOTHING
      RETURNING id
    `;

    if (inserted.length === 0) {
      const existing = await prisma.$queryRaw<Array<{ status: string }>>`
        SELECT status
        FROM webhook_events
        WHERE idempotency_key = ${idempotencyKey}
        LIMIT 1
      `;

      return NextResponse.json(
        {
          message: 'Duplicate webhook ignored',
          status: existing[0]?.status ?? 'unknown',
        },
        { status: 200 }
      );
    }

    const webhookEventId = inserted[0].id;

    const paymentStatus =
      status === 'completed' ? 'PAID' :
      status === 'failed'    ? 'FAILED' :
                               'PENDING';

    const orderStatus =
      paymentStatus === 'PAID' ? 'IN_PREPRODUCTION' : 'PENDING';

    const order = await prisma.order.findUnique({
      where: { id: order_id },
      select: { id: true, paymentStatus: true },
    });

    if (!order) {
      await prisma.$executeRaw`
        UPDATE webhook_events
        SET status = 'failed',
            attempts = attempts + 1,
            last_error = 'Order not found',
            next_retry_at = NOW() + make_interval(secs => ${calculateBackoffSeconds(1)}),
            updated_at = NOW()
        WHERE id = ${webhookEventId}
      `;

      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id: order_id },
        data: { paymentStatus, status: orderStatus },
      }),
      prisma.orderTimeline.create({
        data: {
          orderId: order_id,
          eventType: 'payment_update',
          description: `Plată ${paymentStatus === 'PAID' ? 'confirmată' : paymentStatus === 'FAILED' ? 'eșuată' : 'în așteptare'} via Paynet`,
          eventData: {
            sessionId: session_id,
            previousPaymentStatus: order.paymentStatus,
            newPaymentStatus: paymentStatus,
            rawStatus: status,
          },
        },
      }),
    ]);

    await prisma.$executeRaw`
      UPDATE webhook_events
      SET status = 'processed',
          processed_at = NOW(),
          updated_at = NOW()
      WHERE id = ${webhookEventId}
    `;

    return NextResponse.json({ message: 'Webhook processed' }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown webhook error';
    logger.error('API:PaynetWebhook', 'Error processing webhook', { error: message });

    const idempotencyKey = request.headers.get('x-idempotency-key');
    if (idempotencyKey) {
      const row = await prisma.$queryRaw<Array<{ id: string; attempts: number }>>`
        SELECT id, attempts
        FROM webhook_events
        WHERE idempotency_key = ${idempotencyKey}
        LIMIT 1
      `;

      if (row[0]) {
        const nextAttempt = row[0].attempts + 1;
        const canRetry = nextAttempt < MAX_RETRIES;
        const nextRetrySeconds = calculateBackoffSeconds(nextAttempt);
        await prisma.$executeRaw`
          UPDATE webhook_events
          SET status = 'failed',
              attempts = attempts + 1,
              last_error = ${message},
              next_retry_at = CASE
                WHEN ${canRetry} THEN NOW() + make_interval(secs => ${nextRetrySeconds})
                ELSE NULL
              END,
              updated_at = NOW()
          WHERE id = ${row[0].id}
        `;
      }
    }

    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}
