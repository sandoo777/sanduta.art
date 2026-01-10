/**
 * Banners Management - Bannere promoționale
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Layout, Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  useCms, 
  type Banner, 
  type BannerPosition, 
  type CreateBannerInput 
} from '@/modules/cms/useCms';

const BANNER_POSITIONS: { value: BannerPosition; label: string; description: string }[] = [
  { value: 'HOMEPAGE_HERO', label: 'Homepage Hero', description: 'Banner principal homepage (hero section)' },
  { value: 'HOMEPAGE_GRID', label: 'Homepage Grid', description: 'Grid de bannere mici pe homepage' },
  { value: 'SIDEBAR', label: 'Sidebar', description: 'Banner lateral pe pagini interne' },
  { value: 'PRODUCT_PAGE', label: 'Product Page', description: 'Banner pe pagini de produs' },
  { value: 'CHECKOUT', label: 'Checkout', description: 'Banner la checkout' },
];

export default function CmsBannersPage() {
  const cms = useCms();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [positionFilter, setPositionFilter] = useState<BannerPosition | 'ALL'>('ALL');
  const [showDialog, setShowDialog] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const loadBanners = useCallback(async () => {
    const data = await cms.fetchBanners();
    setBanners(data);
  }, [cms]);

  useEffect(() => {
    void loadBanners();
  }, [loadBanners]);

  const filteredBanners = positionFilter === 'ALL'
    ? banners
    : banners.filter(b => b.position === positionFilter);

  const handleCreate = () => {
    setEditingBanner(null);
    setShowDialog(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setShowDialog(true);
  };

  const handleDelete = async (banner: Banner) => {
    if (!confirm(`Ștergi banner-ul "${banner.title}"?`)) return;
    
    const success = await cms.deleteBanner(banner.id);
    if (success) {
      await loadBanners();
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    const result = await cms.updateBanner(banner.id, { active: !banner.active });
    if (result) {
      await loadBanners();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Banners Management
          </h1>
          <p className="text-sm text-gray-600">
            Gestionează bannere promoționale pentru diferite poziții pe site
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Banner Nou
        </Button>
      </div>

      {/* Position Filter */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPositionFilter('ALL')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              positionFilter === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Toate ({banners.length})
          </button>
          {BANNER_POSITIONS.map((pos) => {
            const count = banners.filter(b => b.position === pos.value).length;
            return (
              <button
                key={pos.value}
                onClick={() => setPositionFilter(pos.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  positionFilter === pos.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {pos.label} ({count})
              </button>
            );
          })}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Total Bannere</div>
          <div className="text-2xl font-bold text-gray-900">{banners.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {banners.filter(b => b.active).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Inactive</div>
          <div className="text-2xl font-bold text-gray-400">
            {banners.filter(b => !b.active).length}
          </div>
        </Card>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBanners.map((banner) => (
          <Card key={banner.id} className="overflow-hidden">
            {/* Banner Image */}
            <div className="h-48 bg-gray-100 relative">
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              {!banner.active && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white font-semibold">INACTIVE</span>
                </div>
              )}
            </div>

            <div className="p-4">
              {/* Position & Active Status */}
              <div className="flex items-center justify-between mb-3">
                <Badge 
                  value={BANNER_POSITIONS.find(p => p.value === banner.position)?.label || banner.position} 
                />
                <button
                  onClick={() => handleToggleActive(banner)}
                  className={`transition-colors ${
                    banner.active ? 'text-green-600' : 'text-gray-400'
                  }`}
                  title={banner.active ? 'Dezactivează' : 'Activează'}
                >
                  {banner.active ? (
                    <ToggleRight className="h-6 w-6" />
                  ) : (
                    <ToggleLeft className="h-6 w-6" />
                  )}
                </button>
              </div>

              {/* Title & Subtitle */}
              <h3 className="font-semibold text-gray-900 mb-1">{banner.title}</h3>
              {banner.subtitle && (
                <p className="text-sm text-gray-600 mb-3">{banner.subtitle}</p>
              )}

              {/* Button Info */}
              {banner.buttonText && (
                <div className="bg-gray-50 p-2 rounded mb-3">
                  <div className="text-xs text-gray-500">Buton:</div>
                  <div className="text-sm font-medium text-gray-900">{banner.buttonText}</div>
                  {banner.buttonLink && (
                    <div className="text-xs text-blue-600 truncate">{banner.buttonLink}</div>
                  )}
                </div>
              )}

              {/* Dates */}
              {(banner.startDate || banner.endDate) && (
                <div className="text-xs text-gray-500 mb-3">
                  {banner.startDate && (
                    <div>Start: {new Date(banner.startDate).toLocaleDateString('ro-RO')}</div>
                  )}
                  {banner.endDate && (
                    <div>End: {new Date(banner.endDate).toLocaleDateString('ro-RO')}</div>
                  )}
                </div>
              )}

              {/* Metrics */}
              {banner.impressions !== undefined && (
                <div className="flex gap-4 text-xs text-gray-500 mb-3 pt-3 border-t border-gray-100">
                  <div>
                    <span className="font-semibold">{banner.impressions}</span> impresii
                  </div>
                  <div>
                    <span className="font-semibold">{banner.clicks}</span> click-uri
                  </div>
                  {banner.ctr !== undefined && (
                    <div>
                      CTR: <span className="font-semibold">{banner.ctr.toFixed(2)}%</span>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleEdit(banner)}
                  className="flex-1 py-2 px-3 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4 mx-auto" />
                </button>
                <button
                  onClick={() => handleDelete(banner)}
                  className="flex-1 py-2 px-3 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4 mx-auto" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredBanners.length === 0 && (
        <Card className="p-12 text-center">
          <Layout className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {positionFilter !== 'ALL'
              ? `Niciun banner pentru poziția ${BANNER_POSITIONS.find(p => p.value === positionFilter)?.label}`
              : 'Niciun banner încă'}
          </p>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      {showDialog && (
        <BannerDialog
          banner={editingBanner}
          onClose={() => setShowDialog(false)}
          onSuccess={() => {
            setShowDialog(false);
            loadBanners();
          }}
        />
      )}
    </div>
  );
}

function BannerDialog({
  banner,
  onClose,
  onSuccess,
}: {
  banner: Banner | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const cms = useCms();
  const [formData, setFormData] = useState<CreateBannerInput>({
    title: banner?.title || '',
    subtitle: banner?.subtitle || '',
    image: banner?.image || '',
    buttonText: banner?.buttonText || '',
    buttonLink: banner?.buttonLink || '',
    position: banner?.position || 'HOMEPAGE_HERO',
    order: banner?.order || 0,
    startDate: banner?.startDate || '',
    endDate: banner?.endDate || '',
    active: banner?.active ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = banner
      ? await cms.updateBanner(banner.id, formData)
      : await cms.createBanner(formData);

    if (result) {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {banner ? 'Editează Banner' : 'Banner Nou'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titlu *
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <Input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagine URL *
              </label>
              <Input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Buton
                </label>
                <Input
                  type="text"
                  value={formData.buttonText}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                  placeholder="Vezi Oferta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Buton
                </label>
                <Input
                  type="text"
                  value={formData.buttonLink}
                  onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                  placeholder="/promotii"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poziție *
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value as BannerPosition })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {BANNER_POSITIONS.map((pos) => (
                    <option key={pos.value} value={pos.value}>
                      {pos.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {BANNER_POSITIONS.find(p => p.value === formData.position)?.description}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ordine
                </label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dată Start
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dată End
                </label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Activ</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button type="button" variant="ghost" onClick={onClose}>
                Anulează
              </Button>
              <Button type="submit" loading={cms.loading}>
                {banner ? 'Actualizează' : 'Creează'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
