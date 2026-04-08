"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateVendorForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
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
    const response = await fetch('/api/admin/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug, whatsappPhone, slogan, tag1, tag2, email, password }),
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
    setWhatsappPhone('');
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
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem', maxWidth: '520px' }}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la tienda" required />
      <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug" required pattern="[A-Za-z0-9-]+" title="Solo letras, números y guiones" />
      <input value={whatsappPhone} onChange={(e) => setWhatsappPhone(e.target.value)} placeholder="WhatsApp" required />
      <label style={{ display: 'grid', gap: '0.25rem', fontSize: '0.95rem' }}>
        Logo de la tienda (opcional)
        <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0] || null)} />
      </label>
      <input value={tag1} onChange={(e) => setTag1(e.target.value)} placeholder="Tag opcional 1" />
      <input value={tag2} onChange={(e) => setTag2(e.target.value)} placeholder="Tag opcional 2" />
      <input value={slogan} onChange={(e) => setSlogan(e.target.value)} placeholder="Slogan (opcional)" />
      <hr style={{ borderColor: '#eee' }} />
      <p style={{ margin: '0' }}><strong>Usuario del vendedor</strong></p>
      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email del vendedor" required />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Contraseña" required />
      <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creando...' : 'Crear tienda y usuario'}</button>
      {message && <p>{message}</p>}
    </form>
  );
}
