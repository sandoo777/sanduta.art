/**
 * Admin Monitoring Dashboard
 * Comprehensive system monitoring interface
 * 
 * Sections:
 * - System Health Overview
 * - API Performance
 * - Database Performance
 * - Queue Status
 * - Recent Errors
 * - Security Events
 * - Alerts
 * - Real-time Metrics
 */

'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface HealthStatus {
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

interface Alert {
  id: string;
  severity: string;
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface SecurityEvent {
  type: string;
  severity: string;
  ip: string;
  timestamp: string;
  blocked: boolean;
}

export default function MonitoringDashboard() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch health status
  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealth(data);
    } catch (error) {
      console.error('Failed to fetch health:', error);
    }
  };

  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/admin/monitoring/alerts');
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  // Fetch security events
  const fetchSecurityEvents = async () => {
    try {
      const response = await fetch('/api/admin/monitoring/security');
      const data = await response.json();
      setSecurityEvents(data);
    } catch (error) {
      console.error('Failed to fetch security events:', error);
    }
  };

  // Initial load
  useEffect(() => {
    Promise.all([fetchHealth(), fetchAlerts(), fetchSecurityEvents()])
      .finally(() => setLoading(false));
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchHealth();
      fetchAlerts();
      fetchSecurityEvents();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Acknowledge alert
  const acknowledgeAlert = async (alertId: string) => {
    try {
      await fetch(`/api/admin/monitoring/alerts/${alertId}/acknowledge`, {
        method: 'POST',
      });
      fetchAlerts();
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  // Format uptime
  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50';
      case 'unhealthy':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-purple-100 text-purple-800';
      case 'error':
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'warning':
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
          <p className="text-gray-600 mt-1">Real-time system health and performance</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant={autoRefresh ? 'primary' : 'secondary'}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? '✓ Auto-refresh' : 'Auto-refresh'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              fetchHealth();
              fetchAlerts();
              fetchSecurityEvents();
            }}
          >
            🔄 Refresh Now
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">System Health</h2>
          
          {health && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Overall Status */}
              <div className="bg-white rounded-lg border p-4">
                <div className="text-sm text-gray-600 mb-1">Overall Status</div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(health.status)}`}>
                  {health.status.toUpperCase()}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Uptime: {formatUptime(health.uptime)}
                </div>
              </div>

              {/* API Status */}
              <div className="bg-white rounded-lg border p-4">
                <div className="text-sm text-gray-600 mb-1">API</div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(health.checks.api.status)}`}>
                  {health.checks.api.status.toUpperCase()}
                </div>
                {health.checks.api.message && (
                  <div className="text-xs text-gray-500 mt-2">{health.checks.api.message}</div>
                )}
              </div>

              {/* Database Status */}
              <div className="bg-white rounded-lg border p-4">
                <div className="text-sm text-gray-600 mb-1">Database</div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(health.checks.database.status)}`}>
                  {health.checks.database.status.toUpperCase()}
                </div>
                {health.checks.database.metrics && (
                  <div className="text-xs text-gray-500 mt-2">
                    Avg query: {health.checks.database.metrics.averageQueryTime.toFixed(0)}ms
                  </div>
                )}
              </div>

              {/* Queue Status */}
              <div className="bg-white rounded-lg border p-4">
                <div className="text-sm text-gray-600 mb-1">Queue</div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(health.checks.queue.status)}`}>
                  {health.checks.queue.status.toUpperCase()}
                </div>
                {health.checks.queue.metrics && (
                  <div className="text-xs text-gray-500 mt-2">
                    Active: {health.checks.queue.metrics.active} | Pending: {health.checks.queue.metrics.pending}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Alerts */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Alerts</h2>
          
          {alerts.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No recent alerts
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-4 p-4 bg-white rounded-lg border"
                >
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                  
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{alert.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{alert.message}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>

                  {!alert.acknowledged && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </Button>
                  )}
                  
                  {alert.acknowledged && (
                    <span className="text-xs text-green-600">✓ Acknowledged</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Database Performance */}
      {health?.checks.database.metrics && (
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Database Performance</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg border p-4">
                <div className="text-sm text-gray-600 mb-1">Total Queries</div>
                <div className="text-2xl font-bold text-gray-900">
                  {health.checks.database.metrics.totalQueries.toLocaleString()}
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4">
                <div className="text-sm text-gray-600 mb-1">Avg Query Time</div>
                <div className="text-2xl font-bold text-gray-900">
                  {health.checks.database.metrics.averageQueryTime.toFixed(0)}ms
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4">
                <div className="text-sm text-gray-600 mb-1">Slow Queries</div>
                <div className="text-2xl font-bold text-gray-900">
                  {health.checks.database.metrics.slowQueries}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Queue Status */}
      {health?.checks.queue.metrics && (
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Queue Status</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg border p-4">
                <div className="text-sm text-gray-600 mb-1">Pending</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {health.checks.queue.metrics.pending}
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4">
                <div className="text-sm text-gray-600 mb-1">Active</div>
                <div className="text-2xl font-bold text-blue-600">
                  {health.checks.queue.metrics.active}
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4">
                <div className="text-sm text-gray-600 mb-1">Completed</div>
                <div className="text-2xl font-bold text-green-600">
                  {health.checks.queue.metrics.completed}
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4">
                <div className="text-sm text-gray-600 mb-1">Failed</div>
                <div className="text-2xl font-bold text-red-600">
                  {health.checks.queue.metrics.failed}
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4">
                <div className="text-sm text-gray-600 mb-1">Success Rate</div>
                <div className="text-2xl font-bold text-gray-900">
                  {(health.checks.queue.metrics.successRate * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Security Events */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Security Events</h2>
          
          {securityEvents.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No recent security events
            </div>
          ) : (
            <div className="space-y-2">
              {securityEvents.slice(0, 10).map((event, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 bg-white rounded border text-sm"
                >
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(event.severity)}`}>
                    {event.type}
                  </span>
                  
                  <div className="flex-1">
                    <span className="text-gray-900 font-mono">{event.ip}</span>
                  </div>

                  {event.blocked && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                      BLOCKED
                    </span>
                  )}

                  <span className="text-gray-400 text-xs">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* External Services */}
      {health?.checks.external.services && Object.keys(health.checks.external.services).length > 0 && (
        <Card className="mt-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">External Services</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(health.checks.external.services).map(([service, status]) => (
                <div key={service} className="bg-white rounded-lg border p-4">
                  <div className="text-sm text-gray-600 mb-1">{service}</div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                    {status.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
