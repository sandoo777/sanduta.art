import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRole } from "@/lib/auth-middleware";
import { UserRole } from "@prisma/client";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export const GET = withRole(
  [UserRole.ADMIN],
  async (request: NextRequest, { user }) => {
    try {
      // Rate limiting
      const rateLimitResult = await rateLimit(request, RATE_LIMITS.API_GENERAL);
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { error: rateLimitResult.error },
          { status: 429 }
        );
      }

      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return NextResponse.json(users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
  }
);