import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';
import ExcelJS from 'exceljs';
import { generateInvoicePDF } from '@/lib/pdf/invoice-generator';

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const body = await request.json();
    const { reportType, format, dateRange, filters } = body;

    if (!reportType || !format) {
      return createErrorResponse('Report type and format are required', 400);
    }

    logger.info('API:ReportsExport', 'Exporting report', {
      userId: user.id,
      reportType,
      format
    });

    let data: any;
    let filename = '';

    // Fetch data based on report type
    switch (reportType) {
      case 'sales':
        data = await getSalesReport(dateRange, filters);
        filename = `sales-report-${Date.now()}`;
        break;
      case 'orders':
        data = await getOrdersReport(dateRange, filters);
        filename = `orders-report-${Date.now()}`;
        break;
      case 'products':
        data = await getProductsReport(filters);
        filename = `products-report-${Date.now()}`;
        break;
      case 'inventory':
        data = await getInventoryReport(filters);
        filename = `inventory-report-${Date.now()}`;
        break;
      case 'operators':
        data = await getOperatorsReport(dateRange);
        filename = `operators-report-${Date.now()}`;
        break;
      default:
        return createErrorResponse('Invalid report type', 400);
    }

    // Export in requested format
    if (format === 'excel') {
      const buffer = await generateExcel(reportType, data);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}.xlsx"`
        }
      });
    } else if (format === 'pdf') {
      const buffer = await generateReportPDF(reportType, data);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}.pdf"`
        }
      });
    } else if (format === 'csv') {
      const csv = convertToCSV(data.rows || data);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}.csv"`
        }
      });
    } else {
      return createErrorResponse('Invalid format', 400);
    }
  } catch (error) {
    logApiError('API:ReportsExport', error);
    return createErrorResponse('Failed to export report', 500);
  }
}

// Helper functions
async function getSalesReport(dateRange?: { start: string; end: string }, filters?: any) {
  const where: any = {
    status: { in: ['IN_PRODUCTION', 'DELIVERED'] }
  };

  if (dateRange) {
    where.createdAt = {
      gte: new Date(dateRange.start),
      lte: new Date(dateRange.end)
    };
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      customer: { select: { name: true, email: true } },
      items: {
        include: {
          product: { select: { name: true, sku: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalPrice), 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    summary: {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      period: dateRange ? `${dateRange.start} - ${dateRange.end}` : 'All time'
    },
    rows: orders.map(o => ({
      orderNumber: o.orderNumber || o.id,
      customerName: o.customer?.name || o.customerName,
      customerEmail: o.customer?.email || o.customerEmail,
      totalPrice: Number(o.totalPrice),
      status: o.status,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt,
      itemsCount: o.items.length
    }))
  };
}

async function getOrdersReport(dateRange?: { start: string; end: string }, filters?: any) {
  const where: any = {};

  if (dateRange) {
    where.createdAt = {
      gte: new Date(dateRange.start),
      lte: new Date(dateRange.end)
    };
  }

  if (filters?.status) {
    where.status = filters.status;
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      customer: { select: { name: true, email: true } },
      items: {
        include: {
          product: { select: { name: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return orders.map(o => ({
    orderNumber: o.orderNumber || o.id,
    customerName: o.customer?.name || o.customerName,
    customerEmail: o.customer?.email || o.customerEmail,
    totalPrice: Number(o.totalPrice),
    status: o.status,
    paymentStatus: o.paymentStatus,
    deliveryStatus: o.deliveryStatus,
    createdAt: o.createdAt,
    items: o.items.map(i => i.product.name).join(', ')
  }));
}

async function getProductsReport(filters?: any) {
  const where: any = {};

  if (filters?.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters?.active !== undefined) {
    where.active = filters.active;
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      category: { select: { name: true } },
      _count: { select: { orderItems: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return products.map(p => ({
    name: p.name,
    sku: p.sku,
    category: p.category.name,
    price: Number(p.price),
    active: p.active,
    totalOrders: p._count.orderItems,
    createdAt: p.createdAt
  }));
}

async function getInventoryReport(filters?: any) {
  const where: any = {};

  if (filters?.lowStock) {
    where.stock = { lte: filters.threshold || 10 };
  }

  const materials = await prisma.material.findMany({
    where,
    orderBy: { name: 'asc' }
  });

  return materials.map(m => ({
    name: m.name,
    sku: m.sku,
    stock: m.stock,
    minStock: m.minStock,
    unit: m.unit,
    costPerUnit: Number(m.costPerUnit),
    totalValue: m.stock * Number(m.costPerUnit),
    status: m.stock === 0 ? 'OUT_OF_STOCK' : m.stock <= m.minStock ? 'LOW_STOCK' : 'IN_STOCK'
  }));
}

async function getOperatorsReport(dateRange?: { start: string; end: string }) {
  const where: any = {
    role: { in: ['OPERATOR', 'MANAGER'] }
  };

  const users = await prisma.user.findMany({
    where,
    include: {
      productionJobs: {
        where: dateRange ? {
          createdAt: {
            gte: new Date(dateRange.start),
            lte: new Date(dateRange.end)
          }
        } : {},
        select: {
          id: true,
          status: true,
          startedAt: true,
          completedAt: true
        }
      },
      _count: {
        select: {
          productionJobs: true,
          assignedOrders: true
        }
      }
    }
  });

  return users.map(u => {
    const completedJobs = u.productionJobs.filter(j => j.status === 'COMPLETED').length;
    const totalJobs = u.productionJobs.length;
    const efficiency = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

    return {
      name: u.name,
      email: u.email,
      role: u.role,
      totalJobs,
      completedJobs,
      efficiency: Math.round(efficiency),
      assignedOrders: u._count.assignedOrders
    };
  });
}

async function generateExcel(reportType: string, data: any): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(reportType.charAt(0).toUpperCase() + reportType.slice(1));

  // Define columns based on report type
  let columns: any[] = [];
  let rows: any[] = [];

  if (reportType === 'sales' && data.rows) {
    columns = [
      { header: 'Order Number', key: 'orderNumber', width: 20 },
      { header: 'Customer', key: 'customerName', width: 25 },
      { header: 'Email', key: 'customerEmail', width: 30 },
      { header: 'Total', key: 'totalPrice', width: 15 },
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Payment', key: 'paymentStatus', width: 15 },
      { header: 'Date', key: 'createdAt', width: 20 }
    ];
    rows = data.rows;
  } else if (Array.isArray(data)) {
    // Generic handling for array data
    if (data.length > 0) {
      columns = Object.keys(data[0]).map(key => ({
        header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        key,
        width: 20
      }));
    }
    rows = data;
  }

  worksheet.columns = columns;

  // Add rows
  rows.forEach(row => {
    worksheet.addRow(row);
  });

  // Style header
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF6366F1' }
  };

  // Add summary if available
  if (data.summary) {
    worksheet.addRow([]);
    worksheet.addRow(['Summary']);
    Object.entries(data.summary).forEach(([key, value]) => {
      worksheet.addRow([key, value]);
    });
  }

  return await workbook.xlsx.writeBuffer() as Buffer;
}

async function generateReportPDF(reportType: string, data: any): Promise<Buffer> {
  // Reuse invoice generator structure for reports
  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument({ margin: 50 });

  const buffers: Buffer[] = [];
  doc.on('data', buffers.push.bind(buffers));

  // Header
  doc.fontSize(20).text(reportType.toUpperCase() + ' REPORT', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString()}`);
  doc.moveDown();

  // Summary
  if (data.summary) {
    doc.fontSize(14).text('Summary', { underline: true });
    doc.moveDown(0.5);
    Object.entries(data.summary).forEach(([key, value]) => {
      doc.fontSize(10).text(`${key}: ${value}`);
    });
    doc.moveDown();
  }

  // Data table (simplified)
  const rows = data.rows || data;
  if (Array.isArray(rows) && rows.length > 0) {
    doc.fontSize(12).text('Details', { underline: true });
    doc.moveDown(0.5);

    rows.slice(0, 50).forEach((row: any, index: number) => {
      doc.fontSize(8).text(`${index + 1}. ${JSON.stringify(row).substring(0, 100)}...`);
    });
  }

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');

  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}
