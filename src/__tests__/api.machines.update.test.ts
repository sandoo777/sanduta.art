import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(async () => ({
    user: {
      id: 'admin-user-id',
      role: 'ADMIN',
      email: 'admin@test.local',
    },
  })),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    material: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    printMethod: {
      count: vi.fn(),
    },
    machine: {
      update: vi.fn(),
    },
    machineMaintenanceRecord: {
      findMany: vi.fn(),
    },
  },
}));

import { PATCH } from '@/app/api/admin/machines/[id]/route';
import { prisma } from '@/lib/prisma';

describe('PATCH /api/admin/machines/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates a machine and returns JSON payload', async () => {
    vi.mocked(prisma.material.count).mockResolvedValue(1);
    vi.mocked(prisma.machine.update).mockResolvedValue({
      id: 'machine-1',
      name: 'Updated Machine',
      type: 'Digital Color',
      equipmentType: 'DIGITAL_COLOR',
      status: 'BUSY',
      active: true,
      compatibleMaterialIds: ['material-1'],
      costPerHour: null,
      speedM2PerHour: null,
      inkPerM2: null,
      materialPerM2: null,
      headAmortPerM2: null,
      printerAmortPerM2: null,
      maintCostPerM2: null,
      operatorCostPerHour: null,
      energyConsumptionKw: null,
      costClickColor: null,
      costClickBW: null,
      servicePerClick: null,
    } as never);
    vi.mocked(prisma.machineMaintenanceRecord.findMany).mockResolvedValue([]);
    vi.mocked(prisma.material.findMany).mockResolvedValue([
      { id: 'material-1', name: 'PVC', unit: 'm2' },
    ] as never);

    const req = new NextRequest('http://localhost/api/admin/machines/machine-1', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Updated Machine',
        equipmentType: 'DIGITAL_COLOR',
        status: 'BUSY',
        compatibleMaterialIds: ['material-1'],
      }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: 'machine-1' }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.name).toBe('Updated Machine');
    expect(body.status).toBe('BUSY');
    expect(prisma.machine.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'machine-1' },
      })
    );
  });

  it('persists compatiblePrintMethodIds on update', async () => {
    vi.mocked(prisma.material.count).mockResolvedValue(1);
    vi.mocked(prisma.printMethod.count).mockResolvedValue(1 as never);
    vi.mocked(prisma.machine.update).mockResolvedValue({
      id: 'machine-2',
      name: 'Machine 2',
      type: 'Digital Color',
      equipmentType: 'DIGITAL_COLOR',
      status: 'AVAILABLE',
      active: true,
      compatibleMaterialIds: ['material-1'],
      compatiblePrintMethodIds: ['print-method-1'],
      costPerHour: null,
      speedM2PerHour: null,
      inkPerM2: null,
      materialPerM2: null,
      headAmortPerM2: null,
      printerAmortPerM2: null,
      maintCostPerM2: null,
      operatorCostPerHour: null,
      energyConsumptionKw: null,
      costClickColor: null,
      costClickBW: null,
      servicePerClick: null,
    } as never);
    vi.mocked(prisma.machineMaintenanceRecord.findMany).mockResolvedValue([]);
    vi.mocked(prisma.material.findMany).mockResolvedValue([] as never);

    const req = new NextRequest('http://localhost/api/admin/machines/machine-2', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Machine 2',
        equipmentType: 'DIGITAL_COLOR',
        compatibleMaterialIds: ['material-1'],
        compatiblePrintMethodIds: ['print-method-1'],
      }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: 'machine-2' }) });

    expect(res.status).toBe(200);
    expect(prisma.machine.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'machine-2' },
        data: expect.objectContaining({
          compatiblePrintMethodIds: ['print-method-1'],
        }),
      })
    );
  });
});
