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
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border-none cursor-pointer transition-colors disabled:opacity-50 ${
        isOnline
          ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-yellow-400'}`} />
      {isOnline ? 'En línea' : 'Ausente'}
    </button>
  );
}
