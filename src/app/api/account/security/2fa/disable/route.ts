import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { authenticator } from 'otplib';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Codul de verificare este obligatoriu' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, twoFactorEnabled: true, twoFactorSecret: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: '2FA nu este activat' },
        { status: 400 }
      );
    }

    // Verify the code
    const isValid = authenticator.verify({ 
      token: code, 
      secret: user.twoFactorSecret 
    });

    if (!isValid) {
      return NextResponse.json(
        { error: 'Codul de verificare este incorect' },
        { status: 400 }
      );
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: []
      }
    });

    // Log activity
    const headers = request.headers;
    await prisma.securityActivity.create({
      data: {
        userId: user.id,
        type: 'TWO_FACTOR_DISABLED',
        description: 'Autentificarea în doi pași a fost dezactivată',
        ipAddress: headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown',
        userAgent: headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Autentificarea în doi pași a fost dezactivată' 
    });
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
