import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Force create admin - useful for initial setup
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, secret } = body;

    // Simple security check - you should change this secret
    if (secret !== 'create-admin-2026') {
      return NextResponse.json(
        { error: 'Secret invalid' },
        { status: 403 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email și parola sunt obligatorii' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Try to find existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    let admin;
    if (existingUser) {
      // Update existing user
      admin = await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          name: name || existingUser.name,
        },
      });
    } else {
      // Create new user
      admin = await prisma.user.create({
        data: {
          email,
          name: name || 'Administrator',
          password: hashedPassword,
          role: 'ADMIN',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: existingUser ? 'Admin updated' : 'Admin created',
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error: unknown) {
    console.error('Force create admin error:', error);
    return NextResponse.json(
      { 
        error: 'Eroare la crearea adminului',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
