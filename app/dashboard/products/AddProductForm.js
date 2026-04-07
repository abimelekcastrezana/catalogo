"use client";

import { useState } from "react";

export default function AddProductForm({ vendorId, categories }) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageFiles, setImageFiles] = useState([null, null]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setMessage('Creando producto...');

    try {
      const res = await fetch(`/api/vendors/${vendorId}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, sku, description, categoryId: categoryId || null }),
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
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.5rem", maxWidth: "420px" }}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" required />
      <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SKU" required />
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción" />

      <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
        <option value="">Sin categoría</option>
        {categories?.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>

      <div>
        <label>Imagen 1</label>
        <input type="file" accept="image/*" onChange={(e) => setImageFiles([e.target.files[0], imageFiles[1]])} />
      </div>
      <div>
        <label>Imagen 2</label>
        <input type="file" accept="image/*" onChange={(e) => setImageFiles([imageFiles[0], e.target.files[0]])} />
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creando...' : 'Crear producto'}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
