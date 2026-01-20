import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { hash, compare } from 'bcryptjs';
import { logger, createErrorResponse } from '@/lib/logger';

export async function POST(_req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { currentPassword, newPassword } = await req.json();

    logger.info('API:Account', 'Changing password', { userId: user.id });

    // Get user with password
    const userWithPassword = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    });

    if (!userWithPassword?.password) {
      return createErrorResponse('User not found', 404);
    }

    // Verify current password
    const isValid = await compare(currentPassword, userWithPassword.password);
    if (!isValid) {
      return createErrorResponse('Current password is incorrect', 401);
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    logger.info('API:Account', 'Password changed successfully', { userId: user.id });

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error('API:Account', 'Error changing password', { error: err });
    return createErrorResponse('Failed to change password', 500);
  }
}
