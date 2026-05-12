'use client';

import { useState } from 'react';

export default function LogoUploadForm({ vendor, onSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [logoUrl, setLogoUrl] = useState(vendor.logoUrl);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await fetch(`/api/vendors/${vendor.id}/logo`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || 'Error al subir el logo');
        return;
      }

      setLogoUrl(data.vendor.logoUrl);
      setMessage('Logo actualizado exitosamente');
      if (onSuccess) onSuccess(data.vendor);
    } catch (error) {
      console.error('Logo upload error:', error);
      setMessage('Error al subir el logo');
    } finally {
      setUploading(false);
    }
  };

  const displayLogoUrl = logoUrl?.startsWith('/') ? `/api/uploads${logoUrl.replace(/^\/uploads\/?/, '/')}` : logoUrl;

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Logo de tu tienda</h2>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {displayLogoUrl && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img
              src={displayLogoUrl}
              alt="Logo actual"
              style={{
                width: '100px',
                height: '100px',
                objectFit: 'cover',
                borderRadius: '10px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            />
          </div>
        )}
        <div className="form-field">
          <label htmlFor="logo-input">Subir nuevo logo</label>
          <input
            id="logo-input"
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            disabled={uploading}
            className="input"
            style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}
          />
          <p style={{ fontSize: '0.85rem', color: '#666', margin: '0.5rem 0 0 0' }}>
            Formatos: JPG, PNG, GIF, WebP. Tamaño máximo: 5MB
          </p>
        </div>
        {message && (
          <p className="text-small" style={{ margin: 0, color: message.includes('exitosamente') ? '#2ecc71' : '#e74c3c' }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
