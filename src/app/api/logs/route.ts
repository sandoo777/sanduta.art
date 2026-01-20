/**
 * Client-side Logs API Endpoint
 * Receives logs from frontend and processes them
 */

import { NextRequest, NextResponse } from 'next/server';
import { useLogger, LogLevel, LogCategory } from '@/modules/monitoring/useLogger';

export async function POST(_request: NextRequest) {
  try {
    const body = await request.json();
    const { level, category, message, context, timestamp } = body;

    if (!level || !category || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: level, category, message' },
        { status: 400 }
      );
    }

    // Validate level
    if (!Object.values(LogLevel).includes(level)) {
      return NextResponse.json(
        { error: `Invalid log level: ${level}` },
        { status: 400 }
      );
    }

    // Validate category
    if (!Object.values(LogCategory).includes(category)) {
      return NextResponse.json(
        { error: `Invalid log category: ${category}` },
        { status: 400 }
      );
    }

    const logger = useLogger();

    // Route to appropriate logger method
    switch (level) {
      case LogLevel.INFO:
        await logger.info(category, message, context);
        break;
      case LogLevel.WARNING:
        await logger.warning(category, message, context);
        break;
      case LogLevel.ERROR:
        await logger.error(category, message, undefined, context);
        break;
      case LogLevel.CRITICAL:
        await logger.critical(category, message, undefined, context);
        break;
      default:
        await logger.info(category, message, context);
    }

    return NextResponse.json({ success: true });
  } catch (_error) {
    console.error('Failed to process client log:', error);
    return NextResponse.json(
      { error: 'Failed to process log' },
      { status: 500 }
    );
  }
}
