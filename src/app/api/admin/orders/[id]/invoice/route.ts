import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { generateInvoicePDF } from '@/lib/pdf/invoice-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
  if (error) return error;

  try {
    const orderId = params.id;

    // Fetch order with all details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Prepare invoice data
    const invoiceData = {
      invoiceNumber: `INV-${order.id.slice(0, 8).toUpperCase()}`,
      date: new Date(order.createdAt).toLocaleDateString('ro-RO'),
      dueDate: order.payment?.createdAt 
        ? new Date(order.payment.createdAt).toLocaleDateString('ro-RO')
        : undefined,

      // Company info (configurabil din setări)
      companyName: 'Sanduta.Art',
      companyAddress: 'Str. Exemplu, Nr. 1',
      companyCity: 'București',
      companyCountry: 'România',
      companyVAT: 'RO12345678',
      companyPhone: '+40 123 456 789',
      companyEmail: 'contact@sanduta.art',

      // Customer info
      customerName: order.customer.name,
      customerEmail: order.customer.email || undefined,
      customerPhone: order.customer.phone || undefined,
      customerAddress: order.customer.address || undefined,
      customerCity: order.customer.city || undefined,
      customerCountry: order.customer.country || undefined,

      // Items
      items: order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.unitPrice,
        total: item.totalPrice,
      })),

      // Totals
      subtotal: order.totalAmount,
      tax: 0, // Calculat mai jos
      taxRate: 19, // TVA România
      total: order.totalAmount,

      // Optional
      notes: order.notes || undefined,
      paymentMethod: order.payment?.method || 'Cash on Delivery',
    };

    // Calculate tax (assuming prices include VAT)
    invoiceData.subtotal = order.totalAmount / 1.19;
    invoiceData.tax = order.totalAmount - invoiceData.subtotal;

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoiceData);

    // Return PDF with proper headers
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="factura-${invoiceData.invoiceNumber}.pdf"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    console.error('Error generating invoice:', err);
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}
