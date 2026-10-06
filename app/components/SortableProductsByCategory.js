'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUp, ArrowDown, ChevronDown } from 'lucide-react';

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
        <p className="text-xs text-[var(--muted)] text-center animate-pulse">Guardando orden…</p>
      )}
      {sortedKeys.map((catKey) => {
        const catId = catKey === 'no-category' ? null : catKey;
        const catName = catKey === 'no-category' ? 'Sin categoría' : (categoryMap[catKey]?.name || catKey);
        const isExpanded = expandedCategories.has(catId);
        const items = groupedProducts[catKey];

        return (
          <div key={catKey} className="rounded-2xl border-2 border-[var(--border)] overflow-hidden">
            {/* Header de categoría */}
            <button
              type="button"
              onClick={() => toggleCategory(catId)}
              aria-expanded={isExpanded}
              className="w-full flex items-center justify-between px-5 py-4 bg-[var(--surface-strong)] hover:bg-[var(--accent-soft)] transition-colors duration-150 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            >
              <span className="font-extrabold text-sm text-[var(--text)]">{catName}</span>
              <span className="text-xs font-bold text-[var(--muted)] flex items-center gap-2">
                {items.length} producto{items.length !== 1 ? 's' : ''}
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`} strokeWidth={2} aria-hidden="true" />
              </span>
            </button>

            {/* Productos */}
            {isExpanded && (
              <ul className="list-none m-0 p-3 grid gap-2 bg-[var(--surface)]">
                {items.map((product, index) => (
                  <li
                    key={product.id}
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border-2 border-[var(--border)] bg-[var(--surface-strong)] transition-opacity ${saving ? 'opacity-50' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[var(--text)] truncate m-0">{product.name}</p>
                      <p className="text-xs text-[var(--muted)] m-0 tabular-nums">${parseFloat(product.price).toFixed(2)}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => swap(catKey, index, -1)}
                        disabled={index === 0 || saving}
                        className="icon-btn hit"
                        aria-label={`Mover ${product.name} arriba`}
                      ><ArrowUp aria-hidden="true" /></button>
                      <button
                        type="button"
                        onClick={() => swap(catKey, index, 1)}
                        disabled={index === items.length - 1 || saving}
                        className="icon-btn hit"
                        aria-label={`Mover ${product.name} abajo`}
                      ><ArrowDown aria-hidden="true" /></button>
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
