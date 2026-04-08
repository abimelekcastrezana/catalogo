"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditVendorForm({ vendor }) {
  const router = useRouter();
  const [name, setName] = useState(vendor.name || '');
  const [slug, setSlug] = useState(vendor.slug || '');
  const [whatsappPhone, setWhatsappPhone] = useState(vendor.whatsappPhone || '');
  const [logoFile, setLogoFile] = useState(null);
  const [slogan, setSlogan] = useState(vendor.slogan || '');
  const [tag1, setTag1] = useState(vendor.tag1 || '');
  const [tag2, setTag2] = useState(vendor.tag2 || '');
  const slugRegex = /^[A-Za-z0-9-]+$/;
  const initialEmail = vendor.userEmail || vendor.Users?.[0]?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [newPassword, setNewPassword] = useState('');
  const [isActive, setIsActive] = useState(vendor.isActive ?? true);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentTags = [tag1, tag2].filter(Boolean);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!slugRegex.test(slug)) {
      setMessage('El slug solo puede contener letras, números y guiones. No se permiten guiones bajos.');
      return;
    }
    setIsSubmitting(true);

    const response = await fetch(`/api/admin/vendors/${vendor.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug, whatsappPhone, slogan, tag1, tag2, isActive, email, newPassword }),
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || 'Error actualizando la tienda');
      setIsSubmitting(false);
      return;
    }

    if (logoFile) {
      const formData = new FormData();
      formData.append('logo', logoFile);
      const uploadRes = await fetch(`/api/admin/vendors/${vendor.id}/logo`, {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setMessage(uploadData.error || 'Tienda actualizada, pero no se pudo subir el logo');
        setIsSubmitting(false);
        return;
      }
    }

    setMessage('Tienda actualizada correctamente');
    setLogoFile(null);
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
      <input value={slogan} onChange={(e) => setSlogan(e.target.value)} placeholder="Slogan" />
      {currentTags.length > 0 ? (
        <p style={{ margin: 0, color: '#555', fontSize: '0.95rem' }}>
          Tags actuales: {currentTags.join(', ')}
        </p>
      ) : (
        <p style={{ margin: 0, color: '#777', fontSize: '0.95rem' }}>
          Sin tags actualmente.
        </p>
      )}
      <input value={tag1} onChange={(e) => setTag1(e.target.value)} placeholder="Tag opcional 1" />
      <input value={tag2} onChange={(e) => setTag2(e.target.value)} placeholder="Tag opcional 2" />
      <hr style={{ borderColor: '#eee' }} />
      <p style={{ margin: 0 }}><strong>Usuario del vendedor</strong></p>
      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email del vendedor" required />
      <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" placeholder="Nueva contraseña (opcional)" />
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        Activar tienda
      </label>
      <button type="submit" disabled={isSubmitting}>Guardar cambios</button>
      {message && <p>{message}</p>}
    </form>
  );
}
