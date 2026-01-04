import { Metadata } from "next";
import AddressList from "@/components/account/addresses/AddressList";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Adrese | Sanduta.art",
  description: "Gestionează adresele tale de livrare",
};

export default function AddressesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Adrese</h1>
          <p className="mt-1 text-gray-600">
            Gestionează adresele tale de livrare
          </p>
        </div>
      </div>

      {/* Address List */}
      <AddressList />
    </div>
  );
}
