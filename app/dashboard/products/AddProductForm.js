"use client";

import { useState } from "react";

export default function AddProductForm({ vendorId, categories, apiBase = '/api/vendors' }) {
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

      setMessage('Producto creado catoke y archivos subidos (si se adjuntaron).');
      setName('');
      setSku('');
      setPrice('');
      setDescription('');
      setCategoryId('');
      setImageFiles([null, null]);
      setIsSubmitting(false);
    } catch (err) {
      setMessage(err.message || 'Error creando producto');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-card" style={{ maxWidth: '520px' }}>
      <div className="form-field">
        <label>Nombre</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" required />
      </div>
      <div className="form-field">
        <label>SKU</label>
        <input className="input" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SKU (opcional)" />
      </div>
      <div className="form-field">
        <label>Precio</label>
        <input className="input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Precio" type="number" step="0.01" min="0" required />
      </div>
      <div className="form-field">
        <label>Descripción</label>
        <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción" />
      </div>
      <div className="form-field">
        <label>Categoría</label>
        <select className="select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Sin categoría</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <label>Imagen 1</label>
        <input className="input" type="file" accept="image/*" onChange={(e) => setImageFiles([e.target.files[0], imageFiles[1]])} />
      </div>
      <div className="form-field">
        <label>Imagen 2</label>
        <input className="input" type="file" accept="image/*" onChange={(e) => setImageFiles([imageFiles[0], e.target.files[0]])} />
      </div>
      <button type="submit" className="primary-button" disabled={isSubmitting}>
        {isSubmitting ? 'Creando...' : 'Crear producto'}
      </button>
      {message && <p className="text-small" style={{ margin: 0 }}>{message}</p>}
    </form>
  );
}
