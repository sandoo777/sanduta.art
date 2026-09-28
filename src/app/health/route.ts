import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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

async function checkDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

async function checkQueue() {
  try {
    await ensureWebhookEventsTable();

    const rows = await prisma.$queryRaw<Array<{ pending_count: number }>>`
      SELECT COUNT(*)::int AS pending_count
      FROM webhook_events
      WHERE status IN ('pending', 'failed')
        AND (next_retry_at IS NULL OR next_retry_at <= NOW())
    `;

    const pending = rows[0]?.pending_count ?? 0;
    return {
      ok: pending < 50,
      pending,
    };
  } catch {
    return {
      ok: false,
      pending: -1,
    };
  }
}

export async function GET() {
  const [dbOk, queue] = await Promise.all([checkDatabase(), checkQueue()]);

  const status = dbOk && queue.ok ? 'ok' : 'degraded';
  const code = status === 'ok' ? 200 : 503;

  return NextResponse.json(
    {
      status,
      checks: {
        database: dbOk ? 'ok' : 'error',
        queue: queue.ok ? 'ok' : 'error',
      },
      queuePending: queue.pending,
      timestamp: new Date().toISOString(),
    },
    { status: code }
  );
}
