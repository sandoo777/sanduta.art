import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError } from '@/lib/logger';
import { reconcilePayments } from '@/jobs/reconcilePayments';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const { user, error } = await requireRole(['ADMIN']);
  if (error) {
    return error;
  }

  try {
    const body = await request.json().catch(() => ({}));
    const limit = typeof body?.limit === 'number' ? body.limit : 100;

    logger.info('API:PaymentsReconcile', 'Manual reconcile triggered', {
      userId: user?.id,
      limit,
    });

    const summary = await reconcilePayments({ limit });

    return NextResponse.json({
      ok: true,
      summary,
    });
  } catch (err) {
    logApiError('API:PaymentsReconcile', err);
    return NextResponse.json({ error: 'Failed to reconcile payments' }, { status: 500 });
  }
}
