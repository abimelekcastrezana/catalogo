"use client";

import { useState } from "react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/app/components/ui/sheet";
import { Card, CardContent, CardFooter } from "@/app/components/ui/card";

function EditForm({ product, vendorId, categories, apiBase, onSuccess, onCancel }) {
  const [name, setName] = useState(product.name);
  const [sku, setSku] = useState(product.sku || '');
  const [description, setDescription] = useState(product.description || '');
  const [catId, setCatId] = useState(product.categoryId || '');
  const [price, setPrice] = useState(product.price || '');
  const [imageFiles, setImageFiles] = useState([null, null]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    setSubmitting(true);
    const res = await fetch(`${apiBase}/${vendorId}/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, sku, description, categoryId: catId || null, isActive: product.isActive, price }),
    });
    let data = {};
    try { data = JSON.parse(await res.text()); } catch {}
    if (!res.ok) { setMessage(data.error || 'Error actualizando'); setSubmitting(false); return; }

    await Promise.all(
      imageFiles.map((file, i) => ({ file, position: i + 1 }))
        .filter(({ file }) => file)
        .map(async ({ file, position }) => {
          const fd = new FormData();
          fd.append('image', file);
          fd.append('replacePosition', String(position));
          return fetch(`/api/products/${product.id}/images`, { method: 'POST', body: fd });
        })
    );

    setSubmitting(false);
    onSuccess();
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-1.5">
        <label className="text-sm font-medium text-[var(--text)]">Nombre</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" />
      </div>
      <div className="grid gap-1.5">
        <label className="text-sm font-medium text-[var(--text)]">Precio</label>
        <input className="input" value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" min="0" />
      </div>
      <div className="grid gap-1.5">
        <label className="text-sm font-medium text-[var(--text)]">Descripción</label>
        <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción" />
      </div>
      <div className="grid gap-1.5">
        <label className="text-sm font-medium text-[var(--text)]">Categoría</label>
        <select className="select" value={catId} onChange={(e) => setCatId(e.target.value)}>
          <option value="">Sin categoría</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <label className="text-xs font-medium text-[var(--muted)]">Reemplazar imagen 1</label>
          <input className="input text-xs" type="file" accept="image/*" onChange={(e) => setImageFiles([e.target.files[0], imageFiles[1]])} />
        </div>
        <div className="grid gap-1.5">
          <label className="text-xs font-medium text-[var(--muted)]">Reemplazar imagen 2</label>
          <input className="input text-xs" type="file" accept="image/*" onChange={(e) => setImageFiles([imageFiles[0], e.target.files[0]])} />
        </div>
      </div>
      {message && <p className="text-sm text-red-500">{message}</p>}
      <div className="flex gap-2 pt-2">
        <Button onClick={handleSave} disabled={submitting} className="flex-1">
          {submitting ? 'Guardando...' : 'Guardar cambios'}
        </Button>
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
      </div>
    </div>
  );
}

export default function ProductRow({ product, vendorId, categories, apiBase = '/api/vendors' }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isActive, setIsActive] = useState(product.isActive ?? true);
  const [toggling, setToggling] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  const deleteProduct = async () => {
    if (!confirm('¿Eliminar producto?')) return;
    const res = await fetch(`${apiBase}/${vendorId}/products/${product.id}`, { method: 'DELETE' });
    if (!res.ok) { setMessage((await res.json()).error || 'Error al eliminar'); return; }
    window.location.reload();
  };

  const toggleActive = async () => {
    if (toggling) return;
    setToggling(true);
    const res = await fetch(`${apiBase}/${vendorId}/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: product.name,
        sku: product.sku || null,
        description: product.description || '',
        categoryId: product.categoryId || null,
        price: product.price,
        isActive: !isActive,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setIsActive(data.product.isActive);
    } else {
      setMessage('Error al cambiar estado');
    }
    setToggling(false);
  };

  const duplicateProduct = async () => {
    if (duplicating) return;
    setDuplicating(true);
    const res = await fetch(`${apiBase}/${vendorId}/products/${product.id}/duplicate`, { method: 'POST' });
    if (res.ok) {
      window.location.reload();
    } else {
      const data = await res.json();
      setMessage(data.error || 'Error al duplicar');
    }
    setDuplicating(false);
  };

  const imageUrls = (product.ProductImages || [])
    .sort((a, b) => (a.position || 0) - (b.position || 0))
    .slice(0, 2)
    .map((img) => `/api/uploads${(img.path || '').replace(/^\/uploads/, '')}`);

  const categoryName = categories.find((c) => c.id === product.categoryId)?.name;

  return (
    <>
      <Card className="overflow-hidden border-[var(--border)] bg-[var(--card)] shadow-card flex flex-col">
        {/* Image */}
        <div className="relative w-full h-48 bg-[var(--surface-strong)] flex items-center justify-center overflow-hidden">
          {imageUrls.length ? (
            <img src={imageUrls[currentImageIndex]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[var(--muted)] text-sm">Sin imagen</span>
          )}
          <Badge variant="secondary" className="absolute top-3 left-3 bg-white/90 text-[var(--muted)] text-xs shadow-sm">
            {categoryName || 'Sin categoría'}
          </Badge>
          {/* Toggle isActive */}
          <button
            type="button"
            onClick={toggleActive}
            disabled={toggling}
            title={isActive ? 'Deshabilitar producto' : 'Habilitar producto'}
            className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 border-white/80 cursor-pointer transition-colors disabled:opacity-50 ${
              isActive ? 'bg-green-500' : 'bg-yellow-400'
            }`}
          />
          {imageUrls.length > 1 && (
            <>
              <button type="button" onClick={() => setCurrentImageIndex((currentImageIndex - 1 + imageUrls.length) % imageUrls.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-white/80 bg-black/60 text-white flex items-center justify-center z-10">‹</button>
              <button type="button" onClick={() => setCurrentImageIndex((currentImageIndex + 1) % imageUrls.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-white/80 bg-black/60 text-white flex items-center justify-center z-10">›</button>
            </>
          )}
        </div>

        {/* Info */}
        <CardContent className="p-4 flex-1 space-y-1">
          <h3 className="font-semibold text-base leading-tight text-[var(--text)]">{product.name}</h3>
          <p className="text-[var(--muted)] text-sm line-clamp-2">{product.description || 'Sin descripción'}</p>
          <p className="font-bold text-lg text-[var(--text)] pt-1">${Number(product.price).toFixed(2)}</p>
        </CardContent>

        {/* Actions */}
        <CardFooter className="p-4 pt-0 flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditOpen(true)}>
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={duplicateProduct}
            disabled={duplicating}
            title="Duplicar producto"
            className="px-3"
          >
            {duplicating ? '...' : '⧉'}
          </Button>
          <Button
            size="sm"
            className="bg-[var(--danger)] hover:opacity-90 text-white border-none flex-1"
            onClick={deleteProduct}
          >
            Eliminar
          </Button>
        </CardFooter>

        {message && <p className="text-sm text-red-500 px-4 pb-3">{message}</p>}
      </Card>

      {/* Sheet de edición */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[520px] overflow-y-auto bg-[var(--bg)] text-[var(--text)]">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl text-[var(--text)]">Editar: {product.name}</SheetTitle>
          </SheetHeader>
          <EditForm
            product={product}
            vendorId={vendorId}
            categories={categories}
            apiBase={apiBase}
            onSuccess={() => { setEditOpen(false); window.location.reload(); }}
            onCancel={() => setEditOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
