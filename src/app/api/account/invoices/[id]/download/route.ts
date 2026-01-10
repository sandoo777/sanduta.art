import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { logger, createErrorResponse } from '@/lib/logger';

export async function GET(
  req: NextRequest,
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
      include: {
        user: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
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

function generateInvoicePDF(order: any): string {
  // Placeholder - implement actual PDF generation
  // Use libraries like pdfkit, puppeteer, or similar
  const pdfText = `
    FACTURĂ
    
    Număr: INV-${order.id.slice(-8).toUpperCase()}
    Dată: ${order.createdAt.toLocaleDateString('ro-RO')}
    
    Client: ${order.user.name}
    Email: ${order.user.email}
    
    Comandă: ${order.id}
    Total: ${order.total} RON
    
    Articole:
    ${order.orderItems.map((item: any) => 
      `- ${item.product.name} x${item.quantity} = ${item.price} RON`
    ).join('\n')}
  `;
  
  return pdfText;
}
