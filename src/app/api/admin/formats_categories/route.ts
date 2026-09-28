import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { createErrorResponse, logApiError } from '@/lib/logger';
import {
  createFormatCategory,
  deleteFormatCategory,
  FormatValidationError,
  listFormatCategories,
  updateFormatCategory,
} from '@/modules/formats/server';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    void user;
    void request;
    const categories = await listFormatCategories(true);
    return NextResponse.json(categories);
  } catch (error) {
    logApiError('API:Admin:FormatsCategories', error);
    return createErrorResponse('Failed to fetch format categories', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    void user;
    const body = await request.json();
    const item = await createFormatCategory(body ?? {});
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    if (error instanceof FormatValidationError) {
      return createErrorResponse(error.message, error.status);
    }

    logApiError('API:Admin:FormatsCategories', error);
    return createErrorResponse('Failed to create format category', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    void user;
    const body = await request.json();
    const id = typeof body?.id === 'string' ? body.id : '';
    if (!id) {
      return createErrorResponse('id is required', 400);
    }

    const item = await updateFormatCategory(id, body ?? {});
    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof FormatValidationError) {
      return createErrorResponse(error.message, error.status);
    }

    logApiError('API:Admin:FormatsCategories', error);
    return createErrorResponse('Failed to update format category', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    void user;
    const body = await request.json();
    const id = typeof body?.id === 'string' ? body.id : '';
    if (!id) {
      return createErrorResponse('id is required', 400);
    }

    const deleted = await deleteFormatCategory(id);
    return NextResponse.json(deleted);
  } catch (error) {
    if (error instanceof FormatValidationError) {
      return createErrorResponse(error.message, error.status);
    }

    logApiError('API:Admin:FormatsCategories', error);
    return createErrorResponse('Failed to delete format category', 500);
  }
}
