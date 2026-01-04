"use client";

import { TruckIcon, MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";

interface OrderDeliveryProps {
  deliveryMethod?: string;
  estimatedTime?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  deliveryAddress?: string;
  deliveryStatus?: string;
}

export default function OrderDelivery({
  deliveryMethod,
  estimatedTime,
  trackingNumber,
  trackingUrl,
  deliveryAddress,
  deliveryStatus,
}: OrderDeliveryProps) {
  const getDeliveryStatusLabel = (status?: string) => {
    switch (status) {
      case "pending":
        return { label: "În așteptare", color: "bg-yellow-100 text-yellow-800" };
      case "shipped":
        return { label: "În tranzit", color: "bg-blue-100 text-blue-800" };
      case "delivered":
        return { label: "Livrată", color: "bg-green-100 text-green-800" };
      default:
        return { label: "În procesare", color: "bg-gray-100 text-gray-800" };
    }
  };

  const statusInfo = getDeliveryStatusLabel(deliveryStatus);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Livrare</h3>
      </div>

      <div className="p-6 space-y-4">
        {/* Delivery Method */}
        {deliveryMethod && (
          <div className="flex items-start gap-3">
            <TruckIcon className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Metodă livrare</p>
              <p className="text-sm text-gray-600 mt-0.5">{deliveryMethod}</p>
            </div>
          </div>
        )}

        {/* Delivery Status */}
        {deliveryStatus && (
          <div className="flex items-start gap-3">
            <ClockIcon className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Status</p>
              <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        )}

        {/* Estimated Time */}
        {estimatedTime && (
          <div className="flex items-start gap-3">
            <ClockIcon className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Timp estimat</p>
              <p className="text-sm text-gray-600 mt-0.5">{estimatedTime}</p>
            </div>
          </div>
        )}

        {/* Tracking Number */}
        {trackingNumber && (
          <div className="flex items-start gap-3">
            <TruckIcon className="w-5 h-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">AWB / Tracking</p>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                  {trackingNumber}
                </code>
                {trackingUrl && (
                  <a
                    href={trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Urmărește →
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delivery Address */}
        {deliveryAddress && (
          <div className="flex items-start gap-3 pt-4 border-t border-gray-200">
            <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Adresă livrare</p>
              <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-line">
                {deliveryAddress}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
