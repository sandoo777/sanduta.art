"use client";

import { useEffect, useState } from "react";
import { Users, Award, Clock, TrendingUp } from "lucide-react";
import { useAnalytics, OperatorPerf as AnalyticsOperator } from "@/modules/admin/useAnalytics";

interface OperatorPerf {
  id: string;
  name: string;
  avatar?: string;
  jobsCompleted: number;
  avgTimePerJob: number;
  accuracy: number;
  errors: number;
  kpiScore: number;
}

export default function OperatorPerformance() {
  const { fetchOperatorPerformance, loading } = useAnalytics();
  const [operators, setOperators] = useState<OperatorPerf[]>([]);

  useEffect(() => {
    loadOperators();
    const interval = setInterval(loadOperators, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadOperators = async () => {
    const data = await fetchOperatorPerformance();
    if (data) {
      // Transform AnalyticsOperator to OperatorPerf
      const transformed = data.map(item => ({
        id: item.id,
        name: item.name,
        jobsCompleted: item.jobsCompleted,
        avgTimePerJob: item.avgTime,
        accuracy: item.accuracy,
        errors: item.errors,
        kpiScore: item.kpiScore,
      }));
      setOperators(transformed);
    }
  };

  if (loading && operators.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 70) return "text-blue-600 bg-blue-100";
    if (score >= 50) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-100 text-purple-600 w-10 h-10 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Operatori</h2>
          <p className="text-sm text-gray-600">Performanță echipă</p>
        </div>
      </div>

      {/* Operators List */}
      <div className="space-y-4">
        {operators.slice(0, 5).map((operator, index) => (
          <div
            key={operator.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              {/* Operator Info */}
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {operator.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{operator.name}</h3>
                  <p className="text-xs text-gray-600">
                    #{index + 1} în echipă
                  </p>
                </div>
              </div>

              {/* KPI Score */}
              <div
                className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(
                  operator.kpiScore
                )}`}
              >
                {operator.kpiScore}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded p-2">
                <div className="flex items-center gap-1 mb-1">
                  <Award className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-600">Joburi</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {operator.jobsCompleted}
                </p>
              </div>

              <div className="bg-gray-50 rounded p-2">
                <div className="flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-600">Timp mediu</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {operator.avgTimePerJob}h
                </p>
              </div>

              <div className="bg-gray-50 rounded p-2">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-600">Acuratețe</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {operator.accuracy}%
                </p>
              </div>

              <div className="bg-gray-50 rounded p-2">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-xs text-gray-600">Erori</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {operator.errors}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All */}
      {operators.length > 5 && (
        <button className="w-full mt-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          Vezi toți operatorii ({operators.length})
        </button>
      )}
    </div>
  );
}
