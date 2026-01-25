"use client";

import { useEffect, useState } from "react";
import { AuthLink } from '@/components/common/links/AuthLink';
import { ArrowLeft, RefreshCw, Award, Clock, Target, TrendingUp } from "lucide-react";
import { Button, Card, CardHeader, CardTitle, CardContent, LoadingState, Table } from "@/components/ui";
import { KpiCard } from "@/components/KpiCard";
import { BarChart, PieChart, LineChart } from "@/components/charts";
import { useReports } from "@/modules/reports/useReports";
import type { OperatorsReport } from "@/modules/reports/types";

export default function OperatorsReportPage() {
  const { loading, getOperators } = useReports();
  const [operators, setOperators] = useState<OperatorsReport | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    const data = await getOperators();
    setOperators(data);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !operators) {
    return (
      <div className="p-6">
        <LoadingState text="Se încarcă raportul de operatori..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <AuthLink
            href="/admin/reports"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </AuthLink>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Operator Performance</h1>
            <p className="text-sm text-gray-600 mt-1">
              Production efficiency and job completion metrics
            </p>
          </div>
        </div>
        <Button
          onClick={loadData}
          disabled={refreshing}
          variant="primary"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* KPIs */}
      {operators && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KpiCard
            title="Total Jobs"
            value={operators.totalJobs.toLocaleString()}
            icon={Target}
            color="blue"
          />
          <KpiCard
            title="Completed Jobs"
            value={operators.totalCompletedJobs.toLocaleString()}
            icon={Award}
            color="green"
          />
          <KpiCard
            title="Avg Completion Time"
            value={`${operators.avgCompletionTimeAllOperators.toFixed(1)}h`}
            icon={Clock}
            color="amber"
          />
          <KpiCard
            title="Completion Rate"
            value={`${((operators.totalCompletedJobs / operators.totalJobs) * 100).toFixed(1)}%`}
            icon={TrendingUp}
            color="purple"
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jobs Completed by Operator */}
        {operators && (
          <Card>
            <CardHeader>
              <CardTitle>Jobs Completed by Operator</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={operators.operatorJobs}
                xKey="operatorName"
                bars={[
                  { key: "jobsCompleted", color: "#10b981", name: "Completed" },
                  { key: "jobsInProgress", color: "#f59e0b", name: "In Progress" },
                ]}
                height={350}
              />
            </CardContent>
          </Card>
        )}

        {/* Avg Completion Time */}
        {operators && (
          <Card>
            <CardHeader>
              <CardTitle>Average Completion Time</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={operators.operatorJobs}
                xKey="operatorName"
                bars={[
                  { key: "avgCompletionTime", color: "#3b82f6", name: "Hours" },
                ]}
                height={350}
              />
            </CardContent>
          </Card>
        )}

        {/* Efficiency Scores */}
        {operators && (
          <Card>
            <CardHeader>
              <CardTitle>Efficiency Score (0-100)</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={operators.operatorEfficiency}
                xKey="operatorName"
                bars={[
                  { key: "efficiencyScore", color: "#8b5cf6", name: "Score" },
                ]}
                height={350}
                layout="vertical"
              />
            </CardContent>
          </Card>
        )}

        {/* On-time vs Late Jobs */}
        {operators && operators.operatorEfficiency.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>On-time vs Late Jobs (Total)</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart
                data={[
                  { 
                    name: "On-time", 
                    value: operators.operatorEfficiency.reduce((sum, op) => sum + op.onTimeJobs, 0) 
                  },
                  { 
                    name: "Late", 
                    value: operators.operatorEfficiency.reduce((sum, op) => sum + op.lateJobs, 0) 
                  },
                ]}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Operators Table */}
      {operators && (
        <Card>
          <CardHeader>
            <CardTitle>Operator Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Table
              columns={[
                {
                  key: 'operator',
                  label: 'Operator',
                  sortable: true,
                  accessor: (row) => row.operatorName,
                  render: (row) => (
                    <div>
                      <p className="text-sm font-medium text-gray-900">{row.operatorName}</p>
                      <p className="text-xs text-gray-500">{row.operatorEmail}</p>
                    </div>
                  )
                },
                {
                  key: 'completed',
                  label: 'Completed',
                  sortable: true,
                  accessor: (row) => row.jobsCompleted,
                  render: (row) => (
                    <span className="text-right block">{row.jobsCompleted}</span>
                  )
                },
                {
                  key: 'inProgress',
                  label: 'In Progress',
                  sortable: true,
                  accessor: (row) => row.jobsInProgress,
                  render: (row) => (
                    <span className="text-right block">{row.jobsInProgress}</span>
                  )
                },
                {
                  key: 'avgTime',
                  label: 'Avg Time',
                  sortable: true,
                  accessor: (row) => row.avgCompletionTime,
                  render: (row) => (
                    <span className="text-right block">{row.avgCompletionTime.toFixed(1)}h</span>
                  )
                },
                {
                  key: 'efficiency',
                  label: 'Efficiency',
                  sortable: true,
                  accessor: (row) => {
                    const efficiency = operators.operatorEfficiency.find(
                      e => e.operatorId === row.operatorId
                    );
                    return efficiency ? efficiency.efficiencyScore : 0;
                  },
                  render: (row) => {
                    const efficiency = operators.operatorEfficiency.find(
                      e => e.operatorId === row.operatorId
                    );
                    return (
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          efficiency && efficiency.efficiencyScore >= 80
                            ? "bg-green-100 text-green-800"
                            : efficiency && efficiency.efficiencyScore >= 60
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {efficiency ? efficiency.efficiencyScore.toFixed(0) : "N/A"}
                        </span>
                      </div>
                    );
                  }
                }
              ]}
              data={operators.operatorJobs}
              rowKey="operatorId"
              loading={loading}
              emptyMessage="No operator data available"
              clientSideSort={true}
              striped={true}
              responsive={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Completion Time Details */
      {operators && operators.completionTimesByOperator && operators.completionTimesByOperator.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completion Time Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {operators.completionTimesByOperator.map((operator) => (
              <div key={operator.operatorId} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{operator.operatorName}</p>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Average:</span>
                    <span className="font-medium">{operator.avgTime.toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Minimum:</span>
                    <span className="font-medium">{operator.minTime.toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Maximum:</span>
                    <span className="font-medium">{operator.maxTime.toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Jobs:</span>
                    <span className="font-medium">{operator.completionTimes.length}</span>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
