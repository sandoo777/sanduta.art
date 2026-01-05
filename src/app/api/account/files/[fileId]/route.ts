import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-middleware";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { logAuditAction, AUDIT_ACTIONS } from "@/lib/audit-log";

export const GET = withAuth(
  async (request: NextRequest, { params, user }) => {
    try {
      // Rate limiting
      const rateLimitResult = await rateLimit(request, RATE_LIMITS.API_GENERAL);
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { error: rateLimitResult.error },
          { status: 429 }
        );
      }

      const { fileId } = await params;

      const file = await prisma.userFile.findFirst({
        where: { id: fileId, userId: user.id },
        include: {
          versions: {
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!file) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }

      return NextResponse.json({
        id: file.id,
        name: file.name,
        type: file.type,
        size: file.size,
        thumbnailUrl: file.thumbnailUrl,
        previewUrl: file.previewUrl,
        originalUrl: file.originalUrl,
        createdAt: file.createdAt.toISOString(),
        updatedAt: file.updatedAt.toISOString(),
        lastUsedAt: file.lastUsedAt ? file.lastUsedAt.toISOString() : null,
        versionCount: file.versions.length,
        versions: file.versions.map((version) => ({
          id: version.id,
          variant: version.variant,
          format: version.format,
          size: version.size,
          url: version.url,
          createdAt: version.createdAt.toISOString(),
          metadata: version.metadata,
        })),
      });
    } catch (error) {
      console.error("Error fetching file", error);
      return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
    }
  }
);

export const DELETE = withAuth(
  async (request: NextRequest, { params, user }) => {
    try {
      // Rate limiting strict pentru delete
      const rateLimitResult = await rateLimit(request, RATE_LIMITS.API_STRICT);
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { error: rateLimitResult.error },
          { status: 429 }
        );
      }

      const { fileId } = await params;

      // Ownership verification
      const file = await prisma.userFile.findFirst({
        where: { id: fileId, userId: user.id },
        select: { id: true, name: true, type: true, size: true },
      });

      if (!file) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }

      await prisma.userFile.delete({ where: { id: fileId } });

      // Audit log
      await logAuditAction({
        userId: user.id,
        action: AUDIT_ACTIONS.FILE_DELETE,
        resourceType: 'file',
        resourceId: fileId,
        details: {
          name: file.name,
          type: file.type,
          size: file.size,
        },
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error deleting file", error);
      return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
    }
  }
);
