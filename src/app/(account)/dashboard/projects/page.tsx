import { Metadata } from "next";
import ProjectsList from "@/components/account/projects/ProjectsList";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Proiectele mele | Sanduta.art",
  description: "Gestionează proiectele tale salvate",
};

export default function ProjectsPage() {
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
          <h1 className="text-3xl font-bold text-gray-900">Proiectele mele</h1>
          <p className="mt-1 text-gray-600">
            Accesează și editează proiectele tale salvate
          </p>
        </div>
      </div>

      {/* Projects List */}
      <ProjectsList />
    </div>
  );
}
