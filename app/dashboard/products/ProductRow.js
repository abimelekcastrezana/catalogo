"use client";

import { useState } from "react";

export default function ProductRow({ product, vendorId, categories, apiBase = '/api/vendors' }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [name, setName] = useState(product.name);
  const [sku, setSku] = useState(product.sku);
  const [description, setDescription] = useState(product.description || "");
  const [catId, setCatId] = useState(product.categoryId || "");
  const [price, setPrice] = useState(product.price || "");
  const [message, setMessage] = useState("");
  const [imageFiles, setImageFiles] = useState([null, null]);

  const updateProduct = async () => {
    const res = await fetch(`${apiBase}/${vendorId}/products/${product.id}`, {
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
    const res = await fetch(`${apiBase}/${vendorId}/products/${product.id}`, { method: "DELETE" });
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

  const handlePrevImage = () => setCurrentImageIndex((currentImageIndex - 1 + imageUrls.length) % imageUrls.length);
  const handleNextImage = () => setCurrentImageIndex((currentImageIndex + 1) % imageUrls.length);

  return (
    <article className="card">
      <div className="card-hero">
        {imageUrls.length ? (
          <img
            src={imageUrls[currentImageIndex]}
            alt={product.name}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
            Sin imagen
          </div>
        )}
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(255,255,255,0.92)', padding: '0.35rem 0.75rem', borderRadius: '999px', fontSize: '0.78rem', color: 'var(--muted)', boxShadow: '0 8px 24px rgba(15,23,42,0.08)' }}>
          {categories.find((cat) => cat.id === product.categoryId)?.name ? `Categoría: ${categories.find((cat) => cat.id === product.categoryId).name}` : 'Sin categoría'}
        </div>

        {imageUrls.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '36px',
                height: '36px',
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.85)',
                background: 'rgba(15,23,42,0.6)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                boxShadow: '0 10px 24px rgba(15,23,42,0.18)',
              }}
              aria-label="Imagen anterior"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '36px',
                height: '36px',
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.85)',
                background: 'rgba(15,23,42,0.6)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                boxShadow: '0 10px 24px rgba(15,23,42,0.18)',
              }}
              aria-label="Siguiente imagen"
            >
              ›
            </button>
            <div style={{ position: 'absolute', bottom: '0.75rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.45rem', padding: '0 0.5rem' }}>
              {imageUrls.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentImageIndex(index)}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.9)',
                    background: currentImageIndex === index ? '#fff' : 'rgba(255,255,255,0.7)',
                    cursor: 'pointer',
                  }}
                  aria-label={`Imagen ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="card-body">
        {isEditing ? (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" />
            <input className="input" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SKU (opcional)" />
            <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción" />
            <select className="select" value={catId} onChange={(e) => setCatId(e.target.value)}>
              <option value="">Sin categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <input className="input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Precio" type="number" step="0.01" min="0" />
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <label className="form-field">
                <span>Reemplazar imagen 1</span>
                <input className="input" type="file" accept="image/*" onChange={(e) => setImageFiles([e.target.files[0], imageFiles[1]])} />
              </label>
              <label className="form-field">
                <span>Reemplazar imagen 2</span>
                <input className="input" type="file" accept="image/*" onChange={(e) => setImageFiles([imageFiles[0], e.target.files[0]])} />
              </label>
            </div>
            <div className="form-actions" style={{ justifyContent: 'flex-start', flexWrap: 'wrap' }}>
              <button type="button" onClick={updateProduct} className="primary-button">Guardar</button>
              <button type="button" onClick={() => setIsEditing(false)} className="secondary-button">Cancelar</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gap: '0.35rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', lineHeight: '1.2' }}>{product.name}</h3>
              <p style={{ margin: 0, color: 'var(--muted)', minHeight: '2.4rem' }}>{product.description || 'Sin descripción'}</p>
              <div style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>SKU: {product.sku}</div>
            </div>
            <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>${Number(product.price).toFixed(2)}</div>
            </div>
          </>
        )}
      </div>

      {!isEditing && (
        <div style={{ padding: '0 1.1rem 1.2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => setIsEditing(true)} className="secondary-button">Editar</button>
          <button type="button" onClick={deleteProduct} className="secondary-button" style={{ background: 'var(--danger)', color: '#fff', borderColor: 'transparent' }}>Eliminar</button>
        </div>
      )}

      {message && <p style={{ color: '#d00', padding: '0 1.1rem 1.2rem' }}>{message}</p>}
    </article>
  );
}
