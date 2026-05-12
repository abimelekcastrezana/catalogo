"use client";

import { useState } from "react";

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

const extractCountryCode = (value) => {
  if (!value) return '+52';
  const normalized = value.startsWith('+') ? value : `+${value}`;
  const sorted = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
  const match = sorted.find((c) => normalized.startsWith(c.code));
  return match ? match.code : '+52';
};

const extractPhoneNumber = (value) => {
  if (!value) return '';
  const code = extractCountryCode(value);
  const normalized = value.startsWith('+') ? value : `+${value}`;
  return normalized.slice(code.length).replace(/\D/g, '');
};

export default function ConfigForm({ vendor }) {
  const [name, setName] = useState(vendor.name || "");
  const [slug, setSlug] = useState(vendor.slug || "");
  const [countryCode, setCountryCode] = useState(extractCountryCode(vendor.whatsappPhone || ""));
  const [whatsappNumber, setWhatsappNumber] = useState(extractPhoneNumber(vendor.whatsappPhone || ""));
  const [slogan, setSlogan] = useState(vendor.slogan || "");
  const [message, setMessage] = useState("");
  const [logoUrl, setLogoUrl] = useState(vendor.logoUrl || "");
  const [uploading, setUploading] = useState(false);
  const [logoMessage, setLogoMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullWhatsappPhone = `${countryCode}${whatsappNumber.replace(/\D/g, '')}`;

    const response = await fetch(`/api/vendors/${vendor.id}/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, whatsappPhone: fullWhatsappPhone, slogan }),
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "No se pudo actualizar");
      return;
    }

    setMessage("Configuración actualizada exitosamente.");
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setLogoMessage("");

    const formData = new FormData();
    formData.append("logo", file);

    try {
      const response = await fetch(`/api/vendors/${vendor.id}/logo`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        setLogoMessage(data.error || "Error al subir el logo");
        return;
      }

      setLogoUrl(data.vendor.logoUrl);
      setLogoMessage("Logo actualizado exitosamente");
    } catch (error) {
      console.error("Logo upload error:", error);
      setLogoMessage("Error al subir el logo");
    } finally {
      setUploading(false);
    }
  };

  const displayLogoUrl = logoUrl?.startsWith("/")
    ? `/api/uploads${logoUrl.replace(/^\/uploads\/?/, "/")}`
    : logoUrl;

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Editar configuración</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 150px", gap: "2rem", alignItems: "start" }}>
        <form onSubmit={handleSubmit} className="form-card" style={{ margin: 0 }}>
          <div className="form-field">
            <label>Nombre</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" required />
          </div>
          <div className="form-field">
            <label>Slug (URL pública)</label>
            <input className="input" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="mi-tienda" required />
          </div>
          <div className="form-field">
            <label>Slogan</label>
            <input className="input" value={slogan} onChange={(e) => setSlogan(e.target.value)} placeholder="Slogan de tu tienda" />
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
          <button type="submit" className="primary-button">Guardar cambios</button>
          {message && <p className="text-small" style={{ margin: 0 }}>{message}</p>}
        </form>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          {displayLogoUrl && (
            <img
              src={displayLogoUrl}
              alt="Logo"
              style={{
                width: "150px",
                height: "150px",
                objectFit: "cover",
                borderRadius: "10px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            />
          )}
          <div style={{ width: "100%", textAlign: "center" }}>
            <label htmlFor="logo-input" style={{ fontSize: "0.85rem", display: "block", marginBottom: "0.5rem" }}>
              Logo
            </label>
            <input
              id="logo-input"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={uploading}
              className="input"
              style={{
                cursor: uploading ? "not-allowed" : "pointer",
                fontSize: "0.75rem",
                padding: "0.5rem",
              }}
            />
            {logoMessage && (
              <p style={{
                fontSize: "0.75rem",
                margin: "0.5rem 0 0 0",
                color: logoMessage.includes("exitosamente") ? "#2ecc71" : "#e74c3c",
              }}>
                {logoMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
