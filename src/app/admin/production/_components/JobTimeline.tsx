"use client";

interface TimelineEvent {
  id: string;
  type: "created" | "status_changed" | "priority_changed" | "assigned" | "updated";
  title: string;
  description?: string;
  timestamp: string;
  user?: string;
}

interface JobTimelineProps {
  jobId: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  status: string;
  priority: string;
  assignedTo?: {
    name: string;
  };
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ro-RO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getEventIcon(type: TimelineEvent["type"]): React.ReactNode {
  switch (type) {
    case "created":
      return (
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      );
    case "status_changed":
      return (
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    case "priority_changed":
      return (
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      );
    case "assigned":
      return (
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      );
    case "updated":
      return (
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
      );
  }
}

export default function JobTimeline(props: JobTimelineProps) {
  // Generate timeline events from job data
  const events: TimelineEvent[] = [];

  // Job created
  events.push({
    id: "created",
    type: "created",
    title: "Job Created",
    description: `Production job was created with ${props.priority} priority`,
    timestamp: props.createdAt,
  });

  // Job started
  if (props.startedAt) {
    events.push({
      id: "started",
      type: "status_changed",
      title: "Job Started",
      description: "Status changed to IN_PROGRESS",
      timestamp: props.startedAt,
    });
  }

  // Job completed
  if (props.completedAt) {
    events.push({
      id: "completed",
      type: "status_changed",
      title: "Job Completed",
      description: "Status changed to COMPLETED",
      timestamp: props.completedAt,
    });
  }

  // Assigned operator
  if (props.assignedTo) {
    events.push({
      id: "assigned",
      type: "assigned",
      title: "Operator Assigned",
      description: `Job assigned to ${props.assignedTo.name}`,
      timestamp: props.updatedAt,
    });
  }

  // Sort by timestamp (newest first)
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Timeline</h3>

      <div className="space-y-6">
        {events.length > 0 ? (
          events.map((event, _index) => (
            <div key={event.id} className="flex gap-4">
              {/* Icon */}
              <div className="flex-shrink-0">
                {getEventIcon(event.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-6 border-b border-gray-100 last:border-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formatDate(event.timestamp)}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No timeline events yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
