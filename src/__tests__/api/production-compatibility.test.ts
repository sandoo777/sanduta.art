import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('next-auth', () => ({
  getServerSession: vi.fn().mockResolvedValue({
    user: { id: 'admin-1', role: 'ADMIN', email: 'admin@test.local' },
  }),
}));

vi.mock('@/lib/auth-middleware', () => ({
  withRole: (_roles: unknown, handler: unknown) => handler,
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue({ allowed: true }),
  RATE_LIMITS: {
    API_GENERAL: 'API_GENERAL',
    API_STRICT: 'API_STRICT',
  },
}));

vi.mock('@/lib/validation', () => ({
  validateInput: vi.fn(async (_schema: unknown, body: unknown) => ({
    success: true,
    data: body,
  })),
}));

vi.mock('@/lib/audit-log', () => ({
  logAuditAction: vi.fn().mockResolvedValue(undefined),
  AUDIT_ACTIONS: {
    PRODUCTION_STATUS_CHANGE: 'PRODUCTION_STATUS_CHANGE',
    PRODUCTION_DELETE: 'PRODUCTION_DELETE',
  },
}));

vi.mock('@/modules/materials/server', () => ({
  getCompatibleMaterials: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    orderItem: {
      findFirst: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
    },
    printMethod: {
      findUnique: vi.fn(),
    },
    machine: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    printMethodConsumable: {
      findMany: vi.fn(),
    },
    productionJob: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      create: vi.fn(),
    },
    material: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    materialUsage: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { POST } from '@/app/api/admin/production/route';
import { PATCH } from '@/app/api/admin/production/[id]/route';
import { prisma } from '@/lib/prisma';
import { getCompatibleMaterials } from '@/modules/materials/server';

function makePostRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost:3000/api/admin/production', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

function makePatchRequest(jobId: string, body: Record<string, unknown>) {
  return new NextRequest(`http://localhost:3000/api/admin/production/${jobId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('Production API compatibility guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(prisma.$transaction).mockReset();
    vi.mocked(prisma.order.findUnique).mockReset();
    vi.mocked(prisma.printMethod.findUnique).mockReset();
    vi.mocked(prisma.machine.findUnique).mockReset();
    vi.mocked(prisma.printMethodConsumable.findMany).mockReset();
    vi.mocked(prisma.productionJob.findUnique).mockReset();
    vi.mocked(prisma.material.findUnique).mockReset();
    vi.mocked(prisma.materialUsage.findFirst).mockReset();
    vi.mocked(getCompatibleMaterials).mockReset();

    vi.mocked(prisma.order.findUnique).mockResolvedValue({ id: 'order-1' } as never);
    vi.mocked(prisma.printMethod.findUnique).mockResolvedValue({
      id: 'pm-1',
      name: 'Method 1',
      active: true,
      isOutsourced: false,
      colorMode: 'PANTONE',
      equipment: [{ id: 'machine-1' }],
      costFurnizorPerM2: null,
      costFurnizorPerUnit: null,
      markup: null,
    } as never);

    vi.mocked(prisma.machine.findUnique).mockResolvedValue({
      id: 'machine-1',
      name: 'Machine 1',
      active: true,
      status: 'AVAILABLE',
      equipmentType: 'DIGITAL',
      compatiblePrintMethodIds: ['pm-1'],
      supportedColorModes: ['CMYK'],
      inkChangeoverCost: 100,
      speedM2PerHour: 80,
      speedPpm: 60,
      inkPerM2: 0.5,
      materialPerM2: 1,
      headAmortPerM2: 0.1,
      printerAmortPerM2: 0.2,
      maintCostPerM2: 0.05,
      costClickColor: 0.03,
      costClickBW: 0.01,
      costPerHour: 150,
    } as never);

    vi.mocked(getCompatibleMaterials).mockResolvedValue([
      {
        id: 'mat-1',
        name: 'Material 1',
        supportedColorModes: ['CMYK'],
      },
    ] as never);

    vi.mocked(prisma.printMethodConsumable.findMany).mockResolvedValue([] as never);
  });

  describe('Validation 400/409', () => {
    it('POST /api/admin/production returns 400 when machine is incompatible with print method', async () => {
      vi.mocked(prisma.machine.findUnique).mockResolvedValueOnce({
        id: 'machine-1',
        name: 'Machine 1',
        active: true,
        status: 'AVAILABLE',
        equipmentType: 'DIGITAL',
        compatiblePrintMethodIds: [],
        speedM2PerHour: 80,
        speedPpm: 60,
        inkPerM2: 0.5,
        materialPerM2: 1,
        headAmortPerM2: 0.1,
        printerAmortPerM2: 0.2,
        maintCostPerM2: 0.05,
        costClickColor: 0.03,
        costClickBW: 0.01,
        costPerHour: 150,
      } as never);

      const response = await POST(
        makePostRequest({
          orderId: 'order-1',
          name: 'Job incompat machine',
          machineId: 'machine-1',
          printMethodId: 'pm-1',
          quantity: 10,
        })
      );

      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error).toContain('nu suportă metoda de tipărire selectată');
    });

    it('PATCH /api/admin/production/[id] returns 400 when current machine is incompatible with print method', async () => {
      vi.mocked(prisma.productionJob.findUnique).mockResolvedValue({
        id: 'job-1',
        orderId: 'order-1',
        productId: null,
        status: 'PENDING',
        priority: 'NORMAL',
        assignedToId: null,
        machineId: 'machine-1',
        printMethodId: 'pm-1',
        materialId: 'mat-1',
        startedAt: null,
        completedAt: null,
        quantity: 5,
        estimatedCost: null,
        estimatedMinutes: null,
      } as never);

      vi.mocked(prisma.machine.findUnique).mockResolvedValueOnce({
        name: 'Machine 1',
        compatiblePrintMethodIds: [],
      } as never);

      const response = await PATCH(makePatchRequest('job-1', { printMethodId: 'pm-1' }), {
        params: Promise.resolve({ id: 'job-1' }),
        user: { id: 'admin-1', role: 'ADMIN', email: 'admin@test.local' },
      });

      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error).toContain('nu suportă metoda de tipărire selectată');
    });

    it('PATCH /api/admin/production/[id] returns 400 when material is incompatible with machine + print method', async () => {
      vi.mocked(prisma.productionJob.findUnique).mockResolvedValue({
        id: 'job-2',
        orderId: 'order-1',
        productId: null,
        status: 'PENDING',
        priority: 'NORMAL',
        assignedToId: null,
        machineId: 'machine-1',
        printMethodId: 'pm-1',
        materialId: 'mat-1',
        startedAt: null,
        completedAt: null,
        quantity: 5,
        estimatedCost: null,
        estimatedMinutes: null,
      } as never);

      vi.mocked(prisma.machine.findUnique).mockResolvedValueOnce({
        name: 'Machine 1',
        compatiblePrintMethodIds: ['pm-1'],
      } as never);

      vi.mocked(getCompatibleMaterials).mockResolvedValueOnce([
        {
          id: 'mat-2',
          name: 'Material 2',
        },
      ] as never);

      const response = await PATCH(makePatchRequest('job-2', { materialId: 'mat-1' }), {
        params: Promise.resolve({ id: 'job-2' }),
        user: { id: 'admin-1', role: 'ADMIN', email: 'admin@test.local' },
      });

      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error).toContain('Materialul selectat nu este compatibil');
    });

    it('POST /api/admin/production returns 409 when machine is BUSY', async () => {
      vi.mocked(prisma.machine.findUnique).mockResolvedValueOnce({
        id: 'machine-busy',
        name: 'Machine Busy',
        active: true,
        status: 'BUSY',
        equipmentType: 'DIGITAL',
        compatiblePrintMethodIds: ['pm-1'],
        supportedColorModes: ['PANTONE'],
        inkChangeoverCost: 100,
        speedM2PerHour: 80,
        speedPpm: 60,
        inkPerM2: 0.5,
        materialPerM2: 1,
        headAmortPerM2: 0.1,
        printerAmortPerM2: 0.2,
        maintCostPerM2: 0.05,
        costClickColor: 0.03,
        costClickBW: 0.01,
        costPerHour: 150,
      } as never);

      vi.mocked(prisma.$transaction).mockImplementationOnce(async (callback) =>
        callback({
          machine: {
            updateMany: vi.fn().mockResolvedValue({ count: 0 }),
            findUnique: vi.fn().mockResolvedValue({
              name: 'Machine Busy',
              active: true,
              status: 'BUSY',
            }),
          },
          productionJob: {
            create: vi.fn(),
          },
        })
      );

      const response = await POST(
        makePostRequest({
          orderId: 'order-1',
          name: 'Job busy machine',
          machineId: 'machine-busy',
          printMethodId: 'pm-1',
          quantity: 10,
        })
      );

      const data = await response.json();
      expect(response.status).toBe(409);
      expect(data.error).toContain('deja ocupat');
    });

    it('POST /api/admin/production returns 409 when machine is in MAINTENANCE', async () => {
      vi.mocked(prisma.machine.findUnique).mockResolvedValueOnce({
        id: 'machine-maint',
        name: 'Machine Maint',
        active: true,
        status: 'MAINTENANCE',
        equipmentType: 'DIGITAL',
        compatiblePrintMethodIds: ['pm-1'],
        supportedColorModes: ['PANTONE'],
        inkChangeoverCost: 100,
        speedM2PerHour: 80,
        speedPpm: 60,
        inkPerM2: 0.5,
        materialPerM2: 1,
        headAmortPerM2: 0.1,
        printerAmortPerM2: 0.2,
        maintCostPerM2: 0.05,
        costClickColor: 0.03,
        costClickBW: 0.01,
        costPerHour: 150,
      } as never);

      vi.mocked(prisma.$transaction).mockImplementationOnce(async (callback) =>
        callback({
          machine: {
            updateMany: vi.fn().mockResolvedValue({ count: 0 }),
            findUnique: vi.fn().mockResolvedValue({
              name: 'Machine Maint',
              active: true,
              status: 'MAINTENANCE',
            }),
          },
          productionJob: {
            create: vi.fn(),
          },
        })
      );

      const response = await POST(
        makePostRequest({
          orderId: 'order-1',
          name: 'Job maintenance machine',
          machineId: 'machine-maint',
          printMethodId: 'pm-1',
          quantity: 10,
        })
      );

      const data = await response.json();
      expect(response.status).toBe(409);
      expect(data.error).toContain('în mentenanță');
    });

    it('PATCH /api/admin/production/[id] returns 400 for invalid status transition', async () => {
      vi.mocked(prisma.productionJob.findUnique).mockResolvedValueOnce({
        id: 'job-transition',
        orderId: 'order-1',
        productId: null,
        status: 'PENDING',
        priority: 'NORMAL',
        assignedToId: null,
        machineId: 'machine-1',
        printMethodId: 'pm-1',
        materialId: 'mat-1',
        startedAt: null,
        completedAt: null,
        quantity: 5,
      } as never);

      const response = await PATCH(makePatchRequest('job-transition', { status: 'COMPLETED' }), {
        params: Promise.resolve({ id: 'job-transition' }),
        user: { id: 'admin-1', role: 'ADMIN', email: 'admin@test.local' },
      });

      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid status transition');
    });

    it('POST /api/admin/production returns 409 when print method is inactive', async () => {
      vi.mocked(prisma.printMethod.findUnique).mockResolvedValueOnce({
        id: 'pm-inactive',
        name: 'Inactive Method',
        active: false,
        isOutsourced: false,
        colorMode: 'PANTONE',
        equipment: [{ id: 'machine-1' }],
        costFurnizorPerM2: null,
        costFurnizorPerUnit: null,
        markup: null,
      } as never);

      const response = await POST(
        makePostRequest({
          orderId: 'order-1',
          name: 'Job inactive method',
          printMethodId: 'pm-inactive',
          quantity: 10,
        })
      );

      const data = await response.json();
      expect(response.status).toBe(409);
      expect(data.error).toContain('inactivă');
    });

    it('PATCH /api/admin/production/[id] returns 409 when material is inactive at completion', async () => {
      vi.mocked(prisma.productionJob.findUnique).mockResolvedValueOnce({
        id: 'job-complete',
        orderId: 'order-1',
        productId: null,
        status: 'IN_PROGRESS',
        priority: 'NORMAL',
        assignedToId: null,
        machineId: 'machine-1',
        printMethodId: 'pm-1',
        materialId: 'mat-1',
        startedAt: new Date('2026-01-01T10:00:00Z'),
        completedAt: null,
        quantity: 5,
        estimatedCost: null,
        estimatedMinutes: null,
      } as never);

      vi.mocked(prisma.machine.findUnique)
        .mockResolvedValueOnce({
          name: 'Machine 1',
          supportedColorModes: ['PANTONE'],
        } as never)
        .mockResolvedValueOnce({
          equipmentType: 'DIGITAL',
          speedM2PerHour: null,
          speedPpm: 50,
          inkChangeoverCost: 100,
        } as never);

      vi.mocked(getCompatibleMaterials).mockResolvedValueOnce([
        {
          id: 'mat-1',
          name: 'Material 1',
          supportedColorModes: ['PANTONE'],
        },
      ] as never);

      vi.mocked(prisma.material.findUnique).mockResolvedValueOnce({
        id: 'mat-1',
        name: 'Inactive material',
        active: false,
        consumptionType: 'DIRECT',
        unit: 'ml',
        wastePercent: 5,
        pricePerSqm: null,
        pricePerMeter: null,
        pricePerUnit: 1,
        stock: 100,
      } as never);

      vi.mocked(prisma.materialUsage.findFirst).mockResolvedValueOnce(null as never);

      const response = await PATCH(makePatchRequest('job-complete', { status: 'COMPLETED' }), {
        params: Promise.resolve({ id: 'job-complete' }),
        user: { id: 'admin-1', role: 'ADMIN', email: 'admin@test.local' },
      });

      const data = await response.json();
      expect(response.status).toBe(409);
      expect(data.error).toContain('inactiv');
    });
  });

  describe('Happy path 200/201', () => {
    it('POST /api/admin/production returns 201 for compatible machine + material + method', async () => {
      vi.mocked(prisma.printMethod.findUnique).mockResolvedValueOnce({
        id: 'pm-ok',
        name: 'Method OK',
        active: true,
        isOutsourced: false,
        colorMode: 'CMYK',
        equipment: [{ id: 'machine-1' }],
        costFurnizorPerM2: null,
        costFurnizorPerUnit: null,
        markup: null,
      } as never);

      vi.mocked(prisma.machine.findUnique).mockResolvedValueOnce({
        id: 'machine-1',
        name: 'Machine 1',
        active: true,
        status: 'AVAILABLE',
        equipmentType: 'DIGITAL',
        compatiblePrintMethodIds: ['pm-ok'],
        supportedColorModes: ['CMYK', 'PANTONE'],
        inkChangeoverCost: 100,
        speedM2PerHour: 80,
        speedPpm: 60,
        inkPerM2: 0.5,
        materialPerM2: 1,
        headAmortPerM2: 0.1,
        printerAmortPerM2: 0.2,
        maintCostPerM2: 0.05,
        costClickColor: 0.03,
        costClickBW: 0.01,
        costPerHour: 150,
      } as never);

      vi.mocked(getCompatibleMaterials).mockResolvedValueOnce([
        {
          id: 'mat-ok',
          name: 'Material OK',
          supportedColorModes: ['CMYK', 'PANTONE'],
        },
      ] as never);

      const createdJob = {
        id: 'job-created',
        name: 'Job valid',
        status: 'PENDING',
      };

      vi.mocked(prisma.$transaction).mockImplementationOnce(async (callback) =>
        callback({
          productionJob: {
            create: vi.fn().mockResolvedValue(createdJob),
          },
          machine: {
            update: vi.fn().mockResolvedValue({ id: 'machine-1', status: 'BUSY' }),
            findUnique: vi.fn().mockResolvedValue(null),
          },
        })
      );

      const response = await POST(
        makePostRequest({
          orderId: 'order-1',
          name: 'Job valid',
          machineId: 'machine-1',
          printMethodId: 'pm-ok',
          materialId: 'mat-ok',
          quantity: 10,
        })
      );

      const data = await response.json();
      expect(response.status).toBe(201);
      expect(data.id).toBe('job-created');
    });

    it('PATCH /api/admin/production/[id] returns 200 for compatible update flow', async () => {
      vi.mocked(prisma.productionJob.findUnique).mockResolvedValueOnce({
        id: 'job-ok',
        orderId: 'order-1',
        productId: null,
        status: 'PENDING',
        priority: 'NORMAL',
        assignedToId: null,
        machineId: 'machine-1',
        printMethodId: 'pm-1',
        materialId: 'mat-1',
        startedAt: null,
        completedAt: null,
        quantity: 5,
        estimatedCost: null,
        estimatedMinutes: null,
      } as never);

      vi.mocked(prisma.printMethod.findUnique).mockResolvedValueOnce({
        id: 'pm-1',
        name: 'Method 1',
        active: true,
        isOutsourced: false,
        colorMode: 'PANTONE',
        equipment: [{ id: 'machine-1' }],
        costFurnizorPerM2: null,
        costFurnizorPerUnit: null,
        markup: null,
      } as never);

      vi.mocked(prisma.machine.findUnique)
        .mockResolvedValueOnce({
          name: 'Machine 1',
          compatiblePrintMethodIds: ['pm-1'],
        } as never);

      vi.mocked(getCompatibleMaterials).mockResolvedValueOnce([
        {
          id: 'mat-1',
          name: 'Material 1',
          supportedColorModes: ['PANTONE'],
        },
      ] as never);

      const updatedJob = {
        id: 'job-ok',
        name: 'Job updated',
        status: 'PENDING',
      };

      vi.mocked(prisma.$transaction).mockImplementationOnce(async (callback) =>
        callback({
          machine: {
            update: vi.fn().mockResolvedValue({ id: 'machine-1' }),
            updateMany: vi.fn().mockResolvedValue({ count: 1 }),
            findUnique: vi.fn().mockResolvedValue(null),
          },
          productionJob: {
            update: vi.fn().mockResolvedValue(updatedJob),
          },
          materialUsage: {
            create: vi.fn().mockResolvedValue(null),
          },
          material: {
            update: vi.fn().mockResolvedValue(null),
          },
          printMethodConsumable: {
            findMany: vi.fn().mockResolvedValue([]),
          },
        })
      );

      const response = await PATCH(makePatchRequest('job-ok', { printMethodId: 'pm-1', materialId: 'mat-1' }), {
        params: Promise.resolve({ id: 'job-ok' }),
        user: { id: 'admin-1', role: 'ADMIN', email: 'admin@test.local' },
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.id).toBe('job-ok');
    });
  });
});
