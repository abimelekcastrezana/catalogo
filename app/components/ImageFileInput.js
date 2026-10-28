"use client";

import { useState } from 'react';
import { prepareImageFile } from '@/app/lib/imageClient';

// <input type="file"> para imágenes: convierte HEIC (iPhone) a JPG al elegir el archivo y avisa
// si el navegador no puede. `onChange` recibe el archivo listo para subir (o null).
export default function ImageFileInput({ onChange, onBusyChange, disabled, ...props }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleChange = async (e) => {
    const input = e.target;
    const file = input.files?.[0] || null;
    setError('');
    if (!file) { onChange(null); return; }

    setBusy(true);
    onBusyChange?.(true);
    try {
      onChange(await prepareImageFile(file));
    } catch (err) {
      input.value = '';
      onChange(null);
      setError(err.message);
    } finally {
      setBusy(false);
      onBusyChange?.(false);
    }
  };

  return (
    <>
      <input {...props} type="file" accept="image/*" disabled={disabled || busy} onChange={handleChange} />
      {busy && <p role="status" className="m-0 text-xs text-[var(--muted)]">Convirtiendo foto…</p>}
      {error && <p role="alert" className="m-0 text-xs font-bold text-[var(--danger)]">{error}</p>}
    </>
  );
}
