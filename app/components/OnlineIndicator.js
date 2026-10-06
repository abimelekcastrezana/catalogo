"use client";

export default function OnlineIndicator({ isOnline }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border-2 px-2.5 py-0.5 text-xs font-bold ${
        isOnline
          ? 'border-[var(--whatsapp)] bg-[var(--success-soft)] text-[var(--success)]'
          : 'border-[var(--highlight)] bg-[var(--highlight-soft)] text-[var(--text)]'
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${isOnline ? 'bg-[var(--whatsapp)]' : 'bg-[var(--highlight)]'}`}
      />
      {isOnline ? 'En línea' : 'Ausente'}
    </span>
  );
}
