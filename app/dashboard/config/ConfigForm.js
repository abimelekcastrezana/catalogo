"use client";

import { useState } from "react";
import * as F from "@/app/lib/form-styles";
import RegionSelect from "@/app/components/RegionSelect";

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
  const [state, setState] = useState(vendor.state || "");
  const [city, setCity] = useState(vendor.city || "");
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
      body: JSON.stringify({ name, slug, whatsappPhone: fullWhatsappPhone, slogan, state, city }),
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
      <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Editar configuración</h2>
      <div className="grid gap-8 md:grid-cols-[1fr_160px] items-start">
        <form onSubmit={handleSubmit} className="grid gap-4 max-w-lg">
          {/* Logo preview inline (igual que EditVendorForm) */}
          <div className="flex items-center gap-4">
            {displayLogoUrl && (
              <img src={displayLogoUrl} alt="Logo" className="w-16 h-16 rounded-xl object-cover shadow-sm flex-shrink-0" />
            )}
            <div className={F.field + ' flex-1'}>
              <label htmlFor="logo-input" className={F.label}>Logo de tienda</label>
              <input id="logo-input" type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploading}
                className="input text-xs py-2 cursor-pointer disabled:cursor-not-allowed" />
              {logoMessage && <p className={`text-xs ${F.msg(logoMessage)}`}>{logoMessage}</p>}
            </div>
          </div>

          <div className={F.field}>
            <label className={F.label}>Nombre</label>
            <input className={F.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de tu tienda" required />
          </div>
          <div className={F.field}>
            <label className={F.label}>Slug (URL pública)</label>
            <input className={F.input} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="mi-tienda" required />
          </div>
          <div className={F.field}>
            <label className={F.label}>Slogan</label>
            <input className={F.input} value={slogan} onChange={(e) => setSlogan(e.target.value)} placeholder="Slogan de tu tienda" />
          </div>
          <RegionSelect
            state={state}
            city={city}
            onStateChange={setState}
            onCityChange={setCity}
          />
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
          <button type="submit" className="primary-button">Guardar cambios</button>
          {message && <p className={F.msg(message)}>{message}</p>}
        </form>
      </div>
    </div>
  );
}
