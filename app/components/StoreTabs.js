'use client';

import { ShoppingBag, Presentation } from 'lucide-react';

export default function StoreTabs() {
  return (
    <div role="tablist" aria-label="Secciones de la tienda" className="flex items-center justify-center gap-2">
      <button
        type="button"
        role="tab"
        aria-selected="true"
        className="hit inline-flex h-10 items-center gap-2 rounded-lg border-2 border-[var(--accent)] bg-[var(--accent-soft)] px-4 text-sm font-extrabold text-[var(--accent-text)]"
      >
        <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden="true" />
        Vitrina
      </button>
      <button
        type="button"
        role="tab"
        aria-selected="false"
        disabled
        title="Próximamente"
        className="inline-flex h-10 items-center gap-2 rounded-lg border-2 border-[var(--border)] px-4 text-sm font-bold text-[var(--muted)] cursor-not-allowed"
      >
        <Presentation className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
        Presentaciones
        <span className="rounded-md bg-[var(--surface-strong)] px-1.5 py-0.5 text-[11px] font-bold">Pronto</span>
      </button>
    </div>
  );
}
