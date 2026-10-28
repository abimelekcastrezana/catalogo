"use client";

import { X } from 'lucide-react';
import { CARD_MAX_VALUES } from '@/app/lib/products';

// Editor de los valores de una suscripción (1 a CARD_MAX_VALUES): monto y nombre opcional.
export default function CardValuesEditor({ values, onChange }) {
  const update = (i, field, value) =>
    onChange(values.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)));
  const remove = (i) => onChange(values.filter((_, idx) => idx !== i));
  const add = () => onChange([...values, { tempId: Date.now(), name: '', price: '' }]);

  return (
    <div className="grid gap-2 border-t border-[var(--border)] pt-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[var(--text)]">
          Valores <span className="text-[var(--muted)] font-normal text-xs">({values.length}/{CARD_MAX_VALUES})</span>
        </span>
        <button
          type="button"
          onClick={add}
          disabled={values.length >= CARD_MAX_VALUES}
          className="text-xs text-[var(--accent-text)] hover:underline font-medium disabled:opacity-50 disabled:no-underline"
        >
          + Agregar valor
        </button>
      </div>
      <div className="grid gap-2">
        {values.map((v, i) => (
          <div key={v.id || v.tempId} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2 p-3 rounded-xl bg-[var(--surface-strong)] border border-[var(--border)]">
            <div className="grid gap-1">
              <label className="text-xs text-[var(--muted)]">Monto</label>
              <input
                className="input text-sm"
                type="number" step="0.01" min="0.01"
                placeholder="100"
                value={v.price}
                onChange={(e) => update(i, 'price', e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs text-[var(--muted)]">Nombre (opcional)</label>
              <input
                className="input text-sm"
                placeholder="ej. 1,000 pavos"
                value={v.name}
                onChange={(e) => update(i, 'name', e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              disabled={values.length <= 1}
              aria-label="Quitar valor"
              className="hit mb-1 text-[var(--muted)] hover:text-[var(--danger)] transition-colors disabled:opacity-40"
            ><X className="h-5 w-5" strokeWidth={2} aria-hidden="true" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
