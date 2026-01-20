'use client';

import { useInventoryAlerts } from '@/lib/socket/socket-client';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export function InventoryAlertsWidget() {
  const { alerts, isConnected } = useInventoryAlerts();

  if (alerts.length === 0) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
      <div className="flex items-start">
        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-semibold text-yellow-800">
            Alertă Stoc Scăzut
          </h3>
          <div className="mt-2 space-y-2">
            {alerts.slice(0, 3).map((alert, index) => (
              <div key={index} className="text-sm text-yellow-700">
                <span className="font-medium">{alert.productName}</span>
                {' - '}
                <span className="text-red-600 font-semibold">{alert.stock}</span>
                {' bucăți rămase'}
              </div>
            ))}
          </div>
          {alerts.length > 3 && (
            <p className="text-xs text-yellow-600 mt-2">
              +{alerts.length - 3} alte produse
            </p>
          )}
          <Link
            href="/admin/inventory/low-stock"
            className="mt-3 inline-block text-sm font-medium text-yellow-700 hover:text-yellow-800 underline"
          >
            Vezi toate alertele →
          </Link>
        </div>
      </div>
    </div>
  );
}
