'use client';

export default function StoreTabs() {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        className="px-4 py-2 rounded-full text-sm font-medium bg-[var(--accent)] text-white"
      >
        🛍️ Vitrina
      </button>
      <button
        type="button"
        disabled
        title="Próximamente"
        className="px-4 py-2 rounded-full text-sm font-medium border border-[var(--border)] text-[var(--muted)] cursor-not-allowed"
      >
        Presentaciones · Próximamente
      </button>
    </div>
  );
}
