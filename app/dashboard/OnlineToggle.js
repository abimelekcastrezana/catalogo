"use client";

import { useState } from 'react';

export default function OnlineToggle({ vendorId, initialIsOnline, vendorData }) {
  const [isOnline, setIsOnline] = useState(initialIsOnline ?? true);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/vendors/${vendorId}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...vendorData, isOnline: !isOnline }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsOnline(data.vendor.isOnline ?? !isOnline);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-pressed={isOnline}
      className={`inline-flex items-center gap-2 min-h-10 px-4 py-1.5 rounded-lg text-sm font-bold border-2 cursor-pointer transition-[background-color,border-color,transform] duration-100 active:scale-[0.96] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        isOnline
          ? 'border-[var(--whatsapp)] bg-[var(--success-soft)] text-[var(--success)]'
          : 'border-[var(--highlight)] bg-[var(--highlight-soft)] text-[var(--text)]'
      }`}
    >
      <span aria-hidden="true" className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[var(--whatsapp)]' : 'bg-[var(--highlight)]'}`} />
      {isOnline ? 'En línea' : 'Ausente'}
    </button>
  );
}
