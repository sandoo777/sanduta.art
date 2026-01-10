/**
 * Campaigns Management Page
 */

'use client';

import { useEffect, useState } from 'react';
import { Megaphone, Plus, Edit, Trash2, Play, Pause, Calendar, TrendingUp, Target, Package } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useMarketing, Campaign, CampaignType, CampaignStatus, CreateCampaignInput } from '@/modules/admin/useMarketing';

const campaignTypeLabels: Record<CampaignType, string> = {
  GENERAL_DISCOUNT: 'Reducere Generală',
  CATEGORY_DISCOUNT: 'Reducere Categorie',
  PRODUCT_DISCOUNT: 'Reducere Produs',
  SEASONAL: 'Campanie Sezonieră',
  FLASH_SALE: 'Flash Sale',
  BUNDLE: 'Bundle',
};

const statusColors: Record<CampaignStatus, string> = {
  DRAFT: 'text-gray-600 bg-gray-100',
  ACTIVE: 'text-green-600 bg-green-100',
  PAUSED: 'text-orange-600 bg-orange-100',
  ENDED: 'text-red-600 bg-red-100',
};

export default function CampaignsPage() {
  const { fetchCampaigns, createCampaign, updateCampaign, deleteCampaign, loading } = useMarketing();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [filterStatus, setFilterStatus] = useState<CampaignStatus | 'ALL'>('ALL');
  const [filterType, setFilterType] = useState<CampaignType | 'ALL'>('ALL');

  const [formData, setFormData] = useState<CreateCampaignInput>({
    name: '',
    type: 'GENERAL_DISCOUNT',
    discount: 0,
    discountType: 'PERCENTAGE',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    priority: 1,
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    const data = await fetchCampaigns();
    setCampaigns(data);
  };

  const handleCreate = async () => {
    const result = await createCampaign(formData);
    if (result) {
      await loadCampaigns();
      resetForm();
      setShowDialog(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingCampaign) return;
    const result = await updateCampaign(editingCampaign.id, formData);
    if (result) {
      await loadCampaigns();
      resetForm();
      setShowDialog(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Sigur vrei să ștergi această campanie?')) {
      const success = await deleteCampaign(id);
      if (success) {
        await loadCampaigns();
      }
    }
  };

  const handleToggleStatus = async (campaign: Campaign) => {
    const newStatus = campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    // TODO: Implement status toggle via API
    await loadCampaigns();
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      type: campaign.type,
      discount: campaign.discount,
      discountType: campaign.discountType,
      description: campaign.description,
      startDate: campaign.startDate.split('T')[0],
      endDate: campaign.endDate.split('T')[0],
      productIds: campaign.productIds,
      categoryIds: campaign.categoryIds,
      bundleProducts: campaign.bundleProducts,
      priority: campaign.priority,
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setEditingCampaign(null);
    setFormData({
      name: '',
      type: 'GENERAL_DISCOUNT',
      discount: 0,
      discountType: 'PERCENTAGE',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      priority: 1,
    });
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (filterStatus !== 'ALL' && campaign.status !== filterStatus) return false;
    if (filterType !== 'ALL' && campaign.type !== filterType) return false;
    return true;
  });

  const activeCampaigns = campaigns.filter((c) => c.status === 'ACTIVE').length;
  const totalRevenue = campaigns.reduce((sum, c) => sum + (c.revenue || 0), 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campanii Marketing</h1>
          <p className="mt-2 text-gray-600">Planifică și urmărește campanii promoționale</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => {
            resetForm();
            setShowDialog(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Campanie Nouă
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Campanii Active</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{activeCampaigns}</p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <Megaphone className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Conversii</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{totalConversions}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Venit Generat</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{totalRevenue.toLocaleString('ro-RO')} lei</p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Campanii</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{campaigns.length}</p>
            </div>
            <div className="rounded-full bg-orange-100 p-3">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as CampaignStatus | 'ALL')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="ALL">Toate statusurile</option>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Pauză</option>
            <option value="ENDED">Finalizate</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as CampaignType | 'ALL')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="ALL">Toate tipurile</option>
            {Object.entries(campaignTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {loading && (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500">Se încarcă...</div>
          </div>
        )}
        {!loading && filteredCampaigns.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Megaphone className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm text-gray-500">Nu există campanii</p>
          </div>
        )}
        {!loading && filteredCampaigns.map((campaign) => (
          <Card key={campaign.id} className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                  <Badge className={statusColors[campaign.status]}>
                    {campaign.status === 'DRAFT' && 'Draft'}
                    {campaign.status === 'ACTIVE' && 'Activ'}
                    {campaign.status === 'PAUSED' && 'Pauză'}
                    {campaign.status === 'ENDED' && 'Finalizat'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{campaign.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleStatus(campaign)}
                >
                  {campaign.status === 'ACTIVE' ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(campaign)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(campaign.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tip Campanie:</span>
                <Badge>{campaignTypeLabels[campaign.type]}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Reducere:</span>
                <span className="font-semibold text-green-600">
                  {campaign.discountType === 'PERCENTAGE' 
                    ? `-${campaign.discount}%` 
                    : `-${campaign.discount} lei`}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Perioadă:</span>
                <span className="font-medium text-gray-900">
                  {new Date(campaign.startDate).toLocaleDateString('ro-RO')} - {new Date(campaign.endDate).toLocaleDateString('ro-RO')}
                </span>
              </div>
            </div>

            {/* Metrics */}
            {(campaign.views || campaign.clicks || campaign.conversions || campaign.revenue) && (
              <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <p className="text-xs text-gray-600">Vizualizări</p>
                  <p className="text-lg font-bold text-gray-900">{campaign.views || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Click-uri</p>
                  <p className="text-lg font-bold text-gray-900">{campaign.clicks || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Conversii</p>
                  <p className="text-lg font-bold text-gray-900">{campaign.conversions || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Venit</p>
                  <p className="text-lg font-bold text-green-600">{(campaign.revenue || 0).toLocaleString('ro-RO')} lei</p>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingCampaign ? 'Editează Campanie' : 'Campanie Nouă'}
              </h2>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nume Campanie *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Flash Sale Weekend"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tip Campanie *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as CampaignType })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {Object.entries(campaignTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Discount */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tip Reducere *
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'PERCENTAGE' | 'FIXED' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="PERCENTAGE">Procent</option>
                      <option value="FIXED">Valoare Fixă</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valoare {formData.discountType === 'PERCENTAGE' ? '(%)' : '(lei)'} *
                    </label>
                    <Input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                      min="0"
                      max={formData.discountType === 'PERCENTAGE' ? '100' : undefined}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descriere
                  </label>
                  <Input
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descriere campanie"
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
                      Data Sfârșit *
                    </label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioritate (1-10)
                  </label>
                  <Input
                    type="number"
                    value={formData.priority || 1}
                    onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                    min="1"
                    max="10"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Campanii cu prioritate mai mare se aplică primul în caz de conflict
                  </p>
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
                  onClick={editingCampaign ? handleUpdate : handleCreate}
                  loading={loading}
                >
                  {editingCampaign ? 'Salvează' : 'Creează'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
