'use client';

import { useEffect } from 'react';
import { useConfigurator } from '@/modules/configurator/useConfigurator';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { DimensionsSection } from './sections/DimensionsSection';
import { MaterialsSection } from './sections/MaterialsSection';
import { PrintMethodsSection } from './sections/PrintMethodsSection';
import { FinishingSection } from './sections/FinishingSection';
import { CustomOptionsSection } from './sections/CustomOptionsSection';
import { QuantitySection } from './sections/QuantitySection';
import { ProductPreview } from './sections/ProductPreview';
import { PriceSummary } from './sections/PriceSummary';
import { AddToCartButton } from './AddToCartButton';
import { ProjectSection } from './sections/ProjectSection';
import { useSearchParams } from 'next/navigation';
import { handleEditorReturn } from '@/lib/editor/returnToConfigurator';

interface ConfiguratorProps {
  productId: string;
}

export function Configurator({ productId }: ConfiguratorProps) {
  const searchParams = useSearchParams();
  const {
    loading,
    product,
    selections,
    visibleOptions,
    materials,
    printMethods,
    finishing,
    priceSummary,
    errors,
    projectId,
    previewImage,
    loadProduct,
    setOption,
    setMaterial,
    setPrintMethod,
    setFinishing,
    setQuantity,
    setDimension,
    setProject,
    clearProject,
    validateSelections,
  } = useConfigurator();

  useEffect(() => {
    loadProduct(productId);
  }, [productId, loadProduct]);

  // Handle return from editor
  useEffect(() => {
    if (searchParams) {
      handleEditorReturn(
        searchParams,
        (returnedProjectId, returnedPreview) => {
          setProject(returnedProjectId, returnedPreview);
        }
      );
    }
  }, [searchParams, setProject]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState text="Se încarcă configuratorul..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <ErrorState
          title="Produs indisponibil"
          message="Produsul pe care îl căutați nu este disponibil momentan."
        />
      </div>
    );
  }

  const showDimensions = product.type === 'CONFIGURABLE' && product.dimensions;
  const showMaterials = materials.length > 0;
  const showPrintMethods = printMethods.length > 0;
  const showFinishing = finishing.length > 0;
  const showOptions = visibleOptions.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="border-b border-slate-200 pb-6">
        <h1 className="text-4xl font-bold text-slate-900">{product.name}</h1>
        {product.descriptionShort && (
          <p className="mt-2 text-lg text-slate-600">{product.descriptionShort}</p>
        )}
      </header>

      {/* Errors Banner */}
      {errors.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <h4 className="mb-2 text-sm font-semibold text-red-900">
            Configurație incompletă sau incorectă:
          </h4>
          <ul className="list-inside list-disc space-y-1 text-sm text-red-700">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        {/* Left column: Configuration sections */}
        <div className="space-y-6">
          {showDimensions && (
            <DimensionsSection
              dimensions={product.dimensions!}
              currentDimension={selections.dimension}
              onChange={setDimension}
            />
          )}

          {showMaterials && (
            <MaterialsSection
              materials={materials}
              selected={selections.materialId}
              onChange={setMaterial}
            />
          )}

          {showPrintMethods && (
            <PrintMethodsSection
              printMethods={printMethods}
              selected={selections.printMethodId}
              onChange={setPrintMethod}
            />
          )}

          {showFinishing && (
            <FinishingSection
              finishing={finishing}
              selected={selections.finishingIds}
              onChange={setFinishing}
            />
          )}

          {showOptions && (
            <CustomOptionsSection
              options={visibleOptions}
              selections={selections.options}
              onChange={setOption}
            />
          )}

          {/* Project Section - Editor Integration */}
          <ProjectSection
            projectId={projectId}
            previewImage={previewImage}
            productId={product.id}
            dimensions={
              selections.dimension?.width &&
              selections.dimension?.height &&
              selections.dimension?.unit
                ? {
                    width: selections.dimension.width,
                    height: selections.dimension.height,
                    unit: selections.dimension.unit,
                  }
                : undefined
            }
            materialId={selections.materialId}
            printMethodId={selections.printMethodId}
            finishingIds={selections.finishingIds}
            errors={errors}
            onClearProject={clearProject}
          />

          <QuantitySection
            quantity={selections.quantity}
            minQuantity={1}
            maxQuantity={10000}
            priceBreaks={product.pricing.priceBreaks ?? []}
            onChange={setQuantity}
          />
        </div>

        {/* Right column: Preview + Price + Cart */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          {product.images && product.images.length > 0 && (
            <ProductPreview
              images={product.images.map((url) => ({ url, alt: product.name }))}
              currentSelections={{
                material: materials.find((m) => m.id === selections.materialId)?.name,
                printMethod: printMethods.find((p) => p.id === selections.printMethodId)?.name,
                finishing: selections.finishingIds
                  .map((id) => finishing.find((f) => f.id === id)?.name)
                  .filter(Boolean) as string[],
                dimensions: selections.dimension,
              }}
            />
          )}

          <PriceSummary
            priceSummary={priceSummary}
            quantity={selections.quantity}
          />

          <AddToCartButton
            product={product}
            selections={selections}
            priceSummary={priceSummary}
            projectId={projectId}
            previewImage={previewImage}
            finalFileUrl={projectId ? `/projects/${projectId}/final.pdf` : undefined}
            onValidate={validateSelections}
          />
        </aside>
      </div>
    </div>
  );
}
