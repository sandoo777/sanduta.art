import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { signOut } from 'next-auth/react';

export async function POST(request: Request) {
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

    // Revoke all active sessions
    await prisma.userSession.updateMany({
      where: {
        userId: user.id,
        isActive: true
      },
      data: {
        isActive: false
      }
    });

    // Log activity
    const headers = request.headers;
    await prisma.securityActivity.create({
      data: {
        userId: user.id,
        type: 'SESSION_REVOKED',
        description: 'Toate sesiunile au fost revocate',
        ipAddress: headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown',
        userAgent: headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Toate sesiunile au fost revocate' 
    });
  } catch (error) {
    console.error('Error revoking all sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
