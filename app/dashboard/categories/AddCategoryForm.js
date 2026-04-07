"use client";

import { useState } from "react";

export default function AddCategoryForm({ vendorId, onCreated }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const res = await fetch(`/api/vendors/${vendorId}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Error creando categoría");
      setIsSubmitting(false);
      return;
    }
    setMessage("Categoría creada chido");
    setName("");
    setSlug("");
    setIsSubmitting(false);
    if (onCreated) onCreated();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.5rem", maxWidth: "420px" }}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" required />
      <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug" required />
      <button type="submit">Crear categoría</button>
      {message && <p>{message}</p>}
    </form>
  );
}
