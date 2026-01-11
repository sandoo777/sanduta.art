/**
 * Health Check API Endpoint
 * Provides comprehensive system health status
 * 
 * Checks:
 * - API health
 * - Database health
 * - Queue health
 * - Storage health
 * - External services health
 */

import { NextRequest, NextResponse } from 'next/server';
import { useDbMonitoring } from '@/modules/monitoring/useDbMonitoring';
import { useQueueMonitoring } from '@/modules/monitoring/useQueueMonitoring';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    api: { status: string; message?: string };
    database: { status: string; message?: string; metrics?: any };
    queue: { status: string; message?: string; metrics?: any };
    storage: { status: string; message?: string };
    external: { status: string; services: Record<string, string> };
  };
}

const startTime = Date.now();

/**
 * Check database health
 */
async function checkDatabase() {
  try {
    const dbMonitor = useDbMonitoring();
    const health = await dbMonitor.checkHealth(prisma);
    
    return {
      status: health.status,
      message: health.status === 'healthy' ? 'Database is operational' : 'Database has issues',
      metrics: {
        averageQueryTime: health.averageQueryTime,
        totalQueries: health.totalQueries,
        errorRate: health.errorRate,
        slowQueries: health.slowQueries.length,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Database check failed: ${(error as Error).message}`,
    };
  }
}

/**
 * Check queue health
 */
async function checkQueue() {
  try {
    const queueMonitor = useQueueMonitoring();
    const health = await queueMonitor.getHealthStatus();
    
    return {
      status: health.healthy ? 'healthy' : 'degraded',
      message: health.healthy ? 'Queue is operational' : health.issues.join(', '),
      metrics: health.stats,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Queue check failed: ${(error as Error).message}`,
    };
  }
}

/**
 * Check storage health
 */
async function checkStorage() {
  try {
    // Check Cloudinary or other storage service
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/ping`,
        { method: 'GET', signal: AbortSignal.timeout(5000) }
      );
      
      if (response.ok) {
        return {
          status: 'healthy',
          message: 'Storage is operational',
        };
      }
    }
    
    return {
      status: 'healthy',
      message: 'Storage check skipped (not configured)',
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Storage check failed: ${(error as Error).message}`,
    };
  }
}

/**
 * Check external services
 */
async function checkExternalServices() {
  const services: Record<string, string> = {};
  
  // Check Paynet
  if (process.env.PAYNET_API_KEY) {
    try {
      const response = await fetch('https://api.paynet.md/v1/health', {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      services.paynet = response.ok ? 'healthy' : 'unhealthy';
    } catch {
      services.paynet = 'unhealthy';
    }
  }
  
  // Check Nova Poshta
  if (process.env.NOVA_POSHTA_API_KEY) {
    try {
      const response = await fetch('https://api.novaposhta.ua/v2.0/json/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: process.env.NOVA_POSHTA_API_KEY,
          modelName: 'Common',
          calledMethod: 'getTimeIntervals',
        }),
        signal: AbortSignal.timeout(5000),
      });
      services.novaPoshta = response.ok ? 'healthy' : 'unhealthy';
    } catch {
      services.novaPoshta = 'unhealthy';
    }
  }
  
  // Check Resend (email)
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
        signal: AbortSignal.timeout(5000),
      });
      services.resend = response.ok ? 'healthy' : 'unhealthy';
    } catch {
      services.resend = 'unhealthy';
    }
  }
  
  const allHealthy = Object.values(services).every(s => s === 'healthy');
  
  return {
    status: allHealthy ? 'healthy' : 'degraded',
    services,
  };
}

/**
 * GET /api/health
 * Main health check endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const uptime = Date.now() - startTime;
    
    // Run all checks in parallel
    const [database, queue, storage, external] = await Promise.all([
      checkDatabase(),
      checkQueue(),
      checkStorage(),
      checkExternalServices(),
    ]);
    
    // Determine overall status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    const checks = { api: { status: 'healthy' }, database, queue, storage, external };
    
    for (const check of Object.values(checks)) {
      if (check.status === 'unhealthy') {
        overallStatus = 'unhealthy';
        break;
      } else if (check.status === 'degraded') {
        overallStatus = 'degraded';
      }
    }
    
    const healthCheck: HealthCheck = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime,
      checks,
    };
    
    // Return appropriate status code
    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
    
    return NextResponse.json(healthCheck, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: (error as Error).message,
      },
      { status: 503 }
    );
  }
}

/**
 * HEAD /api/health
 * Simple ping endpoint
 */
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
