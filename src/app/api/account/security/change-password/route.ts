import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Toate câmpurile sunt obligatorii' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Parola nouă trebuie să aibă minim 8 caractere' },
        { status: 400 }
      );
    }

    // Verifică dacă parola conține litere mari, mici, cifre și simboluri
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return NextResponse.json(
        { error: 'Parola trebuie să conțină litere mari, mici, cifre și simboluri' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, password: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilizator negăsit' }, { status: 404 });
    }

    // Verifică parola actuală
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Parola actuală este incorectă' },
        { status: 400 }
      );
    }

    // Hash parola nouă
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizează parola
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    // Log activitate
    const headers = request.headers;
    await prisma.securityActivity.create({
      data: {
        userId: user.id,
        type: 'PASSWORD_CHANGE',
        description: 'Parola a fost schimbată cu succes',
        ipAddress: headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown',
        userAgent: headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({ success: true, message: 'Parola a fost schimbată cu succes' });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
