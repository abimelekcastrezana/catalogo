'use client';

import { useRouter } from 'next/navigation';
import SortableList from './SortableList';

export default function SortableProductList({ products, reorderEndpoint }) {
  const router = useRouter();

  const handleReorder = async (ids) => {
    try {
      const response = await fetch(reorderEndpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
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
    }
  };

  return (
    <SortableList
      items={products}
      renderItem={(product) => (
        <div>
          <strong>{product.name}</strong>
          <div style={{ color: '#555', fontSize: '0.9rem' }}>
            ${product.price ? parseFloat(product.price).toFixed(2) : '0.00'}
            {product.Category && ` · ${product.Category.name}`}
          </div>
        </div>
      )}
      onReorder={handleReorder}
    />
  );
}
