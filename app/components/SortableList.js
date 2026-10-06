'use client';

import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, Pencil, Trash2 } from 'lucide-react';

export default function SortableList({ items, renderItem, onReorder, onDelete, onEdit }) {
  const [localItems, setLocalItems] = useState(items);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

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

  const handleDelete = async (item) => {
    if (!onDelete) return;
    const confirmed = window.confirm(`¿Seguro que quieres borrar la categoría "${item.name}"? Los productos no se eliminarán, solo quedarán sin categoría.`);
    if (!confirmed) return;
    setDeletingId(item.id);
    try {
      await onDelete(item);
      setLocalItems((prev) => prev.filter((i) => i.id !== item.id));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ul className="list-none p-0 m-0 grid gap-2">
      {localItems.map((item, index) => (
        <li
          key={item.id}
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border-2 border-[var(--border)] bg-[var(--surface-strong)] transition-opacity ${saving ? 'opacity-50' : 'opacity-100'}`}
        >
          <div className="flex-1 min-w-0">{renderItem(item)}</div>
          <div className="flex gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => swap(index, -1)}
              disabled={index === 0 || saving}
              className="icon-btn hit"
              title="Mover arriba"
              aria-label="Mover arriba"
            >
              <ArrowUp aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => swap(index, 1)}
              disabled={index === localItems.length - 1 || saving}
              className="icon-btn hit"
              title="Mover abajo"
              aria-label="Mover abajo"
            >
              <ArrowDown aria-hidden="true" />
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(item)}
                disabled={saving}
                className="icon-btn hit"
                title="Editar categoría"
                aria-label={`Editar ${item.name}`}
              >
                <Pencil aria-hidden="true" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => handleDelete(item)}
                disabled={saving || deletingId === item.id}
                className="icon-btn icon-btn--danger hit"
                title="Eliminar categoría"
                aria-label={`Eliminar ${item.name}`}
              >
                <Trash2 aria-hidden="true" />
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
