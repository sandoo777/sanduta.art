import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';
import { z } from 'zod';

// Validation schema for creating consumable
const createConsumableSchema = z.object({
  materialId: z.string().min(1, 'Material ID is required'),
  costPerSqm: z.number().min(0).optional(),
  costPerJob: z.number().min(0).optional(),
  active: z.boolean().default(true),
  notes: z.string().optional(),
}).refine(
  (data) => data.costPerSqm !== undefined || data.costPerJob !== undefined,
  { message: 'At least one cost field (costPerSqm or costPerJob) is required' }
);

// GET /api/admin/print-methods/[id]/consumables - List consumables for a print method
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER', 'OPERATOR']);
    if (error) return error;

    const { id: printMethodId } = await params;

    logger.info('API:PrintMethodConsumables', 'Fetching consumables', {
      userId: user.id,
      printMethodId,
    });

    // Check if print method exists
    const printMethod = await prisma.printMethod.findUnique({
      where: { id: printMethodId },
      select: { id: true, name: true },
    });

    if (!printMethod) {
      return NextResponse.json(
        { error: 'Print method not found' },
        { status: 404 }
      );
    }

    // Fetch consumables
    const consumables = await prisma.printMethodConsumable.findMany({
      where: { printMethodId },
      include: {
        material: {
          select: {
            id: true,
            name: true,
            unit: true,
            stock: true,
            pricePerUnit: true,
            active: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format response
    const formatted = consumables.map((c) => ({
      ...c,
      costPerSqm: c.costPerSqm ? Number(c.costPerSqm) : null,
      costPerJob: c.costPerJob ? Number(c.costPerJob) : null,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      material: {
        ...c.material,
        pricePerUnit: c.material.pricePerUnit ? Number(c.material.pricePerUnit) : null,
      },
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    logApiError('API:PrintMethodConsumables', err);
    return createErrorResponse('Failed to fetch consumables', 500);
  }
}

// POST /api/admin/print-methods/[id]/consumables - Create new consumable
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { id: printMethodId } = await params;
    const body = await request.json();

    const validationResult = createConsumableSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    logger.info('API:PrintMethodConsumables', 'Creating consumable', {
      userId: user.id,
      printMethodId,
      materialId: data.materialId,
    });

    // Check if print method exists
    const printMethod = await prisma.printMethod.findUnique({
      where: { id: printMethodId },
      select: { id: true, name: true },
    });

    if (!printMethod) {
      return NextResponse.json(
        { error: 'Print method not found' },
        { status: 404 }
      );
    }

    // Check if material exists
    const material = await prisma.material.findUnique({
      where: { id: data.materialId },
      select: { id: true, name: true },
    });

    if (!material) {
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      );
    }

    // Check for duplicate
    const existing = await prisma.printMethodConsumable.findFirst({
      where: {
        printMethodId,
        materialId: data.materialId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'This material is already added as a consumable for this print method' },
        { status: 409 }
      );
    }

    // Create consumable
    const consumable = await prisma.printMethodConsumable.create({
      data: {
        printMethodId,
        materialId: data.materialId,
        costPerSqm: data.costPerSqm ?? null,
        costPerJob: data.costPerJob ?? null,
        active: data.active,
        notes: data.notes ?? null,
      },
      include: {
        material: {
          select: {
            id: true,
            name: true,
            unit: true,
            stock: true,
            pricePerUnit: true,
            active: true,
          },
        },
      },
    });

    logger.info('API:PrintMethodConsumables', 'Consumable created', {
      id: consumable.id,
      printMethodId,
      materialId: data.materialId,
    });

    // Format response
    const formatted = {
      ...consumable,
      costPerSqm: consumable.costPerSqm ? Number(consumable.costPerSqm) : null,
      costPerJob: consumable.costPerJob ? Number(consumable.costPerJob) : null,
      createdAt: consumable.createdAt.toISOString(),
      updatedAt: consumable.updatedAt.toISOString(),
      material: {
        ...consumable.material,
        pricePerUnit: consumable.material.pricePerUnit ? Number(consumable.material.pricePerUnit) : null,
      },
    };

    return NextResponse.json(formatted, { status: 201 });
  } catch (err) {
    logApiError('API:PrintMethodConsumables', err);
    return createErrorResponse('Failed to create consumable', 500);
  }
}
