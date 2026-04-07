"use client";

import { useState } from "react";

export default function ProductRow({ product, vendorId, categories }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(product.name);
  const [sku, setSku] = useState(product.sku);
  const [description, setDescription] = useState(product.description || "");
  const [catId, setCatId] = useState(product.categoryId || "");
  const [price, setPrice] = useState(product.price || "");
  const [message, setMessage] = useState("");
  const [imageFiles, setImageFiles] = useState([null, null]);

  const updateProduct = async () => {
    const res = await fetch(`/api/vendors/${vendorId}/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, sku, description, categoryId: catId || null, isActive: product.isActive, price }),
    });
    let data = {};
    const text = await res.text();
    try {
      data = text ? JSON.parse(text) : {};
    } catch (error) {
      data = { error: text || 'Error actualizando producto' };
    }
    if (!res.ok) {
      setMessage(data.error || 'Error actualizando producto');
      return;
    }

    const uploadPromises = imageFiles
      .map((file, index) => ({ file, position: index + 1 }))
      .filter(({ file }) => file)
      .slice(0, 2)
      .map(async ({ file, position }) => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('replacePosition', String(position));
        const uploadRes = await fetch(`/api/products/${product.id}/images`, {
          method: 'POST',
          body: formData,
        });
        const text = await uploadRes.text();
        try {
          return text ? JSON.parse(text) : {};
        } catch (err) {
          return { error: text || 'Upload response not valid JSON' };
        }
      });

    const uploadResults = await Promise.all(uploadPromises);
    const uploadError = uploadResults.find((result) => result?.error);
    if (uploadError) {
      setMessage(uploadError.error || 'Producto actualizado, pero la imagen no se pudo subir');
      return;
    }

    setMessage('Producto actualizado y imagen(es) subidas.');
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

  const imageUrls = (product.ProductImages || [])
    .sort((a, b) => (a.position || 0) - (b.position || 0))
    .slice(0, 2)
    .map((img) => {
      const pathWithoutPrefix = img.path?.replace(/^\/uploads/, '') || '';
      return `/api/uploads${pathWithoutPrefix}`;
    });

  return (
    <div
      style={{
        marginBottom: '1rem',
        border: '1px solid #ccc',
        padding: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        {isEditing ? (
          <div>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" />
            <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SKU" />
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Precio" type="number" step="0.01" min="0" />
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción" />
            <select value={catId} onChange={(e) => setCatId(e.target.value)}>
              <option value="">Sin categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.5rem' }}>
              <label>
                Reemplazar imagen 1
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFiles([e.target.files[0], imageFiles[1]])}
                />
              </label>
              <label>
                Reemplazar imagen 2
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFiles([imageFiles[0], e.target.files[0]])}
                />
              </label>
            </div>
            <button onClick={updateProduct}>Guardar</button>
            <button onClick={() => setIsEditing(false)}>Cancelar</button>
          </div>
        ) : (
          <div>
            <strong>{product.name}</strong> (SKU: {product.sku}) - {product.description || 'Sin descripción'}
            <div>Categoría: {product.categoryId || 'N/A'}</div>
            <div>Precio: ${Number(product.price).toFixed(2)}</div>
            <button onClick={() => setIsEditing(true)}>Editar</button>
            <button onClick={deleteProduct}>Eliminar</button>
          </div>
        )}
        {message && <p>{message}</p>}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
        {imageUrls.length ? (
          imageUrls.map((url, index) => (
            <img
              key={url}
              src={url}
              alt={`Imagen ${index + 1}`}
              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          ))
        ) : (
          <div style={{ fontSize: '0.85rem', color: '#666' }}>Sin imágenes</div>
        )}
      </div>
    </div>
  );
}
