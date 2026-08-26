import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';
import { z } from 'zod';

// Validation schema for updating consumable
const updateConsumableSchema = z.object({
  costPerSqm: z.number().min(0).optional().nullable(),
  costPerJob: z.number().min(0).optional().nullable(),
  active: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

// PATCH /api/admin/print-methods/[id]/consumables/[consumableId] - Update consumable
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; consumableId: string }> }
) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { id: printMethodId, consumableId } = await params;
    const body = await request.json();

    const validationResult = updateConsumableSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    logger.info('API:PrintMethodConsumables', 'Updating consumable', {
      userId: user.id,
      printMethodId,
      consumableId,
    });

    // Check if consumable exists and belongs to the print method
    const existingConsumable = await prisma.printMethodConsumable.findFirst({
      where: {
        id: consumableId,
        printMethodId,
      },
    });

    if (!existingConsumable) {
      return NextResponse.json(
        { error: 'Consumable not found or does not belong to this print method' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};
    
    if (data.costPerSqm !== undefined) updateData.costPerSqm = data.costPerSqm;
    if (data.costPerJob !== undefined) updateData.costPerJob = data.costPerJob;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.notes !== undefined) updateData.notes = data.notes;

    // Update consumable
    const consumable = await prisma.printMethodConsumable.update({
      where: { id: consumableId },
      data: updateData,
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

    logger.info('API:PrintMethodConsumables', 'Consumable updated', {
      id: consumable.id,
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

    return NextResponse.json(formatted);
  } catch (err) {
    logApiError('API:PrintMethodConsumables', err);
    return createErrorResponse('Failed to update consumable', 500);
  }
}

// DELETE /api/admin/print-methods/[id]/consumables/[consumableId] - Delete consumable
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; consumableId: string }> }
) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { id: printMethodId, consumableId } = await params;

    logger.info('API:PrintMethodConsumables', 'Deleting consumable', {
      userId: user.id,
      printMethodId,
      consumableId,
    });

    // Check if consumable exists and belongs to the print method
    const existingConsumable = await prisma.printMethodConsumable.findFirst({
      where: {
        id: consumableId,
        printMethodId,
      },
    });

    if (!existingConsumable) {
      return NextResponse.json(
        { error: 'Consumable not found or does not belong to this print method' },
        { status: 404 }
      );
    }

    // Delete consumable
    await prisma.printMethodConsumable.delete({
      where: { id: consumableId },
    });

    logger.info('API:PrintMethodConsumables', 'Consumable deleted', {
      id: consumableId,
    });

    return NextResponse.json({
      success: true,
      message: 'Consumable deleted successfully',
    });
  } catch (err) {
    logApiError('API:PrintMethodConsumables', err);
    return createErrorResponse('Failed to delete consumable', 500);
  }
}
