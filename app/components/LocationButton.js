'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export default function LocationButton({ city, state }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const label = city ? `${city}, ${state}` : state;

  return (
    <div className="relative" ref={ref}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <MapPin aria-hidden="true" /> Ubicación
      </Button>
      {open && (
        <div className="anim-pop-in absolute z-30 top-full left-1/2 -translate-x-1/2 mt-2 w-56 rounded-xl border-2 border-[var(--border)] bg-[var(--surface)] shadow-card p-3 text-center">
          <p className="text-sm font-bold text-[var(--text)] m-0">{label}</p>
        </div>
      )}
    </div>
  );
}
