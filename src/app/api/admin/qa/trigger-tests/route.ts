import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * POST /api/admin/qa/trigger-tests
 * Trigger a new test run (requires GitHub Actions API token or local test execution)
 */
export async function POST(req: NextRequest) {
  try {
    // Check authorization
    const { user, error } = await requireRole(['ADMIN']);
    if (error) return error;

    logger.info('API:QA', 'Triggering test run', { userId: user.id });

    // In production, this would:
    // 1. Trigger GitHub Actions workflow via API
    // 2. Or run tests locally in background

    // For now, trigger local tests in background
    const testCommand = 'npm test -- --run && npx playwright test';
    
    // Don't await - run in background
    execAsync(testCommand)
      .then(() => {
        logger.info('API:QA', 'Test run completed successfully');
      })
      .catch((err) => {
        logger.error('API:QA', 'Test run failed', { error: err });
      });

    return NextResponse.json({
      success: true,
      message: 'Test run triggered successfully',
      estimatedDuration: 300000, // 5 minutes
    });

  } catch (err) {
    logApiError('API:QA', err);
    return createErrorResponse('Failed to trigger tests', 500);
  }
}
