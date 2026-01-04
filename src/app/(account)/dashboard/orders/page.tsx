import { Metadata } from "next";
import OrdersList from "@/components/account/orders/OrdersList";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Comenzile mele | Sanduta.art",
  description: "Vizualizează istoricul comenzilor tale",
};

export default function OrdersPage() {
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
          <h1 className="text-3xl font-bold text-gray-900">Comenzile mele</h1>
          <p className="mt-1 text-gray-600">
            Verifică statusul și detaliile comenzilor tale
          </p>
        </div>
      </div>

      {/* Orders List */}
      <OrdersList />
    </div>
  );
}
