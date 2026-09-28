'use client';

import { MaterialImageUploadField } from './MaterialImageUploadField';

type ImagesSectionProps = {
  isNewMaterial: boolean;
};

export function ImagesSection({ isNewMaterial }: ImagesSectionProps) {
  return (
    <div className="space-y-7">
      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Thumbnail</h3>
        <MaterialImageUploadField
          fieldName="thumbnailImage"
          label="Thumbnail"
          helperText={isNewMaterial
            ? 'Obligatoriu pentru materialele noi. Recomandat format patrat pentru identificare rapida.'
            : 'Imagine pentru identificarea materialului in liste si selectoare.'}
          required={isNewMaterial}
          emptyTitle="Fara thumbnail"
          emptyDescription="Incarca o imagine reprezentativa a materialului."
          imageAlt="Thumbnail material"
          resizeWidth={800}
          resizeHeight={800}
          resizeMode="cover"
          validationHint="Preview: 100x100 px (max 120x120). La upload se salveaza automat la 800x800 px."
          enableFullscreenZoom
          previewMode="thumbnail"
          fullViewLabel="View Full Image"
        />
      </section>

      <div className="border-t border-gray-200" />

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Macro Texture</h3>
        <MaterialImageUploadField
          fieldName="macroTextureImage"
          label="Macro Texture"
          helperText="Preview de textura la detaliu pentru suprafata materialului."
          emptyTitle="Fara macro textura"
          emptyDescription="Incarca o captura close-up pentru textura materialului."
          imageAlt="Macro textura material"
          resizeWidth={1600}
          resizeHeight={1200}
          resizeMode="contain"
          validationHint="Preview lat (max 640 px). La upload se redimensioneaza automat la maxim 1600x1200 px, cu pastrarea raportului."
          enableFullscreenZoom
          previewMode="macro"
          fullViewLabel="Fullscreen Preview"
        />
      </section>
    </div>
  );
}
