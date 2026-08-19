'use client';

import { useEffect, useRef, useState } from 'react';

export default function LocationButton({ city, state }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const label = city ? `${city}, ${state}` : state;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm font-medium text-[var(--text)] border border-[var(--border)] rounded-full px-3 py-1.5 hover:bg-[var(--accent-soft)] transition-colors"
      >
        📍 Ubicación
      </button>
      {open && (
        <div className="absolute z-30 top-full left-1/2 -translate-x-1/2 mt-2 w-56 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-card p-3 text-center">
          <p className="text-sm text-[var(--text)] m-0">{label}</p>
        </div>
      )}
    </div>
  );
}
