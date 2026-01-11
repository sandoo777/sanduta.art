'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  BeakerIcon,
  ShieldCheckIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

interface TestSuite {
  name: string;
  type: 'unit' | 'integration' | 'api' | 'e2e' | 'security' | 'performance';
  status: 'passed' | 'failed' | 'running' | 'pending';
  tests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  coverage?: number;
  lastRun: string;
}

interface TestRun {
  id: string;
  date: string;
  branch: string;
  commit: string;
  status: 'success' | 'failure' | 'running';
  duration: number;
  suites: TestSuite[];
}

interface PerformanceMetric {
  url: string;
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  fcp: number;
  lcp: number;
  cls: number;
  tbt: number;
}

export default function QADashboardPage() {
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [currentRun, setCurrentRun] = useState<TestRun | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTestData();
  }, []);

  const fetchTestData = async () => {
    setLoading(true);
    try {
      // Fetch test results from API
      const [runsResponse, metricsResponse] = await Promise.all([
        fetch('/api/admin/qa/test-runs'),
        fetch('/api/admin/qa/performance-metrics'),
      ]);

      if (runsResponse.ok) {
        const runs = await runsResponse.json();
        setTestRuns(runs);
        setCurrentRun(runs[0] || null);
      }

      if (metricsResponse.ok) {
        const metrics = await metricsResponse.json();
        setPerformanceMetrics(metrics);
      }
    } catch (error) {
      console.error('Failed to fetch test data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTestData();
    setRefreshing(false);
  };

  const handleRunTests = async () => {
    try {
      const response = await fetch('/api/admin/qa/trigger-tests', {
        method: 'POST',
      });

      if (response.ok) {
        alert('Tests triggered successfully! Check back in a few minutes.');
        handleRefresh();
      }
    } catch (error) {
      console.error('Failed to trigger tests:', error);
      alert('Failed to trigger tests');
    }
  };

  const handleExportReport = async () => {
    try {
      const response = await fetch('/api/admin/qa/export-report');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qa-report-${new Date().toISOString()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  const calculateOverallCoverage = () => {
    if (!currentRun || currentRun.suites.length === 0) return 0;
    const totalCoverage = currentRun.suites.reduce(
      (sum, suite) => sum + (suite.coverage || 0),
      0
    );
    return Math.round(totalCoverage / currentRun.suites.length);
  };

  const getTestTypeIcon = (type: TestSuite['type']) => {
    switch (type) {
      case 'unit':
        return <BeakerIcon className="h-5 w-5 text-blue-500" />;
      case 'integration':
        return <ChartBarIcon className="h-5 w-5 text-purple-500" />;
      case 'api':
        return <BoltIcon className="h-5 w-5 text-green-500" />;
      case 'e2e':
        return <CheckCircleIcon className="h-5 w-5 text-indigo-500" />;
      case 'security':
        return <ShieldCheckIcon className="h-5 w-5 text-red-500" />;
      case 'performance':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <BeakerIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            QA Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor test coverage, performance, and security
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleRefresh}
            loading={refreshing}
            icon={<ArrowPathIcon className="h-5 w-5" />}
          >
            Refresh
          </Button>
          <Button
            variant="secondary"
            onClick={handleExportReport}
            icon={<DocumentArrowDownIcon className="h-5 w-5" />}
          >
            Export Report
          </Button>
          <Button variant="primary" onClick={handleRunTests}>
            Run Tests
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      {currentRun && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tests</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {currentRun.suites.reduce((sum, s) => sum + s.tests, 0)}
                </p>
              </div>
              <BeakerIcon className="h-12 w-12 text-blue-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Passed</p>
                <p className="text-3xl font-bold text-green-600">
                  {currentRun.suites.reduce((sum, s) => sum + s.passed, 0)}
                </p>
              </div>
              <CheckCircleIcon className="h-12 w-12 text-green-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
                <p className="text-3xl font-bold text-red-600">
                  {currentRun.suites.reduce((sum, s) => sum + s.failed, 0)}
                </p>
              </div>
              <XCircleIcon className="h-12 w-12 text-red-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Coverage</p>
                <p className="text-3xl font-bold text-blue-600">
                  {calculateOverallCoverage()}%
                </p>
              </div>
              <ChartBarIcon className="h-12 w-12 text-blue-500 opacity-20" />
            </div>
          </Card>
        </div>
      )}

      {/* Test Suites */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Test Suites
          </h2>
          <div className="space-y-4">
            {currentRun?.suites.map((suite) => (
              <div
                key={suite.name}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-4 flex-1">
                  {getTestTypeIcon(suite.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {suite.name}
                      </h3>
                      <Badge value={suite.type} />
                      <Badge
                        value={suite.status}
                        className={
                          suite.status === 'passed'
                            ? 'bg-green-100 text-green-800'
                            : suite.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      />
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>
                        {suite.passed}/{suite.tests} passed
                      </span>
                      {suite.failed > 0 && (
                        <span className="text-red-600">{suite.failed} failed</span>
                      )}
                      {suite.skipped > 0 && (
                        <span className="text-yellow-600">{suite.skipped} skipped</span>
                      )}
                      <span>{suite.duration}ms</span>
                      {suite.coverage && <span>{suite.coverage}% coverage</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(suite.lastRun).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Performance Metrics (Lighthouse)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    URL
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    Performance
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    Accessibility
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    Best Practices
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    SEO
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    LCP
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    CLS
                  </th>
                </tr>
              </thead>
              <tbody>
                {performanceMetrics.map((metric) => (
                  <tr
                    key={metric.url}
                    className="border-b border-gray-200 dark:border-gray-700"
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {metric.url}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        value={`${metric.performance}`}
                        className={
                          metric.performance >= 90
                            ? 'bg-green-100 text-green-800'
                            : metric.performance >= 70
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        value={`${metric.accessibility}`}
                        className={
                          metric.accessibility >= 90
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        value={`${metric.bestPractices}`}
                        className={
                          metric.bestPractices >= 90
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        value={`${metric.seo}`}
                        className={
                          metric.seo >= 90
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      />
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">
                      {metric.lcp.toFixed(2)}s
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">
                      {metric.cls.toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Recent Test Runs */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Recent Test Runs
          </h2>
          <div className="space-y-3">
            {testRuns.slice(0, 10).map((run) => (
              <div
                key={run.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  {run.status === 'success' ? (
                    <CheckCircleIcon className="h-6 w-6 text-green-500" />
                  ) : run.status === 'failure' ? (
                    <XCircleIcon className="h-6 w-6 text-red-500" />
                  ) : (
                    <ClockIcon className="h-6 w-6 text-yellow-500 animate-spin" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {run.branch}
                      </p>
                      <Badge value={run.status} />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {run.commit.substring(0, 7)} • {new Date(run.date).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.round(run.duration / 1000)}s
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
