import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { createErrorResponse, logApiError } from '@/lib/logger';
import { deleteFormat, FormatValidationError, getFormatById, updateFormat } from '@/modules/formats/server';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    void user;
    const { id } = await params;
    const format = await getFormatById(id);

    if (!format) {
      return createErrorResponse('Format not found', 404);
    }

    return NextResponse.json(format);
  } catch (error) {
    if (error instanceof FormatValidationError) {
      return createErrorResponse(error.message, error.status);
    }

    logApiError('API:Admin:FormatDetail', error);
    return createErrorResponse('Failed to fetch format', 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    void user;
    const { id } = await params;
    const body = await request.json();
    const format = await updateFormat(id, body);
    return NextResponse.json(format);
  } catch (error) {
    if (error instanceof FormatValidationError) {
      return createErrorResponse(error.message, error.status);
    }

    logApiError('API:Admin:FormatDetail', error);
    return createErrorResponse('Failed to update format', 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    void user;
    const { id } = await params;
    const response = await deleteFormat(id);
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof FormatValidationError) {
      return createErrorResponse(error.message, error.status);
    }

    logApiError('API:Admin:FormatDetail', error);
    return createErrorResponse('Failed to delete format', 500);
  }
}
