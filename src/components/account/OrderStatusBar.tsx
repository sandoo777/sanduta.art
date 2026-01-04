import { CheckCircleIcon, ClockIcon, TruckIcon, CogIcon, GiftIcon } from "@heroicons/react/24/solid";

interface OrderStatusBarProps {
  currentStatus: string;
}

const statusSteps = [
  { key: "PENDING", label: "În așteptare", icon: ClockIcon },
  { key: "IN_DESIGN", label: "În design", icon: CogIcon },
  { key: "IN_PRODUCTION", label: "În producție", icon: CogIcon },
  { key: "READY_FOR_DELIVERY", label: "Gata de livrare", icon: GiftIcon },
  { key: "DELIVERED", label: "Livrată", icon: TruckIcon },
];

export default function OrderStatusBar({ currentStatus }: OrderStatusBarProps) {
  const currentStepIndex = statusSteps.findIndex((step) => step.key === currentStatus);
  const progressPercentage = currentStepIndex >= 0 ? ((currentStepIndex + 1) / statusSteps.length) * 100 : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Status comandă</h2>
      
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-200">
          <div
            className="h-full bg-[#0066FF] transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center" style={{ zIndex: 1 }}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted
                      ? "bg-[#0066FF] text-white"
                      : "bg-gray-200 text-gray-400"
                  } ${isCurrent ? "ring-4 ring-blue-100" : ""}`}
                >
                  {isCompleted ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium text-center max-w-[80px] ${
                    isCompleted ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
