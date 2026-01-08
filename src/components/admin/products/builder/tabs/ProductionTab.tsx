import { Plus, Trash2 } from 'lucide-react';
import type { Machine } from '@/modules/machines/types';
import type { ProductProduction } from '@/modules/products/productBuilder.types';

interface ProductionTabProps {
  production?: ProductProduction;
  machines: Machine[];
  onChange: (production?: ProductProduction) => void;
}

type OperationField = 'name' | 'machineId' | 'timeMinutes' | 'order';

export function ProductionTab({ production, machines, onChange }: ProductionTabProps) {
  const value = production ?? { operations: [], estimatedTime: 0, notes: '' };
  const operations = value.operations || [];

  const updateProduction = (updates: Partial<ProductProduction>) => {
    onChange({ ...value, ...updates });
  };

  const handleOperationChange = (index: number, field: OperationField, newValue: string) => {
    const nextOperations = [...operations];
    const operation = nextOperations[index];
    nextOperations[index] = {
      ...operation,
      [field]: field === 'timeMinutes' || field === 'order' ? Number(newValue) : newValue,
    };
    updateProduction({ operations: nextOperations });
  };

  const addOperation = () => {
    const nextOperations = [
      ...operations,
      {
        name: 'Operațiune nouă',
        machineId: undefined,
        timeMinutes: 10,
        order: operations.length + 1,
      },
    ];
    updateProduction({ operations: nextOperations });
  };

  const removeOperation = (index: number) => {
    const nextOperations = operations.filter((_, idx) => idx !== index);
    updateProduction({ operations: nextOperations });
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Flux de producție</h3>
            <p className="text-sm text-gray-600">Definește pașii necesari pentru realizarea produsului</p>
          </div>
          <button
            type="button"
            onClick={addOperation}
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
          >
            <Plus className="h-4 w-4" /> Adaugă operațiune
          </button>
        </div>

        {operations.length === 0 && (
          <div className="border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500">
            Nu ai definit încă niciun pas. Adaugă operațiuni pentru a descrie procesul complet.
          </div>
        )}

        <div className="space-y-4">
          {operations.map((operation, index) => (
            <div key={`operation-${index}`} className="border border-gray-200 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900">Pasul {operation.order ?? index + 1}</p>
                <button
                  type="button"
                  onClick={() => removeOperation(index)}
                  className="text-sm text-red-600 hover:text-red-700 inline-flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" /> Elimină
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Nume operațiune</label>
                  <input
                    type="text"
                    value={operation.name}
                    onChange={(event) => handleOperationChange(index, 'name', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Mașină</label>
                  <select
                    value={operation.machineId ?? ''}
                    onChange={(event) => handleOperationChange(index, 'machineId', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Manual / fără mașină</option>
                    {machines.map((machine) => (
                      <option key={machine.id} value={machine.id}>
                        {machine.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Durată (minute)</label>
                  <input
                    type="number"
                    min="1"
                    value={operation.timeMinutes}
                    onChange={(event) => handleOperationChange(index, 'timeMinutes', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Ordinea</label>
                  <input
                    type="number"
                    min="1"
                    value={operation.order}
                    onChange={(event) => handleOperationChange(index, 'order', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-gray-700">Timp estimat total (minute)</label>
          <input
            type="number"
            min="0"
            value={value.estimatedTime ?? 0}
            onChange={(event) => updateProduction({ estimatedTime: Number(event.target.value) })}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Poți calcula automat însumând timpul fiecărei operațiuni sau seta manual.
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Note pentru producție</label>
          <textarea
            rows={4}
            value={value.notes ?? ''}
            onChange={(event) => updateProduction({ notes: event.target.value })}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            placeholder="Instrucțiuni specifice pentru operatori, verificări, QC etc."
          />
        </div>
      </section>
    </div>
  );
}
