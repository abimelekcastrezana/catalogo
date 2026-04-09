"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const COUNTRY_CODES = [
  { code: '+598', label: '+598 (Uruguay)' },
  { code: '+57',  label: '+57 (Colombia)' },
  { code: '+56',  label: '+56 (Chile)' },
  { code: '+55',  label: '+55 (Brasil)' },
  { code: '+54',  label: '+54 (Argentina)' },
  { code: '+52',  label: '+52 (México)' },
  { code: '+51',  label: '+51 (Perú)' },
  { code: '+44',  label: '+44 (Reino Unido)' },
  { code: '+34',  label: '+34 (España)' },
  { code: '+1',   label: '+1 (EE.UU.)' },
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

  const slugRegex = /^[A-Za-z0-9-]+$/;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!slugRegex.test(slug)) {
      setMessage('El slug solo puede contener letras, números y guiones. No se permiten guiones bajos.');
      return;
    }
    setIsSubmitting(true);
    const fullWhatsappPhone = `${countryCode}${whatsappNumber.replace(/\D/g, '')}`;
    const response = await fetch('/api/admin/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug, whatsappPhone: fullWhatsappPhone, slogan, tag1, tag2, email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || 'Error al crear la tienda');
      setIsSubmitting(false);
      return;
    }

    const vendorId = data.vendor?.id;
    if (vendorId && logoFile) {
      const formData = new FormData();
      formData.append('logo', logoFile);
      const uploadRes = await fetch(`/api/admin/vendors/${vendorId}/logo`, {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setMessage(uploadData.error || 'Tienda creada, pero no se pudo subir el logo');
        setIsSubmitting(false);
        return;
      }
    }

    setMessage('Tienda y usuario creados correctamente');
    setName('');
    setSlug('');
    setCountryCode('+52');
    setWhatsappNumber('');
    setLogoFile(null);
    setSlogan('');
    setEmail('');
    setPassword('');
    setTag1('');
    setTag2('');
    setIsSubmitting(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="form-card" style={{ maxWidth: '520px' }}>
      <div className="form-field">
        <label>Nombre de la tienda</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la tienda" required />
      </div>
      <div className="form-field">
        <label>Slug</label>
        <input className="input" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug" required pattern="[A-Za-z0-9-]+" title="Solo letras, números y guiones" />
      </div>
      <div className="form-field">
        <label>Código de país</label>
        <select className="select" value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
          {COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <label>Número de WhatsApp (sin código de país)</label>
        <input
          className="input"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          placeholder="Ej. 6222334455"
          required
        />
      </div>
      <div className="form-field">
        <label>Logo de la tienda (opcional)</label>
        <input className="input" type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0] || null)} />
      </div>
      <div className="form-field">
        <label>Tag 1 (opcional)</label>
        <input className="input" value={tag1} onChange={(e) => setTag1(e.target.value)} placeholder="Tag opcional 1" />
      </div>
      <div className="form-field">
        <label>Tag 2 (opcional)</label>
        <input className="input" value={tag2} onChange={(e) => setTag2(e.target.value)} placeholder="Tag opcional 2" />
      </div>
      <div className="form-field">
        <label>Slogan (opcional)</label>
        <input className="input" value={slogan} onChange={(e) => setSlogan(e.target.value)} placeholder="Slogan" />
      </div>
      <hr style={{ borderColor: 'var(--border)' }} />
      <p style={{ margin: 0 }}><strong>Usuario del vendedor</strong></p>
      <div className="form-field">
        <label>Email</label>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email del vendedor" required />
      </div>
      <div className="form-field">
        <label>Contraseña</label>
        <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Contraseña" required />
      </div>
      <button type="submit" className="primary-button" disabled={isSubmitting}>{isSubmitting ? 'Creando...' : 'Crear tienda y usuario'}</button>
      {message && <p className="text-small" style={{ margin: 0 }}>{message}</p>}
    </form>
  );
}
