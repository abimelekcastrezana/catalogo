"use client";

import { useState } from 'react';

export default function VendorCard({ vendor }) {
  const [isActive, setIsActive] = useState(vendor.isActive);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/admin/vendors/${vendor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: vendor.name,
          slug: vendor.slug,
          whatsappPhone: vendor.whatsappPhone,
          slogan: vendor.slogan,
          isActive: !isActive,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error actualizando el estado');
      }

      setIsActive(data.vendor.isActive);
      setMessage(data.vendor.isActive ? 'Activa' : 'Inactiva');
    } catch (error) {
      setMessage(error.message || 'Error al cambiar el estado');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (loading) return;
    const confirmed = window.confirm(`Eliminar tienda ${vendor.name} y todos sus datos?`);
    if (!confirmed) return;
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/admin/vendors/${vendor.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error eliminando la tienda');
      }
      window.location.reload();
    } catch (error) {
      setMessage(error.message || 'Error al eliminar la tienda');
      setLoading(false);
    }
  };

  const userEmail = vendor.Users?.[0]?.email || vendor.userEmail || 'Sin usuario';

  const logoPath = vendor.logoUrl
    ? vendor.logoUrl.startsWith('/')
      ? `/api/uploads${vendor.logoUrl.replace(/^\/uploads\/?/, '/')}`
      : vendor.logoUrl
    : null;

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '0.85rem', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'grid', gap: '0.4rem' }}>
      {logoPath && (
        <img src={logoPath} alt={`${vendor.name} logo`} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #eee' }} />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div>
          <strong style={{ display: 'block', fontSize: '1rem' }}>{vendor.name}</strong>
          <span style={{ color: '#555', fontSize: '0.85rem' }}>/{vendor.slug}</span>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          disabled={loading}
          style={{
            color: isActive ? '#1f7a1f' : '#b22222',
            fontSize: '0.82rem',
            fontWeight: 600,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0,
          }}
        >
          {isActive ? 'Activa' : 'Inactiva'}
        </button>
      </div>
      <div style={{ color: '#555', fontSize: '0.85rem' }}>WhatsApp: {vendor.whatsappPhone}</div>
      <div style={{ color: '#555', fontSize: '0.85rem' }}>Email: {userEmail}</div>
      {(vendor.tag1 || vendor.tag2) && (
        <div style={{ color: '#555', fontSize: '0.85rem' }}>
          Tags: {[vendor.tag1, vendor.tag2].filter(Boolean).join(', ')}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
        <a href={`/admin/vendors/${vendor.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', border: '1px solid #ccc', borderRadius: '999px', fontSize: '0.9rem', textDecoration: 'none', color: '#0645ad' }}>
          Editar <span style={{ fontSize: '1.1rem' }}>›</span>
        </a>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          style={{
            padding: '0.35rem 0.75rem',
            border: '1px solid #d32f2f',
            borderRadius: '999px',
            background: '#fff',
            color: '#d32f2f',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          Eliminar
        </button>
      </div>
      {message && <div style={{ color: isActive ? '#1f7a1f' : '#b22222', fontSize: '0.85rem' }}>{message}</div>}
    </div>
  );
}
