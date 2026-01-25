'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  bgColor?: string;
  iconColor?: string;
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp = true,
  bgColor = 'bg-blue-50',
  iconColor = 'text-blue-600',
}: KpiCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {value}
            </p>
            {trend && (
              <p className={`text-sm mt-2 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                <span className="font-medium">
                  {trendUp ? '↑' : '↓'} {trend}
                </span>
                <span className="text-gray-500 ml-1">vs. ultima lună</span>
              </p>
            )}
          </div>
          
          <div className={`${bgColor} rounded-full p-4`}>
            <Icon className={`w-8 h-8 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
