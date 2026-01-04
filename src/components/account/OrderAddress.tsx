import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";

interface OrderAddressProps {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  company?: string;
  cui?: string;
}

export default function OrderAddress({
  name,
  email,
  phone,
  address,
  city,
  company,
  cui,
}: OrderAddressProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Date client</h2>

      <div className="space-y-3">
        {/* Name */}
        <div className="flex items-start gap-3">
          <UserIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-600">Nume</p>
            <p className="text-sm font-medium text-gray-900">{name}</p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start gap-3">
          <EnvelopeIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <a
              href={`mailto:${email}`}
              className="text-sm font-medium text-[#0066FF] hover:underline"
            >
              {email}
            </a>
          </div>
        </div>

        {/* Phone */}
        {phone && (
          <div className="flex items-start gap-3">
            <PhoneIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-600">Telefon</p>
              <a
                href={`tel:${phone}`}
                className="text-sm font-medium text-[#0066FF] hover:underline"
              >
                {phone}
              </a>
            </div>
          </div>
        )}

        {/* Address */}
        {address && (
          <div className="flex items-start gap-3 pt-3 border-t border-gray-200">
            <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-600">Adresă</p>
              <p className="text-sm text-gray-900">
                {address}
                {city && `, ${city}`}
              </p>
            </div>
          </div>
        )}

        {/* Company Info */}
        {(company || cui) && (
          <div className="pt-3 border-t border-gray-200 space-y-3">
            {company && (
              <div className="flex items-start gap-3">
                <BuildingOfficeIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Companie</p>
                  <p className="text-sm font-medium text-gray-900">{company}</p>
                </div>
              </div>
            )}

            {cui && (
              <div className="flex items-start gap-3">
                <IdentificationIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">CUI</p>
                  <p className="text-sm font-medium text-gray-900">{cui}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
