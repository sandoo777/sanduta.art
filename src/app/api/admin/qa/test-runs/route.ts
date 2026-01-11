import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';
import fs from 'fs/promises';
import path from 'path';

/**
 * GET /api/admin/qa/test-runs
 * Fetch recent test runs from CI/CD artifacts or local test results
 */
export async function GET(req: NextRequest) {
  try {
    // Check authorization
    const { user, error } = await requireRole(['ADMIN']);
    if (error) return error;

    logger.info('API:QA', 'Fetching test runs', { userId: user.id });

    // Mock data for now - in production, this would fetch from:
    // 1. GitHub Actions API for CI/CD runs
    // 2. Local test results from .lighthouseci/ or playwright-report/
    // 3. Database storing historical test results

    const mockTestRuns = [
      {
        id: '1',
        date: new Date().toISOString(),
        branch: 'main',
        commit: 'abc123def456',
        status: 'success' as const,
        duration: 324000, // 5.4 minutes
        suites: [
          {
            name: 'Unit Tests',
            type: 'unit' as const,
            status: 'passed' as const,
            tests: 89,
            passed: 89,
            failed: 0,
            skipped: 0,
            duration: 12500,
            coverage: 92,
            lastRun: new Date().toISOString(),
          },
          {
            name: 'API Tests',
            type: 'api' as const,
            status: 'passed' as const,
            tests: 75,
            passed: 75,
            failed: 0,
            skipped: 0,
            duration: 45000,
            coverage: 88,
            lastRun: new Date().toISOString(),
          },
          {
            name: 'E2E Tests',
            type: 'e2e' as const,
            status: 'passed' as const,
            tests: 21,
            passed: 21,
            failed: 0,
            skipped: 0,
            duration: 180000,
            coverage: 75,
            lastRun: new Date().toISOString(),
          },
          {
            name: 'Security Tests',
            type: 'security' as const,
            status: 'passed' as const,
            tests: 35,
            passed: 35,
            failed: 0,
            skipped: 0,
            duration: 60000,
            coverage: 95,
            lastRun: new Date().toISOString(),
          },
          {
            name: 'Performance Tests',
            type: 'performance' as const,
            status: 'passed' as const,
            tests: 6,
            passed: 6,
            failed: 0,
            skipped: 0,
            duration: 26500,
            coverage: 100,
            lastRun: new Date().toISOString(),
          },
        ],
      },
      {
        id: '2',
        date: new Date(Date.now() - 3600000).toISOString(),
        branch: 'develop',
        commit: 'xyz789abc123',
        status: 'failure' as const,
        duration: 298000,
        suites: [
          {
            name: 'Unit Tests',
            type: 'unit' as const,
            status: 'passed' as const,
            tests: 89,
            passed: 89,
            failed: 0,
            skipped: 0,
            duration: 12300,
            coverage: 92,
            lastRun: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            name: 'E2E Tests',
            type: 'e2e' as const,
            status: 'failed' as const,
            tests: 21,
            passed: 19,
            failed: 2,
            skipped: 0,
            duration: 185700,
            coverage: 75,
            lastRun: new Date(Date.now() - 3600000).toISOString(),
          },
        ],
      },
    ];

    // Try to read actual test results if available
    try {
      const testResultsPath = path.join(process.cwd(), 'test-results', 'results.json');
      const data = await fs.readFile(testResultsPath, 'utf-8');
      const actualResults = JSON.parse(data);
      
      // Merge with mock data or return actual results
      logger.info('API:QA', 'Returning actual test results');
      return NextResponse.json(actualResults);
    } catch (fileError) {
      // Fall back to mock data if file doesn't exist
      logger.info('API:QA', 'Returning mock test results');
      return NextResponse.json(mockTestRuns);
    }

  } catch (err) {
    logApiError('API:QA', err);
    return createErrorResponse('Failed to fetch test runs', 500);
  }
}
