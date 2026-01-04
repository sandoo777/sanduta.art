import { TruckIcon, MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";

interface OrderDeliveryProps {
  deliveryMethod?: string;
  deliveryStatus: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  address?: string;
}

const deliveryStatusLabels: Record<string, string> = {
  pending: "În așteptare",
  processing: "În procesare",
  shipped: "În tranzit",
  delivered: "Livrată",
};

const deliveryStatusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
};

export default function OrderDelivery({
  deliveryMethod,
  deliveryStatus,
  trackingNumber,
  estimatedDelivery,
  address,
}: OrderDeliveryProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <TruckIcon className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Livrare</h2>
      </div>

      <div className="space-y-4">
        {/* Delivery Method */}
        {deliveryMethod && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Metodă livrare</p>
            <p className="text-base font-medium text-gray-900">{deliveryMethod}</p>
          </div>
        )}

        {/* Delivery Status */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Status</p>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${
              deliveryStatusColors[deliveryStatus] || "bg-gray-50 text-gray-700 border-gray-200"
            }`}
          >
            {deliveryStatusLabels[deliveryStatus] || deliveryStatus}
          </span>
        </div>

        {/* Tracking Number */}
        {trackingNumber && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Număr AWB</p>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                {trackingNumber}
              </code>
              <a
                href={`#`}
                className="text-sm text-[#0066FF] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Urmărește →
              </a>
            </div>
          </div>
        )}

        {/* Estimated Delivery */}
        {estimatedDelivery && (
          <div className="flex items-start gap-2">
            <ClockIcon className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Estimare livrare</p>
              <p className="text-sm font-medium text-gray-900">{estimatedDelivery}</p>
            </div>
          </div>
        )}

        {/* Delivery Address */}
        {address && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-start gap-2">
              <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Adresă livrare</p>
                <p className="text-sm text-gray-900 mt-1">{address}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
