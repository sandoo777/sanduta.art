import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { createErrorResponse, logApiError, logger } from '@/lib/logger';
import { COLOR_MODE_VALUES, isColorModeValue } from '@/modules/print-methods/colorModes';

const methodSchema = z.object({
  name: z.string().min(1).trim(),
  type: z.string().min(1).trim(),
  colorMode: z.enum(COLOR_MODE_VALUES).optional().nullable(),
  active: z.boolean().optional().default(true),
  materials: z.array(z.string()).optional().default([]),
  equipment: z.array(z.string()).optional().default([]),
});

export async function GET() {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER', 'OPERATOR']);
    if (error) return error;

    logger.info('API:Methods', 'Fetching methods', { userId: user.id });

    const methods = await prisma.printMethod.findMany({
      orderBy: { name: 'asc' },
      include: {
        materials: true,
        equipment: true,
      },
    });

    return NextResponse.json(methods);
  } catch (error) {
    logApiError('API:Methods', error);
    return createErrorResponse('Failed to fetch methods', 500);
  }
}

export async function POST(request: NextRequest) {
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

    const payload = methodSchema.safeParse(body);
    if (!payload.success) {
      return NextResponse.json({ error: 'Validation failed', details: payload.error.errors }, { status: 400 });
    }

    const data = payload.data;

    logger.info('API:Methods', 'Creating method', { userId: user.id, name: data.name });

    if (data.materials.length > 0) {
      const materialsCount = await prisma.material.count({ where: { id: { in: data.materials } } });
      if (materialsCount !== data.materials.length) {
        return NextResponse.json({ error: 'One or more material IDs are invalid' }, { status: 400 });
      }
    }

    if (data.equipment.length > 0) {
      const equipmentCount = await prisma.machine.count({ where: { id: { in: data.equipment } } });
      if (equipmentCount !== data.equipment.length) {
        return NextResponse.json({ error: 'One or more equipment IDs are invalid' }, { status: 400 });
      }
    }

    const method = await prisma.printMethod.create({
      data: {
        name: data.name,
        type: data.type,
        colorMode: data.colorMode ?? null,
        active: data.active,
        materials: { connect: data.materials.map((id) => ({ id })) },
        equipment: { connect: data.equipment.map((id) => ({ id })) },
      },
      include: {
        materials: true,
        equipment: true,
      },
    });

    return NextResponse.json(method, { status: 201 });
  } catch (error) {
    logApiError('API:Methods', error);
    return createErrorResponse('Failed to create method', 500);
  }
}
