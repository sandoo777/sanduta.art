import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const body = await request.json();
    const { reportType, format, dateRange } = body;

    if (!reportType || !format) {
      return createErrorResponse('Report type and format are required', 400);
    }

    logger.info('API:Reports', 'Exporting report', { 
      userId: user.id, 
      reportType, 
      format 
    });

    let data: any[] = [];
    let filename = '';

    // Fetch data based on report type
    switch (reportType) {
      case 'orders':
        data = await fetchOrdersReport(dateRange);
        filename = `orders-report-${Date.now()}`;
        break;
      case 'products':
        data = await fetchProductsReport();
        filename = `products-report-${Date.now()}`;
        break;
      case 'revenue':
        data = await fetchRevenueReport(dateRange);
        filename = `revenue-report-${Date.now()}`;
        break;
      case 'customers':
        data = await fetchCustomersReport();
        filename = `customers-report-${Date.now()}`;
        break;
      default:
        return createErrorResponse('Invalid report type', 400);
    }

    // Export in requested format
    let fileContent: string;
    let contentType: string;

    switch (format) {
      case 'csv':
        fileContent = convertToCSV(data);
        contentType = 'text/csv';
        filename += '.csv';
        break;
      case 'json':
        fileContent = JSON.stringify(data, null, 2);
        contentType = 'application/json';
        filename += '.json';
        break;
      default:
        return createErrorResponse('Invalid format', 400);
    }

    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    logApiError('API:Reports', error);
    return createErrorResponse('Failed to export report', 500);
  }
}

async function fetchOrdersReport(dateRange?: { start: string; end: string }) {
  const where: any = {};
  if (dateRange) {
    where.createdAt = {
      gte: new Date(dateRange.start),
      lte: new Date(dateRange.end)
    };
  }

  return await prisma.order.findMany({
    where,
    include: {
      customer: {
        select: { name: true, email: true }
      },
      items: {
        include: {
          product: {
            select: { name: true, sku: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

async function fetchProductsReport() {
  return await prisma.product.findMany({
    include: {
      category: {
        select: { name: true }
      },
      _count: {
        select: { orderItems: true }
      }
    }
  });
}

async function fetchRevenueReport(dateRange?: { start: string; end: string }) {
  const where: any = {
    status: {
      in: ['CONFIRMED', 'IN_PRODUCTION', 'DELIVERED']
    }
  };
  
  if (dateRange) {
    where.createdAt = {
      gte: new Date(dateRange.start),
      lte: new Date(dateRange.end)
    };
  }

  return await prisma.order.findMany({
    where,
    select: {
      id: true,
      total: true,
      createdAt: true,
      status: true,
      customerName: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

async function fetchCustomersReport() {
  return await prisma.user.findMany({
    where: {
      role: 'VIEWER'
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      _count: {
        select: { orders: true }
      }
    }
  });
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  // Get headers from first object
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');

  // Convert rows
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}
