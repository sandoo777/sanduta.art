/**
 * Admin Monitoring API - Alerts
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { useAlerts } from '@/modules/monitoring/useAlerts';

// GET /api/admin/monitoring/alerts
export async function GET(request: NextRequest) {
  const { user, error } = await requireRole(['ADMIN']);
  if (error) return error;

  try {
    const alerts = useAlerts();
    const recentAlerts = alerts.getRecentAlerts(50);

    return NextResponse.json(recentAlerts);
  } catch (err) {
    console.error('Failed to fetch alerts:', err);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}
