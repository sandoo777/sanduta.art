/**
 * Admin Monitoring API - Security Events
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { useSecurityMonitoring } from '@/modules/monitoring/useSecurityMonitoring';

// GET /api/admin/monitoring/security
export async function GET(_request: NextRequest) {
  const { user, error } = await requireRole(['ADMIN']);
  if (error) return error;

  try {
    const security = useSecurityMonitoring();
    const events = security.getRecentEvents(100);

    return NextResponse.json(events);
  } catch (err) {
    console.error('Failed to fetch security events:', err);
    return NextResponse.json(
      { error: 'Failed to fetch security events' },
      { status: 500 }
    );
  }
}
