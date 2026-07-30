'use client';

import { useRouter } from 'next/navigation';
import SortableList from './SortableList';

export default function SortableCategoryList({ categories, reorderEndpoint, deleteEndpoint }) {
  const router = useRouter();

  const handleReorder = async (ids) => {
    const res = await fetch(reorderEndpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(`Error al reordenar: ${err.error}`);
      return;
    }
    router.refresh();
  };

  const handleDelete = async (category) => {
    const res = await fetch(`${deleteEndpoint}/${category.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      alert(`Error al eliminar: ${err.error}`);
      throw new Error(err.error);
    }
    router.refresh();
  };

  return (
    <SortableList
      items={categories}
      renderItem={(category) => (
        <div>
          <p className="font-semibold text-sm text-[var(--text)] m-0">{category.name}</p>
          <p className="text-xs text-[var(--muted)] m-0">/{category.slug}</p>
        </div>
      )}
      onReorder={handleReorder}
      onDelete={deleteEndpoint ? handleDelete : undefined}
    />
  );
}
