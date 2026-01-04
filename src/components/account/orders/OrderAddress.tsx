"use client";

import { UserIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";

interface OrderAddressProps {
  name: string;
  phone?: string;
  email: string;
  address?: string;
  city?: string;
  country?: string;
  company?: string;
  cui?: string;
}

export default function OrderAddress({
  name,
  phone,
  email,
  address,
  city,
  country,
  company,
  cui,
}: OrderAddressProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Informații client</h3>
      </div>

      <div className="p-6 space-y-4">
        {/* Name */}
        <div className="flex items-start gap-3">
          <UserIcon className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">Nume complet</p>
            <p className="text-sm text-gray-600 mt-0.5">{name}</p>
          </div>
        </div>

        {/* Phone */}
        {phone && (
          <div className="flex items-start gap-3">
            <PhoneIcon className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Telefon</p>
              <a
                href={`tel:${phone}`}
                className="text-sm text-blue-600 hover:text-blue-700 mt-0.5 inline-block"
              >
                {phone}
              </a>
            </div>
          </div>
        )}

        {/* Email */}
        <div className="flex items-start gap-3">
          <EnvelopeIcon className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">Email</p>
            <a
              href={`mailto:${email}`}
              className="text-sm text-blue-600 hover:text-blue-700 mt-0.5 inline-block"
            >
              {email}
            </a>
          </div>
        </div>

        {/* Address */}
        {address && (
          <div className="flex items-start gap-3">
            <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Adresă</p>
              <p className="text-sm text-gray-600 mt-0.5">
                {address}
                {city && `, ${city}`}
                {country && `, ${country}`}
              </p>
            </div>
          </div>
        )}

        {/* Company Info */}
        {(company || cui) && (
          <div className="flex items-start gap-3 pt-4 border-t border-gray-200">
            <BuildingOfficeIcon className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Informații firmă</p>
              {company && (
                <p className="text-sm text-gray-600 mt-0.5">{company}</p>
              )}
              {cui && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">CUI:</span> {cui}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
