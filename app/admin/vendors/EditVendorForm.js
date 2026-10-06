"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as F from '@/app/lib/form-styles';
import RegionSelect from '@/app/components/RegionSelect';

const COUNTRY_CODES = [
  { code: '+598', label: '+598 (Uruguay)' }, { code: '+57', label: '+57 (Colombia)' },
  { code: '+56', label: '+56 (Chile)' },     { code: '+55', label: '+55 (Brasil)' },
  { code: '+54', label: '+54 (Argentina)' }, { code: '+52', label: '+52 (México)' },
  { code: '+51', label: '+51 (Perú)' },      { code: '+44', label: '+44 (Reino Unido)' },
  { code: '+34', label: '+34 (España)' },    { code: '+1',  label: '+1 (EE.UU.)' },
];

const extractCountryCode = (value) => {
  if (!value) return '+52';
  const normalized = value.startsWith('+') ? value : `+${value}`;
  const match = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length).find((c) => normalized.startsWith(c.code));
  return match ? match.code : '+52';
};

const extractPhoneNumber = (value) => {
  if (!value) return '';
  const code = extractCountryCode(value);
  const normalized = value.startsWith('+') ? value : `+${value}`;
  return normalized.slice(code.length).replace(/\D/g, '');
};

export default function EditVendorForm({ vendor }) {
  const router = useRouter();
  const [name, setName] = useState(vendor.name || '');
  const [slug, setSlug] = useState(vendor.slug || '');
  const [countryCode, setCountryCode] = useState(extractCountryCode(vendor.whatsappPhone || ''));
  const [whatsappNumber, setWhatsappNumber] = useState(extractPhoneNumber(vendor.whatsappPhone || ''));
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(
    vendor.logoUrl ? (vendor.logoUrl.startsWith('/') ? `/api/uploads${vendor.logoUrl.replace(/^\/uploads\/?/, '/')}` : vendor.logoUrl) : null
  );
  const [slogan, setSlogan] = useState(vendor.slogan || '');
  const [tag1, setTag1] = useState(vendor.tag1 || '');
  const [tag2, setTag2] = useState(vendor.tag2 || '');
  const [state, setState] = useState(vendor.state || '');
  const [city, setCity] = useState(vendor.city || '');
  const [email, setEmail] = useState(vendor.userEmail || vendor.Users?.[0]?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [isActive, setIsActive] = useState(vendor.isActive ?? true);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogoChange = (e) => {
    const file = e.target.files[0] || null;
    setLogoFile(file);
    if (file) setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!/^[A-Za-z0-9-]+$/.test(slug)) { setMessage('El slug solo puede contener letras, números y guiones.'); return; }
    setIsSubmitting(true);

    const res = await fetch(`/api/admin/vendors/${vendor.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug, whatsappPhone: `${countryCode}${whatsappNumber.replace(/\D/g, '')}`, slogan, tag1, tag2, isActive, email, newPassword, state, city }),
    });
    const data = await res.json();
    if (!res.ok) { setMessage(data.error || 'Error actualizando la tienda'); setIsSubmitting(false); return; }

    if (logoFile) {
      const fd = new FormData();
      fd.append('logo', logoFile);
      const upRes = await fetch(`/api/admin/vendors/${vendor.id}/logo`, { method: 'POST', body: fd });
      const upData = await upRes.json();
      if (!upRes.ok) { setMessage(upData.error || 'Tienda guardada, pero el logo falló'); setIsSubmitting(false); return; }
    }

    setMessage('Tienda actualizada correctamente');
    setLogoFile(null);
    setIsSubmitting(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 max-w-lg">
      {/* Logo preview + upload */}
      <div className="flex items-center gap-4">
        {logoPreview && (
          <img src={logoPreview} alt="Logo" className="w-16 h-16 rounded-xl object-cover shadow-sm flex-shrink-0" />
        )}
        <div className={F.field + ' flex-1'}>
          <label className={F.label}>Logo de la tienda</label>
          <input className={F.input} type="file" accept="image/*" onChange={handleLogoChange} />
        </div>
      </div>

      {/* Tienda */}
      <div className={F.field}>
        <label className={F.label}>Nombre</label>
        <input className={F.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la tienda" required />
      </div>
      <div className={F.field}>
        <label className={F.label}>Slug</label>
        <input className={F.input} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="mi-tienda" required pattern="[A-Za-z0-9-]+" />
      </div>
      <div className={F.field}>
        <label className={F.label}>Slogan</label>
        <input className={F.input} value={slogan} onChange={(e) => setSlogan(e.target.value)} placeholder="Slogan de la tienda" />
      </div>

      {/* Región */}
      <RegionSelect
        state={state}
        city={city}
        onStateChange={setState}
        onCityChange={setCity}
      />

      {/* WhatsApp */}
      <div className="grid grid-cols-[160px_1fr] gap-3">
        <div className={F.field}>
          <label className={F.label}>País</label>
          <select className={F.select} value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
            {COUNTRY_CODES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
          </select>
        </div>
        <div className={F.field}>
          <label className={F.label}>WhatsApp</label>
          <input className={F.input} value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="6222334455" required />
        </div>
      </div>

      {/* Tags */}
      <div className="grid grid-cols-2 gap-3">
        <div className={F.field}>
          <label className={F.label}>Tag 1</label>
          <input className={F.input} value={tag1} onChange={(e) => setTag1(e.target.value)} placeholder="Ej. belleza" />
        </div>
        <div className={F.field}>
          <label className={F.label}>Tag 2</label>
          <input className={F.input} value={tag2} onChange={(e) => setTag2(e.target.value)} placeholder="Ej. uñas" />
        </div>
      </div>

      <hr className={F.divider} />
      <p className={F.sectionTitle}>Usuario del vendedor</p>

      <div className={F.field}>
        <label className={F.label}>Email</label>
        <input className={F.input} value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" required />
      </div>
      <div className={F.field}>
        <label className={F.label}>Nueva contraseña</label>
        <input className={F.input} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" placeholder="Dejar vacío para no cambiar" />
      </div>

      <label className="flex items-center gap-2 text-sm text-[var(--text)] cursor-pointer">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
        Tienda activa
      </label>

      <button type="submit" className="primary-button" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
      </button>
      {message && <p className={F.msg(message)}>{message}</p>}
    </form>
  );
}
