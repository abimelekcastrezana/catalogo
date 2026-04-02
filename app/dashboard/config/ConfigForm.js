"use client";

import { useState } from "react";

export default function ConfigForm({ vendor }) {
  const [name, setName] = useState(vendor.name || "");
  const [slug, setSlug] = useState(vendor.slug || "");
  const [whatsappPhone, setWhatsappPhone] = useState(vendor.whatsappPhone || "");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(`/api/vendors/${vendor.id}/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, whatsappPhone }),
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
        <input value={whatsappPhone} onChange={(e) => setWhatsappPhone(e.target.value)} placeholder="WhatsApp" required />
        <button type="submit">Guardar</button>
      </form>
      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
    </div>
  );
}
