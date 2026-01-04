"use client";

import { UserCircleIcon, CpuChipIcon } from "@heroicons/react/24/outline";

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

export default function OrderHistory({ events }: OrderHistoryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ro-RO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserIcon = (userType: string) => {
    return userType === "system" ? CpuChipIcon : UserCircleIcon;
  };

  const getUserColor = (userType: string) => {
    switch (userType) {
      case "admin":
        return "text-purple-600 bg-purple-100";
      case "system":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-blue-600 bg-blue-100";
    }
  };

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Istoric actualizări
        </h3>
        <p className="text-gray-600">Nu există actualizări înregistrate.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">
          Istoric actualizări
        </h3>
      </div>

      <div className="p-6">
        <div className="flow-root">
          <ul className="-mb-8">
            {events.map((event, eventIdx) => {
              const Icon = getUserIcon(event.userType);
              const colorClass = getUserColor(event.userType);

              return (
                <li key={event.id}>
                  <div className="relative pb-8">
                    {eventIdx !== events.length - 1 && (
                      <span
                        className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span
                          className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${colorClass}`}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-900">
                              {event.action}
                            </span>
                          </div>
                          <p className="mt-0.5 text-sm text-gray-500">
                            de către {event.user}
                          </p>
                          {event.details && (
                            <p className="mt-1 text-sm text-gray-600">
                              {event.details}
                            </p>
                          )}
                        </div>
                        <div className="mt-1 text-sm whitespace-nowrap text-gray-500">
                          <time dateTime={event.timestamp}>
                            {formatDate(event.timestamp)}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
