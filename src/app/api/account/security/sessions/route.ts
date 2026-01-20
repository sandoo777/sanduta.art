import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_request: Request) {
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

    const sessions = await prisma.userSession.findMany({
      where: {
        userId: user.id,
        isActive: true
      },
      orderBy: {
        lastActivity: 'desc'
      }
    });

    return NextResponse.json({ sessions });
  } catch (_error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(_request: Request) {
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

    // Create new session record
    const headers = request.headers;
    const userAgent = headers.get('user-agent') || 'unknown';
    const ipAddress = headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown';

    // Parse user agent to get device/browser info
    const deviceName = userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop';
    const browser = userAgent.includes('Chrome') ? 'Chrome' : 
                    userAgent.includes('Firefox') ? 'Firefox' :
                    userAgent.includes('Safari') ? 'Safari' : 'Unknown';
    const os = userAgent.includes('Windows') ? 'Windows' :
               userAgent.includes('Mac') ? 'macOS' :
               userAgent.includes('Linux') ? 'Linux' :
               userAgent.includes('Android') ? 'Android' :
               userAgent.includes('iOS') ? 'iOS' : 'Unknown';

    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await prisma.userSession.create({
      data: {
        userId: user.id,
        sessionToken,
        deviceName,
        browser,
        os,
        ipAddress,
        expiresAt
      }
    });

    return NextResponse.json({ success: true, sessionToken });
  } catch (_error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
