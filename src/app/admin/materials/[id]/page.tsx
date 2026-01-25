"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Package, AlertCircle } from "lucide-react";
import { AuthLink } from '@/components/common/links/AuthLink';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useMaterials } from "@/modules/materials/useMaterials";
import type { MaterialWithDetails } from "@/modules/materials/types";
import { MaterialModal } from "../_components/MaterialModal";
import { MaterialConsumption } from "../_components/MaterialConsumption";
import { MaterialJobs } from "../_components/MaterialJobs";
import { MaterialNotes } from "../_components/MaterialNotes";

export default function MaterialDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const materialId = params.id as string;

  const [material, setMaterial] = useState<MaterialWithDetails | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "consumption" | "jobs" | "notes">(
    "overview"
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const { getMaterial, deleteMaterial, isLoading } = useMaterials();

  useEffect(() => {
    loadMaterial();
  }, [materialId]);

  const loadMaterial = async () => {
    const data = await getMaterial(materialId);
    if (data) {
      setMaterial(data);
    }
  };

  const handleDelete = async () => {
    const success = await deleteMaterial(materialId);
    if (success) {
      router.push("/admin/materials");
    }
  };

  if (isLoading || !material) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg p-8 text-center text-gray-500">
            Se încarcă...
          </div>
        </div>
      </div>
    );
  }

  const totalConsumption = material.consumption.reduce((sum, c) => sum + c.quantity, 0);
  const totalCost = material.stock * Number(material.costPerUnit);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <AuthLink
          href="/admin/materials"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Înapoi la materiale</span>
        </AuthLink>

        {/* Header */}
        <Card className="mb-6">
          <CardContent>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{material.name}</h1>
                  {material.sku && (
                    <p className="text-gray-600 mt-1">SKU: {material.sku}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editează</span>
                </button>
                <button
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Șterge</span>
                </button>
              </div>
            </div>

            {/* Low Stock Warning */}
            {material.lowStock && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Atenție: Stoc scăzut!</p>
                <p className="text-red-700 text-sm">
                  Stocul curent ({material.stock} {material.unit}) este sub pragul minim (
                  {material.minStock} {material.unit})
                </p>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Stoc curent</p>
              <div className="flex items-baseline gap-2">
                <p
                  className={`text-2xl font-bold ${
                    material.stock === 0
                      ? "text-black"
                      : material.lowStock
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {material.stock}
                </p>
                <span className="text-gray-600">{material.unit}</span>
              </div>
              {material.stock === 0 ? (
                <Badge variant="default" size="md" className="bg-black text-white">
                  Stoc epuizat
                </Badge>
              ) : material.lowStock ? (
                <Badge variant="danger" size="md">
                  Stoc scăzut
                </Badge>
              ) : (
                <Badge variant="success" size="md">
                  OK
                </Badge>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Stoc minim</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-gray-900">{material.minStock}</p>
                <span className="text-gray-600">{material.unit}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Cost/Unitate</p>
              <p className="text-2xl font-bold text-gray-900">
                {Number(material.costPerUnit).toFixed(2)}
                <span className="text-sm font-normal text-gray-600 ml-1">MDL</span>
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Valoare stoc</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalCost.toFixed(2)}
                <span className="text-sm font-normal text-gray-600 ml-1">MDL</span>
              </p>
            </div>
          </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "overview"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Prezentare generală
              </button>
              <button
                onClick={() => setActiveTab("consumption")}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "consumption"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Consum ({material.consumption.length})
              </button>
              <button
                onClick={() => setActiveTab("jobs")}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "jobs"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Joburi de producție
              </button>
              <button
                onClick={() => setActiveTab("notes")}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "notes"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Note
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Informații generale
                  </h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Nume</dt>
                      <dd className="mt-1 text-sm text-gray-900">{material.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">SKU</dt>
                      <dd className="mt-1 text-sm text-gray-900">{material.sku || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Unitate</dt>
                      <dd className="mt-1 text-sm text-gray-900">{material.unit}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Consum total</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {totalConsumption} {material.unit}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Creat la</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(material.createdAt).toLocaleDateString("ro-RO")}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Actualizat la</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(material.updatedAt).toLocaleDateString("ro-RO")}
                      </dd>
                    </div>
                  </dl>
                </div>

                {material.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Note</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{material.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "consumption" && (
              <MaterialConsumption material={material} onUpdate={loadMaterial} />
            )}

            {activeTab === "jobs" && <MaterialJobs material={material} />}

            {activeTab === "notes" && (
              <MaterialNotes material={material} onUpdate={loadMaterial} />
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <MaterialModal
          material={material}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            setIsEditModalOpen(false);
            loadMaterial();
          }}
        />
      )}

      {/* Delete Confirmation */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Șterge material</h3>
            <p className="text-gray-600 mb-6">
              Sigur dorești să ștergi materialul "{material.name}"?
              {material.consumption.length > 0 && (
                <span className="block mt-2 text-red-600 font-medium">
                  Atenție: Acest material are {material.consumption.length} înregistrări de
                  consum și nu poate fi șters.
                </span>
              )}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={handleDelete}
                disabled={material.consumption.length > 0}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Șterge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
