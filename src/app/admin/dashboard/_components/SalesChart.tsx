'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

const mockData = [
  { month: "Jan", sales: 12000 },
  { month: "Feb", sales: 15000 },
  { month: "Mar", sales: 9800 },
  { month: "Apr", sales: 17500 },
  { month: "May", sales: 21000 },
  { month: "Jun", sales: 19500 }
];

export function SalesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales (Last 6 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px'
              }}
              formatter={(value) => {
                const numValue = typeof value === 'number' ? value : 0;
                return [`${numValue.toLocaleString()} MDL`, 'Sales'];
              }}
            />
            <Line 
              type="monotone" 
              dataKey="sales" 
              stroke="#9333ea" 
              strokeWidth={3}
              dot={{ fill: '#9333ea', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      </CardContent>
    </Card>
  );
}
