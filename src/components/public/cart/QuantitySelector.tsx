import React from 'react';

interface QuantitySelectorProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export function QuantitySelector({ value, min, max, onChange }: QuantitySelectorProps) {
  const increment = () => {
    if (value < max) onChange(value + 1);
  };
  const decrement = () => {
    if (value > min) onChange(value - 1);
  };
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v) && v >= min && v <= max) onChange(v);
  };
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={decrement} className="px-2 py-1 bg-slate-100 rounded disabled:opacity-50" disabled={value <= min}>-</button>
      <input type="number" min={min} max={max} value={value} onChange={handleInput} className="w-12 text-center border rounded" />
      <button type="button" onClick={increment} className="px-2 py-1 bg-slate-100 rounded disabled:opacity-50" disabled={value >= max}>+</button>
    </div>
  );
}
