/**
 * API: CMS Media - Upload and manage files
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

// Mock data
let mockMedia = [
  {
    id: '1',
    name: 'banner-hero.jpg',
    originalName: 'banner-hero.jpg',
    url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200',
    type: 'IMAGE',
    mimeType: 'image/jpeg',
    size: 245678,
    width: 1200,
    height: 630,
    createdAt: '2025-01-05T10:00:00Z',
    updatedAt: '2025-01-05T10:00:00Z',
  },
  {
    id: '2',
    name: 'product-1.jpg',
    originalName: 'product-1.jpg',
    url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
    type: 'IMAGE',
    mimeType: 'image/jpeg',
    size: 156432,
    width: 800,
    height: 600,
    createdAt: '2025-01-06T11:00:00Z',
    updatedAt: '2025-01-06T11:00:00Z',
  },
  {
    id: '3',
    name: 'catalog-2025.pdf',
    originalName: 'catalog-2025.pdf',
    url: '/files/catalog-2025.pdf',
    type: 'DOCUMENT',
    mimeType: 'application/pdf',
    size: 1245678,
    createdAt: '2025-01-07T09:00:00Z',
    updatedAt: '2025-01-07T09:00:00Z',
  },
];

// GET /api/admin/cms/media
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get('folderId');

    logger.info('API:CMS:Media', 'Fetching media', { userId: user.id, folderId });

    let media = mockMedia;
    if (folderId) {
      media = media.filter(m => m.folderId === folderId);
    }

    return NextResponse.json(media);
  } catch (err) {
    logApiError('API:CMS:Media', err);
    return createErrorResponse('Failed to fetch media', 500);
  }
}

// POST /api/admin/cms/media
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    // TODO: Handle actual file upload (Cloudinary, S3, etc.)
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folderId = formData.get('folderId') as string | null;

    if (!file) {
      return createErrorResponse('No file provided', 400);
    }

    logger.info('API:CMS:Media', 'Uploading file', { 
      userId: user.id, 
      fileName: file.name,
      folderId,
    });

    // Mock upload
    const mockUrl = `https://images.unsplash.com/photo-${Date.now()}?w=800`;
    const isImage = file.type.startsWith('image/');

    const newMedia = {
      id: String(mockMedia.length + 1),
      name: file.name,
      originalName: file.name,
      url: mockUrl,
      type: isImage ? 'IMAGE' : 'DOCUMENT',
      mimeType: file.type,
      size: file.size,
      ...(isImage && { width: 800, height: 600 }),
      folderId: folderId || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockMedia.push(newMedia);

    return NextResponse.json(newMedia, { status: 201 });
  } catch (err) {
    logApiError('API:CMS:Media', err);
    return createErrorResponse('Failed to upload file', 500);
  }
}
