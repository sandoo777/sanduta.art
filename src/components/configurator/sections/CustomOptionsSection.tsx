'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { ConfiguratorOption } from '@/modules/configurator/types';

interface CustomOptionsSectionProps {
  options: ConfiguratorOption[];
  selections: Record<string, string | string[]>;
  onChange: (optionId: string, value: string | string[]) => void;
}

export function CustomOptionsSection({
  options,
  selections,
  onChange,
}: CustomOptionsSectionProps) {
  if (options.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Opțiuni personalizare</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {options.map((option) => {
            const value = selections[option.id];

            return (
              <div key={option.id} className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  {option.name}
                  {option.required && <span className="ml-1 text-red-500">*</span>}
                </label>

                {/* Dropdown */}
                {option.type === 'dropdown' && (
                  <Select
                    value={String(value ?? '')}
                    onChange={(e) => onChange(option.id, e.target.value)}
                    required={option.required}
                    options={[
                      { value: '', label: 'Selectează...' },
                      ...option.values.map((val) => ({
                        value: val.value,
                        label: `${val.label}${val.priceModifier && val.priceModifier > 0 ? ` (+${val.priceModifier} MDL)` : ''}`,
                        disabled: val.disabled,
                      })),
                    ]}
                  />
                )}

                {/* Radio */}
                {option.type === 'radio' && (
                  <div className="space-y-2">
                    {option.values.map((val) => (
                      <label
                        key={val.value}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-all hover:bg-slate-50 ${
                          value === val.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200'
                        } ${val.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <input
                          type="radio"
                          name={option.id}
                          value={val.value}
                          checked={value === val.value}
                          onChange={(e) => onChange(option.id, e.target.value)}
                          disabled={val.disabled}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="flex-1 text-sm text-slate-900">
                          {val.label}
                          {val.priceModifier && val.priceModifier > 0 && (
                            <span className="ml-2 text-xs text-slate-500">
                              +{val.priceModifier} MDL
                            </span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Checkbox */}
                {option.type === 'checkbox' && (
                  <div className="space-y-2">
                    {option.values.map((val) => {
                      const arrayValue = Array.isArray(value) ? value : [];
                      const isChecked = arrayValue.includes(val.value);

                      return (
                        <label
                          key={val.value}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-all hover:bg-slate-50 ${
                            isChecked
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-slate-200'
                          } ${val.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const newValue = e.target.checked
                                ? [...arrayValue, val.value]
                                : arrayValue.filter((v) => v !== val.value);
                              onChange(option.id, newValue);
                            }}
                            disabled={val.disabled}
                            className="h-4 w-4 rounded text-blue-600"
                          />
                          <span className="flex-1 text-sm text-slate-900">
                            {val.label}
                            {val.priceModifier && val.priceModifier > 0 && (
                              <span className="ml-2 text-xs text-slate-500">
                                +{val.priceModifier} MDL
                              </span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Numeric input */}
                {option.type === 'numeric' && (
                  <Input
                    type="number"
                    value={value ? String(value) : ''}
                    onChange={(e) => onChange(option.id, e.target.value)}
                    placeholder={`Introdu ${option.name.toLowerCase()}`}
                    required={option.required}
                  />
                )}

                {/* Color picker */}
                {option.type === 'color' && (
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((val) => (
                      <button
                        key={val.value}
                        type="button"
                        onClick={() => onChange(option.id, val.value)}
                        disabled={val.disabled}
                        className={`group relative h-12 w-12 rounded-lg border-2 transition-all hover:scale-110 ${
                          value === val.value
                            ? 'border-blue-500 shadow-md'
                            : 'border-slate-200 hover:border-slate-300'
                        } ${val.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        style={{ backgroundColor: val.value }}
                        title={val.label}
                      >
                        {value === val.value && (
                          <svg
                            className="absolute inset-0 m-auto h-6 w-6 text-white drop-shadow-md"
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
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
