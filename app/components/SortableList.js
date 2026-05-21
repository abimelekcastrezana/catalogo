'use client';

import { useState, useEffect } from 'react';

export default function SortableList({ items, renderItem, onReorder }) {
  const [localItems, setLocalItems] = useState(items);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setLocalItems(items); }, [items]);

  const swap = (index, direction) => {
    const next = index + direction;
    if (next < 0 || next >= localItems.length) return;
    const newItems = [...localItems];
    [newItems[index], newItems[next]] = [newItems[next], newItems[index]];
    setLocalItems(newItems);
    saveOrder(newItems);
  };

  const saveOrder = async (items) => {
    setSaving(true);
    try { await onReorder(items.map((i) => i.id)); }
    finally { setSaving(false); }
  };

  return (
    <ul className="list-none p-0 m-0 grid gap-2">
      {localItems.map((item, index) => (
        <li
          key={item.id}
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] transition-opacity ${saving ? 'opacity-50' : 'opacity-100'}`}
        >
          <div className="flex-1 min-w-0">{renderItem(item)}</div>
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => swap(index, -1)}
              disabled={index === 0 || saving}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] text-sm disabled:opacity-30 hover:bg-[var(--accent-soft)] transition-colors"
              title="Mover arriba"
            >
              ↑
            </button>
            <button
              onClick={() => swap(index, 1)}
              disabled={index === localItems.length - 1 || saving}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] text-sm disabled:opacity-30 hover:bg-[var(--accent-soft)] transition-colors"
              title="Mover abajo"
            >
              ↓
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
