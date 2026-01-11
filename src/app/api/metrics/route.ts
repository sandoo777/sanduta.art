/**
 * Client-side Metrics API Endpoint
 * Receives metrics from frontend and processes them
 */

import { NextRequest, NextResponse } from 'next/server';
import { useMetrics, MetricType } from '@/modules/monitoring/useMetrics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, value, context, timestamp } = body;

    if (!type || value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: type, value' },
        { status: 400 }
      );
    }

    // Validate type
    if (!Object.values(MetricType).includes(type)) {
      return NextResponse.json(
        { error: `Invalid metric type: ${type}` },
        { status: 400 }
      );
    }

    const metrics = useMetrics();

    // Route to appropriate metrics method
    switch (type) {
      case MetricType.TTFB:
        await metrics.recordTTFB(value, context);
        break;
      case MetricType.LCP:
        await metrics.recordLCP(value, context);
        break;
      case MetricType.FID:
        await metrics.recordFID(value, context);
        break;
      case MetricType.CLS:
        await metrics.recordCLS(value, context);
        break;
      default:
        await metrics.record(type, value, 'ms', context);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to process client metric:', error);
    return NextResponse.json(
      { error: 'Failed to process metric' },
      { status: 500 }
    );
  }
}
