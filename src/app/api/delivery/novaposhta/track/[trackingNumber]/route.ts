import { NextRequest, NextResponse } from 'next/server';
import { novaPoshtaClient } from '@/lib/novaposhta';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  try {
    const { trackingNumber } = await params;

    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Missing tracking number' },
        { status: 400 }
      );
    }

    const trackingInfo = await novaPoshtaClient.trackShipment(trackingNumber);

    if (!trackingInfo) {
      return NextResponse.json(
        { error: 'Tracking information not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        trackingNumber,
        status: trackingInfo.Status || 'unknown',
        statusDescription: trackingInfo.StatusName || '',
        lastUpdate: trackingInfo.DateModified || null,
      },
      { status: 200 }
    );
  } catch (_error) {
    console.error('Error tracking shipment:', error);
    return NextResponse.json(
      { error: 'Failed to get tracking information' },
      { status: 500 }
    );
  }
}
