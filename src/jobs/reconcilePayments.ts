import { PaymentStatus, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { paynetClient } from '@/lib/paynet';
import { logger } from '@/lib/logger';

export interface ReconcileSummary {
  scanned: number;
  updated: number;
  unchanged: number;
  failed: number;
  errors: string[];
}

export interface ReconcileOptions {
  limit?: number;
  staleMinutes?: number;
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
    logger.error('Jobs:ReconcilePayments', 'Failed to send alert', {
      error: error instanceof Error ? error.message : 'Unknown alert error',
    });
  }
}

export function mapPaynetStatusToPaymentStatus(status: string | null | undefined): PaymentStatus {
  const normalized = String(status ?? '').toLowerCase();

  if (normalized === 'completed' || normalized === 'paid' || normalized === 'success') {
    return 'PAID';
  }

  if (normalized === 'failed' || normalized === 'cancelled' || normalized === 'canceled') {
    return 'FAILED';
  }

  return 'PENDING';
}

function toOrderStatus(paymentStatus: PaymentStatus): 'IN_PREPRODUCTION' | 'PENDING' {
  return paymentStatus === 'PAID' ? 'IN_PREPRODUCTION' : 'PENDING';
}

export async function reconcilePayments(options: ReconcileOptions = {}): Promise<ReconcileSummary> {
  const staleMinutes = options.staleMinutes ?? 5;
  const limit = options.limit ?? 100;
  const staleBefore = new Date(Date.now() - staleMinutes * 60 * 1000);

  const summary: ReconcileSummary = {
    scanned: 0,
    updated: 0,
    unchanged: 0,
    failed: 0,
    errors: [],
  };

  const candidates = await prisma.order.findMany({
    where: {
      paymentStatus: 'PENDING',
      paynetSessionId: { not: null },
      createdAt: { lte: staleBefore },
    },
    select: {
      id: true,
      paymentStatus: true,
      status: true,
      paynetSessionId: true,
    },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });

  summary.scanned = candidates.length;

  for (const order of candidates) {
    try {
      const session = await paynetClient.getSessionStatus(order.paynetSessionId as string);
      const paymentStatus = mapPaynetStatusToPaymentStatus((session.status as string | undefined) ?? null);

      if (paymentStatus === order.paymentStatus) {
        summary.unchanged += 1;
        continue;
      }

      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus,
            status: toOrderStatus(paymentStatus),
          },
        }),
        prisma.orderTimeline.create({
          data: {
            orderId: order.id,
            eventType: 'payment_reconciled',
            description: `Payment reconciled from ${order.paymentStatus} to ${paymentStatus}`,
            eventData: {
              previousPaymentStatus: order.paymentStatus,
              newPaymentStatus: paymentStatus,
              source: 'reconcile_job',
            } as Prisma.InputJsonValue,
          },
        }),
      ]);

      summary.updated += 1;
    } catch (error) {
      summary.failed += 1;
      const message = error instanceof Error ? error.message : 'Unknown reconcile error';
      summary.errors.push(`${order.id}: ${message}`);
      logger.error('Jobs:ReconcilePayments', 'Failed reconciling order', {
        orderId: order.id,
        error: message,
      });
    }
  }

  if (summary.failed >= 3) {
    await sendAlertIfConfigured(
      `Payments reconcile failures: ${summary.failed}/${summary.scanned}. First error: ${summary.errors[0] ?? 'n/a'}`
    );
  }

  return summary;
}
