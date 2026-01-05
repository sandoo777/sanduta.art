import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify session belongs to user
    const userSession = await prisma.userSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id
      }
    });

    if (!userSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Revoke session
    await prisma.userSession.update({
      where: { id: sessionId },
      data: { isActive: false }
    });

    // Log activity
    const headers = request.headers;
    await prisma.securityActivity.create({
      data: {
        userId: user.id,
        type: 'SESSION_REVOKED',
        description: `Sesiunea de pe ${userSession.deviceName || 'dispozitiv necunoscut'} a fost revocată`,
        ipAddress: headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown',
        userAgent: headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({ success: true, message: 'Sesiunea a fost revocată' });
  } catch (error) {
    console.error('Error revoking session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
