"use client";

import { useId } from 'react';

// Campo de descripción; en planes con límite (Free) muestra un contador de caracteres.
export default function DescriptionField({ plan, value, onChange, placeholder }) {
  const id = useId();
  const max = plan.maxDescriptionLength;
  const over = max !== null && value.length > max;

  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-[var(--text)]">Descripción</label>
        {max !== null && (
          <span className={`text-xs tabular-nums ${over ? 'text-[var(--danger)] font-bold' : 'text-[var(--muted)]'}`}>
            {value.length}/{max}
          </span>
        )}
      </div>
      <input
        id={id}
        name="description"
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={max ?? undefined}
        autoComplete="off"
      />
    </div>
  );
}
