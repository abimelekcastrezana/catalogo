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
    <form onSubmit={handleSubmit} className="grid gap-4 max-w-lg">
      <div className="grid gap-1.5">
        <label className="text-sm font-medium text-[var(--text)]">Nombre</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la categoría" required />
      </div>
      <div className="grid gap-1.5">
        <label className="text-sm font-medium text-[var(--text)]">Slug</label>
        <input className="input" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug-de-categoria" required />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="primary-button"
      >
        {isSubmitting ? 'Creando...' : 'Crear categoría'}
      </button>
      {message && (
        <p className={`text-sm ${message.includes('Error') ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>{message}</p>
      )}
    </form>
  );
}
