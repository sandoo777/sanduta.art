'use client';

import { useState } from 'react';
import { useCurrentUser } from '@/modules/auth/useCurrentUser';
import { Card, Button, Input } from '@/components/ui';
import { User, Building, Mail, Phone, MapPin, Save, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
  });

  const [companyInfo, setCompanyInfo] = useState({
    companyName: '',
    cui: '',
    regCom: '',
    address: '',
    city: '',
    county: '',
    postalCode: '',
  });

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'personal', ...personalInfo }),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Eroare la actualizarea profilului');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'company', ...companyInfo }),
      });

      if (!response.ok) throw new Error('Failed to update company info');

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating company info:', error);
      alert('Eroare la actualizarea informațiilor companiei');
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profilul Meu</h1>
        <p className="text-gray-600 mt-2">
          Actualizează informațiile personale și detaliile companiei
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          Informațiile au fost actualizate cu succes!
        </div>
      )}

      {/* Personal Information */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-indigo-100">
            <User className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Informații Personale
          </h2>
        </div>

        <form onSubmit={handlePersonalSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nume Complet *
              </label>
              <Input
                type="text"
                value={personalInfo.name}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, name: e.target.value })
                }
                placeholder="Ex: Ion Popescu"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <Input
                type="email"
                value={personalInfo.email}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, email: e.target.value })
                }
                placeholder="ion.popescu@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon
              </label>
              <Input
                type="tel"
                value={personalInfo.phone}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, phone: e.target.value })
                }
                placeholder="0712345678"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="min-w-[140px]"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvează
            </Button>
          </div>
        </form>
      </Card>

      {/* Company Information */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-100">
            <Building className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Informații Companie
          </h2>
        </div>

        <form onSubmit={handleCompanySubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nume Companie
              </label>
              <Input
                type="text"
                value={companyInfo.companyName}
                onChange={(e) =>
                  setCompanyInfo({ ...companyInfo, companyName: e.target.value })
                }
                placeholder="Ex: SC Example SRL"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CUI
              </label>
              <Input
                type="text"
                value={companyInfo.cui}
                onChange={(e) =>
                  setCompanyInfo({ ...companyInfo, cui: e.target.value })
                }
                placeholder="RO12345678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reg. Com.
              </label>
              <Input
                type="text"
                value={companyInfo.regCom}
                onChange={(e) =>
                  setCompanyInfo({ ...companyInfo, regCom: e.target.value })
                }
                placeholder="J40/1234/2020"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresa Sediu
              </label>
              <Input
                type="text"
                value={companyInfo.address}
                onChange={(e) =>
                  setCompanyInfo({ ...companyInfo, address: e.target.value })
                }
                placeholder="Strada, Număr, Bloc, Scara, Apartament"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Oraș
              </label>
              <Input
                type="text"
                value={companyInfo.city}
                onChange={(e) =>
                  setCompanyInfo({ ...companyInfo, city: e.target.value })
                }
                placeholder="București"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Județ
              </label>
              <Input
                type="text"
                value={companyInfo.county}
                onChange={(e) =>
                  setCompanyInfo({ ...companyInfo, county: e.target.value })
                }
                placeholder="Ilfov"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cod Poștal
              </label>
              <Input
                type="text"
                value={companyInfo.postalCode}
                onChange={(e) =>
                  setCompanyInfo({ ...companyInfo, postalCode: e.target.value })
                }
                placeholder="012345"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="min-w-[140px]"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvează
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
