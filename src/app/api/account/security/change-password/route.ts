import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth-middleware';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { validateInput, passwordSchema } from '@/lib/validation';
import { logAuditAction, AUDIT_ACTIONS } from '@/lib/audit-log';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Parola actuală este obligatorie'),
  newPassword: passwordSchema,
});

export const POST = withAuth(
  async (request: NextRequest, { user }) => {
    try {
      // Rate limiting strict pentru schimbare parolă
      const rateLimitResult = await rateLimit(request, RATE_LIMITS.PASSWORD_RESET);
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { error: rateLimitResult.error },
          { status: 429 }
        );
      }

      const body = await request.json();

      // Validate input
      const validation = await validateInput(changePasswordSchema, body);
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Date invalide', details: validation.errors },
          { status: 400 }
        );
      }

      const { currentPassword, newPassword } = validation.data;

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, password: true, email: true }
      });

      if (!dbUser) {
        return NextResponse.json({ error: 'Utilizator negăsit' }, { status: 404 });
      }

      // Verifică parola actuală
      const isValid = await bcrypt.compare(currentPassword, dbUser.password);
      if (!isValid) {
        // Log failed attempt
        await logAuditAction({
          userId: user.id,
          action: AUDIT_ACTIONS.PASSWORD_CHANGE,
          resourceType: 'user',
          resourceId: user.id,
          details: { success: false, reason: 'invalid_current_password' },
        });

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

      // Audit log success
      await logAuditAction({
        userId: user.id,
        action: AUDIT_ACTIONS.PASSWORD_CHANGE,
        resourceType: 'user',
        resourceId: user.id,
        details: { success: true },
      });

      return NextResponse.json({
        success: true,
        message: 'Parola a fost schimbată cu succes'
      });
    } catch (_error) {
      console.error('Error changing password:', error);
      return NextResponse.json(
        { error: 'Eroare la schimbarea parolei' },
        { status: 500 }
      );
    }
  }
);
