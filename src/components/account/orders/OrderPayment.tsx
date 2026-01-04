"use client";

import { CreditCardIcon, DocumentArrowDownIcon, CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline";

interface OrderPaymentProps {
  paymentMethod?: string;
  paymentStatus: string;
  totalAmount: number;
  currency: string;
  transactionId?: string;
  invoiceUrl?: string;
}

export default function OrderPayment({
  paymentMethod,
  paymentStatus,
  totalAmount,
  currency,
  transactionId,
  invoiceUrl,
}: OrderPaymentProps) {
  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} ${currency}`;
  };

  const getPaymentStatusInfo = (status: string) => {
    switch (status) {
      case "PAID":
        return {
          label: "Plătită",
          color: "bg-green-100 text-green-800",
          icon: CheckCircleIcon,
        };
      case "PENDING":
        return {
          label: "În așteptare",
          color: "bg-yellow-100 text-yellow-800",
          icon: ClockIcon,
        };
      case "FAILED":
        return {
          label: "Eșuată",
          color: "bg-red-100 text-red-800",
          icon: ClockIcon,
        };
      default:
        return {
          label: "Necunoscută",
          color: "bg-gray-100 text-gray-800",
          icon: ClockIcon,
        };
    }
  };

  const getPaymentMethodLabel = (method?: string) => {
    switch (method) {
      case "card":
        return "Card bancar";
      case "cash":
        return "Cash la livrare";
      case "bank_transfer":
        return "Transfer bancar";
      default:
        return method || "Nespecificat";
    }
  };

  const statusInfo = getPaymentStatusInfo(paymentStatus);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Plată</h3>
      </div>

      <div className="p-6 space-y-4">
        {/* Payment Method */}
        <div className="flex items-start gap-3">
          <CreditCardIcon className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">Metodă de plată</p>
            <p className="text-sm text-gray-600 mt-0.5">
              {getPaymentMethodLabel(paymentMethod)}
            </p>
          </div>
        </div>

        {/* Payment Status */}
        <div className="flex items-start gap-3">
          <StatusIcon className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">Status plată</p>
            <span
              className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${statusInfo.color}`}
            >
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Total Amount */}
        <div className="flex items-start gap-3 pt-4 border-t border-gray-200">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Sumă plătită</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatPrice(totalAmount)}
            </p>
          </div>
        </div>

        {/* Transaction ID */}
        {transactionId && (
          <div className="flex items-start gap-3 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-900">ID tranzacție</p>
              <code className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                {transactionId}
              </code>
            </div>
          </div>
        )}

        {/* Invoice Download */}
        {invoiceUrl && (
          <div className="pt-4 border-t border-gray-200">
            <a
              href={invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              Descarcă factura
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
