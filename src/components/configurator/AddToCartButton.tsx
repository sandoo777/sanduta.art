'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { ConfiguratorSelections, ConfiguratorProduct } from '@/modules/configurator/types';
import type { ExtendedPriceSummary } from '@/lib/pricing/calculateProductPrice';

interface AddToCartButtonProps {
  product: ConfiguratorProduct;
  selections: ConfiguratorSelections;
  priceSummary?: ExtendedPriceSummary;
  projectId?: string;
  previewImage?: string;
  finalFileUrl?: string;
  onValidate: () => string[];
}

export function AddToCartButton({
  product,
  selections,
  priceSummary,
  projectId,
  previewImage,
  finalFileUrl,
  onValidate,
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const handleAddToCart = async () => {
    // Validate selections
    const validationErrors = onValidate();
    if (validationErrors.length > 0) {
      setShowErrors(true);
      return;
    }

    // Check if product requires a project (CUSTOM products)
    if (product.type === 'CUSTOM' && !projectId) {
      setShowErrors(true);
      return;
    }

    setIsLoading(true);

    // Generate cart item payload with project data
    const cartItem = {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      quantity: selections.quantity,
      price: priceSummary?.total || 0,
      configuration: {
        dimensions: selections.dimension,
        materialId: selections.materialId,
        printMethodId: selections.printMethodId,
        finishingIds: selections.finishingIds,
        options: selections.options,
      },
      // Project data (if available)
      projectId,
      previewImage,
      finalFileUrl,
      // Metadata for display
      metadata: {
        material: selections.materialId,
        printMethod: selections.printMethodId,
        finishing: selections.finishingIds.join(', '),
        dimensions: selections.dimension
          ? `${selections.dimension.width} × ${selections.dimension.height} ${selections.dimension.unit}`
          : undefined,
      },
    };

    try {
      // TODO: Call cart API to add item
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log('Added to cart:', cartItem);
      // TODO: Add toast notification
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // TODO: Show error notification
    } finally {
      setIsLoading(false);
    }
  };

  // Compute validation errors for display (with safety check)
  const validationErrors = onValidate?.() || [];
  
  // Add project requirement error for CUSTOM products
  const allErrors = [...validationErrors];
  if (product.type === 'CUSTOM' && !projectId) {
    allErrors.push('Trebuie să creezi o machetă în editor înainte de a adăuga în coș');
  }

  return (
    <div className="space-y-3">
      {/* Validation errors */}
      {showErrors && allErrors.length > 0 && (
        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-3">
          <div className="mb-2 text-sm font-medium text-red-900">
            Corectează următoarele erori:
          </div>
          <ul className="list-inside list-disc space-y-1 text-sm text-red-700">
            {allErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Add to cart button */}
      <Button
        onClick={handleAddToCart}
        disabled={isLoading || allErrors.length > 0}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Se adaugă...
          </div>
        ) : (
          <>
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Adaugă în coș
          </>
        )}
      </Button>

      {/* Secondary actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          Salvează configurația
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          Partajează
        </Button>
      </div>
    </div>
  );
}
