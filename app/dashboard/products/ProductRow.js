"use client";

import { useState } from "react";

export default function ProductRow({ product, vendorId, categories }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(product.name);
  const [sku, setSku] = useState(product.sku);
  const [description, setDescription] = useState(product.description || "");
  const [catId, setCatId] = useState(product.categoryId || "");
  const [message, setMessage] = useState("");

  const updateProduct = async () => {
    const res = await fetch(`/api/vendors/${vendorId}/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, sku, description, categoryId: catId || null, isActive: product.isActive }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Error actualizando producto");
      return;
    }
    setMessage("Producto actualizado");
    setIsEditing(false);
    window.location.reload();
  };

  const deleteProduct = async () => {
    if (!confirm("¿Eliminar producto?")) return;
    const res = await fetch(`/api/vendors/${vendorId}/products/${product.id}`, { method: "DELETE" });
    if (!res.ok) {
      setMessage((await res.json()).error || "Error al eliminar");
      return;
    }
    setMessage("Producto eliminado");
    window.location.reload();
  };

  return (
    <div style={{ marginBottom: "1rem", border: "1px solid #ccc", padding: "0.5rem" }}>
      {isEditing ? (
        <div>
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <input value={sku} onChange={(e) => setSku(e.target.value)} />
          <input value={description} onChange={(e) => setDescription(e.target.value)} />
          <select value={catId} onChange={(e) => setCatId(e.target.value)}>
            <option value="">Sin categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <button onClick={updateProduct}>Guardar</button>
          <button onClick={() => setIsEditing(false)}>Cancelar</button>
        </div>
      ) : (
        <div>
          <strong>{product.name}</strong> (SKU: {product.sku}) - {product.description || 'Sin descripción'}
          <div>Categoría: {product.categoryId || 'N/A'}</div>
          <button onClick={() => setIsEditing(true)}>Editar</button>
          <button onClick={deleteProduct}>Eliminar</button>
        </div>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}
