import {
  CreditCardIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface OrderPaymentProps {
  paymentStatus: string;
  paymentMethod?: string;
  totalPrice: number;
  currency: string;
  transactionId?: string;
  orderId: string;
}

const paymentStatusLabels: Record<string, string> = {
  PENDING: "În așteptare",
  PAID: "Plătită",
  FAILED: "Eșuată",
  REFUNDED: "Rambursată",
};

const paymentStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  PAID: "bg-green-50 text-green-700 border-green-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
  REFUNDED: "bg-gray-50 text-gray-700 border-gray-200",
};

const paymentStatusIcons: Record<string, any> = {
  PENDING: ClockIcon,
  PAID: CheckCircleIcon,
  FAILED: XCircleIcon,
  REFUNDED: CheckCircleIcon,
};

const paymentMethodLabels: Record<string, string> = {
  card: "Card bancar",
  cash: "Cash",
  bank_transfer: "Transfer bancar",
};

export default function OrderPayment({
  paymentStatus,
  paymentMethod,
  totalPrice,
  currency,
  transactionId,
  orderId,
}: OrderPaymentProps) {
  const StatusIcon = paymentStatusIcons[paymentStatus] || ClockIcon;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <CreditCardIcon className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Plată</h2>
      </div>

      <div className="space-y-4">
        {/* Payment Status */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Status plată</p>
          <div className="flex items-center gap-2">
            <StatusIcon className="w-5 h-5" />
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${
                paymentStatusColors[paymentStatus] || "bg-gray-50 text-gray-700 border-gray-200"
              }`}
            >
              {paymentStatusLabels[paymentStatus] || paymentStatus}
            </span>
          </div>
        </div>

        {/* Payment Method */}
        {paymentMethod && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Metodă plată</p>
            <p className="text-base font-medium text-gray-900">
              {paymentMethodLabels[paymentMethod] || paymentMethod}
            </p>
          </div>
        )}

        {/* Total Amount */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total plătit</p>
          <p className="text-2xl font-bold text-gray-900">
            {totalPrice.toFixed(2)} {currency}
          </p>
        </div>

        {/* Transaction ID */}
        {transactionId && (
          <div>
            <p className="text-sm text-gray-600 mb-1">ID tranzacție</p>
            <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded block">
              {transactionId}
            </code>
          </div>
        )}

        {/* Invoice Download */}
        {paymentStatus === "PAID" && (
          <div className="pt-4 border-t border-gray-200">
            <a
              href={`/api/invoices/${orderId}`}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition-colors text-sm font-medium"
            >
              <DocumentArrowDownIcon className="w-5 h-5" />
              Descarcă factură
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
