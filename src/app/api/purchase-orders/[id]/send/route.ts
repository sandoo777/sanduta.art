import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, logApiError, logger } from '@/lib/logger';
import { applyPoStatusTransition } from '@/modules/purchasing/reorder';
import { sendPurchaseOrderEmail } from '@/lib/email';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { id } = await params;
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        lines: { include: { material: true } },
      },
    });

    if (!po) {
      return createErrorResponse('PO-ul nu a fost găsit', 404);
    }

    const payload = {
      poNumber: po.poNumber ?? po.id,
      supplierId: po.supplierId,
      lines: po.lines.map((line) => ({
        sku: line.material?.sku ?? line.materialId,
        qty: Number(line.quantity),
        unit: line.unit,
      })),
      expectedDelivery: po.expectedDeliveryDate ? po.expectedDeliveryDate.toISOString().slice(0, 10) : undefined,
    };

    let sendResult: { success: boolean; message?: string } = { success: false, message: 'No delivery channel configured' };
    const supplierEmail = (po.supplier as { email?: string | null; contactEmail?: string | null }).email
      ?? (po.supplier as { contactEmail?: string | null }).contactEmail
      ?? null;
    const supplierPhones = Array.isArray(po.supplier.phones)
      ? po.supplier.phones.filter((phone): phone is string => typeof phone === 'string' && phone.length > 0)
      : [];
    const preferredChannel = po.supplier.preferredChannel ?? (supplierEmail ? 'email' : po.supplier.website ? 'web' : supplierPhones.length > 0 ? 'phone' : null);

    if (preferredChannel === 'web' && po.supplier.website) {
      const response = await fetch(po.supplier.website, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      sendResult = {
        success: response.ok,
        message: `HTTP ${response.status}: ${text.slice(0, 200)}`,
      };
    } else if (preferredChannel === 'email' && supplierEmail) {
      const emailResult = await sendPurchaseOrderEmail({
        to: supplierEmail,
        subject: `PO ${po.poNumber ?? po.id}`,
        html: `<pre>${JSON.stringify(payload, null, 2)}</pre>`,
        text: JSON.stringify(payload, null, 2),
      });
      sendResult = {
        success: emailResult.success,
        message: emailResult.success ? 'Email delivered' : emailResult.error?.message ?? 'Email failed',
      };
    } else if (preferredChannel === 'phone' && supplierPhones.length > 0) {
      sendResult = {
        success: true,
        message: `Phone follow-up required: ${supplierPhones[0]}`,
      };
    } else if (preferredChannel === 'chat') {
      sendResult = {
        success: true,
        message: 'Chat follow-up required',
      };
    }

    const nextAttempts = po.attempts + 1;
    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        attempts: nextAttempts,
        lastResponse: sendResult.message,
        lastSentAt: sendResult.success ? new Date() : undefined,
        status: sendResult.success ? applyPoStatusTransition(po.status as any, 'send') : po.status,
      },
    });

    if (!sendResult.success) {
      await prisma.purchaseOrderEvent.create({
        data: {
          purchaseOrderId: id,
          eventType: 'SEND_FAILED',
          message: `PO send failed after ${nextAttempts} attempts: ${sendResult.message}`,
          metadata: { attempts: nextAttempts },
        },
      });

      if (nextAttempts >= 3) {
        const admins = await prisma.user.findMany({ where: { role: { in: ['ADMIN', 'MANAGER'] } } });
        await prisma.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            type: 'SYSTEM',
            title: 'PO send escalation',
            message: `Purchase order ${po.poNumber ?? po.id} failed delivery after ${nextAttempts} attempts.`,
            link: `/admin/purchase-orders/${id}`,
          })),
        });
      }

      return NextResponse.json({ ok: false, error: sendResult.message }, { status: 502 });
    }

    await prisma.purchaseOrderEvent.create({
      data: {
        purchaseOrderId: id,
        eventType: 'SENT',
        message: 'PO sent successfully to supplier',
      },
    });

    return NextResponse.json({ ok: true, item: updated });
  } catch (error) {
    logger.error('API:PurchaseOrders:Send', 'Failed to send PO', { error });
    logApiError('API:PurchaseOrders:Send', error);
    return createErrorResponse('Eroare la trimiterea comenzii', 500);
  }
}
