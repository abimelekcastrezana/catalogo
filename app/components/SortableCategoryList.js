'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SortableList from './SortableList';

export default function SortableCategoryList({ categories, reorderEndpoint, deleteEndpoint, editEndpoint }) {
  const router = useRouter();
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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

  const openEdit = (category) => {
    setEditing(category);
    setName(category.name);
    setSlug(category.slug);
    setError('');
  };

  const closeEdit = () => setEditing(null);

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const res = await fetch(`${editEndpoint}/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || 'Error al editar');
      return;
    }
    setEditing(null);
    router.refresh();
  };

  return (
    <>
      <SortableList
        items={categories}
        renderItem={(category) => (
          <div>
            <p className="font-semibold text-sm text-[var(--text)] m-0">{category.name}</p>
            <p className="text-xs text-[var(--muted)] m-0">/{category.slug}</p>
          </div>
        )}
        onReorder={handleReorder}
        onEdit={editEndpoint ? openEdit : undefined}
        onDelete={deleteEndpoint ? handleDelete : undefined}
      />

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeEdit}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSaveEdit}
            className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 grid gap-4"
          >
            <h3 className="font-semibold text-[var(--text)] m-0">Editar categoría</h3>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-[var(--text)]">Nombre</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-[var(--text)]">Slug</label>
              <input className="input" value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-red-500 m-0">{error}</p>}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={closeEdit} className="secondary-button text-sm py-2 px-4">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="primary-button text-sm py-2 px-4">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
