/**
 * Coupons Management Page
 */

'use client';

import { useEffect, useState } from 'react';
import { Tag, Plus, Edit, Trash2, Copy, CheckCircle, XCircle, Calendar, Users, ShoppingCart } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useMarketing, Coupon, CouponType, CreateCouponInput } from '@/modules/admin/useMarketing';
import { logger } from '@/lib/logger';

const couponTypeLabels: Record<CouponType, string> = {
  PERCENTAGE: 'Procent',
  FIXED_AMOUNT: 'Valoare Fixă',
  FREE_SHIPPING: 'Transport Gratuit',
  CATEGORY_DISCOUNT: 'Reducere Categorie',
  PRODUCT_DISCOUNT: 'Reducere Produs',
  CUSTOMER_DISCOUNT: 'Reducere Client',
};

export default function CouponsPage() {
  const { fetchCoupons, createCoupon, updateCoupon, deleteCoupon, loading } = useMarketing();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<CouponType | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'EXPIRED'>('ALL');

  // Form state
  const [formData, setFormData] = useState<CreateCouponInput>({
    code: '',
    type: 'PERCENTAGE',
    value: 0,
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    maxUses: undefined,
    usesPerCustomer: 1,
    minOrderValue: undefined,
    excludePromotions: false,
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    const data = await fetchCoupons();
    setCoupons(data);
  };

  const handleCreate = async () => {
    const result = await createCoupon(formData);
    if (result) {
      await loadCoupons();
      resetForm();
      setShowDialog(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingCoupon) return;
    const result = await updateCoupon(editingCoupon.id, formData);
    if (result) {
      await loadCoupons();
      resetForm();
      setShowDialog(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Sigur vrei să ștergi acest cupon?')) {
      const success = await deleteCoupon(id);
      if (success) {
        await loadCoupons();
      }
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    const result = await updateCoupon(coupon.id, { 
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
    });
    if (result) {
      await loadCoupons();
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      description: coupon.description,
      startDate: coupon.startDate.split('T')[0],
      endDate: coupon.endDate?.split('T')[0],
      maxUses: coupon.maxUses,
      usesPerCustomer: coupon.usesPerCustomer,
      minOrderValue: coupon.minOrderValue,
      categoryIds: coupon.categoryIds,
      productIds: coupon.productIds,
      customerIds: coupon.customerIds,
      excludePromotions: coupon.excludePromotions,
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      type: 'PERCENTAGE',
      value: 0,
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      maxUses: undefined,
      usesPerCustomer: 1,
      minOrderValue: undefined,
      excludePromotions: false,
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // TODO: Show toast notification
    logger.info('Coupons', 'Code copied', { code });
  };

  const isExpired = (endDate?: string) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  const filteredCoupons = coupons.filter((coupon) => {
    // Search filter
    if (searchQuery && !coupon.code.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Type filter
    if (filterType !== 'ALL' && coupon.type !== filterType) {
      return false;
    }

    // Status filter
    if (filterStatus === 'ACTIVE' && !coupon.active) return false;
    if (filterStatus === 'INACTIVE' && coupon.active) return false;
    if (filterStatus === 'EXPIRED' && !isExpired(coupon.endDate)) return false;

    return true;
  });

  const activeCoupons = coupons.filter((c) => c.active && !isExpired(c.endDate)).length;
  const totalUses = coupons.reduce((sum, c) => sum + c.currentUses, 0);
  const expiringCoupons = coupons.filter((c) => {
    if (!c.endDate) return false;
    const daysUntilExpiry = Math.ceil((new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  }).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cupoane</h1>
          <p className="mt-2 text-gray-600">Gestionează cupoane de reducere pentru clienți</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => {
            resetForm();
            setShowDialog(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Cupon Nou
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cupoane Active</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{activeCoupons}</p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Utilizări</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{totalUses}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expiră în 7 zile</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{expiringCoupons}</p>
            </div>
            <div className="rounded-full bg-orange-100 p-3">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cupoane</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{coupons.length}</p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <Tag className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            placeholder="Caută după cod..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as CouponType | 'ALL')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="ALL">Toate tipurile</option>
            {Object.entries(couponTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE' | 'EXPIRED')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="ALL">Toate statusurile</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="EXPIRED">Expirate</option>
          </select>
        </div>
      </Card>

      {/* Coupons List */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Cod
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tip
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Reducere
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Utilizări
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Expirare
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-500">Se încarcă...</div>
                  </td>
                </tr>
              )}
              {!loading && filteredCoupons.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Tag className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-sm text-gray-500">
                      {searchQuery || filterType !== 'ALL' || filterStatus !== 'ALL'
                        ? 'Nu s-au găsit cupoane cu aceste filtre'
                        : 'Nu există cupoane'}
                    </p>
                  </td>
                </tr>
              )}
              {!loading && filteredCoupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-gray-900">{coupon.code}</span>
                      <button
                        onClick={() => handleCopyCode(coupon.code)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    {coupon.description && (
                      <p className="mt-1 text-sm text-gray-500">{coupon.description}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge>{couponTypeLabels[coupon.type]}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-green-600">
                      {coupon.type === 'PERCENTAGE' ? `-${coupon.value}%` : 
                       coupon.type === 'FIXED_AMOUNT' ? `-${coupon.value} lei` : 
                       'Transport Gratuit'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">{coupon.currentUses}</span>
                      {coupon.maxUses && (
                        <span className="text-gray-500"> / {coupon.maxUses}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {coupon.endDate ? (
                      <div>
                        {new Date(coupon.endDate).toLocaleDateString('ro-RO')}
                        {isExpired(coupon.endDate) && (
                          <Badge className="ml-2" variant="danger">Expirat</Badge>
                        )}
                      </div>
                    ) : (
                      'Fără expirare'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {coupon.active && !isExpired(coupon.endDate) ? (
                      <Badge variant="success">Activ</Badge>
                    ) : (
                      <Badge>Inactiv</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(coupon)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(coupon.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create/Edit Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingCoupon ? 'Editează Cupon' : 'Cupon Nou'}
              </h2>

              <div className="space-y-4">
                {/* Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cod Cupon *
                  </label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Ex: WELCOME10"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tip Cupon *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as CouponType })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {Object.entries(couponTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Value */}
                {formData.type !== 'FREE_SHIPPING' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valoare {formData.type === 'PERCENTAGE' ? '(%)' : '(lei)'} *
                    </label>
                    <Input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                      min="0"
                      max={formData.type === 'PERCENTAGE' ? '100' : undefined}
                    />
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descriere
                  </label>
                  <Input
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descriere opțională"
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Start *
                    </label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Expirare
                    </label>
                    <Input
                      type="date"
                      value={formData.endDate || ''}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Usage Limits */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Utilizări Maxime
                    </label>
                    <Input
                      type="number"
                      value={formData.maxUses || ''}
                      onChange={(e) => setFormData({ ...formData, maxUses: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="Nelimitat"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Utilizări per Client
                    </label>
                    <Input
                      type="number"
                      value={formData.usesPerCustomer || 1}
                      onChange={(e) => setFormData({ ...formData, usesPerCustomer: Number(e.target.value) })}
                      min="1"
                    />
                  </div>
                </div>

                {/* Min Order Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valoare Minimă Comandă (lei)
                  </label>
                  <Input
                    type="number"
                    value={formData.minOrderValue || ''}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Fără minim"
                    min="0"
                  />
                </div>

                {/* Exclude Promotions */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="excludePromotions"
                    checked={formData.excludePromotions}
                    onChange={(e) => setFormData({ ...formData, excludePromotions: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="excludePromotions" className="ml-2 text-sm text-gray-700">
                    Nu se aplică la produse cu promoții
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    resetForm();
                    setShowDialog(false);
                  }}
                >
                  Anulează
                </Button>
                <Button
                  variant="primary"
                  onClick={editingCoupon ? handleUpdate : handleCreate}
                  loading={loading}
                >
                  {editingCoupon ? 'Salvează' : 'Creează'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
