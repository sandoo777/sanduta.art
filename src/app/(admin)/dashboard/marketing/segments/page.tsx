/**
 * Customer Segments Management Page
 */

'use client';

import { useEffect, useState } from 'react';
import { Users, Plus, Trash2, Filter, TrendingUp, ShoppingCart } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useMarketing, CustomerSegment, SegmentType, CreateSegmentInput, SegmentFilter } from '@/modules/admin/useMarketing';

const segmentTypeLabels: Record<SegmentType, string> = {
  NEW_CUSTOMERS: 'Clienți Noi',
  RETURNING_CUSTOMERS: 'Clienți Recurenți',
  INACTIVE_CUSTOMERS: 'Clienți Inactivi',
  VIP_CUSTOMERS: 'Clienți VIP',
  ABANDONED_CART: 'Coș Abandonat',
  HIGH_VALUE: 'Valoare Mare',
  CUSTOM: 'Personalizat',
};

export default function SegmentsPage() {
  const { fetchSegments, createSegment, deleteSegment, loading } = useMarketing();
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [showDialog, setShowDialog] = useState(false);

  const [formData, setFormData] = useState<CreateSegmentInput>({
    name: '',
    type: 'CUSTOM',
    description: '',
    filters: [],
  });

  useEffect(() => {
    loadSegments();
  }, []);

  const loadSegments = async () => {
    const data = await fetchSegments();
    setSegments(data);
  };

  const handleCreate = async () => {
    const result = await createSegment(formData);
    if (result) {
      await loadSegments();
      setShowDialog(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Sigur vrei să ștergi acest segment?')) {
      const success = await deleteSegment(id);
      if (success) await loadSegments();
    }
  };

  const totalCustomers = segments.reduce((sum, s) => sum + s.customerCount, 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Segmente Clienți</h1>
          <p className="mt-2 text-gray-600">Segmentează clienții după comportament și preferințe</p>
        </div>
        <Button variant="primary" onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Segment Nou
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Segmente</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{segments.length}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <Filter className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clienți Segmentați</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{totalCustomers}</p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clienți VIP</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {segments.find((s) => s.type === 'VIP_CUSTOMERS')?.customerCount || 0}
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Segments Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {loading && <div className="col-span-full text-center py-12 text-gray-500">Se încarcă...</div>}
        {!loading && segments.map((segment) => (
          <Card key={segment.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{segment.name}</h3>
                <Badge className="mt-2">{segmentTypeLabels[segment.type]}</Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(segment.id)}>
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
            {segment.description && (
              <p className="text-sm text-gray-600 mb-4">{segment.description}</p>
            )}
            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-400" />
                <span className="text-2xl font-bold text-gray-900">{segment.customerCount}</span>
              </div>
              <Button variant="secondary" size="sm">Vezi Clienți</Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Card className="w-full max-w-xl m-4 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Segment Nou</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nume Segment"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as SegmentType })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {Object.entries(segmentTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <textarea
                placeholder="Descriere"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows={3}
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowDialog(false)}>Anulează</Button>
              <Button variant="primary" onClick={handleCreate} loading={loading}>Creează</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
