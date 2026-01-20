import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { authenticator } from 'otplib';
import bcrypt from 'bcryptjs';

export async function POST(_request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { secret, code, backupCodes } = await request.json();

    if (!secret || !code || !backupCodes) {
      return NextResponse.json(
        { error: 'Toate câmpurile sunt obligatorii' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, twoFactorEnabled: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA este deja activat' },
        { status: 400 }
      );
    }

    // Verify the code
    const isValid = authenticator.verify({ token: code, secret });

    if (!isValid) {
      return NextResponse.json(
        { error: 'Codul de verificare este incorect' },
        { status: 400 }
      );
    }

    // Hash backup codes
    const hashedBackupCodes = await Promise.all(
      backupCodes.map((code: string) => bcrypt.hash(code, 10))
    );

    // Enable 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        backupCodes: hashedBackupCodes
      }
    });

    // Log activity
    const headers = request.headers;
    await prisma.securityActivity.create({
      data: {
        userId: user.id,
        type: 'TWO_FACTOR_ENABLED',
        description: 'Autentificarea în doi pași a fost activată',
        ipAddress: headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown',
        userAgent: headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Autentificarea în doi pași a fost activată cu succes' 
    });
  } catch (_error) {
    console.error('Error enabling 2FA:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
