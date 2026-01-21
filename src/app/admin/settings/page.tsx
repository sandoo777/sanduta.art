"use client";

import { useState, useEffect, useCallback } from "react";
import { Activity, Filter, Download, Search, Calendar, User, CheckCircle, XCircle } from "lucide-react";
import { ActivityType } from "@prisma/client";
import { Table, LoadingState, Badge } from "@/components/ui";

interface AuditLog {
  id: string;
  userId: string;
  type: ActivityType;
  ip: string;
  userAgent: string;
  success: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

const activityTypeLabels: Record<ActivityType, string> = {
  LOGIN: "Autentificare",
  LOGOUT: "Deconectare",
  PASSWORD_CHANGE: "Schimbare parolă",
  TWO_FACTOR_ENABLED: "2FA activat",
  TWO_FACTOR_DISABLED: "2FA dezactivat",
  SESSION_REVOKED: "Sesiune revocată",
  FAILED_LOGIN: "Autentificare eșuată",
  NEW_DEVICE: "Dispozitiv nou",
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ActivityType | "ALL">("ALL");
  const [successFilter, setSuccessFilter] = useState<"ALL" | "SUCCESS" | "FAILED">("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: "50",
      });
      
      if (typeFilter !== "ALL") params.append("type", typeFilter);
      if (successFilter !== "ALL") params.append("success", String(successFilter === "SUCCESS"));
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      
      const response = await fetch(`/api/admin/settings/audit-logs?${params}`);
      const data = await response.json();
      setLogs(data.logs || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (_error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, successFilter, startDate, endDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter((log) =>
    log.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.ip.includes(searchQuery)
  );

  const exportLogs = () => {
    const csv = [
      ["Data", "Utilizator", "Email", "Acțiune", "IP", "Status"].join(","),
      ...filteredLogs.map(log => [
        new Date(log.createdAt).toLocaleString(),
        log.user.name,
        log.user.email,
        activityTypeLabels[log.type],
        log.ip,
        log.success ? "Success" : "Failed"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              <Activity className="w-8 h-8 inline mr-2" />
              Audit Logs
            </h1>
            <p className="text-gray-600">
              Monitorizează și analizează activitatea utilizatorilor
            </p>
          </div>
          <button
            onClick={exportLogs}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Caută utilizator, email, IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ActivityType | "ALL")}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Toate tipurile</option>
              {Object.entries(activityTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            {/* Success Filter */}
            <select
              value={successFilter}
              onChange={(e) => setSuccessFilter(e.target.value as "ALL" | "SUCCESS" | "FAILED")}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Toate statusurile</option>
              <option value="SUCCESS">Succes</option>
              <option value="FAILED">Eșuat</option>
            </select>

            {/* Start Date */}
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Data început"
            />

            {/* End Date */}
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Data sfârșit"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Evenimente"
            value={filteredLogs.length}
            color="blue"
          />
          <StatCard
            label="Autentificări"
            value={filteredLogs.filter(l => l.type === "LOGIN").length}
            color="green"
          />
          <StatCard
            label="Eșuate"
            value={filteredLogs.filter(l => !l.success).length}
            color="red"
          />
          <StatCard
            label="Dispozitive Noi"
            value={filteredLogs.filter(l => l.type === "NEW_DEVICE").length}
            color="purple"
          />
        </div>

        {/* Logs Table */}
        <Table
          columns={[
            {
              key: 'createdAt',
              label: 'Data & Ora',
              sortable: true,
              render: (log) => (
                <div>
                  <div className="text-sm text-gray-900">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ),
            },
            {
              key: 'user',
              label: 'Utilizator',
              sortable: true,
              render: (log) => (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {log.user.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {log.user.email}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: 'type',
              label: 'Acțiune',
              render: (log) => (
                <Badge variant="primary" size="sm">
                  {activityTypeLabels[log.type]}
                </Badge>
              ),
            },
            {
              key: 'ip',
              label: 'IP Address',
              render: (log) => <code className="text-xs text-gray-600">{log.ip}</code>,
            },
            {
              key: 'success',
              label: 'Status',
              render: (log) => log.success ? (
                <span className="flex items-center gap-1 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Succes
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-600 text-sm">
                  <XCircle className="w-4 h-4" />
                  Eșuat
                </span>
              ),
            },
            {
              key: 'actions',
              label: 'Detalii',
              render: () => (
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  Vezi detalii
                </button>
              ),
            },
          ]}
          data={filteredLogs}
          rowKey="id"
          loading={loading}
          emptyMessage="Nu s-au găsit evenimente."
          clientSideSort={true}
          className="bg-white border border-gray-200 rounded-lg overflow-hidden"
        />

        {/* Pagination */}
        {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="px-4 py-2 text-gray-600">
                  Pagina {page} din {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Următorul
                </button>
              </div>
            )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className={`text-2xl font-bold text-${color}-600`}>{value}</div>
    </div>
  );
}
