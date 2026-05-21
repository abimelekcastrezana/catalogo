'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SortableProductsByCategory({ products, categories, reorderEndpoint }) {
  const router = useRouter();
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [groupedProducts, setGroupedProducts] = useState({});

  const categoryMap = {};
  categories.forEach((cat) => { categoryMap[cat.id] = cat; });

  useEffect(() => {
    const grouped = {};
    products.forEach((product) => {
      const catId = product.categoryId || 'no-category';
      if (!grouped[catId]) grouped[catId] = [];
      grouped[catId].push(product);
    });
    setGroupedProducts(grouped);
  }, [products]);

  const toggleCategory = (catId) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(catId) ? next.delete(catId) : next.add(catId);
      return next;
    });
  };

  const swap = async (catKey, index, direction) => {
    const next = index + direction;
    const items = [...groupedProducts[catKey]];
    if (next < 0 || next >= items.length) return;
    [items[index], items[next]] = [items[next], items[index]];
    const newGrouped = { ...groupedProducts, [catKey]: items };
    setGroupedProducts(newGrouped);
    await saveOrder(newGrouped);
  };

  const saveOrder = async (grouped) => {
    setSaving(true);
    try {
      const sortedKeys = Object.keys(grouped).sort((a, b) => {
        if (a === 'no-category') return -1;
        if (b === 'no-category') return 1;
        return (categoryMap[a]?.position ?? 999) - (categoryMap[b]?.position ?? 999);
      });
      const allIds = sortedKeys.flatMap((key) => grouped[key].map((p) => p.id));
      const res = await fetch(reorderEndpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: allIds }),
      });
      if (!res.ok) { alert('Error al reordenar'); return; }
      router.refresh();
    } catch { alert('Error al reordenar productos'); }
    finally { setSaving(false); }
  };

  const sortedKeys = Object.keys(groupedProducts).sort((a, b) => {
    if (a === 'no-category') return -1;
    if (b === 'no-category') return 1;
    return (categoryMap[a]?.position ?? 999) - (categoryMap[b]?.position ?? 999);
  });

  if (sortedKeys.length === 0) {
    return <p className="text-sm text-[var(--muted)] text-center py-6">No hay productos para reordenar.</p>;
  }

  return (
    <div className="grid gap-3">
      {saving && (
        <p className="text-xs text-[var(--muted)] text-center animate-pulse">Guardando orden...</p>
      )}
      {sortedKeys.map((catKey) => {
        const catId = catKey === 'no-category' ? null : catKey;
        const catName = catKey === 'no-category' ? 'Sin categoría' : (categoryMap[catKey]?.name || catKey);
        const isExpanded = expandedCategories.has(catId);
        const items = groupedProducts[catKey];

        return (
          <div key={catKey} className="rounded-2xl border border-[var(--border)] overflow-hidden">
            {/* Header de categoría */}
            <button
              onClick={() => toggleCategory(catId)}
              className="w-full flex items-center justify-between px-5 py-4 bg-[var(--surface-strong)] hover:bg-[var(--accent-soft)] transition-colors text-left"
            >
              <span className="font-semibold text-sm text-[var(--text)]">{catName}</span>
              <span className="text-xs text-[var(--muted)] flex items-center gap-2">
                {items.length} producto{items.length !== 1 ? 's' : ''}
                <span className="text-base">{isExpanded ? '▼' : '▶'}</span>
              </span>
            </button>

            {/* Productos */}
            {isExpanded && (
              <ul className="list-none m-0 p-3 grid gap-2 bg-[var(--surface)]">
                {items.map((product, index) => (
                  <li
                    key={product.id}
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] transition-opacity ${saving ? 'opacity-50' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[var(--text)] truncate m-0">{product.name}</p>
                      <p className="text-xs text-[var(--muted)] m-0">${parseFloat(product.price).toFixed(2)}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => swap(catKey, index, -1)}
                        disabled={index === 0 || saving}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] text-sm disabled:opacity-30 hover:bg-[var(--accent-soft)] transition-colors"
                      >↑</button>
                      <button
                        onClick={() => swap(catKey, index, 1)}
                        disabled={index === items.length - 1 || saving}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] text-sm disabled:opacity-30 hover:bg-[var(--accent-soft)] transition-colors"
                      >↓</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
