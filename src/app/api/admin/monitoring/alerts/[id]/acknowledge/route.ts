/**
 * Admin Monitoring API - Acknowledge Alert
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { useAlerts } from '@/modules/monitoring/useAlerts';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error } = await requireRole(['ADMIN']);
  if (error) return error;

  try {
    const alerts = useAlerts();
    await alerts.acknowledgeAlert(params.id, user.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to acknowledge alert:', err);
    return NextResponse.json(
      { error: 'Failed to acknowledge alert' },
      { status: 500 }
    );
  }
}
