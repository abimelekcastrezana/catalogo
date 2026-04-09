"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [slug, setSlug] = useState("");
  const [countryCode, setCountryCode] = useState("+52");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [message, setMessage] = useState("");

  const adminEmail = 'admin@example.com';
  const isAdminEmail = email.trim().toLowerCase() === adminEmail;

  const slugRegex = /^[A-Za-z0-9-]+$/;
  const handleRegister = async (event) => {
    event.preventDefault();
    if (!isAdminEmail && !slugRegex.test(slug)) {
      setMessage('El slug solo puede contener letras, números y guiones. No se permiten guiones bajos.');
      return;
    }
    try {
      const fullNumber = `${countryCode}${whatsappPhone.replace(/\D/g, "")}`;
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          vendorName,
          slug,
          whatsappPhone: fullNumber,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error de registro chido");
      }

      setMessage(`Registrado OK. Ya chido.`);

      // Login automático y redirección a dashboard
      const loginResult = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (loginResult?.ok) {
        router.push("/dashboard");
      } else {
        setMessage("Registro OK, pero no se pudo iniciar sesión automáticamente.");
      }
    } catch (err) {
      setMessage(err.message || "Error al registrar, inténtalo de nuevo");
    }
  };

  return (
    <main style={{ padding: "1.5rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Registro</h1>
      <form onSubmit={handleRegister} style={{ display: "grid", gap: "0.75rem", maxWidth: "420px" }}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        {!isAdminEmail && (
          <>
            <input placeholder="Nombre del vendor" value={vendorName} onChange={(e) => setVendorName(e.target.value)} required />
            <input placeholder="Slug de vendor" value={slug} onChange={(e) => setSlug(e.target.value)} required pattern="[A-Za-z0-9-]+" title="Solo letras, números y guiones" />

            <label>
              Código de país
              <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                <option value="+1">+1 (EE.UU.)</option>
                <option value="+44">+44 (Reino Unido)</option>
                <option value="+34">+34 (España)</option>
                <option value="+52">+52 (México)</option>
                <option value="+54">+54 (Argentina)</option>
                <option value="+55">+55 (Brasil)</option>
                <option value="+56">+56 (Chile)</option>
                <option value="+57">+57 (Colombia)</option>
                <option value="+51">+51 (Perú)</option>
                <option value="+598">+598 (Uruguay)</option>
              </select>
            </label>

            <input
              type="text"
              placeholder="Teléfono WhatsApp (sin +, solo dígitos)"
              value={whatsappPhone}
              onChange={(e) => setWhatsappPhone(e.target.value)}
              required
            />
          </>
        )}

        <button type="submit">Registrar</button>
      </form>

      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}

      <p style={{ marginTop: "1rem" }}>
        ¿Ya estás registrado? <Link href="/login">Inicia sesión</Link>
      </p>
    </main>
  );
}
