"use client";

import { ArrowPathIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

interface OrderProduct {
  id: string;
  name: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications?: {
    dimension?: string;
    material?: string;
    finishes?: string[];
    productionTime?: string;
  };
}

interface OrderProductsProps {
  products: OrderProduct[];
  currency: string;
  onReorder?: (productId: string) => void;
}

export default function OrderProducts({
  products,
  currency,
  onReorder,
}: OrderProductsProps) {
  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} ${currency}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Produse</h3>
      </div>

      <div className="divide-y divide-gray-200">
        {products.map((product) => (
          <div key={product.id} className="p-6">
            <div className="flex gap-6">
              {/* Product Image */}
              {product.image && (
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-lg bg-gray-100 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-gray-900 mb-2">
                  {product.name}
                </h4>

                {/* Specifications */}
                {product.specifications && (
                  <div className="space-y-1 mb-3">
                    {product.specifications.dimension && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Dimensiune:</span>{" "}
                        {product.specifications.dimension}
                      </p>
                    )}
                    {product.specifications.material && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Material:</span>{" "}
                        {product.specifications.material}
                      </p>
                    )}
                    {product.specifications.finishes &&
                      product.specifications.finishes.length > 0 && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Finisaje:</span>{" "}
                          {product.specifications.finishes.join(", ")}
                        </p>
                      )}
                    {product.specifications.productionTime && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Timp producție:</span>{" "}
                        {product.specifications.productionTime}
                      </p>
                    )}
                  </div>
                )}

                {/* Quantity & Price */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Cantitate: <span className="font-medium">{product.quantity}</span>
                    {" × "}
                    {formatPrice(product.unitPrice)}
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatPrice(product.totalPrice)}
                  </div>
                </div>

                {/* Reorder Button */}
                {onReorder && (
                  <button
                    onClick={() => onReorder(product.id)}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    Recomandă din nou
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
