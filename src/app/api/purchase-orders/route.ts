import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, logApiError, logger } from '@/lib/logger';
import { buildPurchaseOrderTotal } from '@/modules/purchasing/reorder';

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireRole(['ADMIN', 'MANAGER', 'OPERATOR']);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const supplierId = searchParams.get('supplierId');
    const search = searchParams.get('search')?.trim();
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const page = Number(searchParams.get('page') ?? '1');
    const limit = Number(searchParams.get('limit') ?? '20');
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 20;

    const where: any = {
      ...(status ? { status: status as any } : {}),
      ...(supplierId ? { supplierId } : {}),
      ...(fromDate ? { createdAt: { gte: new Date(fromDate) } } : {}),
      ...(toDate ? { createdAt: { lte: new Date(`${toDate}T23:59:59.999Z`) } } : {}),
      ...(search
        ? {
            OR: [
              { poNumber: { contains: search, mode: 'insensitive' } },
              { supplier: { name: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [orders, totalCount] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          supplier: true,
          lines: { include: { material: true } },
          events: { orderBy: { createdAt: 'desc' } },
        },
        orderBy: [{ createdAt: 'desc' }, { expectedDeliveryDate: 'asc' }],
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    return NextResponse.json({
      ok: true,
      items: orders.map((order) => ({
        ...order,
        totalCost: Number(order.totalCost),
        lines: order.lines.map((line) => ({
          ...line,
          unitCost: Number(line.unitCost),
          lineTotal: Number(line.lineTotal),
        })),
      })),
      totalCount,
      page: safePage,
      limit: safeLimit,
    });
  } catch (error) {
    logger.error('API:PurchaseOrders', 'Failed to fetch purchase orders', { error });
    logApiError('API:PurchaseOrders', error);
    return createErrorResponse('Eroare la încărcarea comenzilor de cumpărare', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const body = await request.json().catch(() => ({}));
    const supplierId = typeof body.supplierId === 'string' ? body.supplierId : null;
    const materialId = typeof body.materialId === 'string' ? body.materialId : null;
    const quantity = Number(body.quantity ?? 0);

    if (!supplierId || !materialId || quantity <= 0) {
      return createErrorResponse('supplierId, materialId și quantity sunt obligatorii', 400);
    }

    const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
    const material = await prisma.material.findUnique({ where: { id: materialId } });

    if (!supplier || !material) {
      return createErrorResponse('Furnizor sau material inexistent', 404);
    }

    const po = await prisma.purchaseOrder.create({
      data: {
        supplierId,
        createdBy: user.id,
        status: 'DRAFT',
        currency: supplier.defaultCurrency || 'MDL',
        totalCost: 0,
        expectedDeliveryDate: new Date(Date.now() + (supplier.defaultLeadTimeDays || 7) * 24 * 60 * 60 * 1000),
      },
    });

    const line = await prisma.purchaseOrderLine.create({
      data: {
        purchaseOrderId: po.id,
        materialId,
        quantity,
        unit: material.unit ?? 'unit',
        unitCost: Number(material.purchasePrice ?? 0),
        lineTotal: Number(material.purchasePrice ?? 0) * quantity,
      },
    });

    await prisma.purchaseOrder.update({
      where: { id: po.id },
      data: {
        totalCost: buildPurchaseOrderTotal([{ materialId, quantity, unit: line.unit, unitCost: Number(line.unitCost) }]),
      },
    });

    return NextResponse.json({ ok: true, item: { ...po, totalCost: Number(po.totalCost) } }, { status: 201 });
  } catch (error) {
    logApiError('API:PurchaseOrders', error);
    return createErrorResponse('Eroare la crearea comenzii de cumpărare', 500);
  }
}
