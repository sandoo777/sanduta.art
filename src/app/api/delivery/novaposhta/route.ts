import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { novaPoshtaClient } from '@/lib/novaposhta';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

export async function POST(_request: NextRequest) {
  try {
    logger.info('API:NovaPoshta', 'Creating shipment');
    
    const body = await request.json();
    const {
      orderId,
      customerPhone,
      city,
      address,
      deliveryType,
      pickupPointRef,
      weight = 1,
    } = body;

    if (!orderId || !customerPhone || !city || !address || !deliveryType) {
      logger.warn('API:NovaPoshta', 'Missing required fields', {
        hasOrderId: !!orderId,
        hasPhone: !!customerPhone,
        hasCity: !!city,
        hasAddress: !!address,
        hasDeliveryType: !!deliveryType,
      });
      return createErrorResponse(
        'Missing required fields for delivery',
        400
      );
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: { include: { product: true } } },
    });

    if (!order) {
      logger.warn('API:NovaPoshta', 'Order not found', { orderId });
      return createErrorResponse('Order not found', 404);
    }

    logger.info('API:NovaPoshta', 'Creating Nova Poshta shipment', { 
      orderId, 
      city, 
      deliveryType 
    });

    try {
      // Create shipment with Nova Poshta
      const shipment = await novaPoshtaClient.createShipment({
        orderId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone,
        city,
        address,
        deliveryType,
        pickupPointRef,
        weight,
        cod: Number(order.totalPrice), // Cash on delivery = order total
      });

      // Update order with tracking number
      await prisma.order.update({
        where: { id: orderId },
        data: {
          trackingNumber: shipment.tracking_number,
          deliveryStatus: 'shipped',
        },
      });

      logger.info('API:NovaPoshta', 'Shipment created successfully', { 
        orderId, 
        trackingNumber: shipment.tracking_number 
      });

      return NextResponse.json(
        {
          message: 'Shipment created successfully',
          trackingNumber: shipment.tracking_number,
          reference: shipment.reference,
          status: shipment.status,
        },
        { status: 200 }
      );
    } catch (novaPoshtaError) {
      logApiError('API:NovaPoshta', novaPoshtaError, { orderId, service: 'novaposhta_api' });
      
      // Still update order status even if Nova Poshta fails
      await prisma.order.update({
        where: { id: orderId },
        data: {
          deliveryStatus: 'pending',
        },
      });
      
      return createErrorResponse(
        'Delivery service temporarily unavailable. Your order is saved and will be processed manually.',
        503,
        { orderId, fallback: 'manual_processing' }
      );
    }
  } catch (error) {
    logApiError('API:NovaPoshta', error, { action: 'create_shipment' });
    return createErrorResponse(
      'Failed to create shipment. Please contact support with your order number.',
      500
    );
  }
}
