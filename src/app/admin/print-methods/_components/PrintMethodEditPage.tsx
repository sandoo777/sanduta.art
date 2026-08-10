"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { usePrintMethods } from "@/modules/print-methods/usePrintMethods";
import type { PrintMethodWithRelations, CreatePrintMethodInput } from "@/modules/print-methods/types";
import { PrintMethodForm } from "./PrintMethodForm";

interface PrintMethodEditPageProps {
  id: string;
}

export function PrintMethodEditPage({ id }: PrintMethodEditPageProps) {
  const router = useRouter();
  const { getPrintMethod, updatePrintMethod } = usePrintMethods();
  const [printMethod, setPrintMethod] = useState<PrintMethodWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPrintMethod = async () => {
      setIsLoading(true);
      const data = await getPrintMethod(id);
      setPrintMethod(data);
      setIsLoading(false);
    };

    loadPrintMethod();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async (data: CreatePrintMethodInput) => {
    const updated = await updatePrintMethod(id, data);
    if (updated) {
      router.push("/admin/print-methods");
      router.refresh();
    }
  };

  const handleClose = () => {
    router.push("/admin/print-methods");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
            <ArrowLeft className="h-4 w-4" />
            <button
              type="button"
              onClick={() => router.push("/admin/print-methods")}
              className="hover:text-blue-600 transition-colors"
            >
              Înapoi la metode
            </button>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-gray-600">Se încarcă metoda...</div>
        </div>
      </div>
    );
  }

  if (!printMethod) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h1 className="text-lg font-semibold text-red-800">Metoda nu a fost găsită</h1>
            <p className="mt-1 text-sm text-red-700">Verifică linkul sau revino la lista de metode.</p>
            <button
              type="button"
              onClick={() => router.push("/admin/print-methods")}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Înapoi la metode
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <PrintMethodForm printMethod={printMethod} onClose={handleClose} onSave={handleSave} />;
}
