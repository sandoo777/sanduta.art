'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FileText, Download, Eye, Search, Loader2 } from 'lucide-react';
import { AuthLink } from '@/components/common/links/AuthLink';

interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  date: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  downloadUrl: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'OVERDUE'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/account/invoices');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch invoices: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Ensure data is an array before setting state
      if (Array.isArray(data)) {
        setInvoices(data);
      } else {
        console.error('Invalid data format received:', data);
        setInvoices([]);
      }
    } catch (_error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/account/invoices/${invoiceId}/download`);
      
      if (!response.ok) throw new Error('Failed to download invoice');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (_error) {
      console.error('Error downloading invoice:', error);
      alert('Eroare la descărcarea facturii');
    }
  };

  const getStatusColor = (status: Invoice['status']) => {
    const colors = {
      PAID: 'bg-green-100 text-green-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      OVERDUE: 'bg-red-100 text-red-700',
    };
    return colors[status];
  };

  const getStatusLabel = (status: Invoice['status']) => {
    const labels = {
      PAID: 'Plătită',
      PENDING: 'În așteptare',
      OVERDUE: 'Întârziată',
    };
    return labels[status];
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesFilter = filter === 'ALL' || invoice.status === filter;
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return <LoadingState text="Se încarcă facturile..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Facturile Mele</h1>
        <p className="text-gray-600 mt-2">
          Descarcă facturile pentru comenzile tale
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Caută după număr factură sau comandă..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="ALL">Toate</option>
            <option value="PAID">Plătite</option>
            <option value="PENDING">În așteptare</option>
            <option value="OVERDUE">Întârziate</option>
          </select>
        </div>
      </Card>

      {/* Invoices Table */}
      {filteredInvoices.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nicio factură găsită
          </h3>
          <p className="text-gray-600">
            {searchTerm || filter !== 'ALL'
              ? 'Încearcă să modifici filtrele de căutare'
              : 'Facturile vor apărea aici după ce vei plasa comenzi'}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Număr Factură
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comandă
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sumă
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <AuthLink
                        href={`/account/orders/${invoice.orderId}`}
                        className="text-sm text-indigo-600 hover:text-indigo-700"
                      >
                        #{invoice.orderId}
                      </AuthLink>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(invoice.date).toLocaleDateString('ro-RO')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.amount.toFixed(2)} RON
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {getStatusLabel(invoice.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          onClick={() => handleDownload(invoice.id)}
                          variant="ghost"
                          className="text-indigo-600 hover:text-indigo-700"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Descarcă
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Summary */}
      <Card className="p-6 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Facturi</p>
            <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total de Plată</p>
            <p className="text-2xl font-bold text-gray-900">
              {invoices
                .filter((inv) => inv.status === 'PENDING' || inv.status === 'OVERDUE')
                .reduce((sum, inv) => sum + inv.amount, 0)
                .toFixed(2)}{' '}
              RON
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Plătite</p>
            <p className="text-2xl font-bold text-green-600">
              {invoices.filter((inv) => inv.status === 'PAID').length}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
