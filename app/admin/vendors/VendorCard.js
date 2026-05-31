"use client";

import { useState } from 'react';

export default function VendorCard({ vendor }) {
  const [isActive, setIsActive] = useState(vendor.isActive);
  const [isOnline, setIsOnline] = useState(vendor.isOnline ?? true);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const updateVendor = async (patch) => {
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
          isActive,
          isOnline,
          ...patch,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error actualizando');
      setIsActive(data.vendor.isActive);
      setIsOnline(data.vendor.isOnline ?? true);
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
      const response = await fetch(`/api/admin/vendors/${vendor.id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error eliminando la tienda');
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
    <article className="card overflow-hidden">
      {/* Hero */}
      <div className="card-hero relative">
        {logoPath ? (
          <img src={logoPath} alt={`${vendor.name} logo`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--muted)] text-sm">
            Sin logo
          </div>
        )}

        {/* isOnline: lado izquierdo */}
        <button
          type="button"
          onClick={() => updateVendor({ isOnline: !isOnline })}
          disabled={loading}
          title={isOnline ? 'En línea' : 'Ausente'}
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold border-none cursor-pointer transition-colors ${
            isOnline
              ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400'
          }`}
        >
          {isOnline ? 'En línea' : 'Ausente'}
        </button>

        {/* isActive: lado derecho */}
        <button
          type="button"
          onClick={() => updateVendor({ isActive: !isActive })}
          disabled={loading}
          className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold border-none cursor-pointer transition-colors ${
            isActive
              ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
              : 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
          }`}
        >
          {isActive ? 'Activa' : 'Inactiva'}
        </button>
      </div>

      {/* Body */}
      <div className="card-body">
        <div className="space-y-0.5">
          <h3 className="text-base font-semibold m-0">{vendor.name}</h3>
          <span className="text-[var(--muted)] text-sm">/{vendor.slug}</span>
        </div>
        <div className="space-y-0.5 text-sm text-[var(--muted)]">
          <p className="m-0">WhatsApp: {vendor.whatsappPhone}</p>
          <p className="m-0">Email: {userEmail}</p>
          {(vendor.tag1 || vendor.tag2) && (
            <p className="m-0">Tags: {[vendor.tag1, vendor.tag2].filter(Boolean).join(', ')}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2 flex-wrap">
        <a
          href={`/admin/vendors/${vendor.id}`}
          className="secondary-button text-sm py-2 px-3"
        >
          Editar ›
        </a>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="text-sm py-2 px-3 rounded-full border-none bg-[var(--danger)] text-white cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Eliminar
        </button>
      </div>

      {message && (
        <p className="px-4 pb-3 text-sm m-0 text-red-500">{message}</p>
      )}
    </article>
  );
}
