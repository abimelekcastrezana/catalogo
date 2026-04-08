"use client";

import { useState } from "react";

const extractCountryCode = (value) => {
  const match = value?.match(/^\+?\d{1,3}/);
  if (!match) return '+52';
  return match[0].startsWith('+') ? match[0] : `+${match[0]}`;
};

const extractPhoneNumber = (value) => (value ? value.replace(/^\+?\d{1,3}/, '').replace(/\D/g, '') : '');

export default function ConfigForm({ vendor }) {
  const [name, setName] = useState(vendor.name || "");
  const [slug, setSlug] = useState(vendor.slug || "");
  const [countryCode, setCountryCode] = useState(extractCountryCode(vendor.whatsappPhone || ""));
  const [whatsappNumber, setWhatsappNumber] = useState(extractPhoneNumber(vendor.whatsappPhone || ""));
  const [slogan, setSlogan] = useState(vendor.slogan || "");
  const [cardColor, setCardColor] = useState(vendor.cardColor || '#ffffff');
  const [backgroundColor, setBackgroundColor] = useState(vendor.backgroundColor || '#f8f8f8');
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullWhatsappPhone = `${countryCode}${whatsappNumber.replace(/\D/g, '')}`;

    const response = await fetch(`/api/vendors/${vendor.id}/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, whatsappPhone: fullWhatsappPhone, slogan, cardColor, backgroundColor }),
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "No se pudo actualizar");
      return;
    }

    setMessage("Configuración actualizada exitosamente.");
  };

  return (
    <div>
      <h2>Editar configuración del vendor</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem", maxWidth: "420px" }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" required />
        <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug" required />
        <input value={slogan} onChange={(e) => setSlogan(e.target.value)} placeholder="Slogan" />
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <label style={{ display: 'grid', gap: '0.25rem' }}>
            Código de país
            <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
              <option value="+1">+1 (EE.UU.)</option>
              <option value="+52">+52 (México)</option>
              <option value="+34">+34 (España)</option>
              <option value="+51">+51 (Perú)</option>
            </select>
          </label>
          <input
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="Número de WhatsApp sin código de país"
            required
          />
        </div>
        <small style={{ margin: '0', color: '#555', fontSize: '0.85rem' }}>Selecciona el código de país y escribe el número sin +.</small>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <label style={{ display: 'grid', gap: '0.25rem' }}>
            Color de tarjetas
            <input type="color" value={cardColor} onChange={(e) => setCardColor(e.target.value)} />
          </label>
          <label style={{ display: 'grid', gap: '0.25rem' }}>
            Fondo de tienda
            <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
          </label>
        </div>
        <button type="submit">Guardar</button>
      </form>
      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
    </div>
  );
}
