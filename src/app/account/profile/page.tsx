'use client';

import { useState, useEffect } from 'react';
import { useCurrentUser } from '@/modules/auth/useCurrentUser';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/LoadingState';
import { User, Building, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

// Validation helpers
const validateEmail = (email: string): string | null => {
  if (!email) return 'Email-ul este obligatoriu';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Email invalid';
  return null;
};

const validatePhone = (phone: string): string | null => {
  if (!phone) return null; // Optional field
  const phoneRegex = /^(\+4|0)[0-9]{9}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return 'Telefon invalid (ex: 0712345678)';
  }
  return null;
};

const validateName = (name: string): string | null => {
  if (!name) return 'Numele este obligatoriu';
  if (name.length < 3) return 'Numele trebuie să aibă minim 3 caractere';
  if (name.length > 100) return 'Numele este prea lung';
  return null;
};

const validateCUI = (cui: string): string | null => {
  if (!cui) return null; // Optional
  const cuiRegex = /^(RO)?[0-9]{6,10}$/;
  if (!cuiRegex.test(cui.replace(/\s/g, ''))) {
    return 'CUI invalid (ex: RO12345678)';
  }
  return null;
};

const validatePostalCode = (code: string): string | null => {
  if (!code) return null; // Optional
  const postalRegex = /^[0-9]{6}$/;
  if (!postalRegex.test(code)) {
    return 'Cod poștal invalid (6 cifre)';
  }
  return null;
};

interface ValidationErrors {
  [key: string]: string | null;
}

export default function ProfilePage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
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

  const [personalErrors, setPersonalErrors] = useState<ValidationErrors>({});
  const [companyErrors, setCompanyErrors] = useState<ValidationErrors>({});
  const [touchedPersonal, setTouchedPersonal] = useState<Set<string>>(new Set());
  const [touchedCompany, setTouchedCompany] = useState<Set<string>>(new Set());

  // Initialize with user data
  useEffect(() => {
    if (user) {
      setPersonalInfo({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  // Real-time validation for personal info
  useEffect(() => {
    const errors: ValidationErrors = {};
    
    if (touchedPersonal.has('name')) {
      errors.name = validateName(personalInfo.name);
    }
    if (touchedPersonal.has('email')) {
      errors.email = validateEmail(personalInfo.email);
    }
    if (touchedPersonal.has('phone') && personalInfo.phone) {
      errors.phone = validatePhone(personalInfo.phone);
    }

    setPersonalErrors(errors);
  }, [personalInfo, touchedPersonal]);

  // Real-time validation for company info
  useEffect(() => {
    const errors: ValidationErrors = {};
    
    if (touchedCompany.has('cui') && companyInfo.cui) {
      errors.cui = validateCUI(companyInfo.cui);
    }
    if (touchedCompany.has('postalCode') && companyInfo.postalCode) {
      errors.postalCode = validatePostalCode(companyInfo.postalCode);
    }

    setCompanyErrors(errors);
  }, [companyInfo, touchedCompany]);

  const handlePersonalChange = (field: string, value: string) => {
    setPersonalInfo({ ...personalInfo, [field]: value });
    setTouchedPersonal(new Set(touchedPersonal).add(field));
  };

  const handleCompanyChange = (field: string, value: string) => {
    setCompanyInfo({ ...companyInfo, [field]: value });
    setTouchedCompany(new Set(touchedCompany).add(field));
  };

  const isPersonalFormValid = () => {
    return (
      !validateName(personalInfo.name) &&
      !validateEmail(personalInfo.email) &&
      (!personalInfo.phone || !validatePhone(personalInfo.phone))
    );
  };

  const isCompanyFormValid = () => {
    return (
      (!companyInfo.cui || !validateCUI(companyInfo.cui)) &&
      (!companyInfo.postalCode || !validatePostalCode(companyInfo.postalCode))
    );
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setErrorMessage(null);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setSuccessMessage(null);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouchedPersonal(new Set(['name', 'email', 'phone']));
    
    if (!isPersonalFormValid()) {
      showError('Te rugăm să corectezi erorile din formular');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'personal', ...personalInfo }),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      showSuccess('✓ Informațiile personale au fost actualizate cu succes!');
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Eroare la actualizarea profilului. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouchedCompany(new Set(['companyName', 'cui', 'regCom', 'address', 'city', 'county', 'postalCode']));
    
    if (!isCompanyFormValid()) {
      showError('Te rugăm să corectezi erorile din formular');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'company', ...companyInfo }),
      });

      if (!response.ok) throw new Error('Failed to update company info');

      showSuccess('✓ Informațiile companiei au fost actualizate cu succes!');
    } catch (error) {
      console.error('Error updating company info:', error);
      showError('Eroare la actualizarea informațiilor companiei. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return <LoadingState text="Se încarcă profilul..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profilul Meu</h1>
        <p className="text-gray-600 mt-2">
          Actualizează informațiile personale și detaliile companiei
        </p>
      </div>

      {/* Success Toast */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg shadow-md flex items-start gap-3 animate-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-md flex items-start gap-3 animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Personal Information */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-blue-100">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Informații Personale
          </h2>
        </div>

        <form onSubmit={handlePersonalSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nume Complet <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={personalInfo.name}
                onChange={(e) => handlePersonalChange('name', e.target.value)}
                onBlur={() => setTouchedPersonal(new Set(touchedPersonal).add('name'))}
                placeholder="Ex: Ion Popescu"
                className={personalErrors.name && touchedPersonal.has('name') ? 'border-red-500 focus:ring-red-500' : ''}
                required
              />
              {personalErrors.name && touchedPersonal.has('name') && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {personalErrors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={personalInfo.email}
                onChange={(e) => handlePersonalChange('email', e.target.value)}
                onBlur={() => setTouchedPersonal(new Set(touchedPersonal).add('email'))}
                placeholder="ion.popescu@example.com"
                className={personalErrors.email && touchedPersonal.has('email') ? 'border-red-500 focus:ring-red-500' : ''}
                required
              />
              {personalErrors.email && touchedPersonal.has('email') && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {personalErrors.email}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon
              </label>
              <Input
                type="tel"
                value={personalInfo.phone}
                onChange={(e) => handlePersonalChange('phone', e.target.value)}
                onBlur={() => setTouchedPersonal(new Set(touchedPersonal).add('phone'))}
                placeholder="0712345678"
                className={personalErrors.phone && touchedPersonal.has('phone') ? 'border-red-500 focus:ring-red-500' : ''}
              />
              {personalErrors.phone && touchedPersonal.has('phone') && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {personalErrors.phone}
                </p>
              )}
              {!personalErrors.phone && touchedPersonal.has('phone') && personalInfo.phone && (
                <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Telefon valid
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={!isPersonalFormValid() || loading}
              className="min-w-[160px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Se salvează...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvează Modificările
                </>
              )}
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
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              Informații Companie
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Opțional - completează pentru facturare firmă
            </p>
          </div>
        </div>

        <form onSubmit={handleCompanySubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nume Companie
              </label>
              <Input
                type="text"
                value={companyInfo.companyName}
                onChange={(e) => handleCompanyChange('companyName', e.target.value)}
                placeholder="Ex: SC Example SRL"
              />
            </div>

            {/* CUI */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CUI
              </label>
              <Input
                type="text"
                value={companyInfo.cui}
                onChange={(e) => handleCompanyChange('cui', e.target.value)}
                onBlur={() => setTouchedCompany(new Set(touchedCompany).add('cui'))}
                placeholder="RO12345678"
                className={companyErrors.cui && touchedCompany.has('cui') ? 'border-red-500 focus:ring-red-500' : ''}
              />
              {companyErrors.cui && touchedCompany.has('cui') && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {companyErrors.cui}
                </p>
              )}
              {!companyErrors.cui && touchedCompany.has('cui') && companyInfo.cui && (
                <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  CUI valid
                </p>
              )}
            </div>

            {/* Reg Com */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reg. Com.
              </label>
              <Input
                type="text"
                value={companyInfo.regCom}
                onChange={(e) => handleCompanyChange('regCom', e.target.value)}
                placeholder="J40/1234/2020"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresa Sediu
              </label>
              <Input
                type="text"
                value={companyInfo.address}
                onChange={(e) => handleCompanyChange('address', e.target.value)}
                placeholder="Strada, Număr, Bloc, Scara, Apartament"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Oraș
              </label>
              <Input
                type="text"
                value={companyInfo.city}
                onChange={(e) => handleCompanyChange('city', e.target.value)}
                placeholder="București"
              />
            </div>

            {/* County */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Județ
              </label>
              <Input
                type="text"
                value={companyInfo.county}
                onChange={(e) => handleCompanyChange('county', e.target.value)}
                placeholder="Ilfov"
              />
            </div>

            {/* Postal Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cod Poștal
              </label>
              <Input
                type="text"
                value={companyInfo.postalCode}
                onChange={(e) => handleCompanyChange('postalCode', e.target.value)}
                onBlur={() => setTouchedCompany(new Set(touchedCompany).add('postalCode'))}
                placeholder="012345"
                maxLength={6}
                className={companyErrors.postalCode && touchedCompany.has('postalCode') ? 'border-red-500 focus:ring-red-500' : ''}
              />
              {companyErrors.postalCode && touchedCompany.has('postalCode') && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {companyErrors.postalCode}
                </p>
              )}
              {!companyErrors.postalCode && touchedCompany.has('postalCode') && companyInfo.postalCode && (
                <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Cod poștal valid
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={!isCompanyFormValid() || loading}
              className="min-w-[160px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Se salvează...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvează Modificările
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
