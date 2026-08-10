import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { logger, createErrorResponse } from '@/lib/logger';

const invoiceOrderInclude = {
  user: true,
  orderItems: {
    include: {
      product: true,
    },
  },
} satisfies Prisma.OrderInclude;

type InvoiceOrder = Prisma.OrderGetPayload<{
  include: typeof invoiceOrderInclude;
}>;

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { id } = params;

    // Find order and verify ownership
    const order = await prisma.order.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
      include: invoiceOrderInclude,
    });

    if (!order) {
      return createErrorResponse('Invoice not found', 404);
    }

    // Generate PDF (placeholder - integrate with PDF generation library)
    const pdfContent = generateInvoicePDF(order);

    return new NextResponse(pdfContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="factura-${id}.pdf"`,
      },
    });
  } catch (err) {
    logger.error('API:Account', 'Error downloading invoice', { error: err });
    return createErrorResponse('Failed to download invoice', 500);
  }
}

function generateInvoicePDF(order: InvoiceOrder): string {
  // Placeholder - implement actual PDF generation
  // Use libraries like pdfkit, puppeteer, or similar
  const pdfText = `
    FACTURĂ
    
    Număr: INV-${order.id.slice(-8).toUpperCase()}
    Dată: ${order.createdAt.toLocaleDateString('ro-RO')}
    
    Client: ${order.user.name}
    Email: ${order.user.email}
    
    Comandă: ${order.id}
    Total: ${Number(order.totalPrice)} RON
    
    Articole:
    ${order.orderItems.map((item) => 
      `- ${item.product.name} x${item.quantity} = ${Number(item.lineTotal)} RON`
    ).join('\n')}
  `;
  
  return pdfText;
}
