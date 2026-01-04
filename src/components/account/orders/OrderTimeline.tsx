"use client";

import {
  CheckCircleIcon,
  CreditCardIcon,
  DocumentCheckIcon,
  SparklesIcon,
  TruckIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  type: "success" | "info" | "warning";
}

interface OrderTimelineProps {
  events: TimelineEvent[];
}

const getIconForEvent = (title: string) => {
  if (title.includes("plasată") || title.includes("creată")) return ClockIcon;
  if (title.includes("plată") || title.includes("Plată")) return CreditCardIcon;
  if (title.includes("verificat") || title.includes("Verificat")) return DocumentCheckIcon;
  if (title.includes("producție") || title.includes("Producție")) return SparklesIcon;
  if (title.includes("livrare") || title.includes("curier")) return TruckIcon;
  if (title.includes("livrată") || title.includes("Livrată")) return CheckCircleIcon;
  return ClockIcon;
};

const getColorForType = (type: string) => {
  switch (type) {
    case "success":
      return "bg-green-100 text-green-600";
    case "warning":
      return "bg-yellow-100 text-yellow-600";
    case "info":
    default:
      return "bg-blue-100 text-blue-600";
  }
};

export default function OrderTimeline({ events }: OrderTimelineProps) {
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Istoric comandă
      </h3>

      <div className="flow-root">
        <ul className="-mb-8">
          {events.map((event, eventIdx) => {
            const Icon = getIconForEvent(event.title);
            const colorClass = getColorForType(event.type);

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
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {event.title}
                        </p>
                        {event.description && (
                          <p className="mt-0.5 text-sm text-gray-500">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500">
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
  );
}
