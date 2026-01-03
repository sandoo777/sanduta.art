import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    logger.info('API:Register', 'Registration attempt', { email });

    if (!name || !email || !password) {
      logger.warn('API:Register', 'Missing required fields', { hasName: !!name, hasEmail: !!email, hasPassword: !!password });
      return createErrorResponse('Name, email, and password are required', 400);
    }

    if (password.length < 6) {
      logger.warn('API:Register', 'Password too short', { email });
      return createErrorResponse('Password must be at least 6 characters', 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      logger.warn('API:Register', 'User already exists', { email });
      return createErrorResponse('User already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    logger.info('API:Register', 'User created successfully', { userId: user.id, email: user.email });

    return NextResponse.json({ message: "User created", user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    logApiError('API:Register', error, { action: 'create_user' });
    return createErrorResponse('Registration failed. Please try again later.', 500);
  }
}