/**
 * API: Customer Segments
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

let mockSegments = [
  {
    id: '1',
    name: 'Clienți Noi',
    type: 'NEW_CUSTOMERS',
    description: 'Clienți înregistrați în ultimele 30 de zile',
    filters: [{ field: 'createdAt', operator: 'gte', value: -30 }],
    customerCount: 145,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Clienți VIP',
    type: 'VIP_CUSTOMERS',
    description: 'Clienți cu mai mult de 5 comenzi și valoare totală > 2000 lei',
    filters: [
      { field: 'orderCount', operator: 'gte', value: 5 },
      { field: 'totalSpent', operator: 'gte', value: 2000 },
    ],
    customerCount: 23,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    logger.info('API:Segments', 'Fetching segments', { userId: user.id });
    return NextResponse.json(mockSegments);
  } catch (err) {
    logApiError('API:Segments', err);
    return createErrorResponse('Failed to fetch segments', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const body = await req.json();
    logger.info('API:Segments', 'Creating segment', { userId: user.id, name: body.name });

    const newSegment = {
      id: String(mockSegments.length + 1),
      name: body.name,
      type: body.type,
      description: body.description,
      filters: body.filters || [],
      customerCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockSegments.push(newSegment);
    return NextResponse.json(newSegment, { status: 201 });
  } catch (err) {
    logApiError('API:Segments', err);
    return createErrorResponse('Failed to create segment', 500);
  }
}
