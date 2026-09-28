import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { createErrorResponse, logApiError } from '@/lib/logger';
import { createFormat, FormatValidationError, listFormats } from '@/modules/formats/server';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    void user;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const formats = await listFormats(category ?? undefined, search ?? undefined);
    return NextResponse.json(formats);
  } catch (error) {
    if (error instanceof FormatValidationError) {
      return createErrorResponse(error.message, error.status);
    }

    logApiError('API:Admin:Formats', error);
    return createErrorResponse('Failed to fetch formats', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    void user;
    const body = await request.json();
    const format = await createFormat(body);
    return NextResponse.json(format, { status: 201 });
  } catch (error) {
    if (error instanceof FormatValidationError) {
      return createErrorResponse(error.message, error.status);
    }

    logApiError('API:Admin:Formats', error);
    return createErrorResponse('Failed to create format', 500);
  }
}
