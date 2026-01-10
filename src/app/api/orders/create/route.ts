import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';
import { sendOrderEmails, OrderEmailData } from '@/lib/email';
import { logAuditAction, AUDIT_ACTIONS } from '@/lib/audit-log';

/**
 * POST /api/orders/create
 * 
 * Creează o comandă nouă cu datele din checkout
 * Acest endpoint este folosit de useCheckout hook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    logger.info('API:Orders:Create', 'Processing order creation request', {
      hasCustomer: !!body.customer,
      hasAddress: !!body.address,
      hasItems: !!body.items,
      itemCount: body.items?.length,
    });

    // Validare date obligatorii
    if (!body.customer || !body.address || !body.deliveryMethod || !body.paymentMethod) {
      logger.warn('API:Orders:Create', 'Missing required fields');
      return createErrorResponse('Datele comenzii sunt incomplete', 400);
    }

    if (!body.items || body.items.length === 0) {
      logger.warn('API:Orders:Create', 'No items in order');
      return createErrorResponse('Coșul este gol', 400);
    }

    const { customer, address, deliveryMethod, paymentMethod, items, totals } = body;

    // Generează order number
    const orderNumber = `SND${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Creare comandă în baza de date
    const order = await prisma.order.create({
      data: {
        orderNumber,
        totalPrice: totals.total,
        customerName: `${customer.firstName} ${customer.lastName}`,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        companyName: customer.companyName || null,
        taxId: customer.taxId || null,
        status: 'PENDING',
        paymentStatus: paymentMethod.type === 'card' ? 'PAID' : 'PENDING',
        deliveryStatus: 'pending',
        paymentMethod: paymentMethod.name,
        deliveryMethod: deliveryMethod.name,
        deliveryAddress: `${address.street} ${address.number}${address.apt ? `, ${address.apt}` : ''}, ${address.city}, ${address.country}, ${address.postalCode}`,
        city: address.city,
        country: address.country,
        postalCode: address.postalCode,
        subtotal: totals.subtotal,
        discount: totals.discount || 0,
        vat: totals.vat,
        shippingCost: totals.shipping,
        notes: `Delivery: ${deliveryMethod.estimatedDays} | Payment: ${paymentMethod.type}`,
      },
    });

    logger.info('API:Orders:Create', 'Order created in database', {
      orderId: order.id,
      orderNumber: order.orderNumber,
    });

    // Creare order items
    const orderItems = [];
    for (const item of items) {
      const orderItem = await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.id,
          quantity: item.specifications?.quantity || 1,
          unitPrice: item.priceBreakdown?.basePrice || item.totalPrice,
          lineTotal: item.totalPrice,
          // Project data din editor
          projectId: item.projectId || null,
          previewImage: item.previewImage || null,
          finalFileUrl: item.finalFileUrl || null,
          configuration: item.configuration || undefined,
          // Specificații produse
          specifications: item.specifications || undefined,
        },
        include: {
          product: true,
        },
      });
      orderItems.push(orderItem);
    }

    logger.info('API:Orders:Create', 'Order items created', {
      orderId: order.id,
      itemCount: orderItems.length,
    });

    // Pregătire date pentru email
    const emailData: OrderEmailData = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone || '',
      items: orderItems.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: Number(item.unitPrice),
      })),
      subtotal: Number(totals.subtotal),
      shippingCost: Number(totals.shipping),
      total: Number(totals.total),
      paymentMethod: paymentMethod.name,
      deliveryMethod: deliveryMethod.name,
      deliveryAddress: order.deliveryAddress || undefined,
      city: order.city || undefined,
      novaPoshtaWarehouse: undefined,
      trackingNumber: undefined,
      createdAt: order.createdAt,
    };

    // Trimitere emailuri (async, fără blocare)
    sendOrderEmails(emailData).catch((error) => {
      logApiError('API:Orders:Create:Email', error, { orderId: order.id });
    });

    // Audit log (dacă utilizatorul este autentificat)
    // Pentru comenzi guest, putem sări acest pas sau folosi userId null
    // În viitor, putem adăuga userId din session dacă există
    
    logger.info('API:Orders:Create', 'Order processed successfully', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: order.totalPrice,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Comanda a fost plasată cu succes',
        orderId: order.id,
        orderNumber: order.orderNumber,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          totalPrice: Number(order.totalPrice),
          status: order.status,
          paymentStatus: order.paymentStatus,
          deliveryStatus: order.deliveryStatus,
          createdAt: order.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logApiError('API:Orders:Create', error, { action: 'create_order' });
    return createErrorResponse(
      'Eroare la crearea comenzii. Te rugăm să încerci din nou sau contactează suportul.',
      500
    );
  }
}
