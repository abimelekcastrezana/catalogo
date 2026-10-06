"use client";

import { useState } from 'react';
import { ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

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
          <img src={logoPath} alt={`${vendor.name} logo`} width={400} height={200} loading="lazy" decoding="async" className="img-outline w-full h-full object-cover" />
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
          className={`hit absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold border-none cursor-pointer transition-colors duration-150 disabled:opacity-50 ${
            isOnline ? 'bg-[var(--success-soft)] text-[var(--success)]' : 'bg-[var(--highlight-soft)] text-[var(--text)]'
          }`}
        >
          {isOnline ? 'En línea' : 'Ausente'}
        </button>

        {/* isActive: lado derecho */}
        <button
          type="button"
          onClick={() => updateVendor({ isActive: !isActive })}
          disabled={loading}
          className={`hit absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold border-none cursor-pointer transition-colors duration-150 disabled:opacity-50 ${
            isActive ? 'bg-[var(--success-soft)] text-[var(--success)]' : 'bg-[var(--danger-soft)] text-[var(--danger)]'
          }`}
        >
          {isActive ? 'Activa' : 'Inactiva'}
        </button>
      </div>

      {/* Body */}
      <div className="card-body">
        <div className="space-y-0.5">
          <h3 className="text-base font-extrabold m-0">{vendor.name}</h3>
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
        <Button asChild variant="outline" size="sm">
          <a href={`/admin/vendors/${vendor.id}`}>
            Editar <ChevronRight aria-hidden="true" />
          </a>
        </Button>
        <Button
          type="button"
          variant="dangerOutline"
          size="sm"
          onClick={handleDelete}
          disabled={loading}
        >
          <Trash2 aria-hidden="true" /> Eliminar
        </Button>
      </div>

      {message && (
        <p className="px-4 pb-3 text-sm m-0 text-[var(--danger)]">{message}</p>
      )}
    </article>
  );
}
