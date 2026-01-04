import OrderDetails from '../OrderDetails';

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  
  return (
    <div className="p-6">
      <OrderDetails params={{ id }} />
    </div>
  );
}
