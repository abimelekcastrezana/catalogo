'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SortableProductsByCategory({ products, categories, reorderEndpoint }) {
  const router = useRouter();
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [groupedProducts, setGroupedProducts] = useState({});

  useEffect(() => {
    const grouped = {};
    products.forEach((product) => {
      const catId = product.categoryId || 'no-category';
      if (!grouped[catId]) {
        grouped[catId] = [];
      }
      grouped[catId].push(product);
    });
    setGroupedProducts(grouped);
  }, [products]);

  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const moveProductUp = async (categoryId, index) => {
    if (index === 0) return;
    const catKey = categoryId || 'no-category';
    const newGrouped = { ...groupedProducts };
    const items = [...newGrouped[catKey]];
    [items[index - 1], items[index]] = [items[index], items[index - 1]];
    newGrouped[catKey] = items;
    setGroupedProducts(newGrouped);
    await saveOrder(newGrouped);
  };

  const moveProductDown = async (categoryId, index) => {
    const catKey = categoryId || 'no-category';
    if (index === groupedProducts[catKey].length - 1) return;
    const newGrouped = { ...groupedProducts };
    const items = [...newGrouped[catKey]];
    [items[index], items[index + 1]] = [items[index + 1], items[index]];
    newGrouped[catKey] = items;
    setGroupedProducts(newGrouped);
    await saveOrder(newGrouped);
  };

  const saveOrder = async (grouped) => {
    setSaving(true);
    try {
      const allProductIds = [];

      // Primero agregar productos sin categoría
      if (grouped['no-category']) {
        grouped['no-category'].forEach((product) => {
          allProductIds.push(product.id);
        });
      }

      // Luego agregar productos de otras categorías en orden de position
      const sortedCategoryKeys = Object.keys(grouped)
        .filter((key) => key !== 'no-category')
        .sort((a, b) => {
          const posA = categoryMap[a]?.position ?? 999;
          const posB = categoryMap[b]?.position ?? 999;
          return posA - posB;
        });

      sortedCategoryKeys.forEach((catKey) => {
        grouped[catKey].forEach((product) => {
          allProductIds.push(product.id);
        });
      });

      const response = await fetch(reorderEndpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: allProductIds }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Error al reordenar: ${error.error}`);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error('Reorder error:', error);
      alert('Error al reordenar productos');
    } finally {
      setSaving(false);
    }
  };

  const categoryMap = {};
  categories.forEach((cat) => {
    categoryMap[cat.id] = cat;
  });

  const sortedKeys = Object.keys(groupedProducts).sort((a, b) => {
    // Sin categoría siempre primero
    if (a === 'no-category') return -1;
    if (b === 'no-category') return 1;
    // Luego por posición de categoría
    const posA = categoryMap[a]?.position ?? 999;
    const posB = categoryMap[b]?.position ?? 999;
    return posA - posB;
  });

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {sortedKeys.map((catKey) => {
          const categoryId = catKey === 'no-category' ? null : catKey;
          const categoryName = catKey === 'no-category' ? 'Sin categoría' : categoryMap[catKey]?.name || catKey;
          const isExpanded = expandedCategories.has(categoryId);
          const productsInCat = groupedProducts[catKey];

          return (
            <div
              key={catKey}
              style={{
                border: '1px solid #ddd',
                borderRadius: '12px',
                padding: '1rem',
                backgroundColor: '#fafafa',
              }}
            >
              <button
                onClick={() => toggleCategory(categoryId)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                }}
              >
                <span>{categoryName}</span>
                <span style={{ fontSize: '0.9rem', color: '#666' }}>
                  {isExpanded ? '▼' : '▶'} {productsInCat.length} producto{productsInCat.length !== 1 ? 's' : ''}
                </span>
              </button>

              {isExpanded && (
                <div style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem' }}>
                  {productsInCat.map((product, index) => (
                    <div
                      key={product.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        border: '1px solid #eee',
                        gap: '1rem',
                        opacity: saving ? 0.6 : 1,
                        transition: 'opacity 0.2s',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{product.name}</div>
                        <div style={{ color: '#666', fontSize: '0.85rem' }}>
                          ${parseFloat(product.price).toFixed(2)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                        <button
                          onClick={() => moveProductUp(categoryId, index)}
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
                          onClick={() => moveProductDown(categoryId, index)}
                          disabled={index === productsInCat.length - 1 || saving}
                          style={{
                            padding: '0.4rem 0.6rem',
                            fontSize: '0.9rem',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            cursor:
                              index === productsInCat.length - 1 || saving ? 'not-allowed' : 'pointer',
                            opacity: index === productsInCat.length - 1 ? 0.4 : 1,
                            backgroundColor: '#fff',
                          }}
                          title="Mover hacia abajo"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}
