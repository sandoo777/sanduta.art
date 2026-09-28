import { PurchaseOrderDetail } from '@/components/purchasing/PurchaseOrderDetail';

export default async function PurchaseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <PurchaseOrderDetail purchaseOrderId={id} />
      </div>
    </div>
  );
}
