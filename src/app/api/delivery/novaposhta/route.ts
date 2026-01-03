import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { novaPoshtaClient } from '@/lib/novaposhta';

export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: { include: { product: true } } },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

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
      cod: order.total, // Cash on delivery = order total
    });

    // Update order with tracking number
    await prisma.order.update({
      where: { id: orderId },
      data: {
        trackingNumber: shipment.tracking_number,
        deliveryStatus: 'shipped',
      },
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
  } catch (error) {
    console.error('Error creating Nova Poshta shipment:', error);
    return NextResponse.json(
      { error: 'Failed to create shipment' },
      { status: 500 }
    );
  }
}
