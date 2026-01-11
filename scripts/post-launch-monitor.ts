#!/usr/bin/env ts-node
/**
 * POST-LAUNCH MONITORING DASHBOARD
 * =================================
 * 
 * Monitorizare intensivă 24h și 72h după lansare
 * Track: traffic, orders, errors, performance, conversions
 * 
 * Usage: npm run monitor:post-launch
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  baseUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  refreshInterval: 60000, // 1 minute
  dataRetention: 72 * 60 * 60 * 1000, // 72 hours
  alertThresholds: {
    errorRate: 0.05, // 5%
    responseTime: 2000, // 2s
    orderRate: -0.5, // -50% drop
    bounceRate: 0.7, // 70%
    cartAbandonmentRate: 0.8, // 80%
  },
};

// ============================================
// TYPES
// ============================================

interface MetricSnapshot {
  timestamp: Date;
  traffic: {
    pageViews: number;
    uniqueVisitors: number;
    bounceRate: number;
    avgSessionDuration: number;
  };
  orders: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    revenue: number;
    avgOrderValue: number;
  };
  errors: {
    total: number;
    rate: number;
    byType: Record<string, number>;
    critical: string[];
  };
  performance: {
    avgResponseTime: number;
    p95ResponseTime: number;
    uptime: number;
    slowestEndpoints: Array<{ path: string; avgTime: number }>;
  };
  conversions: {
    visitToCart: number;
    cartToCheckout: number;
    checkoutToOrder: number;
    overallConversionRate: number;
    cartAbandonmentRate: number;
  };
  production: {
    ordersInProduction: number;
    avgProductionTime: number;
    delayedOrders: number;
  };
}

interface Alert {
  severity: 'critical' | 'warning' | 'info';
  metric: string;
  message: string;
  timestamp: Date;
  value?: number;
  threshold?: number;
}

interface MonitoringReport {
  startTime: Date;
  endTime: Date;
  snapshots: MetricSnapshot[];
  alerts: Alert[];
  summary: {
    totalPageViews: number;
    totalOrders: number;
    totalRevenue: number;
    avgErrorRate: number;
    avgResponseTime: number;
    conversionRate: number;
    incidents: number;
  };
}

// ============================================
// DATA COLLECTION
// ============================================

async function fetchMetrics(): Promise<MetricSnapshot> {
  try {
    // Fetch from API
    const response = await fetch(`${CONFIG.baseUrl}/api/admin/monitoring/metrics`);
    
    if (!response.ok) {
      throw new Error(`Metrics API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      timestamp: new Date(),
      traffic: data.traffic || {
        pageViews: 0,
        uniqueVisitors: 0,
        bounceRate: 0,
        avgSessionDuration: 0,
      },
      orders: data.orders || {
        total: 0,
        completed: 0,
        pending: 0,
        cancelled: 0,
        revenue: 0,
        avgOrderValue: 0,
      },
      errors: data.errors || {
        total: 0,
        rate: 0,
        byType: {},
        critical: [],
      },
      performance: data.performance || {
        avgResponseTime: 0,
        p95ResponseTime: 0,
        uptime: 100,
        slowestEndpoints: [],
      },
      conversions: data.conversions || {
        visitToCart: 0,
        cartToCheckout: 0,
        checkoutToOrder: 0,
        overallConversionRate: 0,
        cartAbandonmentRate: 0,
      },
      production: data.production || {
        ordersInProduction: 0,
        avgProductionTime: 0,
        delayedOrders: 0,
      },
    };
  } catch (error) {
    console.error('Error fetching metrics:', error);
    
    // Return empty snapshot on error
    return {
      timestamp: new Date(),
      traffic: { pageViews: 0, uniqueVisitors: 0, bounceRate: 0, avgSessionDuration: 0 },
      orders: { total: 0, completed: 0, pending: 0, cancelled: 0, revenue: 0, avgOrderValue: 0 },
      errors: { total: 0, rate: 0, byType: {}, critical: [] },
      performance: { avgResponseTime: 0, p95ResponseTime: 0, uptime: 100, slowestEndpoints: [] },
      conversions: { visitToCart: 0, cartToCheckout: 0, checkoutToOrder: 0, overallConversionRate: 0, cartAbandonmentRate: 0 },
      production: { ordersInProduction: 0, avgProductionTime: 0, delayedOrders: 0 },
    };
  }
}

// ============================================
// ALERT DETECTION
// ============================================

function detectAlerts(
  current: MetricSnapshot,
  previous?: MetricSnapshot
): Alert[] {
  const alerts: Alert[] = [];
  
  // Error rate alert
  if (current.errors.rate > CONFIG.alertThresholds.errorRate) {
    alerts.push({
      severity: 'critical',
      metric: 'error_rate',
      message: `Error rate ${(current.errors.rate * 100).toFixed(2)}% exceeds threshold ${(CONFIG.alertThresholds.errorRate * 100)}%`,
      timestamp: new Date(),
      value: current.errors.rate,
      threshold: CONFIG.alertThresholds.errorRate,
    });
  }
  
  // Response time alert
  if (current.performance.avgResponseTime > CONFIG.alertThresholds.responseTime) {
    alerts.push({
      severity: 'warning',
      metric: 'response_time',
      message: `Average response time ${current.performance.avgResponseTime}ms exceeds threshold ${CONFIG.alertThresholds.responseTime}ms`,
      timestamp: new Date(),
      value: current.performance.avgResponseTime,
      threshold: CONFIG.alertThresholds.responseTime,
    });
  }
  
  // Bounce rate alert
  if (current.traffic.bounceRate > CONFIG.alertThresholds.bounceRate) {
    alerts.push({
      severity: 'warning',
      metric: 'bounce_rate',
      message: `Bounce rate ${(current.traffic.bounceRate * 100).toFixed(1)}% exceeds threshold ${(CONFIG.alertThresholds.bounceRate * 100)}%`,
      timestamp: new Date(),
      value: current.traffic.bounceRate,
      threshold: CONFIG.alertThresholds.bounceRate,
    });
  }
  
  // Cart abandonment alert
  if (current.conversions.cartAbandonmentRate > CONFIG.alertThresholds.cartAbandonmentRate) {
    alerts.push({
      severity: 'warning',
      metric: 'cart_abandonment',
      message: `Cart abandonment ${(current.conversions.cartAbandonmentRate * 100).toFixed(1)}% exceeds threshold ${(CONFIG.alertThresholds.cartAbandonmentRate * 100)}%`,
      timestamp: new Date(),
      value: current.conversions.cartAbandonmentRate,
      threshold: CONFIG.alertThresholds.cartAbandonmentRate,
    });
  }
  
  // Critical errors
  if (current.errors.critical.length > 0) {
    alerts.push({
      severity: 'critical',
      metric: 'critical_errors',
      message: `${current.errors.critical.length} critical errors detected: ${current.errors.critical.slice(0, 3).join(', ')}`,
      timestamp: new Date(),
    });
  }
  
  // Order drop alert (if previous data available)
  if (previous && previous.orders.total > 0) {
    const orderChange = (current.orders.total - previous.orders.total) / previous.orders.total;
    
    if (orderChange < CONFIG.alertThresholds.orderRate) {
      alerts.push({
        severity: 'critical',
        metric: 'order_drop',
        message: `Orders dropped by ${(Math.abs(orderChange) * 100).toFixed(1)}% compared to previous period`,
        timestamp: new Date(),
        value: orderChange,
        threshold: CONFIG.alertThresholds.orderRate,
      });
    }
  }
  
  // Production delays
  if (current.production.delayedOrders > 0) {
    alerts.push({
      severity: 'warning',
      metric: 'production_delays',
      message: `${current.production.delayedOrders} orders are delayed in production`,
      timestamp: new Date(),
      value: current.production.delayedOrders,
    });
  }
  
  return alerts;
}

// ============================================
// DISPLAY & REPORTING
// ============================================

function displayDashboard(snapshot: MetricSnapshot, alerts: Alert[]) {
  console.clear();
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 POST-LAUNCH MONITORING DASHBOARD');
  console.log(`⏰ ${snapshot.timestamp.toLocaleString()}`);
  console.log('='.repeat(80) + '\n');
  
  // Traffic
  console.log('🚦 TRAFFIC');
  console.log(`   Page Views: ${snapshot.traffic.pageViews.toLocaleString()}`);
  console.log(`   Unique Visitors: ${snapshot.traffic.uniqueVisitors.toLocaleString()}`);
  console.log(`   Bounce Rate: ${(snapshot.traffic.bounceRate * 100).toFixed(1)}%`);
  console.log(`   Avg Session: ${Math.round(snapshot.traffic.avgSessionDuration / 1000)}s\n`);
  
  // Orders
  console.log('🛒 ORDERS');
  console.log(`   Total: ${snapshot.orders.total}`);
  console.log(`   Completed: ${snapshot.orders.completed}`);
  console.log(`   Pending: ${snapshot.orders.pending}`);
  console.log(`   Revenue: ${snapshot.orders.revenue.toLocaleString()} MDL`);
  console.log(`   Avg Order Value: ${snapshot.orders.avgOrderValue.toLocaleString()} MDL\n`);
  
  // Errors
  console.log('⚠️  ERRORS');
  console.log(`   Total: ${snapshot.errors.total}`);
  console.log(`   Error Rate: ${(snapshot.errors.rate * 100).toFixed(2)}%`);
  console.log(`   Critical: ${snapshot.errors.critical.length}\n`);
  
  // Performance
  console.log('⚡ PERFORMANCE');
  console.log(`   Avg Response: ${snapshot.performance.avgResponseTime}ms`);
  console.log(`   P95 Response: ${snapshot.performance.p95ResponseTime}ms`);
  console.log(`   Uptime: ${snapshot.performance.uptime.toFixed(2)}%\n`);
  
  // Conversions
  console.log('💰 CONVERSIONS');
  console.log(`   Visit → Cart: ${(snapshot.conversions.visitToCart * 100).toFixed(1)}%`);
  console.log(`   Cart → Checkout: ${(snapshot.conversions.cartToCheckout * 100).toFixed(1)}%`);
  console.log(`   Checkout → Order: ${(snapshot.conversions.checkoutToOrder * 100).toFixed(1)}%`);
  console.log(`   Overall Rate: ${(snapshot.conversions.overallConversionRate * 100).toFixed(2)}%`);
  console.log(`   Cart Abandonment: ${(snapshot.conversions.cartAbandonmentRate * 100).toFixed(1)}%\n`);
  
  // Production
  console.log('🏭 PRODUCTION');
  console.log(`   In Production: ${snapshot.production.ordersInProduction}`);
  console.log(`   Avg Time: ${Math.round(snapshot.production.avgProductionTime / 3600)}h`);
  console.log(`   Delayed: ${snapshot.production.delayedOrders}\n`);
  
  // Alerts
  if (alerts.length > 0) {
    console.log('🚨 ACTIVE ALERTS');
    for (const alert of alerts) {
      const icon = alert.severity === 'critical' ? '🔴' : alert.severity === 'warning' ? '🟠' : '🔵';
      console.log(`   ${icon} [${alert.severity.toUpperCase()}] ${alert.message}`);
    }
    console.log();
  }
  
  console.log('='.repeat(80));
  console.log(`Next refresh in ${CONFIG.refreshInterval / 1000}s | Press Ctrl+C to stop`);
  console.log('='.repeat(80) + '\n');
}

function generateMarkdownReport(report: MonitoringReport): string {
  let md = '# Post-Launch Monitoring Report\n\n';
  
  md += `**Period**: ${report.startTime.toLocaleString()} - ${report.endTime.toLocaleString()}\n\n`;
  md += `**Duration**: ${Math.round((report.endTime.getTime() - report.startTime.getTime()) / (1000 * 60 * 60))} hours\n\n`;
  
  md += '## Summary\n\n';
  md += `- **Total Page Views**: ${report.summary.totalPageViews.toLocaleString()}\n`;
  md += `- **Total Orders**: ${report.summary.totalOrders}\n`;
  md += `- **Total Revenue**: ${report.summary.totalRevenue.toLocaleString()} MDL\n`;
  md += `- **Avg Error Rate**: ${(report.summary.avgErrorRate * 100).toFixed(2)}%\n`;
  md += `- **Avg Response Time**: ${report.summary.avgResponseTime}ms\n`;
  md += `- **Conversion Rate**: ${(report.summary.conversionRate * 100).toFixed(2)}%\n`;
  md += `- **Incidents**: ${report.summary.incidents}\n\n`;
  
  // Status
  const status = report.summary.incidents === 0 ? '✅ STABLE' :
                 report.summary.incidents < 5 ? '⚠️ MINOR ISSUES' : '🚨 NEEDS ATTENTION';
  
  md += `## Status: ${status}\n\n`;
  
  // Critical alerts
  const criticalAlerts = report.alerts.filter(a => a.severity === 'critical');
  
  if (criticalAlerts.length > 0) {
    md += '## Critical Issues\n\n';
    for (const alert of criticalAlerts) {
      md += `- **${alert.metric}**: ${alert.message} (${alert.timestamp.toLocaleString()})\n`;
    }
    md += '\n';
  }
  
  // Recommendations
  md += '## Recommendations\n\n';
  
  if (report.summary.avgErrorRate > 0.05) {
    md += '- ⚠️ Error rate above threshold - investigate logs\n';
  }
  
  if (report.summary.avgResponseTime > 2000) {
    md += '- ⚠️ Response time slow - optimize queries/caching\n';
  }
  
  if (report.summary.conversionRate < 0.02) {
    md += '- ⚠️ Low conversion rate - review UX/checkout flow\n';
  }
  
  if (criticalAlerts.length === 0 && report.summary.incidents < 3) {
    md += '- ✅ Platform performing well - continue monitoring\n';
  }
  
  return md;
}

// ============================================
// MAIN MONITORING LOOP
// ============================================

async function startMonitoring(duration?: number) {
  console.log('🚀 Starting post-launch monitoring...\n');
  
  const snapshots: MetricSnapshot[] = [];
  const alerts: Alert[] = [];
  const startTime = new Date();
  let previousSnapshot: MetricSnapshot | undefined;
  
  const monitoringLoop = async () => {
    const snapshot = await fetchMetrics();
    snapshots.push(snapshot);
    
    const newAlerts = detectAlerts(snapshot, previousSnapshot);
    alerts.push(...newAlerts);
    
    displayDashboard(snapshot, newAlerts);
    
    // Send critical alerts to Slack
    for (const alert of newAlerts.filter(a => a.severity === 'critical')) {
      await sendSlackAlert(alert);
    }
    
    previousSnapshot = snapshot;
    
    // Clean old data
    const cutoff = Date.now() - CONFIG.dataRetention;
    while (snapshots.length > 0 && snapshots[0].timestamp.getTime() < cutoff) {
      snapshots.shift();
    }
  };
  
  // Initial run
  await monitoringLoop();
  
  // Setup interval
  const intervalId = setInterval(monitoringLoop, CONFIG.refreshInterval);
  
  // Stop after duration (if specified)
  if (duration) {
    setTimeout(() => {
      clearInterval(intervalId);
      
      const endTime = new Date();
      const report: MonitoringReport = {
        startTime,
        endTime,
        snapshots,
        alerts,
        summary: {
          totalPageViews: snapshots.reduce((sum, s) => sum + s.traffic.pageViews, 0),
          totalOrders: snapshots.reduce((sum, s) => sum + s.orders.total, 0),
          totalRevenue: snapshots.reduce((sum, s) => sum + s.orders.revenue, 0),
          avgErrorRate: snapshots.reduce((sum, s) => sum + s.errors.rate, 0) / snapshots.length,
          avgResponseTime: Math.round(snapshots.reduce((sum, s) => sum + s.performance.avgResponseTime, 0) / snapshots.length),
          conversionRate: snapshots.reduce((sum, s) => sum + s.conversions.overallConversionRate, 0) / snapshots.length,
          incidents: alerts.filter(a => a.severity === 'critical').length,
        },
      };
      
      const reportMd = generateMarkdownReport(report);
      
      const reportPath = path.join(process.cwd(), 'POST_LAUNCH_MONITORING_REPORT.md');
      fs.writeFileSync(reportPath, reportMd);
      
      console.log(`\n✅ Monitoring complete. Report saved to ${reportPath}\n`);
      
      process.exit(0);
    }, duration);
  }
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    clearInterval(intervalId);
    console.log('\n\n👋 Monitoring stopped.\n');
    process.exit(0);
  });
}

async function sendSlackAlert(alert: Alert) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    return; // Skip if not configured
  }
  
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 *${alert.severity.toUpperCase()} ALERT*\n\n*Metric*: ${alert.metric}\n*Message*: ${alert.message}\n*Time*: ${alert.timestamp.toLocaleString()}`,
      }),
    });
  } catch (error) {
    console.error('Failed to send Slack alert:', error);
  }
}

// ============================================
// CLI EXECUTION
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const durationHours = parseInt(args[0]) || undefined;
  
  if (durationHours) {
    console.log(`Monitoring for ${durationHours} hours...\n`);
    await startMonitoring(durationHours * 60 * 60 * 1000);
  } else {
    console.log('Monitoring indefinitely (press Ctrl+C to stop)...\n');
    await startMonitoring();
  }
}

if (require.main === module) {
  main();
}

export { startMonitoring, fetchMetrics, detectAlerts };
export type { MetricSnapshot, Alert, MonitoringReport };
