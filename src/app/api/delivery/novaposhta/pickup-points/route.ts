import { NextRequest, NextResponse } from 'next/server';
import { novaPoshtaClient } from '@/lib/novaposhta';

export async function GET(_request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    if (!city) {
      return NextResponse.json(
        { error: 'Missing city parameter' },
        { status: 400 }
      );
    }

    const pickupPoints = await novaPoshtaClient.getPickupPoints(city);

    return NextResponse.json(
      {
        city,
        pickupPoints,
        count: pickupPoints.length,
      },
      { status: 200 }
    );
  } catch (_error) {
    console.error('Error getting pickup points:', error);
    return NextResponse.json(
      { error: 'Failed to get pickup points' },
      { status: 500 }
    );
  }
}
