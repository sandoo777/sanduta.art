/**
 * API: Email Automations
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

const mockAutomations = [
  {
    id: '1',
    name: 'Welcome Email',
    type: 'WELCOME_SERIES',
    trigger: 'ACCOUNT_CREATED',
    triggerDelay: 0,
    subject: 'Bun venit la Șandută Art!',
    body: '<h1>Bun venit, {{name}}!</h1><p>Mulțumim că te-ai înregistrat.</p>',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    sent: 234,
    opened: 189,
    clicked: 67,
    converted: 23,
  },
  {
    id: '2',
    name: 'Coș Abandonat',
    type: 'ABANDONED_CART',
    trigger: 'CART_ABANDONED',
    triggerDelay: 2,
    subject: 'Ai uitat ceva în coș? 🛒',
    body: '<h1>Salut, {{name}}!</h1><p>Ai lăsat {{productName}} în coș. Completează comanda!</p>',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    sent: 456,
    opened: 298,
    clicked: 134,
    converted: 45,
  },
];

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    logger.info('API:Automations', 'Fetching automations', { userId: user.id });
    return NextResponse.json(mockAutomations);
  } catch (err) {
    logApiError('API:Automations', err);
    return createErrorResponse('Failed to fetch automations', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const body = await req.json();
    logger.info('API:Automations', 'Creating automation', { userId: user.id, name: body.name });

    const newAutomation = {
      id: String(mockAutomations.length + 1),
      name: body.name,
      type: body.type,
      trigger: body.trigger,
      triggerDelay: body.triggerDelay || 0,
      subject: body.subject,
      body: body.body,
      segmentId: body.segmentId,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sent: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
    };

    mockAutomations.push(newAutomation);
    return NextResponse.json(newAutomation, { status: 201 });
  } catch (err) {
    logApiError('API:Automations', err);
    return createErrorResponse('Failed to create automation', 500);
  }
}
