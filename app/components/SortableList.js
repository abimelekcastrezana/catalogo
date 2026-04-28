'use client';

import { useState, useEffect } from 'react';

export default function SortableList({ items, renderItem, onReorder, isLoading = false }) {
  const [localItems, setLocalItems] = useState(items);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const moveUp = (index) => {
    if (index === 0) return;
    const newItems = [...localItems];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setLocalItems(newItems);
    saveOrder(newItems);
  };

  const moveDown = (index) => {
    if (index === localItems.length - 1) return;
    const newItems = [...localItems];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setLocalItems(newItems);
    saveOrder(newItems);
  };

  const saveOrder = async (items) => {
    setSaving(true);
    try {
      const ids = items.map(item => item.id);
      await onReorder(ids);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
      {localItems.map((item, index) => (
        <li
          key={item.id}
          style={{
            border: '1px solid #eee',
            borderRadius: '10px',
            padding: '0.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            opacity: saving ? 0.6 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          <div style={{ flex: 1 }}>
            {renderItem(item)}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <button
              onClick={() => moveUp(index)}
              disabled={index === 0 || saving}
              style={{
                padding: '0.4rem 0.6rem',
                fontSize: '0.9rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: index === 0 || saving ? 'not-allowed' : 'pointer',
                opacity: index === 0 ? 0.4 : 1,
                backgroundColor: '#fff',
              }}
              title="Mover hacia arriba"
            >
              ↑
            </button>
            <button
              onClick={() => moveDown(index)}
              disabled={index === localItems.length - 1 || saving}
              style={{
                padding: '0.4rem 0.6rem',
                fontSize: '0.9rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: index === localItems.length - 1 || saving ? 'not-allowed' : 'pointer',
                opacity: index === localItems.length - 1 ? 0.4 : 1,
                backgroundColor: '#fff',
              }}
              title="Mover hacia abajo"
            >
              ↓
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
