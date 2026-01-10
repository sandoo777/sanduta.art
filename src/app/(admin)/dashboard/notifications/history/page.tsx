'use client';

import { useState, useEffect } from 'react';
import { useNotificationHistory } from '@/modules/notifications/useNotifications';
import { getNotificationTypeName } from '@/lib/notifications/notificationTypes';
import { Button, Card, Badge, Input, Select } from '@/components/ui';
import { Search, Filter, Download, Mail, Bell, MessageSquare } from 'lucide-react';

export default function NotificationHistoryPage() {
  const { history, loading, filters, setFilters, fetchHistory } = useNotificationHistory();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [localFilters, setLocalFilters] = useState({
    type: '',
    status: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleApplyFilters = () => {
    setFilters({
      type: localFilters.type as any,
      status: localFilters.status,
      startDate: localFilters.startDate ? new Date(localFilters.startDate) : undefined,
      endDate: localFilters.endDate ? new Date(localFilters.endDate) : undefined,
      userId: undefined,
    });
  };

  const handleResetFilters = () => {
    setLocalFilters({
      type: '',
      status: '',
      startDate: '',
      endDate: '',
    });
    setFilters({
      type: undefined,
      status: undefined,
      startDate: undefined,
      endDate: undefined,
      userId: undefined,
    });
  };

  const handleExport = () => {
    // Export to CSV
    const csv = [
      ['Dată', 'Tip', 'Utilizator', 'Status', 'Canal', 'Mesaj'].join(','),
      ...history.map((item: any) =>
        [
          new Date(item.createdAt).toLocaleString('ro-RO'),
          getNotificationTypeName(item.type),
          item.userId,
          item.status,
          item.channel,
          `"${item.message?.replace(/"/g, '""') || ''}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `notifications_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      sent: { label: 'Trimis', className: 'bg-green-100 text-green-800' },
      failed: { label: 'Eșuat', className: 'bg-red-100 text-red-800' },
      pending: { label: 'În așteptare', className: 'bg-yellow-100 text-yellow-800' },
      queued: { label: 'În coadă', className: 'bg-blue-100 text-blue-800' },
    };

    const config = statusConfig[status] || { label: status, className: '' };
    return <Badge value={config.label} className={config.className} />;
  };

  const getChannelIcon = (channel: string) => {
    const icons: Record<string, React.ReactNode> = {
      email: <Mail className="w-4 h-4" />,
      in_app: <Bell className="w-4 h-4" />,
      sms: <MessageSquare className="w-4 h-4" />,
    };
    return icons[channel] || <Bell className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Istoric Notificări
          </h1>
          <p className="text-gray-600">
            Toate notificările trimise din sistem
          </p>
        </div>

        {/* Filters Card */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Filtre</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tip Notificare
              </label>
              <Select
                value={localFilters.type}
                onChange={(e) => setLocalFilters({ ...localFilters, type: e.target.value })}
              >
                <option value="">Toate</option>
                <option value="order_placed">Comandă Plasată</option>
                <option value="order_paid">Comandă Plătită</option>
                <option value="order_in_production">Comandă în Producție</option>
                <option value="order_shipped">Comandă Expediată</option>
                <option value="admin_new_order">Comandă Nouă (Admin)</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                value={localFilters.status}
                onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
              >
                <option value="">Toate</option>
                <option value="sent">Trimis</option>
                <option value="failed">Eșuat</option>
                <option value="pending">În așteptare</option>
                <option value="queued">În coadă</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dată Început
              </label>
              <Input
                type="date"
                value={localFilters.startDate}
                onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dată Sfârșit
              </label>
              <Input
                type="date"
                value={localFilters.endDate}
                onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="primary" onClick={handleApplyFilters}>
              Aplică Filtre
            </Button>
            <Button variant="secondary" onClick={handleResetFilters}>
              Resetează
            </Button>
            <Button variant="ghost" onClick={handleExport} className="ml-auto">
              <Download className="w-4 h-4 mr-1" />
              Export CSV
            </Button>
          </div>
        </Card>

        {/* Search */}
        <Card className="p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Caută în istoric..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* History Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dată & Oră
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tip
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilizator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Canal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mesaj
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Nu există notificări în istoric
                    </td>
                  </tr>
                ) : (
                  history
                    .filter((item: any) =>
                      searchTerm === '' ||
                      item.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      item.userId?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((item: any) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(item.createdAt).toLocaleString('ro-RO', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {getNotificationTypeName(item.type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                          {item.userId?.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            {getChannelIcon(item.channel)}
                            <span className="capitalize">{item.channel}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                          {item.message || item.title}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
