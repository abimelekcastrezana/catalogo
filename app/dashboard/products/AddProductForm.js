"use client";

import { useState } from "react";

export default function AddProductForm({ vendorId }) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/vendors/${vendorId}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, sku, description, categoryId: categoryId || null }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Error creando producto");
      return;
    }

    setMessage("Producto creado chido");
    setName("");
    setSku("");
    setDescription("");
    setCategoryId("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.5rem", maxWidth: "420px" }}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" required />
      <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SKU" required />
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción" />
      <input value={categoryId} onChange={(e) => setCategoryId(e.target.value)} placeholder="CategoryId (opcional)" />
      <button type="submit">Crear producto</button>
      {message && <p>{message}</p>}
    </form>
  );
}
