import { NextRequest, NextResponse } from 'next/server';
import { novaPoshtaClient } from '@/lib/novaposhta';

export async function GET(_request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const cities = await novaPoshtaClient.getCities(search);

    return NextResponse.json(
      {
        search,
        cities,
        count: cities.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error getting cities:', error);
    return NextResponse.json(
      { error: 'Failed to get cities' },
      { status: 500 }
    );
  }
}
