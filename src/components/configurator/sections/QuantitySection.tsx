'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface PriceBreak {
  minQuantity: number;
  maxQuantity?: number | null;
  price?: number;
  discount?: number;
}

interface QuantitySectionProps {
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  priceBreaks: PriceBreak[];
  onChange: (quantity: number) => void;
}

export function QuantitySection({
  quantity,
  minQuantity,
  maxQuantity,
  priceBreaks,
  onChange,
}: QuantitySectionProps) {
  const increment = () => {
    if (quantity < maxQuantity) {
      onChange(quantity + 1);
    }
  };

  const decrement = () => {
    if (quantity > minQuantity) {
      onChange(quantity - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= minQuantity && value <= maxQuantity) {
      onChange(value);
    }
  };

  // Find active price break
  const activePriceBreak = priceBreaks
    .filter((pb) => quantity >= pb.minQuantity)
    .sort((a, b) => b.minQuantity - a.minQuantity)[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cantitate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Quantity controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={decrement}
              disabled={quantity <= minQuantity}
              className="h-10 w-10"
            >
              -
            </Button>

            <input
              type="number"
              value={quantity}
              onChange={handleInputChange}
              min={minQuantity}
              max={maxQuantity}
              className="w-20 rounded-lg border-2 border-slate-200 px-3 py-2 text-center text-lg font-semibold focus:border-blue-500 focus:outline-none"
            />

            <Button
              variant="outline"
              size="sm"
              onClick={increment}
              disabled={quantity >= maxQuantity}
              className="h-10 w-10"
            >
              +
            </Button>

            <div className="ml-4 text-sm text-slate-600">
              <div>Min: {minQuantity}</div>
              <div>Max: {maxQuantity}</div>
            </div>
          </div>

          {/* Price breaks indicators */}
          {priceBreaks.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-700">
                Reduceri la volum:
              </div>
              <div className="grid gap-2">
                {priceBreaks.map((priceBreak) => {
                  const isActive =
                    activePriceBreak?.minQuantity === priceBreak.minQuantity;

                  return (
                    <div
                      key={priceBreak.minQuantity}
                      className={`flex items-center justify-between rounded-lg border-2 px-3 py-2 text-sm transition-all ${
                        isActive
                          ? 'border-green-500 bg-green-50 text-green-900'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="font-medium">
                        {priceBreak.minQuantity}+ bucăți
                      </span>
                      <span className="flex items-center gap-1">
                        {priceBreak.discount && priceBreak.discount > 0 && (
                          <span className="font-semibold text-green-600">
                            -{priceBreak.discount.toFixed(0)}%
                          </span>
                        )}
                        {priceBreak.price && (
                          <span className="font-semibold">
                            {priceBreak.price.toFixed(2)} MDL
                          </span>
                        )}
                        {isActive && (
                          <svg
                            className="ml-1 h-4 w-4 text-green-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
