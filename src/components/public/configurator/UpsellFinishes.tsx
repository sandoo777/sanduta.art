"use client";

import { type FinishSuggestion } from '@/modules/configurator/useUpsellEngine';

interface UpsellFinishesProps {
  suggestions: FinishSuggestion[];
  onAddFinish: (suggestion: FinishSuggestion) => void;
}

export function UpsellFinishes({ suggestions, onAddFinish }: UpsellFinishesProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">Finisaje premium</p>
          <p className="text-xs text-gray-600">Îmbunătățește aspectul și protecția produsului.</p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold">Premium</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {suggestions.map((s) => (
          <div key={s.id} className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <IconFor id={s.id} />
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold">+{s.price} MDL</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">{s.label}</p>
            <p className="text-xs text-gray-600 mb-3">{s.description}</p>
            <button
              type="button"
              onClick={() => onAddFinish(s)}
              className="w-full text-sm font-semibold text-blue-700 border border-blue-200 rounded-lg py-2 hover:bg-blue-50"
            >
              Adaugă
            </button>
          </div>
        ))}
        {suggestions.length === 0 && (
          <div className="col-span-1 md:col-span-3 text-sm text-gray-500 border border-dashed border-gray-200 rounded-lg p-3">
            Toate finisajele premium sunt deja selectate.
          </div>
        )}
      </div>
    </div>
  );
}

function IconFor({ id }: { id: string }) {
  if (id.includes('foil')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3h14l-2 18H7L5 3z" />
      </svg>
    );
  }
  if (id.includes('round')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="16" rx="4" strokeWidth={2} />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
