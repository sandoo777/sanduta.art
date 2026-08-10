import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { createErrorResponse, logApiError, logger } from '@/lib/logger';
import { COLOR_MODE_VALUES, isColorModeValue } from '@/modules/print-methods/colorModes';

const methodUpdateSchema = z.object({
  name: z.string().min(1).trim().optional(),
  type: z.string().min(1).trim().optional(),
  colorMode: z.enum(COLOR_MODE_VALUES).optional().nullable(),
  active: z.boolean().optional(),
  materials: z.array(z.string()).optional(),
  equipment: z.array(z.string()).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER', 'OPERATOR']);
    if (error) return error;

    const { id } = await params;
    logger.info('API:Methods', 'Fetching method by id', { userId: user.id, methodId: id });

    const method = await prisma.printMethod.findUnique({
      where: { id },
      include: {
        materials: true,
        equipment: true,
      },
    });

    if (!method) {
      return NextResponse.json({ error: 'Method not found' }, { status: 404 });
    }

    return NextResponse.json(method);
  } catch (error) {
    logApiError('API:Methods', error);
    return createErrorResponse('Failed to fetch method', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const body = await request.json();
    if (body && typeof body === 'object' && 'colorMode' in body) {
      const colorModeValue = (body as { colorMode?: unknown }).colorMode;
      if (colorModeValue === '') {
        (body as { colorMode?: unknown }).colorMode = null;
      } else if (colorModeValue != null && !isColorModeValue(colorModeValue)) {
        return NextResponse.json({ error: 'Mod culoare invalid' }, { status: 400 });
      }
    }

    const payload = methodUpdateSchema.safeParse(body);
    if (!payload.success) {
      return NextResponse.json({ error: 'Validation failed', details: payload.error.errors }, { status: 400 });
    }

    const data = payload.data;
    const { id } = await params;

    logger.info('API:Methods', 'Updating method', { userId: user.id, methodId: id });

    if (data.materials && data.materials.length > 0) {
      const materialsCount = await prisma.material.count({ where: { id: { in: data.materials } } });
      if (materialsCount !== data.materials.length) {
        return NextResponse.json({ error: 'One or more material IDs are invalid' }, { status: 400 });
      }
    }

    if (data.equipment && data.equipment.length > 0) {
      const equipmentCount = await prisma.machine.count({ where: { id: { in: data.equipment } } });
      if (equipmentCount !== data.equipment.length) {
        return NextResponse.json({ error: 'One or more equipment IDs are invalid' }, { status: 400 });
      }
    }

    const method = await prisma.printMethod.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.colorMode !== undefined ? { colorMode: data.colorMode } : {}),
        ...(data.active !== undefined ? { active: data.active } : {}),
        ...(data.materials !== undefined
          ? { materials: { set: data.materials.map((materialId) => ({ id: materialId })) } }
          : {}),
        ...(data.equipment !== undefined
          ? { equipment: { set: data.equipment.map((equipmentId) => ({ id: equipmentId })) } }
          : {}),
      },
      include: {
        materials: true,
        equipment: true,
      },
    });

    return NextResponse.json(method);
  } catch (error) {
    logApiError('API:Methods', error);
    return createErrorResponse('Failed to update method', 500);
  }
}

export const PATCH = PUT;
