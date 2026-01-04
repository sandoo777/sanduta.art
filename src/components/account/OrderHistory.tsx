import { UserCircleIcon, CogIcon, UserIcon } from "@heroicons/react/24/outline";

interface HistoryEvent {
  id: string;
  action: string;
  user: string;
  userType: "admin" | "system" | "user";
  timestamp: string;
  details?: string;
}

interface OrderHistoryProps {
  events: HistoryEvent[];
}

const userTypeStyles = {
  admin: "bg-purple-100 text-purple-700",
  system: "bg-gray-100 text-gray-700",
  user: "bg-blue-100 text-blue-700",
};

const userTypeIcons = {
  admin: UserCircleIcon,
  system: CogIcon,
  user: UserIcon,
};

export default function OrderHistory({ events }: OrderHistoryProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Istoric modificări</h2>

      <div className="space-y-3">
        {events.map((event) => {
          const Icon = userTypeIcons[event.userType];

          return (
            <div
              key={event.id}
              className="flex gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div className="flex-shrink-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    userTypeStyles[event.userType]
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{event.action}</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      de către <span className="font-medium">{event.user}</span>
                    </p>
                  </div>
                  <time className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(event.timestamp).toLocaleDateString("ro-RO", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>

                {event.details && (
                  <p className="text-xs text-gray-600 mt-2">{event.details}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
