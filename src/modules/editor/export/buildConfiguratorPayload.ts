/**
 * Build payload for configurator step after editor export.
 */

interface BuildPayloadInput {
  fileUrl: string;
  previewUrl: string;
  projectId: string;
  projectName: string;
  width: number;
  height: number;
  bleed: number;
}

export function buildConfiguratorPayload(input: BuildPayloadInput) {
  const {
    fileUrl,
    previewUrl,
    projectId,
    projectName,
    width,
    height,
    bleed,
  } = input;

  return {
    fileUrl,
    previewUrl,
    projectId,
    projectName,
    width,
    height,
    bleed,
    colorProfile: 'CMYK' as const,
    validation: {
      resolution: 'ok',
      bleed: 'ok',
      color: 'ok',
      fonts: 'ok',
    },
  };
}
