"use client";

import { useState } from "react";

export default function AddProductForm({ vendorId, categories, apiBase = '/api/vendors', onSuccess }) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [imageFiles, setImageFiles] = useState([null, null]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setMessage('Creando producto...');

    try {
const res = await fetch(`${apiBase}/${vendorId}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, sku, description, categoryId: categoryId || null, price }),
      });

      let data;
      try {
        data = await res.json();
      } catch (err) {
        const text = await res.text();
        setMessage(`Error del servidor: ${text || err.message}`);
        setIsSubmitting(false);
        return;
      }

      if (!res.ok) {
        setMessage(data.error || "Error creando producto");
        setIsSubmitting(false);
        return;
      }

      const product = data.product;
      if (!product || !product.id) {
        setMessage("Producto creado, pero no se retornó id");
        setIsSubmitting(false);
        return;
      }

      // Upload images if provided
      const uploadPromises = imageFiles
        .filter((f) => f)
        .slice(0, 2)
        .map(async (file) => {
          const formData = new FormData();
          formData.append('image', file);
          const uploadRes = await fetch(`/api/products/${product.id}/images`, {
            method: 'POST',
            body: formData,
          });
          return uploadRes.json();
        });

      await Promise.all(uploadPromises);

      setName('');
      setSku('');
      setPrice('');
      setDescription('');
      setCategoryId('');
      setImageFiles([null, null]);
      setIsSubmitting(false);
      if (onSuccess) { onSuccess(); } else { setMessage('Producto creado.'); }
    } catch (err) {
      setMessage(err.message || 'Error creando producto');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 max-w-lg">
      <div className="grid gap-1.5">
        <label className="text-sm font-medium text-[var(--text)]">Nombre</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del producto" required />
      </div>
      <div className="grid gap-1.5">
        <label className="text-sm font-medium text-[var(--text)]">Precio</label>
        <input className="input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" type="number" step="0.01" min="0" required />
      </div>
      <div className="grid gap-1.5">
        <label className="text-sm font-medium text-[var(--text)]">Descripción</label>
        <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción del producto" />
      </div>
      <div className="grid gap-1.5">
        <label className="text-sm font-medium text-[var(--text)]">Categoría</label>
        <select className="select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Sin categoría</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-[var(--text)]">Imagen 1</label>
          <input className="input" type="file" accept="image/*" onChange={(e) => setImageFiles([e.target.files[0], imageFiles[1]])} />
        </div>
        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-[var(--text)]">Imagen 2</label>
          <input className="input" type="file" accept="image/*" onChange={(e) => setImageFiles([imageFiles[0], e.target.files[0]])} />
        </div>
      </div>
      <button type="submit" className="primary-button" disabled={isSubmitting}>
        {isSubmitting ? 'Creando...' : 'Crear producto'}
      </button>
      {message && (
        <p className={`text-sm ${message.includes('Error') ? 'text-red-500' : 'text-[var(--muted)]'}`}>{message}</p>
      )}
    </form>
  );
}
