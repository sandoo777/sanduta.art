"use client";

import { useEffect, useState } from "react";
import { 
  AlertTriangle, 
  FileWarning, 
  Clock as ClockIcon, 
  Wrench, 
  XCircle 
} from "lucide-react";
import { useAnalytics } from "@/modules/admin/useAnalytics";

interface Alert {
  id: string;
  type: "error" | "warning" | "info";
  category: "file" | "order" | "machine" | "operation";
  title: string;
  message: string;
  timestamp: string;
  actionUrl?: string;
}

export default function AlertsPanel() {
  const { fetchAlerts, loading } = useAnalytics();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<"all" | "error" | "warning" | "info">("all");

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    const data = await fetchAlerts();
    if (data) {
      setAlerts(data);
    }
  };

  const filteredAlerts = alerts.filter(
    (alert) => filter === "all" || alert.type === filter
  );

  const getAlertIcon = (category: string, type: string) => {
    const iconClass = `w-5 h-5 ${
      type === "error"
        ? "text-red-600"
        : type === "warning"
        ? "text-orange-600"
        : "text-blue-600"
    }`;

    switch (category) {
      case "file":
        return <FileWarning className={iconClass} />;
      case "order":
        return <ClockIcon className={iconClass} />;
      case "machine":
        return <Wrench className={iconClass} />;
      case "operation":
        return <XCircle className={iconClass} />;
      default:
        return <AlertTriangle className={iconClass} />;
    }
  };

  const getAlertBg = (type: string) => {
    switch (type) {
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-orange-50 border-orange-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("ro-RO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const errorCount = alerts.filter((a) => a.type === "error").length;
  const warningCount = alerts.filter((a) => a.type === "warning").length;
  const infoCount = alerts.filter((a) => a.type === "info").length;

  if (loading && alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Dacă nu sunt alerte, nu afișa panoul
  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 text-red-600 w-10 h-10 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Alerte & Notificări</h2>
            <p className="text-sm text-gray-600">
              {alerts.length} {alerts.length === 1 ? "alertă" : "alerte"} active
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filter === "all"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Toate ({alerts.length})
          </button>
          {errorCount > 0 && (
            <button
              onClick={() => setFilter("error")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === "error"
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Erori ({errorCount})
            </button>
          )}
          {warningCount > 0 && (
            <button
              onClick={() => setFilter("warning")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === "warning"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Avertizări ({warningCount})
            </button>
          )}
          {infoCount > 0 && (
            <button
              onClick={() => setFilter("info")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === "info"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Info ({infoCount})
            </button>
          )}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`border rounded-lg p-4 ${getAlertBg(alert.type)}`}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {getAlertIcon(alert.category, alert.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                  <span className="text-xs text-gray-600 whitespace-nowrap">
                    {formatTime(alert.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{alert.message}</p>

                {/* Action */}
                {alert.actionUrl && (
                  <a
                    href={alert.actionUrl}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Vezi detalii →
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nu există alerte de tip {filter}
        </div>
      )}
    </div>
  );
}
