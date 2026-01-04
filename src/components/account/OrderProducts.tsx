import Image from "next/image";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

interface OrderItem {
  id: string;
  productName: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  thumbnail?: string;
  specifications?: {
    dimension?: string;
    material?: string;
    finishes?: string[];
    productionTime?: string;
  };
}

interface OrderProductsProps {
  items: OrderItem[];
  currency: string;
  totalPrice: number;
}

export default function OrderProducts({ items, currency, totalPrice }: OrderProductsProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">Produse</h2>
      </div>

      <div className="divide-y divide-gray-200">
        {items.map((item) => (
          <div key={item.id} className="p-6">
            <div className="flex gap-4">
              {/* Product Image */}
              {item.thumbnail ? (
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={item.thumbnail}
                    alt={item.productName}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-lg bg-gray-200 flex-shrink-0" />
              )}

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900">{item.productName}</h3>
                
                {/* Specifications */}
                {item.specifications && (
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    {item.specifications.dimension && (
                      <div>
                        <span className="text-gray-600">Dimensiune: </span>
                        <span className="text-gray-900">{item.specifications.dimension}</span>
                      </div>
                    )}
                    {item.specifications.material && (
                      <div>
                        <span className="text-gray-600">Material: </span>
                        <span className="text-gray-900">{item.specifications.material}</span>
                      </div>
                    )}
                    {item.specifications.finishes && item.specifications.finishes.length > 0 && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Finisaje: </span>
                        <span className="text-gray-900">
                          {item.specifications.finishes.join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Quantity and Price */}
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Cantitate: <span className="font-medium text-gray-900">{item.quantity}</span> × {item.unitPrice.toFixed(2)} {currency}
                  </p>
                  <p className="text-base font-bold text-gray-900">
                    {item.lineTotal.toFixed(2)} {currency}
                  </p>
                </div>

                {/* Reorder Button */}
                <button className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#0066FF] hover:text-blue-700 transition-colors">
                  <ArrowPathIcon className="w-4 h-4" />
                  Recomandă produs
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-[#0066FF]">
            {totalPrice.toFixed(2)} {currency}
          </span>
        </div>
      </div>
    </div>
  );
}
