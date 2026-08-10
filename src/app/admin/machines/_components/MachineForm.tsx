'use client';

import { Info, X } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCompatibilitySelector } from '../../finishing/_components/MaterialCompatibilitySelector';
import { PrintMethodCompatibilitySelector } from '../../finishing/_components/PrintMethodCompatibilitySelector';
import { EquipmentConsumables } from './EquipmentConsumables';
import type { Machine } from '@/modules/machines/types';
import { MACHINE_TYPES, MACHINE_STATUS_CONFIG, EQUIPMENT_TYPE_CONFIG } from '@/modules/machines/types';
import { machineFormSchema, type MachineFormData } from '@/lib/validations/admin';
import { Form } from '@/components/ui/form';
import { FormField } from '@/components/ui/FormField';
import { FormLabel } from '@/components/ui/FormLabel';
import { FormMessage } from '@/components/ui/FormMessage';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface MachineFormProps {
  machine?: Machine;
  onSubmit: (data: MachineFormData) => Promise<void>;
  onClose: () => void;
}

function NumericField({ name, label, placeholder, step = '0.01', min = '0', suffix, tooltip }: {
  name: string; label: string; placeholder?: string; step?: string; min?: string; suffix?: string; tooltip?: string;
}) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <div>
          <FormLabel>
            <span className="inline-flex items-center gap-1.5">
              <span>{label}</span>
              {suffix && <span className="text-xs text-gray-400">({suffix})</span>}
              {tooltip && (
                <span
                  title={tooltip}
                  aria-label={tooltip}
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gray-100 text-gray-500 cursor-help"
                >
                  <Info className="h-3 w-3" />
                </span>
              )}
            </span>
          </FormLabel>
          <Input
            type="number"
            step={step}
            min={min}
            placeholder={placeholder ?? '0.00'}
            title={tooltip}
            {...field}
            value={field.value ?? ''}
            onChange={(e) => field.onChange(e.target.value !== '' ? parseFloat(e.target.value) : null)}
          />
          <FormMessage />
        </div>
      )}
    />
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-gray-200 pb-3">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

export function MachineForm({ machine, onSubmit, onClose }: MachineFormProps) {
  const form = useForm({
    resolver: zodResolver(machineFormSchema) as never,
    defaultValues: {
      name:          machine?.name          ?? '',
      type:          machine?.type          ?? 'Digital Printer',
      equipmentType: machine?.equipmentType ?? 'DIGITAL',
      status:        machine?.status        ?? 'AVAILABLE',
      speed:         machine?.speed         ?? '',
      maxWidth:      machine?.maxWidth      ?? null,
      maxHeight:     machine?.maxHeight     ?? null,
      operatorCostPerHour: machine?.operatorCostPerHour ?? null,
      energyConsumptionKw: machine?.energyConsumptionKw ?? null,
      costPerHour:      machine?.costPerHour     ?? null,
      speedM2PerHour:   machine?.speedM2PerHour  ?? null,
      inkPerM2:         machine?.inkPerM2        ?? null,
      materialPerM2:    machine?.materialPerM2   ?? null,
      headAmortPerM2:   machine?.headAmortPerM2  ?? null,
      printerAmortPerM2: machine?.printerAmortPerM2 ?? null,
      maintCostPerM2:   machine?.maintCostPerM2  ?? null,
      costClickColor:   machine?.costClickColor  ?? null,
      costClickBW:      machine?.costClickBW     ?? null,
      servicePerClick:  machine?.servicePerClick ?? null,
      maxFormat:        machine?.maxFormat       ?? null,
      maxGramWeight:    machine?.maxGramWeight   ?? null,
      speedPpm:         machine?.speedPpm        ?? null,
      compatibleMaterialIds:    machine?.compatibleMaterialIds    ?? [],
      compatiblePrintMethodIds: machine?.compatiblePrintMethodIds ?? [],
      description:     machine?.description     ?? '',
      notes:           machine?.notes           ?? '',
      lastMaintenance: machine?.lastMaintenance
        ? new Date(machine.lastMaintenance).toISOString().split('T')[0]
        : '',
      active: machine?.active ?? true,
    },
  }) as unknown as UseFormReturn<MachineFormData>;

  const { formState: { isSubmitting } } = form;
  const equipmentType = useWatch({ control: form.control, name: 'equipmentType' });

  const handleTypeChange = (value: string) => {
    form.setValue('type', value);
    const found = MACHINE_TYPES.find((t) => t.value === value);
    if (found) form.setValue('equipmentType', found.equipmentType);
  };

  const handleFormSubmit = async (data: MachineFormData) => {
    await onSubmit(data);
    onClose();
  };

  const etCfg = EQUIPMENT_TYPE_CONFIG[equipmentType ?? 'HOURLY'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {machine ? 'Editează echipament' : 'Adaugă echipament'}
            </h2>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${etCfg.bg} ${etCfg.color} mt-1 inline-block`}>
              {etCfg.label} · {etCfg.description}
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <Form<MachineFormData> form={form} onSubmit={handleFormSubmit} className="p-6 space-y-6">
          <section className="space-y-5 rounded-2xl border border-gray-200 bg-gray-50/70 p-5">
            <SectionHeading
              title="General"
              description="Datele de bază, categoria de cost și starea operațională a echipamentului."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                name="name"
                render={({ field }) => (
                  <div>
                    <FormLabel required>Nume echipament</FormLabel>
                    <Input {...field} placeholder="ex: Xerox Versant 280, Mimaki UCJV300" />
                    <FormMessage />
                  </div>
                )}
              />
              <FormField
                name="type"
                render={({ field }) => (
                  <div>
                    <FormLabel required>Tip echipament</FormLabel>
                    <select
                      value={field.value}
                      onChange={(e) => handleTypeChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {MACHINE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <FormMessage />
                  </div>
                )}
              />
            </div>

            <FormField
              name="equipmentType"
              render={({ field }) => (
                <div>
                  <FormLabel required>Categorie calcul cost</FormLabel>
                  <div className="flex gap-3 flex-wrap">
                    {(Object.entries(EQUIPMENT_TYPE_CONFIG) as [string, typeof EQUIPMENT_TYPE_CONFIG[keyof typeof EQUIPMENT_TYPE_CONFIG]][]).map(([key, cfg]) => (
                      <label
                        key={key}
                        className={`flex flex-col px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                          field.value === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input type="radio" value={key} checked={field.value === key} onChange={() => field.onChange(key)} className="sr-only" />
                        <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
                        <span className="text-xs text-gray-500">{cfg.description}</span>
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </div>
              )}
            />

            <FormField
              name="status"
              render={({ field }) => (
                <div>
                  <FormLabel required>Stare</FormLabel>
                  <div className="flex gap-3 flex-wrap">
                    {(Object.entries(MACHINE_STATUS_CONFIG) as [string, typeof MACHINE_STATUS_CONFIG[keyof typeof MACHINE_STATUS_CONFIG]][]).map(([key, cfg]) => (
                      <label
                        key={key}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                          field.value === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input type="radio" value={key} checked={field.value === key} onChange={() => field.onChange(key)} className="sr-only" />
                        <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                        <span className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</span>
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </div>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                name="lastMaintenance"
                render={({ field }) => (
                  <div>
                    <FormLabel>Data ultimei mentenanțe</FormLabel>
                    <Input type="date" {...field} value={field.value ?? ''} />
                    <FormMessage />
                  </div>
                )}
              />

              <FormField
                name="active"
                render={({ field }) => (
                  <div className="flex h-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
                    <input
                      type="checkbox"
                      id="active"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="active" className="text-sm font-medium text-gray-700">
                      Echipament activ
                    </label>
                  </div>
                )}
              />
            </div>

            <FormField
              name="description"
              render={({ field }) => (
                <div>
                  <FormLabel>Descriere tehnică</FormLabel>
                  <textarea
                    {...field}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Detalii tehnice despre echipament..."
                  />
                  <FormMessage />
                </div>
              )}
            />

            <FormField
              name="notes"
              render={({ field }) => (
                <div>
                  <FormLabel>Observații tehnice</FormLabel>
                  <textarea
                    {...field}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="ex: necesită calibrare săptămânală, consumabile speciale..."
                  />
                  <FormMessage />
                </div>
              )}
            />
          </section>

          <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5">
            <SectionHeading
              title="Compatibilități"
              description="Selectează materialele și metodele de tipărire pe care le poate procesa acest echipament."
            />

            <FormField
              name="compatibleMaterialIds"
              render={({ field }) => (
                <div>
                  <FormLabel>Materiale compatibile</FormLabel>
                  <MaterialCompatibilitySelector
                    selectedMaterialIds={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </div>
              )}
            />

            <FormField
              name="compatiblePrintMethodIds"
              render={({ field }) => (
                <div>
                  <FormLabel>Metode de tipărire compatibile</FormLabel>
                  <PrintMethodCompatibilitySelector
                    selectedPrintMethodIds={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </div>
              )}
            />
          </section>

          <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5">
            <SectionHeading
              title="Parametri tehnici"
              description="Valorile de mai jos sunt folosite pentru estimarea timpului și costului de producție."
            />

            {/* ===== LARGE FORMAT ===== */}
            {equipmentType === 'LARGE_FORMAT' && (
            <div className="space-y-4 rounded-xl border border-purple-200 bg-purple-50 p-4 animate-in fade-in slide-in-from-top-2 duration-300 transition-all">
              <h3 className="text-sm font-semibold text-purple-800">Parametri Large Format (cost per m²)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <NumericField name="speedM2PerHour"    label="Viteză" suffix="m²/h" step="0.1" placeholder="20" tooltip="Capacitatea efectivă de producție pe oră. Este folosită la calculul timpului estimat." />
                <NumericField name="inkPerM2"          label="Cerneală" suffix="lei/m²" step="0.001" placeholder="0.80" tooltip="Costul mediu de cerneală consumată pentru un metru pătrat imprimat." />
                <NumericField name="materialPerM2"     label="Material" suffix="lei/m²" step="0.001" placeholder="1.20" tooltip="Costul substratului sau al materialului de bază pentru un metru pătrat." />
                <NumericField name="headAmortPerM2"    label="Amort. cap" suffix="lei/m²" step="0.0001" placeholder="0.15" tooltip="Amortizarea capului de print repartizată per metru pătrat produs." />
                <NumericField name="printerAmortPerM2" label="Amort. imprimantă" suffix="lei/m²" step="0.0001" placeholder="0.30" tooltip="Amortizarea echipamentului principal repartizată per metru pătrat." />
                <NumericField name="maintCostPerM2"    label="Mentenanță" suffix="lei/m²" step="0.0001" placeholder="0.10" tooltip="Cost mediu de întreținere, piese și consumabile auxiliare per metru pătrat." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <NumericField name="operatorCostPerHour" label="Cost operator" suffix="lei/h" placeholder="25" tooltip="Costul orar al operatorului alocat echipamentului." />
                <NumericField name="maxWidth" label="Lățime max" suffix="mm" step="1" placeholder="3200" tooltip="Lățimea maximă a suportului acceptat de echipament." />
              </div>
            </div>
          )}

          {/* ===== DIGITAL ===== */}
          {equipmentType === 'DIGITAL' && (
            <div className="space-y-4 rounded-xl border border-blue-200 bg-blue-50 p-4 animate-in fade-in slide-in-from-top-2 duration-300 transition-all">
              <h3 className="text-sm font-semibold text-blue-800">Parametri Digital (cost per click/coală)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <NumericField name="costClickColor"  label="Click color"   suffix="lei/click" step="0.0001" placeholder="0.0850" tooltip="Costul total per pagină color imprimată." />
                <NumericField name="costClickBW"     label="Click A/N"     suffix="lei/click" step="0.0001" placeholder="0.0120" tooltip="Costul total per pagină alb-negru imprimată." />
                <NumericField name="servicePerClick" label="Service/click"  suffix="lei/click" step="0.000001" placeholder="0.005000" tooltip="Taxa de service sau mentenanță repartizată pentru fiecare click imprimat." />
                <NumericField name="speedPpm"        label="Viteză"         suffix="ppm" step="1" placeholder="100" tooltip="Numărul de pagini pe minut folosit pentru estimarea timpului de producție." />
                <NumericField name="maxGramWeight"   label="Gramaj max"     suffix="g/m²" step="1" placeholder="300" tooltip="Gramajul maxim acceptat al hârtiei sau suportului printat." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  name="maxFormat"
                  render={({ field }) => (
                    <div>
                      <FormLabel>
                        <span className="inline-flex items-center gap-1.5">
                          <span>Format maxim</span>
                          <span
                            title="Formatul maxim al colii sau suportului acceptat de echipament."
                            aria-label="Formatul maxim al colii sau suportului acceptat de echipament."
                            className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gray-100 text-gray-500 cursor-help"
                          >
                            <Info className="h-3 w-3" />
                          </span>
                        </span>
                      </FormLabel>
                      <select
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">— selectează —</option>
                        {['A4', 'A3', 'SRA3', 'SRA2', 'B2', 'B1'].map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                  )}
                />
                <NumericField name="operatorCostPerHour" label="Cost operator" suffix="lei/h" placeholder="20" tooltip="Costul orar al operatorului alocat acestei imprimante." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <NumericField name="maxWidth"  label="Lățime max"   suffix="mm" step="1" tooltip="Lățimea maximă acceptată pentru coli sau suporturi speciale." />
                <NumericField name="maxHeight" label="Înălțime max" suffix="mm" step="1" tooltip="Înălțimea maximă acceptată pentru coli sau suporturi speciale." />
              </div>
            </div>
          )}

          {/* ===== HOURLY ===== */}
          {equipmentType === 'HOURLY' && (
            <div className="space-y-4 rounded-xl border border-orange-200 bg-orange-50 p-4 animate-in fade-in slide-in-from-top-2 duration-300 transition-all">
              <h3 className="text-sm font-semibold text-orange-800">Parametri Orar (cost per oră)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <NumericField name="costPerHour"         label="Cost mașină"    suffix="lei/h" placeholder="50" tooltip="Costul de funcționare al echipamentului pentru o oră de lucru." />
                <NumericField name="operatorCostPerHour" label="Cost operator"  suffix="lei/h" placeholder="25" tooltip="Tariful orar al operatorului necesar pentru utilizarea echipamentului." />
                <NumericField name="energyConsumptionKw" label="Consum energie" suffix="kW"    placeholder="3.5" tooltip="Consum energetic mediu pe oră, folosit la calculul costului total." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  name="speed"
                  render={({ field }) => (
                    <div>
                      <FormLabel>
                        <span className="inline-flex items-center gap-1.5">
                          <span>Viteză (opțional)</span>
                          <span
                            title="Descriere operațională liberă a vitezei: mm/s, cicluri/h, bucăți/oră sau alt indicator util operatorilor."
                            aria-label="Descriere operațională liberă a vitezei: mm/s, cicluri/h, bucăți/oră sau alt indicator util operatorilor."
                            className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gray-100 text-gray-500 cursor-help"
                          >
                            <Info className="h-3 w-3" />
                          </span>
                        </span>
                      </FormLabel>
                      <Input {...field} value={field.value ?? ''} placeholder="ex: 1000 mm/s, 200 cicluri/h" />
                    </div>
                  )}
                />
                <NumericField name="maxWidth" label="Lățime max" suffix="mm" step="1" tooltip="Lățimea maximă de lucru admisă pentru această operațiune tehnologică." />
              </div>
            </div>
          )}
          </section>

          {/* Consumabile Utilaj */}
          <EquipmentConsumables 
            machineId={machine?.id || null} 
            initialConsumables={machine?.consumables || []}
          />

          {/* Acțiuni */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Anulează
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting} className="flex-1">
              {machine ? 'Actualizează' : 'Adaugă echipament'}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
