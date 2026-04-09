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
    <article className="card">
      <div className="card-hero">
        {logoPath ? (
          <img src={logoPath} alt={`${vendor.name} logo`} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '0.9rem' }}>
            Sin logo
          </div>
        )}
        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
          <button
            type="button"
            onClick={handleToggle}
            disabled={loading}
            style={{
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
              color: isActive ? '#15803d' : '#dc2626',
            }}
          >
            {isActive ? 'Activa' : 'Inactiva'}
          </button>
        </div>
      </div>

      <div className="card-body">
        <div style={{ display: 'grid', gap: '0.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{vendor.name}</h3>
          <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>/{vendor.slug}</span>
        </div>
        <div style={{ display: 'grid', gap: '0.2rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
          <span>WhatsApp: {vendor.whatsappPhone}</span>
          <span>Email: {userEmail}</span>
          {(vendor.tag1 || vendor.tag2) && (
            <span>Tags: {[vendor.tag1, vendor.tag2].filter(Boolean).join(', ')}</span>
          )}
        </div>
      </div>

      <div style={{ padding: '0 1.1rem 1.2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <a href={`/admin/vendors/${vendor.id}`} className="secondary-button" style={{ fontSize: '0.88rem', padding: '0.5rem 0.85rem' }}>
          Editar ›
        </a>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="secondary-button"
          style={{ fontSize: '0.88rem', padding: '0.5rem 0.85rem', background: 'var(--danger)', color: '#fff', borderColor: 'transparent' }}
        >
          Eliminar
        </button>
      </div>

      {message && <p style={{ margin: '0 1.1rem 1rem', fontSize: '0.85rem', color: isActive ? '#15803d' : '#dc2626' }}>{message}</p>}
    </article>
  );
}
