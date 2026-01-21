"use client";

import { EmptyState } from "@/components/ui";
import { type Customer } from "@/modules/customers/useCustomers";

interface CustomerTimelineProps {
  customer: Customer;
}

interface TimelineEvent {
  id: string;
  type: "created" | "order" | "note" | "tag" | "updated";
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
}

export default function CustomerTimeline({ customer }: CustomerTimelineProps) {
  // Generate timeline events from customer data
  const generateEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    // Customer created event
    events.push({
      id: "created",
      type: "created",
      title: "Client înregistrat",
      description: `${customer.name} a fost adăugat în sistem`,
      timestamp: customer.createdAt,
      icon: "user-add",
      color: "blue",
    });

    // First order event (if has orders)
    if (customer.statistics && customer.statistics.totalOrders > 0) {
      events.push({
        id: "first-order",
        type: "order",
        title: "Prima comandă",
        description: `Prima comandă plasată - Total: ${customer.statistics.totalOrders} comenzi`,
        timestamp: customer.createdAt, // Mock - ar trebui să fie data primei comenzi
        icon: "shopping-cart",
        color: "green",
      });
    }

    // Notes added events
    if (customer.notes && customer.notes.length > 0) {
      customer.notes.slice(0, 3).forEach((note, _index) => {
        events.push({
          id: `note-${note.id}`,
          type: "note",
          title: "Notă adăugată",
          description: note.content.substring(0, 100) + (note.content.length > 100 ? "..." : ""),
          timestamp: note.createdAt,
          icon: "document-text",
          color: "yellow",
        });
      });
    }

    // Tags added events
    if (customer.tags && customer.tags.length > 0) {
      customer.tags.forEach((tag) => {
        events.push({
          id: `tag-${tag.id}`,
          type: "tag",
          title: "Tag adăugat",
          description: `Tag "${tag.label}" aplicat`,
          timestamp: customer.createdAt, // Mock - tags don't have createdAt
          icon: "tag",
          color: "purple",
        });
      });
    }

    // Last order event
    if (customer.statistics?.lastOrderDate) {
      events.push({
        id: "last-order",
        type: "order",
        title: "Ultima comandă",
        description: `Total cheltuit: ${customer.statistics.totalSpent.toFixed(2)} RON`,
        timestamp: customer.statistics.lastOrderDate,
        icon: "shopping-bag",
        color: "green",
      });
    }

    // Updated event (if different from created)
    if (customer.updatedAt !== customer.createdAt) {
      events.push({
        id: "updated",
        type: "updated",
        title: "Profil actualizat",
        description: "Informațiile clientului au fost modificate",
        timestamp: customer.updatedAt,
        icon: "pencil",
        color: "gray",
      });
    }

    // Sort by timestamp (newest first)
    return events.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const events = generateEvents();

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get icon SVG
  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      "user-add": (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      ),
      "shopping-cart": (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      ),
      "shopping-bag": (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      ),
      "document-text": (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      ),
      "tag": (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      ),
      "pencil": (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      ),
    };
    return icons[iconName] || icons["document-text"];
  };

  // Get color classes
  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; ring: string }> = {
      blue: { bg: "bg-blue-100", text: "text-blue-600", ring: "ring-blue-200" },
      green: { bg: "bg-green-100", text: "text-green-600", ring: "ring-green-200" },
      yellow: { bg: "bg-yellow-100", text: "text-yellow-600", ring: "ring-yellow-200" },
      purple: { bg: "bg-purple-100", text: "text-purple-600", ring: "ring-purple-200" },
      gray: { bg: "bg-gray-100", text: "text-gray-600", ring: "ring-gray-200" },
    };
    return colors[color] || colors.gray;
  };

  if (events.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        title="Nu există activitate"
        description="Activitățile clientului vor apărea aici"
      />
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {events.map((event, eventIdx) => {
          const colorClasses = getColorClasses(event.color);
          
          return (
            <li key={event.id}>
              <div className="relative pb-8">
                {/* Connecting line */}
                {eventIdx !== events.length - 1 && (
                  <span
                    className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}

                <div className="relative flex items-start space-x-3">
                  {/* Icon */}
                  <div className="relative">
                    <div
                      className={`h-10 w-10 rounded-full ${colorClasses.bg} ring-4 ${colorClasses.ring} flex items-center justify-center`}
                    >
                      <svg
                        className={`h-5 w-5 ${colorClasses.text}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        {getIcon(event.icon)}
                      </svg>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">{event.title}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">{formatDate(event.timestamp)}</p>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">
                      <p>{event.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
