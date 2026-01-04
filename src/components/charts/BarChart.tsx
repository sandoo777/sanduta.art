"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface BarChartProps {
  data: any[];
  xKey: string;
  bars: Array<{
    key: string;
    color: string;
    name?: string;
  }>;
  height?: number;
  layout?: "horizontal" | "vertical";
}

export function BarChart({ 
  data, 
  xKey, 
  bars, 
  height = 300,
  layout = "horizontal" 
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart 
        data={data}
        layout={layout}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        {layout === "horizontal" ? (
          <>
            <XAxis 
              dataKey={xKey} 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
          </>
        ) : (
          <>
            <XAxis 
              type="number"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              type="category"
              dataKey={xKey}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              width={120}
            />
          </>
        )}
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '8px 12px'
          }}
        />
        <Legend />
        {bars.map((bar) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            fill={bar.color}
            name={bar.name || bar.key}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
