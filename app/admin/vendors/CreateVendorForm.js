"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as F from '@/app/lib/form-styles';

const COUNTRY_CODES = [
  { code: '+598', label: '+598 (Uruguay)' }, { code: '+57', label: '+57 (Colombia)' },
  { code: '+56', label: '+56 (Chile)' },     { code: '+55', label: '+55 (Brasil)' },
  { code: '+54', label: '+54 (Argentina)' }, { code: '+52', label: '+52 (México)' },
  { code: '+51', label: '+51 (Perú)' },      { code: '+44', label: '+44 (Reino Unido)' },
  { code: '+34', label: '+34 (España)' },    { code: '+1',  label: '+1 (EE.UU.)' },
];

export default function CreateVendorForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [countryCode, setCountryCode] = useState('+52');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [slogan, setSlogan] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tag1, setTag1] = useState('');
  const [tag2, setTag2] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!/^[A-Za-z0-9-]+$/.test(slug)) { setMessage('El slug solo puede contener letras, números y guiones.'); return; }
    setIsSubmitting(true);

    const res = await fetch('/api/admin/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug, whatsappPhone: `${countryCode}${whatsappNumber.replace(/\D/g, '')}`, slogan, tag1, tag2, email, password }),
    });
    const data = await res.json();
    if (!res.ok) { setMessage(data.error || 'Error al crear la tienda'); setIsSubmitting(false); return; }

    if (logoFile && data.vendor?.id) {
      const fd = new FormData();
      fd.append('logo', logoFile);
      const upRes = await fetch(`/api/admin/vendors/${data.vendor.id}/logo`, { method: 'POST', body: fd });
      const upData = await upRes.json();
      if (!upRes.ok) { setMessage(upData.error || 'Tienda creada, pero el logo falló'); setIsSubmitting(false); return; }
    }

    setMessage('Tienda y usuario creados correctamente');
    setName(''); setSlug(''); setCountryCode('+52'); setWhatsappNumber('');
    setLogoFile(null); setSlogan(''); setEmail(''); setPassword(''); setTag1(''); setTag2('');
    setIsSubmitting(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 max-w-lg">
      <div className={F.field}>
        <label className={F.label}>Nombre de la tienda</label>
        <input className={F.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Mi Tienda" required />
      </div>
      <div className={F.field}>
        <label className={F.label}>Slug</label>
        <input className={F.input} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="mi-tienda" required pattern="[A-Za-z0-9-]+" />
      </div>
      <div className={F.field}>
        <label className={F.label}>Slogan</label>
        <input className={F.input} value={slogan} onChange={(e) => setSlogan(e.target.value)} placeholder="Slogan de la tienda" />
      </div>

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

      <div className={F.field}>
        <label className={F.label}>Logo (opcional)</label>
        <input className={F.input} type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0] || null)} />
      </div>

      <hr className={F.divider} />
      <p className={F.sectionTitle}>Usuario del vendedor</p>

      <div className={F.field}>
        <label className={F.label}>Email</label>
        <input className={F.input} value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="vendedor@email.com" required />
      </div>
      <div className={F.field}>
        <label className={F.label}>Contraseña</label>
        <input className={F.input} value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Contraseña" required />
      </div>

      <button type="submit" className="primary-button" disabled={isSubmitting}>
        {isSubmitting ? 'Creando...' : 'Crear tienda y usuario'}
      </button>
      {message && <p className={F.msg(message)}>{message}</p>}
    </form>
  );
}
