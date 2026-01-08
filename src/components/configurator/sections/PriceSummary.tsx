'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { ExtendedPriceSummary } from '@/lib/pricing/calculateProductPrice';

interface PriceSummaryProps {
  priceSummary?: ExtendedPriceSummary;
  quantity: number;
}

export function PriceSummary({ priceSummary, quantity }: PriceSummaryProps) {
  if (!priceSummary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sumar preț</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-slate-200 rounded"></div>
            <div className="h-4 bg-slate-200 rounded"></div>
            <div className="h-8 bg-slate-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const summary = priceSummary;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sumar preț</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Base price */}
          {summary.basePrice > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Preț bază:</span>
              <span className="font-medium text-slate-900">
                {summary.basePrice.toFixed(2)} MDL
              </span>
            </div>
          )}

          {/* Material cost */}
          {summary.materialCost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Material:</span>
              <span className="font-medium text-slate-900">
                {summary.materialCost.toFixed(2)} MDL
              </span>
            </div>
          )}

          {/* Print cost */}
          {summary.printCost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Imprimare:</span>
              <span className="font-medium text-slate-900">
                {summary.printCost.toFixed(2)} MDL
              </span>
            </div>
          )}

          {/* Finishing cost */}
          {summary.finishingCost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Finisaje:</span>
              <span className="font-medium text-slate-900">
                {summary.finishingCost.toFixed(2)} MDL
              </span>
            </div>
          )}

          {/* Options cost */}
          {summary.optionCost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Opțiuni:</span>
              <span className="font-medium text-slate-900">
                {summary.optionCost.toFixed(2)} MDL
              </span>
            </div>
          )}

          {/* Subtotal */}
          {summary.discounts > 0 && (
            <div className="flex justify-between border-t border-slate-200 pt-2 text-sm">
              <span className="text-slate-600">Subtotal:</span>
              <span className="font-medium text-slate-900">
                {summary.subtotal.toFixed(2)} MDL
              </span>
            </div>
          )}

          {/* Discounts */}
          {summary.discounts > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Reducere:</span>
              <span className="font-medium">-{summary.discounts.toFixed(2)} MDL</span>
            </div>
          )}

          {/* Total */}
          <div className="flex items-baseline justify-between border-t-2 border-slate-300 pt-3">
            <span className="text-lg font-semibold text-slate-900">Total:</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {summary.total.toFixed(2)} MDL
              </div>
              {summary.pricePerUnit && summary.pricePerUnit !== summary.total && (
                <div className="text-xs text-slate-500">
                  {summary.pricePerUnit.toFixed(2)} MDL / buc.
                </div>
              )}
            </div>
          </div>

          {/* Breakdown metadata */}
          {summary.breakdown && (
            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              <div className="mb-1 font-medium">Detalii calcul:</div>
              {summary.breakdown.pricingMethod && (
                <div>Metodă: {summary.breakdown.pricingMethod}</div>
              )}
              {summary.breakdown.appliedBreak && (
                <div>
                  Reducere volumetrică aplicată:{' '}
                  {summary.breakdown.appliedBreak.minQuantity}+ bucăți
                </div>
              )}
              {summary.breakdown.areaInSquareMeters && (
                <div>
                  Suprafață: {summary.breakdown.areaInSquareMeters.toFixed(2)} m²
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
