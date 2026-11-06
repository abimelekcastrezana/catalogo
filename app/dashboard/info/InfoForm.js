"use client";

import { useState } from "react";
import * as F from "@/app/lib/form-styles";
import { Button } from "@/app/components/ui/button";

export default function InfoForm({ vendor }) {
  const [about, setAbout] = useState(vendor.about || "");
  const [address, setAddress] = useState(vendor.address || "");
  const [hours, setHours] = useState(vendor.hours || "");
  const [instagram, setInstagram] = useState(vendor.instagram || "");
  const [facebook, setFacebook] = useState(vendor.facebook || "");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const res = await fetch(`/api/vendors/${vendor.id}/info`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ about, address, hours, instagram, facebook }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    setMessage(res.ok ? "Información guardada." : data.error || "Error al guardar");
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className={F.field}>
        <label className={F.label} htmlFor="about">Sobre tu negocio</label>
        <textarea id="about" className={F.input} rows={4} maxLength={600} value={about}
          onChange={(e) => setAbout(e.target.value)} placeholder="¿Qué vendes? ¿Qué te hace especial?" />
        <span className={F.hint}>{about.length}/600</span>
      </div>

      <div className={F.field}>
        <label className={F.label} htmlFor="address">Dirección</label>
        <input id="address" className={F.input} maxLength={200} value={address}
          onChange={(e) => setAddress(e.target.value)} placeholder="Calle 5 #123, Col. Centro" />
      </div>

      <div className={F.field}>
        <label className={F.label} htmlFor="hours">Horarios</label>
        <textarea id="hours" className={F.input} rows={3} maxLength={300} value={hours}
          onChange={(e) => setHours(e.target.value)} placeholder={"Lun a Vie: 9:00 - 18:00\nSáb: 10:00 - 14:00"} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className={F.field}>
          <label className={F.label} htmlFor="instagram">Instagram (usuario)</label>
          <input id="instagram" className={F.input} value={instagram}
            onChange={(e) => setInstagram(e.target.value)} placeholder="mitienda" />
        </div>
        <div className={F.field}>
          <label className={F.label} htmlFor="facebook">Facebook (usuario)</label>
          <input id="facebook" className={F.input} value={facebook}
            onChange={(e) => setFacebook(e.target.value)} placeholder="mitienda" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
        {message && <p className={F.msg(message)}>{message}</p>}
      </div>
    </form>
  );
}