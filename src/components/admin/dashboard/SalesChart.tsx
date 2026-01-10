"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Calendar } from "lucide-react";
import { useAnalytics, DataPoint as AnalyticsDataPoint } from "@/modules/admin/useAnalytics";

type ChartType = "line" | "bar";
type Period = "day" | "week" | "month" | "year";

interface DataPoint {
  label: string;
  value: number;
  comparison?: number;
}

export default function SalesChart() {
  const { fetchSalesData, loading } = useAnalytics();
  const [chartType, setChartType] = useState<ChartType>("line");
  const [period, setPeriod] = useState<Period>("week");
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    loadSalesData();
  }, [period, compareEnabled]);

  const loadSalesData = async () => {
    const salesData = await fetchSalesData(period, compareEnabled);
    if (salesData) {
      // Transform AnalyticsDataPoint[] to DataPoint[]
      const transformed = salesData.map((item: AnalyticsDataPoint) => ({
        label: item.date,
        value: item.value,
        comparison: item.compareValue,
      }));
      setData(transformed);
    }
  };

  const maxValue = Math.max(...data.map((d) => Math.max(d.value, d.comparison || 0)));

  const getBarHeight = (value: number) => {
    return `${(value / maxValue) * 100}%`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Vânzări</h2>
            <p className="text-sm text-gray-600">Evoluție în timp</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Period Filter */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            {(["day", "week", "month", "year"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  period === p
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {p === "day" && "Zi"}
                {p === "week" && "Săptămână"}
                {p === "month" && "Lună"}
                {p === "year" && "An"}
              </button>
            ))}
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChartType("line")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                chartType === "line"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Linie
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                chartType === "bar"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Bare
            </button>
          </div>

          {/* Compare Toggle */}
          <button
            onClick={() => setCompareEnabled(!compareEnabled)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              compareEnabled
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Compară
          </button>
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-gray-500">
          Nu există date disponibile
        </div>
      ) : (
        <div className="h-80 relative">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-500">
            <span>{maxValue.toLocaleString()}</span>
            <span>{(maxValue * 0.75).toLocaleString()}</span>
            <span>{(maxValue * 0.5).toLocaleString()}</span>
            <span>{(maxValue * 0.25).toLocaleString()}</span>
            <span>0</span>
          </div>

          {/* Chart Area */}
          <div className="ml-14 h-full pb-8">
            <div className="relative h-full border-l border-b border-gray-200">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="border-t border-gray-100"></div>
                ))}
              </div>

              {/* Bars/Lines */}
              <div className="absolute inset-0 flex items-end justify-around px-4">
                {data.map((point, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1 max-w-[80px]">
                    {chartType === "bar" ? (
                      <div className="w-full flex justify-center gap-1">
                        {/* Current period bar */}
                        <div
                          className="bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer group relative"
                          style={{
                            height: getBarHeight(point.value),
                            width: compareEnabled ? "45%" : "60%",
                          }}
                          title={`${point.label}: ${point.value.toLocaleString()} RON`}
                        >
                          <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                            {point.value.toLocaleString()} RON
                          </div>
                        </div>

                        {/* Comparison bar */}
                        {compareEnabled && point.comparison !== undefined && (
                          <div
                            className="bg-gray-300 rounded-t hover:bg-gray-400 transition-colors cursor-pointer group relative"
                            style={{
                              height: getBarHeight(point.comparison),
                              width: "45%",
                            }}
                            title={`Comparație: ${point.comparison.toLocaleString()} RON`}
                          >
                            <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                              {point.comparison.toLocaleString()} RON
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Line chart points (simplified representation)
                      <div
                        className="bg-blue-500 rounded-full w-3 h-3 hover:scale-150 transition-transform cursor-pointer"
                        style={{
                          marginBottom: getBarHeight(point.value),
                        }}
                        title={`${point.label}: ${point.value.toLocaleString()} RON`}
                      ></div>
                    )}

                    {/* X-axis label */}
                    <span className="text-xs text-gray-600 mt-2 truncate max-w-full">
                      {point.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      {compareEnabled && (
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Perioada curentă</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded"></div>
            <span className="text-sm text-gray-600">Perioada anterioară</span>
          </div>
        </div>
      )}
    </div>
  );
}
