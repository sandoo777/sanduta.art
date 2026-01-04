"use client";

import { CheckCircleIcon, ClockIcon, TruckIcon, XCircleIcon } from "@heroicons/react/24/solid";

interface OrderStatusBarProps {
  currentStatus: string;
}

const orderSteps = [
  { key: "PENDING", label: "În procesare", icon: ClockIcon },
  { key: "IN_DESIGN", label: "În design", icon: ClockIcon },
  { key: "IN_PRODUCTION", label: "În producție", icon: ClockIcon },
  { key: "READY_FOR_DELIVERY", label: "Gata livrare", icon: TruckIcon },
  { key: "DELIVERED", label: "Livrată", icon: CheckCircleIcon },
];

const getStepIndex = (status: string): number => {
  const index = orderSteps.findIndex((step) => step.key === status);
  return index === -1 ? 0 : index;
};

export default function OrderStatusBar({ currentStatus }: OrderStatusBarProps) {
  const currentIndex = getStepIndex(currentStatus);
  const isCancelled = currentStatus === "CANCELLED";

  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <XCircleIcon className="w-8 h-8 text-red-600" />
          <div>
            <h3 className="text-lg font-semibold text-red-900">Comandă anulată</h3>
            <p className="text-sm text-red-700">Această comandă a fost anulată</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${(currentIndex / (orderSteps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {orderSteps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={step.key} className="flex flex-col items-center" style={{ flex: 1 }}>
                {/* Icon Circle */}
                <div
                  className={`
                    relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all
                    ${
                      isCompleted
                        ? "bg-blue-600 border-blue-600"
                        : "bg-white border-gray-300"
                    }
                    ${isCurrent ? "ring-4 ring-blue-100" : ""}
                  `}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isCompleted ? "text-white" : "text-gray-400"
                    }`}
                  />
                </div>

                {/* Label */}
                <div className="mt-2 text-center">
                  <p
                    className={`text-xs font-medium ${
                      isCompleted ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
