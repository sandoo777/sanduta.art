import { Trash2, PlusCircle } from 'lucide-react';
import type { Material } from '@/modules/materials/types';
import type { PrintMethod } from '@/modules/print-methods/types';
import type { FinishingOperation } from '@/modules/finishing/types';
import type {
  CreateFullProductInput,
  ProductDimensions,
  ProductOption,
} from '@/modules/products/productBuilder.types';

interface OptionsTabProps {
  data: CreateFullProductInput;
  materials: Material[];
  printMethods: PrintMethod[];
  finishing: FinishingOperation[];
  onDimensionsChange: (dimensions?: ProductDimensions) => void;
  onMaterialsChange: (ids: string[]) => void;
  onPrintMethodsChange: (ids: string[]) => void;
  onFinishingChange: (ids: string[]) => void;
  onOptionsChange: (options: ProductOption[]) => void;
}

const UNITS = [
  { value: 'mm', label: 'Milimetri' },
  { value: 'cm', label: 'Centimetri' },
  { value: 'm', label: 'Metri' },
] as const;

type OptionField = keyof ProductOption;
type OptionValueField = 'label' | 'value' | 'priceModifier';

type ToggleList = 'materials' | 'printMethods' | 'finishing';

export function OptionsTab({
  data,
  materials,
  printMethods,
  finishing,
  onDimensionsChange,
  onMaterialsChange,
  onPrintMethodsChange,
  onFinishingChange,
  onOptionsChange,
}: OptionsTabProps) {
  const dimensions = data.dimensions ?? { unit: 'mm' };
  const options = data.options ?? [];

  const handleDimensionChange = (field: keyof ProductDimensions, value: string) => {
    const next = {
      ...dimensions,
      [field]: value === '' ? undefined : Number(value),
    } as ProductDimensions;

    onDimensionsChange(next);
  };

  const handleUnitChange = (value: string) => {
    onDimensionsChange({ ...dimensions, unit: value as ProductDimensions['unit'] });
  };

  const toggleItem = (id: string, list: ToggleList) => {
    const current =
      list === 'materials'
        ? data.compatibleMaterials || []
        : list === 'printMethods'
          ? data.compatiblePrintMethods || []
          : data.compatibleFinishing || [];

    const exists = current.includes(id);
    const next = exists ? current.filter((item) => item !== id) : [...current, id];

    if (list === 'materials') {
      onMaterialsChange(next);
    } else if (list === 'printMethods') {
      onPrintMethodsChange(next);
    } else {
      onFinishingChange(next);
    }
  };

  const handleOptionChange = (index: number, field: OptionField, value: unknown) => {
    const next = [...options];
    next[index] = {
      ...next[index],
      [field]: value,
    } as ProductOption;
    onOptionsChange(next);
  };

  const handleValueChange = (
    optionIndex: number,
    valueIndex: number,
    field: OptionValueField,
    value: string
  ) => {
    const next = [...options];
    const option = next[optionIndex];
    const values = [...(option.values || [])];
    const updatedValue = {
      ...values[valueIndex],
      [field]: field === 'priceModifier' ? Number(value) : value,
    };
    values[valueIndex] = updatedValue;
    next[optionIndex] = { ...option, values };
    onOptionsChange(next);
  };

  const handleAddOption = () => {
    const next: ProductOption[] = [
      ...options,
      {
        name: 'Noua opțiune',
        type: 'dropdown',
        required: false,
        values: [
          {
            label: 'Variantă',
            value: 'varianta',
            priceModifier: 0,
          },
        ],
      },
    ];

    onOptionsChange(next);
  };

  const handleRemoveOption = (index: number) => {
    const next = options.filter((_, idx) => idx !== index);
    onOptionsChange(next);
  };

  const handleAddValue = (optionIndex: number) => {
    const next = [...options];
    const option = next[optionIndex];
    const values = [...(option.values || [])];
    values.push({ label: 'Opțiune', value: `value-${values.length + 1}`, priceModifier: 0 });
    next[optionIndex] = { ...option, values };
    onOptionsChange(next);
  };

  const handleRemoveValue = (optionIndex: number, valueIndex: number) => {
    const next = [...options];
    const option = next[optionIndex];
    const values = option.values.filter((_, idx) => idx !== valueIndex);
    if (values.length === 0) {
      values.push({ label: 'Opțiune', value: `value-${Date.now()}`, priceModifier: 0 });
    }
    next[optionIndex] = { ...option, values };
    onOptionsChange(next);
  };

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Dimensiuni configurabile</h3>
            <p className="text-sm text-gray-600">Definește limitele pentru lățime și înălțime</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Lățime minimă</label>
            <input
              type="number"
              min="0"
              value={dimensions.widthMin ?? ''}
              onChange={(event) => handleDimensionChange('widthMin', event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Lățime maximă</label>
            <input
              type="number"
              min="0"
              value={dimensions.widthMax ?? ''}
              onChange={(event) => handleDimensionChange('widthMax', event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Înălțime minimă</label>
            <input
              type="number"
              min="0"
              value={dimensions.heightMin ?? ''}
              onChange={(event) => handleDimensionChange('heightMin', event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Înălțime maximă</label>
            <input
              type="number"
              min="0"
              value={dimensions.heightMax ?? ''}
              onChange={(event) => handleDimensionChange('heightMax', event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Unitate</label>
            <select
              value={dimensions.unit}
              onChange={(event) => handleUnitChange(event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              {UNITS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MultiSelectSection
          title="Materiale compatibile"
          description="Selectează materialele disponibile în configurator"
          items={materials.map((material) => ({ id: material.id, label: material.name, hint: material.unit }))}
          selected={data.compatibleMaterials || []}
          onToggle={(id) => toggleItem(id, 'materials')}
        />
        <MultiSelectSection
          title="Metode de print"
          description="Limitează opțiunile în funcție de echipamente"
          items={printMethods.map((method) => ({ id: method.id, label: method.name, hint: method.type }))}
          selected={data.compatiblePrintMethods || []}
          onToggle={(id) => toggleItem(id, 'printMethods')}
        />
        <MultiSelectSection
          title="Operațiuni de finisare"
          description="Opțiuni suplimentare după print"
          items={finishing.map((operation) => ({ id: operation.id, label: operation.name, hint: operation.type }))}
          selected={data.compatibleFinishing || []}
          onToggle={(id) => toggleItem(id, 'finishing')}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Opțiuni configurator</h3>
            <p className="text-sm text-gray-600">Controlează secțiunile și valorile disponibile pentru client</p>
          </div>
          <button
            type="button"
            onClick={handleAddOption}
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
          >
            <PlusCircle className="h-4 w-4" /> Adaugă opțiune
          </button>
        </div>

        {options.length === 0 && (
          <div className="border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500">
            Nu există încă opțiuni configurabile. Adaugă prima opțiune pentru a începe.
          </div>
        )}

        <div className="space-y-6">
          {options.map((option, index) => (
            <div key={`option-${index}`} className="border border-gray-200 rounded-xl p-4 space-y-4">
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium text-gray-700">Nume opțiune</label>
                  <input
                    type="text"
                    value={option.name}
                    onChange={(event) => handleOptionChange(index, 'name', event.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Tip</label>
                  <select
                    value={option.type}
                    onChange={(event) => handleOptionChange(index, 'type', event.target.value as ProductOption['type'])}
                    className="mt-2 rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="dropdown">Dropdown</option>
                    <option value="radio">Radio</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="numeric">Valoare numerică</option>
                    <option value="color">Selector culori</option>
                  </select>
                </div>
                <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={option.required}
                    onChange={(event) => handleOptionChange(index, 'required', event.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Obligatorie
                </label>
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Elimină
                </button>
              </div>

              <div className="space-y-3">
                {option.values.map((value, valueIndex) => (
                  <div key={`option-${index}-value-${valueIndex}`} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Etichetă</label>
                      <input
                        type="text"
                        value={value.label}
                        onChange={(event) => handleValueChange(index, valueIndex, 'label', event.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Valoare internă</label>
                      <input
                        type="text"
                        value={value.value}
                        onChange={(event) => handleValueChange(index, valueIndex, 'value', event.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Supliment (MDL)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={value.priceModifier ?? 0}
                          onChange={(event) => handleValueChange(index, valueIndex, 'priceModifier', event.target.value)}
                          className="mt-1 flex-1 rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveValue(index, valueIndex)}
                          className="mt-1 px-3 py-2 rounded-lg border border-gray-100 text-gray-500 hover:bg-gray-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddValue(index)}
                  className="text-sm font-semibold text-blue-600"
                >
                  + Adaugă valoare
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface MultiSelectItem {
  id: string;
  label: string;
  hint?: string | null;
}

interface MultiSelectSectionProps {
  title: string;
  description: string;
  items: MultiSelectItem[];
  selected: string[];
  onToggle: (id: string) => void;
}

function MultiSelectSection({ title, description, items, selected, onToggle }: MultiSelectSectionProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3">
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <div className="max-h-48 overflow-y-auto space-y-2">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex items-center gap-2 text-sm text-gray-700 rounded-lg px-2 py-1.5 hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selected.includes(item.id)}
              onChange={() => onToggle(item.id)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <p className="font-medium text-gray-800">{item.label}</p>
              {item.hint && <p className="text-xs text-gray-500">{item.hint}</p>}
            </div>
          </label>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-gray-500">
            Nu există înregistrări încă. Adaugă elemente în secțiunea dedicată.
          </p>
        )}
      </div>
    </div>
  );
}
