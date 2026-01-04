"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Award, Clock, Target, TrendingUp } from "lucide-react";
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
  }, []);

  if (loading && !operators) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/reports"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Operator Performance</h1>
            <p className="text-sm text-gray-600 mt-1">
              Production efficiency and job completion metrics
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Jobs Completed by Operator</h2>
            <BarChart
              data={operators.operatorJobs}
              xKey="operatorName"
              bars={[
                { key: "jobsCompleted", color: "#10b981", name: "Completed" },
                { key: "jobsInProgress", color: "#f59e0b", name: "In Progress" },
              ]}
              height={350}
            />
          </div>
        )}

        {/* Avg Completion Time */}
        {operators && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Average Completion Time</h2>
            <BarChart
              data={operators.operatorJobs}
              xKey="operatorName"
              bars={[
                { key: "avgCompletionTime", color: "#3b82f6", name: "Hours" },
              ]}
              height={350}
            />
          </div>
        )}

        {/* Efficiency Scores */}
        {operators && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Efficiency Score (0-100)</h2>
            <BarChart
              data={operators.operatorEfficiency}
              xKey="operatorName"
              bars={[
                { key: "efficiencyScore", color: "#8b5cf6", name: "Score" },
              ]}
              height={350}
              layout="vertical"
            />
          </div>
        )}

        {/* On-time vs Late Jobs */}
        {operators && operators.operatorEfficiency.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">On-time vs Late Jobs (Total)</h2>
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
          </div>
        )}
      </div>

      {/* Operators Table */}
      {operators && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Operator Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Operator</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Completed</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">In Progress</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Avg Time</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {operators.operatorJobs.map((operator) => {
                  const efficiency = operators.operatorEfficiency.find(
                    e => e.operatorId === operator.operatorId
                  );
                  return (
                    <tr key={operator.operatorId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{operator.operatorName}</p>
                          <p className="text-xs text-gray-500">{operator.operatorEmail}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-right">{operator.jobsCompleted}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-right">{operator.jobsInProgress}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-right">
                        {operator.avgCompletionTime.toFixed(1)}h
                      </td>
                      <td className="py-3 px-4 text-sm text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          efficiency && efficiency.efficiencyScore >= 80
                            ? "bg-green-100 text-green-800"
                            : efficiency && efficiency.efficiencyScore >= 60
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {efficiency ? efficiency.efficiencyScore.toFixed(0) : "N/A"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Completion Time Details */}
      {operators && operators.completionTimesByOperator.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Completion Time Statistics</h2>
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
        </div>
      )}
    </div>
  );
}
