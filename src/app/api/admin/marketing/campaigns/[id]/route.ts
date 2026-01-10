/**
 * API: Campaign Operations
 * PATCH /api/admin/marketing/campaigns/[id] - Actualizare campanie
 * DELETE /api/admin/marketing/campaigns/[id] - Ștergere campanie
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

const mockCampaigns: any[] = [];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { id } = await params;
    const body = await req.json();
    logger.info('API:Campaigns', 'Updating campaign', { userId: user.id, campaignId: id });

    // TODO: Replace with Prisma update
    // const campaign = await prisma.campaign.update({
    //   where: { id },
    //   data: {
    //     ...body,
    //     updatedAt: new Date(),
    //   },
    // });

    const campaignIndex = mockCampaigns.findIndex((c) => c.id === id);
    if (campaignIndex === -1) {
      return createErrorResponse('Campaign not found', 404);
    }

    mockCampaigns[campaignIndex] = {
      ...mockCampaigns[campaignIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(mockCampaigns[campaignIndex]);
  } catch (err) {
    logApiError('API:Campaigns', err);
    return createErrorResponse('Failed to update campaign', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { id } = await params;
    logger.info('API:Campaigns', 'Deleting campaign', { userId: user.id, campaignId: id });

    // TODO: Replace with Prisma delete
    // await prisma.campaign.delete({ where: { id } });

    const campaignIndex = mockCampaigns.findIndex((c) => c.id === id);
    if (campaignIndex === -1) {
      return createErrorResponse('Campaign not found', 404);
    }

    mockCampaigns.splice(campaignIndex, 1);

    return NextResponse.json({ success: true });
  } catch (err) {
    logApiError('API:Campaigns', err);
    return createErrorResponse('Failed to delete campaign', 500);
  }
}
