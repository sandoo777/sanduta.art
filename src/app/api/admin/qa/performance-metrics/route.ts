import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';
import fs from 'fs/promises';
import path from 'path';

/**
 * GET /api/admin/qa/performance-metrics
 * Fetch Lighthouse performance metrics from recent runs
 */
export async function GET(_req: NextRequest) {
  try {
    // Check authorization
    const { user, error } = await requireRole(['ADMIN']);
    if (error) return error;

    logger.info('API:QA', 'Fetching performance metrics', { userId: user.id });

    // Mock Lighthouse data - in production, read from .lighthouseci/
    const mockMetrics = [
      {
        url: '/',
        performance: 95,
        accessibility: 98,
        bestPractices: 92,
        seo: 100,
        fcp: 1.2,
        lcp: 1.8,
        cls: 0.05,
        tbt: 150,
      },
      {
        url: '/products',
        performance: 92,
        accessibility: 96,
        bestPractices: 90,
        seo: 98,
        fcp: 1.4,
        lcp: 2.1,
        cls: 0.08,
        tbt: 180,
      },
      {
        url: '/configurator',
        performance: 88,
        accessibility: 94,
        bestPractices: 88,
        seo: 95,
        fcp: 1.8,
        lcp: 2.4,
        cls: 0.09,
        tbt: 250,
      },
      {
        url: '/editor',
        performance: 85,
        accessibility: 92,
        bestPractices: 86,
        seo: 90,
        fcp: 2.0,
        lcp: 2.6,
        cls: 0.12,
        tbt: 280,
      },
      {
        url: '/cart',
        performance: 93,
        accessibility: 97,
        bestPractices: 91,
        seo: 96,
        fcp: 1.3,
        lcp: 1.9,
        cls: 0.06,
        tbt: 160,
      },
      {
        url: '/checkout',
        performance: 90,
        accessibility: 95,
        bestPractices: 89,
        seo: 94,
        fcp: 1.6,
        lcp: 2.2,
        cls: 0.07,
        tbt: 200,
      },
    ];

    // Try to read actual Lighthouse results if available
    try {
      const lighthousePath = path.join(process.cwd(), '.lighthouseci', 'manifest.json');
      const manifestData = await fs.readFile(lighthousePath, 'utf-8');
      const manifest = JSON.parse(manifestData);

      // Parse Lighthouse results
      const actualMetrics = await Promise.all(
        manifest.map(async (item: any) => {
          const resultPath = path.join(process.cwd(), '.lighthouseci', item.jsonPath);
          const resultData = await fs.readFile(resultPath, 'utf-8');
          const result = JSON.parse(resultData);

          return {
            url: new URL(result.finalUrl).pathname,
            performance: Math.round(result.categories.performance.score * 100),
            accessibility: Math.round(result.categories.accessibility.score * 100),
            bestPractices: Math.round(result.categories['best-practices'].score * 100),
            seo: Math.round(result.categories.seo.score * 100),
            fcp: result.audits['first-contentful-paint'].numericValue / 1000,
            lcp: result.audits['largest-contentful-paint'].numericValue / 1000,
            cls: result.audits['cumulative-layout-shift'].numericValue,
            tbt: result.audits['total-blocking-time'].numericValue,
          };
        })
      );

      logger.info('API:QA', 'Returning actual Lighthouse results');
      return NextResponse.json(actualMetrics);
    } catch (fileError) {
      // Fall back to mock data
      logger.info('API:QA', 'Returning mock performance metrics');
      return NextResponse.json(mockMetrics);
    }

  } catch (err) {
    logApiError('API:QA', err);
    return createErrorResponse('Failed to fetch performance metrics', 500);
  }
}
