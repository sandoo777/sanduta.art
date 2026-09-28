import { normalizeEquipmentType } from '@/modules/machines/types';

export function validateMachinePayload(body: Record<string, unknown>): string | null {
  const { equipmentType } = body as {
    equipmentType?: string;
  };

  const normalizedType = normalizeEquipmentType(equipmentType);
  const isLargeFormat = ['UV', 'LARGE_FORMAT', 'DTF', 'SUBLIMATION'].includes(normalizedType);
  const isDigital = ['DIGITAL_COLOR', 'DIGITAL_MONO'].includes(normalizedType);
  const isHourly = ['OFFSET', 'EMBROIDERY', 'PLOTTER_CUTTING'].includes(normalizedType);

  if (isLargeFormat && !body.speedM2PerHour) {
    return 'Câmpul "Viteză (m²/h)" este obligatoriu pentru echipamente Large Format / UV / DTF / Sublimation';
  }

  if (isDigital && !body.costClickColor && !body.costClickBW) {
    return 'Cel puțin un cost per click (color sau A/N) este obligatoriu pentru echipamente Digitale';
  }

  if (isHourly && !body.costPerHour) {
    return 'Câmpul "Cost pe oră" este obligatoriu pentru echipamente de tip Offset / Embroidery / Plotter Cutting';
  }

  return null;
}
