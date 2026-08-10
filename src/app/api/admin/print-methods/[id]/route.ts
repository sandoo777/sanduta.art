import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

type PrintMethodConsumableDto = {
  id: string;
  costPerSqm: Prisma.Decimal | null;
  costPerJob: Prisma.Decimal | null;
  createdAt: Date;
  updatedAt: Date;
  material: {
    id: string;
    name: string;
    unit: string;
    stock: number;
    pricePerUnit: Prisma.Decimal | null;
  };
};

type PrintMethodLoadedRelations = {
  compatibleMaterials: Array<{
    id: string;
    name: string;
    unit: string;
    active: boolean;
  }>;
  compatibleEquipment: Array<{
    id: string;
    name: string;
    type: string;
    active: boolean;
  }>;
  consumables: PrintMethodConsumableDto[];
  _count: {
    compatibleMaterials: number;
    compatibleEquipment: number;
    consumables: number;
    productionJobs: number;
    productPrintMethods?: number;
  };
};

function castLoadedRelations<T>(printMethod: T): T & PrintMethodLoadedRelations {
  return printMethod as T & PrintMethodLoadedRelations;
}

function serializeConsumables(consumables: PrintMethodConsumableDto[]) {
  return consumables.map((consumable) => ({
    ...consumable,
    costPerSqm: consumable.costPerSqm ? Number(consumable.costPerSqm) : null,
    costPerJob: consumable.costPerJob ? Number(consumable.costPerJob) : null,
    createdAt: consumable.createdAt.toISOString(),
    updatedAt: consumable.updatedAt.toISOString(),
    material: {
      ...consumable.material,
      pricePerUnit: consumable.material.pricePerUnit ? Number(consumable.material.pricePerUnit) : null,
    },
  }));
}

// Validation schema for updating print method
const updatePrintMethodSchema = z.object({
  name: z.string().min(1).trim().optional(),
  type: z.string().min(1).trim().optional(),
  baseCost: z.number().min(0).nullish(),
  costPerM2: z.number().min(0).nullish(),
  costPerSheet: z.number().min(0).nullish(),
  speed: z.string().nullish(),
  isOutsourced: z.boolean().optional(),
  costFurnizorPerM2: z.number().min(0).nullish(),
  costFurnizorPerUnit: z.number().min(0).nullish(),
  termenFurnizor: z.string().nullish(),
  markup: z.number().min(0).max(1000).nullish(),
  colorMode: z.string().nullish(),
  maxWidth: z.number().int().min(0).nullish(),
  maxHeight: z.number().int().min(0).nullish(),
  description: z.string().nullish(),
  active: z.boolean().optional(),
  compatibleMaterialIds: z.array(z.string()).optional(),
  compatibleEquipmentIds: z.array(z.string()).optional(),
});

// GET /api/admin/print-methods/[id] - Get single print method with all relations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER', 'OPERATOR']);
    if (error) return error;

    const { id } = await params;

    logger.info('API:PrintMethods', 'Fetching print method', { 
      userId: user.id,
      printMethodId: id 
    });

    const printMethod = await prisma.printMethod.findUnique({
      where: { id },
      include: {
        compatibleMaterials: {
          select: {
            id: true,
            name: true,
            unit: true,
            active: true,
          },
        },
        compatibleEquipment: {
          select: {
            id: true,
            name: true,
            type: true,
            active: true,
          },
        },
        consumables: {
          where: { active: true },
          include: {
            material: {
              select: {
                id: true,
                name: true,
                unit: true,
                stock: true,
                pricePerUnit: true,
              },
            },
          },
        },
        _count: {
          select: {
            compatibleMaterials: true,
            compatibleEquipment: true,
            consumables: true,
            productionJobs: true,
            productPrintMethods: true,
          },
        },
      } as never,
    });

    if (!printMethod) {
      return NextResponse.json(
        { error: 'Print method not found' },
        { status: 404 }
      );
    }

    const loadedPrintMethod = castLoadedRelations(printMethod);

    // Format response
    const formatted = {
      ...loadedPrintMethod,
      baseCost: loadedPrintMethod.baseCost ? Number(loadedPrintMethod.baseCost) : null,
      costPerM2: loadedPrintMethod.costPerM2 ? Number(loadedPrintMethod.costPerM2) : null,
      costPerSheet: loadedPrintMethod.costPerSheet ? Number(loadedPrintMethod.costPerSheet) : null,
      costFurnizorPerM2: loadedPrintMethod.costFurnizorPerM2 ? Number(loadedPrintMethod.costFurnizorPerM2) : null,
      costFurnizorPerUnit: loadedPrintMethod.costFurnizorPerUnit ? Number(loadedPrintMethod.costFurnizorPerUnit) : null,
      markup: loadedPrintMethod.markup ? Number(loadedPrintMethod.markup) : null,
      createdAt: loadedPrintMethod.createdAt.toISOString(),
      updatedAt: loadedPrintMethod.updatedAt.toISOString(),
      consumables: serializeConsumables(loadedPrintMethod.consumables ?? []),
    };

    return NextResponse.json(formatted);
  } catch (err) {
    logApiError('API:PrintMethods', err);
    return createErrorResponse('Failed to fetch print method', 500);
  }
}

// PUT /api/admin/print-methods/[id] - Update print method (atomic many-to-many update)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    
    const validationResult = updatePrintMethodSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    logger.info('API:PrintMethods', 'Updating print method', {
      userId: user.id,
      printMethodId: id,
    });

    // Check if print method exists
    const existingMethod = await prisma.printMethod.findUnique({
      where: { id },
    });

    if (!existingMethod) {
      return NextResponse.json(
        { error: 'Print method not found' },
        { status: 404 }
      );
    }

    // Check name uniqueness if name is being changed
    if (data.name && data.name !== existingMethod.name) {
      const duplicate = await prisma.printMethod.findFirst({
        where: { 
          name: data.name,
          id: { not: id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: 'A print method with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Validate material IDs if provided
    if (data.compatibleMaterialIds && data.compatibleMaterialIds.length > 0) {
      const materials = await prisma.material.findMany({
        where: { id: { in: data.compatibleMaterialIds } },
        select: { id: true },
      });

      if (materials.length !== data.compatibleMaterialIds.length) {
        return NextResponse.json(
          { error: 'One or more material IDs are invalid' },
          { status: 400 }
        );
      }
    }

    // Validate equipment IDs if provided
    if (data.compatibleEquipmentIds && data.compatibleEquipmentIds.length > 0) {
      const equipment = await prisma.machine.findMany({
        where: { id: { in: data.compatibleEquipmentIds } },
        select: { id: true },
      });

      if (equipment.length !== data.compatibleEquipmentIds.length) {
        return NextResponse.json(
          { error: 'One or more equipment IDs are invalid' },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.baseCost !== undefined) updateData.baseCost = data.baseCost;
    if (data.costPerM2 !== undefined) updateData.costPerM2 = data.costPerM2;
    if (data.costPerSheet !== undefined) updateData.costPerSheet = data.costPerSheet;
    if (data.speed !== undefined) updateData.speed = data.speed;
    if (data.isOutsourced !== undefined) updateData.isOutsourced = data.isOutsourced;
    if (data.costFurnizorPerM2 !== undefined) updateData.costFurnizorPerM2 = data.costFurnizorPerM2;
    if (data.costFurnizorPerUnit !== undefined) updateData.costFurnizorPerUnit = data.costFurnizorPerUnit;
    if (data.termenFurnizor !== undefined) updateData.termenFurnizor = data.termenFurnizor;
    if (data.markup !== undefined) updateData.markup = data.markup;
    if (data.colorMode !== undefined) updateData.colorMode = data.colorMode;
    if (data.maxWidth !== undefined) updateData.maxWidth = data.maxWidth;
    if (data.maxHeight !== undefined) updateData.maxHeight = data.maxHeight;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.active !== undefined) updateData.active = data.active;

    // Atomic update of many-to-many relations
    if (data.compatibleMaterialIds !== undefined) {
      updateData.materialIds = data.compatibleMaterialIds;
      updateData.compatibleMaterials = {
        set: [], // Clear existing
        connect: data.compatibleMaterialIds.map((id) => ({ id })), // Set new
      };
    }

    if (data.compatibleEquipmentIds !== undefined) {
      updateData.compatibleEquipment = {
        set: [], // Clear existing
        connect: data.compatibleEquipmentIds.map((id) => ({ id })), // Set new
      };
    }

    // Update in transaction
    await prisma.printMethod.update({
      where: { id },
      data: updateData as Prisma.PrintMethodUpdateInput,
    });

    const printMethod = await prisma.printMethod.findUnique({
      where: { id },
      include: {
        compatibleMaterials: {
          select: {
            id: true,
            name: true,
            unit: true,
            active: true,
          },
        },
        compatibleEquipment: {
          select: {
            id: true,
            name: true,
            type: true,
            active: true,
          },
        },
        consumables: {
          where: { active: true },
          include: {
            material: {
              select: {
                id: true,
                name: true,
                unit: true,
                stock: true,
                pricePerUnit: true,
              },
            },
          },
        },
      } as never,
    });

    if (!printMethod) {
      return NextResponse.json(
        { error: 'Print method not found after update' },
        { status: 404 }
      );
    }

    logger.info('API:PrintMethods', 'Print method updated', {
      id: printMethod.id,
      name: printMethod.name,
    });

    const loadedPrintMethod = castLoadedRelations(printMethod);

    // Format response
    const formatted = {
      ...loadedPrintMethod,
      baseCost: loadedPrintMethod.baseCost ? Number(loadedPrintMethod.baseCost) : null,
      costPerM2: loadedPrintMethod.costPerM2 ? Number(loadedPrintMethod.costPerM2) : null,
      costPerSheet: loadedPrintMethod.costPerSheet ? Number(loadedPrintMethod.costPerSheet) : null,
      costFurnizorPerM2: loadedPrintMethod.costFurnizorPerM2 ? Number(loadedPrintMethod.costFurnizorPerM2) : null,
      costFurnizorPerUnit: loadedPrintMethod.costFurnizorPerUnit ? Number(loadedPrintMethod.costFurnizorPerUnit) : null,
      markup: loadedPrintMethod.markup ? Number(loadedPrintMethod.markup) : null,
      createdAt: loadedPrintMethod.createdAt.toISOString(),
      updatedAt: loadedPrintMethod.updatedAt.toISOString(),
      consumables: serializeConsumables(loadedPrintMethod.consumables ?? []),
    };

    return NextResponse.json(formatted);
  } catch (err) {
    logApiError('API:PrintMethods', err);
    return createErrorResponse('Failed to update print method', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(request, { params });
}

// DELETE /api/admin/print-methods/[id] - Soft delete print method (active=false)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireRole(['ADMIN']);
    if (error) return error;

    const { id } = await params;

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid print method id' },
        { status: 400 }
      );
    }

    logger.info('API:PrintMethods', 'Soft deleting print method', {
      userId: user.id,
      printMethodId: id,
    });

    const existing = await prisma.printMethod.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { error: 'Print method not found' },
        { status: 404 }
      );
    }

    const printMethod = await prisma.printMethod.update({
      where: { id },
      data: { active: false },
    });

    logger.info('API:PrintMethods', 'Print method deactivated', {
      id: printMethod.id,
      name: printMethod.name,
    });

    return NextResponse.json({
      ...printMethod,
      baseCost: printMethod.baseCost ? Number(printMethod.baseCost) : null,
      costPerM2: printMethod.costPerM2 ? Number(printMethod.costPerM2) : null,
      costPerSheet: printMethod.costPerSheet ? Number(printMethod.costPerSheet) : null,
      costFurnizorPerM2: printMethod.costFurnizorPerM2 ? Number(printMethod.costFurnizorPerM2) : null,
      costFurnizorPerUnit: printMethod.costFurnizorPerUnit ? Number(printMethod.costFurnizorPerUnit) : null,
      markup: printMethod.markup ? Number(printMethod.markup) : null,
      createdAt: printMethod.createdAt.toISOString(),
      updatedAt: printMethod.updatedAt.toISOString(),
    });
  } catch (err) {
    logApiError('API:PrintMethods', err);
    return createErrorResponse('Failed to delete print method', 500);
  }
}
