'use client';

import { TrendingUp } from 'lucide-react';

const mockProducts = [
  { name: "Business Cards", sales: 340 },
  { name: "Flyers A5", sales: 280 },
  { name: "Photo Prints", sales: 190 },
  { name: "Large Format Banner", sales: 120 }
];

export function TopProducts() {
  const maxSales = Math.max(...mockProducts.map(p => p.sales));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Top Products</h2>
        <TrendingUp className="w-5 h-5 text-green-600" />
      </div>
      
      <div className="space-y-4">
        {mockProducts.map((product, index) => {
          const percentage = (product.sales / maxSales) * 100;
          
          return (
            <div key={product.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {product.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {product.sales}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          Based on total orders this month
        </p>
      </div>
    </div>
  );
}
