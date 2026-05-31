"use client";

import { useState, useRef, useEffect } from 'react';

export default function OnlineIndicator({ isOnline }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!showTooltip) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setShowTooltip(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [showTooltip]);

  return (
    <div className="relative inline-flex items-center" ref={ref}>
      <button
        type="button"
        onClick={() => setShowTooltip((v) => !v)}
        aria-label={isOnline ? 'En línea' : 'Ausente'}
        className={`w-4 h-4 rounded-full border-2 border-white/80 cursor-pointer transition-colors shadow-sm ${
          isOnline ? 'bg-green-500' : 'bg-yellow-400'
        }`}
      />
      {showTooltip && (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg bg-[var(--surface)] text-[var(--text)] border border-[var(--border)]">
          {isOnline ? 'En línea' : 'Ausente'}
        </div>
      )}
    </div>
  );
}
