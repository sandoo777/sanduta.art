// This file is being removed to resolve dynamic path slug names issue.
"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useOrderDetails } from "@/modules/account/useOrderDetails";
import OrderStatusBar from "@/components/account/OrderStatusBar";
import OrderTimeline from "@/components/account/OrderTimeline";
import OrderProducts from "@/components/account/OrderProducts";
import OrderFiles from "@/components/account/OrderFiles";
import OrderDelivery from "@/components/account/OrderDelivery";
import OrderPayment from "@/components/account/OrderPayment";
import OrderAddress from "@/components/account/OrderAddress";
import OrderHistory from "@/components/account/OrderHistory";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";


export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const { order, loading, error, fetchOrder, generateTimeline, generateHistory } = useOrderDetails();

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0066FF]"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">{error || "Comanda nu a fost găsită."}</p>
        <Link
          href="/dashboard/orders"
          className="text-[#0066FF] hover:underline"
        >
          Înapoi la comenzi
        </Link>
      </div>
    );
  }

  const timeline = order.timeline || generateTimeline(order);
  const history = order.history || generateHistory(order);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/orders"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Comandă #{order.orderNumber}
          </h1>
          <p className="text-gray-600 mt-2">
            Plasată pe {new Date(order.createdAt).toLocaleDateString("ro-RO", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* Status Progress Bar */}
      <OrderStatusBar currentStatus={order.status} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products */}
          <OrderProducts
            items={order.items}
            currency={order.currency}
            totalPrice={order.totalPrice}
          />

          {/* Files */}
          {order.files && order.files.length > 0 && (
            <OrderFiles files={order.files} />
          )}

          {/* Timeline */}
          <OrderTimeline events={timeline} />

          {/* History */}
          <OrderHistory events={history} />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Payment Info */}
          <OrderPayment
            paymentStatus={order.paymentStatus}
            paymentMethod={order.paymentMethod}
            totalPrice={order.totalPrice}
            currency={order.currency}
            transactionId={order.orderNumber}
            orderId={order.id}
          />

          {/* Delivery Info */}
          <OrderDelivery
            deliveryMethod={order.deliveryMethod}
            deliveryStatus={order.deliveryStatus}
            trackingNumber={order.trackingNumber}
            estimatedDelivery="3-5 zile lucrătoare"
            address={order.deliveryAddress}
          />

          {/* Customer Address */}
          <OrderAddress
            name={order.customerName}
            email={order.customerEmail}
            phone={order.customerPhone}
            address={order.deliveryAddress}
            city={order.city}
            company={order.company}
            cui={order.cui}
          />
        </div>
      </div>
    </div>
  );
}
