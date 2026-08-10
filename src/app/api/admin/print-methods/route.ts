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
    pricePerUnit: Prisma.Decimal | null;  // mapped from salePrice
  };
};

type PrintMethodLoadedRelations = {
  consumables: PrintMethodConsumableDto[];
  compatibleMaterials: Array<{ id: string; name: string; unit: string; active: boolean }>;
  compatibleEquipment: Array<{ id: string; name: string; type: string; active: boolean }>;
  _count: {
    compatibleMaterials: number;
    compatibleEquipment: number;
    consumables: number;
    productionJobs: number;
  };
};

function serializeConsumables(consumables: PrintMethodConsumableDto[]) {
  return consumables.map((consumable) => ({
    ...consumable,
    costPerSqm: consumable.costPerSqm ? Number(consumable.costPerSqm) : null,
    costPerJob: consumable.costPerJob ? Number(consumable.costPerJob) : null,
    createdAt: consumable.createdAt.toISOString(),
    updatedAt: consumable.updatedAt.toISOString(),
    material: {
      ...consumable.material,
      pricePerUnit: consumable.material.salePrice ? Number(consumable.material.salePrice) : null,
    },
  }));
}

function castLoadedRelations<T>(printMethod: T): T & PrintMethodLoadedRelations {
  return printMethod as T & PrintMethodLoadedRelations;
}

function isMissingCompatibilityTableError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('code' in error)) return false;

  const errorCode = String((error as { code?: unknown }).code ?? '');
  const errorMessage = String((error as { message?: unknown }).message ?? '');

  return (
    errorCode === 'P2021' &&
    errorMessage.includes('_MaterialPrintMethodCompatibility')
  );
}

function formatPrintMethodResponse(pm: unknown) {
  const loadedPrintMethod = castLoadedRelations(pm);

  return {
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
}

// Validation schema for creating print method
const createPrintMethodSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  type: z.string().min(1, 'Type is required').trim(),
  baseCost: z.number().min(0).nullish(),
  costPerM2: z.number().min(0).nullish(),
  costPerSheet: z.number().min(0).nullish(),
  speed: z.string().nullish(),
  isOutsourced: z.boolean().default(false),
  costFurnizorPerM2: z.number().min(0).nullish(),
  costFurnizorPerUnit: z.number().min(0).nullish(),
  termenFurnizor: z.string().nullish(),
  markup: z.number().min(0).max(1000).nullish(),
  colorMode: z.string().nullish(),
  maxWidth: z.number().int().min(0).nullish(),
  maxHeight: z.number().int().min(0).nullish(),
  description: z.string().nullish(),
  active: z.boolean().default(true),
  compatibleMaterialIds: z.array(z.string()).default([]),
  compatibleEquipmentIds: z.array(z.string()).default([]),
});

// GET /api/admin/print-methods - List all print methods with relations
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER', 'OPERATOR']);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    logger.info('API:PrintMethods', 'Fetching print methods', { 
      userId: user.id,
      activeOnly 
    });

    const where: Prisma.PrintMethodWhereInput = activeOnly ? { active: true } : {};

    let printMethods: unknown[] = [];

    try {
      printMethods = await prisma.printMethod.findMany({
        where,
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
                  salePrice: true,
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
            },
          },
        },
        orderBy: { name: 'asc' },
      });
    } catch (err) {
      if (!isMissingCompatibilityTableError(err)) {
        throw err;
      }

      logger.warn('API:PrintMethods', 'Compatibility join table missing, using fallback query');

      const fallbackMethods = await prisma.printMethod.findMany({
        where,
        include: {
          consumables: {
            where: { active: true },
            include: {
              material: {
                select: {
                  id: true,
                  name: true,
                  unit: true,
                  stock: true,
                  salePrice: true,
                },
              },
            },
          },
          _count: {
            select: {
              consumables: true,
              productionJobs: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      printMethods = fallbackMethods.map((pm) => ({
        ...pm,
        compatibleMaterials: [],
        compatibleEquipment: [],
        _count: {
          compatibleMaterials: 0,
          compatibleEquipment: 0,
          consumables: pm._count.consumables,
          productionJobs: pm._count.productionJobs,
        },
      }));
    }

    const formatted = printMethods.map(formatPrintMethodResponse);

    logger.info('API:PrintMethods', 'Print methods fetched', {
      count: formatted.length,
    });

    return NextResponse.json(formatted);
  } catch (err) {
    logApiError('API:PrintMethods', err);
    return createErrorResponse('Failed to fetch print methods', 500);
  }
}

// POST /api/admin/print-methods - Create new print method
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const body = await request.json();
    const validationResult = createPrintMethodSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    logger.info('API:PrintMethods', 'Creating print method', {
      userId: user.id,
      name: data.name,
    });

    // Check if name already exists
    const existingMethod = await prisma.printMethod.findFirst({
      where: { name: data.name },
    });

    if (existingMethod) {
      return NextResponse.json(
        { error: 'A print method with this name already exists' },
        { status: 409 }
      );
    }

    // Validate material IDs exist
    if (data.compatibleMaterialIds.length > 0) {
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

    // Validate equipment IDs exist
    if (data.compatibleEquipmentIds.length > 0) {
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

    // Create print method with relations
    const createData: Record<string, unknown> = {
        name: data.name,
        type: data.type,
        baseCost: data.baseCost ?? null,
        costPerM2: data.costPerM2 ?? null,
        costPerSheet: data.costPerSheet ?? null,
        speed: data.speed ?? null,
        isOutsourced: data.isOutsourced,
        costFurnizorPerM2: data.costFurnizorPerM2 ?? null,
        costFurnizorPerUnit: data.costFurnizorPerUnit ?? null,
        termenFurnizor: data.termenFurnizor ?? null,
        markup: data.markup ?? null,
        colorMode: data.colorMode ?? null,
        maxWidth: data.maxWidth ?? null,
        maxHeight: data.maxHeight ?? null,
        description: data.description ?? null,
        active: data.active,
        materialIds: data.compatibleMaterialIds,
        compatibleMaterials: {
          connect: data.compatibleMaterialIds.map((id) => ({ id })),
        },
        compatibleEquipment: {
          connect: data.compatibleEquipmentIds.map((id) => ({ id })),
        },
      };

    const createdPrintMethod = await prisma.printMethod.create({
      data: createData as Prisma.PrintMethodCreateInput,
    });

    const printMethod = await prisma.printMethod.findUnique({
      where: { id: createdPrintMethod.id },
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
      },
    });

    if (!printMethod) {
      return createErrorResponse('Failed to load created print method', 500);
    }

    logger.info('API:PrintMethods', 'Print method created', {
      id: printMethod.id,
      name: printMethod.name,
    });

    // Format response
    const loadedPrintMethod = castLoadedRelations(printMethod);

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

    return NextResponse.json(formatted, { status: 201 });
  } catch (err) {
    logApiError('API:PrintMethods', err);
    return createErrorResponse('Failed to create print method', 500);
  }
}
