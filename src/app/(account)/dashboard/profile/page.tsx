import { Metadata } from "next";
import ProfileForm from "@/components/account/profile/ProfileForm";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Date personale | Sanduta.art",
  description: "Actualizează informațiile contului tău",
};

export default function ProfilePage() {
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
          <h1 className="text-3xl font-bold text-gray-900">Date personale</h1>
          <p className="mt-1 text-gray-600">
            Actualizează informațiile contului tău
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <ProfileForm />
    </div>
  );
}
