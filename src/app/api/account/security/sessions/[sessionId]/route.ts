import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth-middleware';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { logAuditAction, AUDIT_ACTIONS } from '@/lib/audit-log';

export const DELETE = withAuth(
  async (request: NextRequest, { params, user }) => {
    try {
      // Rate limiting
      const rateLimitResult = await rateLimit(request, RATE_LIMITS.API_STRICT);
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { error: rateLimitResult.error },
          { status: 429 }
        );
      }

      const { sessionId } = await params;

      // Verify session belongs to user
      const userSession = await prisma.userSession.findFirst({
        where: {
          id: sessionId,
          userId: user.id
        },
        select: {
          id: true,
          deviceName: true,
          ipAddress: true,
        },
      });

      if (!userSession) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      // Revoke session
      await prisma.userSession.update({
        where: { id: sessionId },
        data: { isActive: false }
      });

      // Audit log
      await logAuditAction({
        userId: user.id,
        action: AUDIT_ACTIONS.SESSION_REVOKE,
        resourceType: 'session',
        resourceId: sessionId,
        details: {
          deviceName: userSession.deviceName,
          ipAddress: userSession.ipAddress,
        },
      });

      return NextResponse.json({ success: true, message: 'Sesiunea a fost revocată' });
    } catch (error) {
      console.error('Error revoking session:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
);
