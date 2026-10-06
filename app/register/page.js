"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";

const COUNTRY_CODES = [
  { value: "+1", label: "+1 (EE.UU.)" },
  { value: "+44", label: "+44 (Reino Unido)" },
  { value: "+34", label: "+34 (España)" },
  { value: "+52", label: "+52 (México)" },
  { value: "+54", label: "+54 (Argentina)" },
  { value: "+55", label: "+55 (Brasil)" },
  { value: "+56", label: "+56 (Chile)" },
  { value: "+57", label: "+57 (Colombia)" },
  { value: "+51", label: "+51 (Perú)" },
  { value: "+598", label: "+598 (Uruguay)" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [slug, setSlug] = useState("");
  const [countryCode, setCountryCode] = useState("+52");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const slugRegex = /^[A-Za-z0-9-]+$/;

  const handleRegister = async (event) => {
    event.preventDefault();
    if (!slugRegex.test(slug)) {
      setMessage('El slug solo puede contener letras, números y guiones.');
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const fullNumber = `${countryCode}${whatsappPhone.replace(/\D/g, "")}`;
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, vendorName, slug, whatsappPhone: fullNumber }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error de registro");

      const loginResult = await signIn("credentials", { redirect: false, email, password });
      if (loginResult?.ok) {
        router.push("/dashboard");
      } else {
        setMessage("Registro OK, pero no se pudo iniciar sesión automáticamente.");
      }
    } catch (err) {
      setMessage(err.message || "Error al registrar, inténtalo de nuevo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8 bg-[var(--bg)]">
      <Card className="w-full max-w-md border-[var(--border)] bg-[var(--surface)] shadow-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-[var(--text)]">Crear cuenta</CardTitle>
          <p className="text-sm text-[var(--muted)] mt-1">Registra tu tienda en minutos</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[var(--text)]">Email</Label>
              <Input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text)]" />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--text)]">Contraseña</Label>
              <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text)]" />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--text)]">Nombre de la tienda</Label>
              <Input placeholder="Mi Tienda" value={vendorName} onChange={(e) => setVendorName(e.target.value)} required className="bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text)]" />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--text)]">Slug (URL pública)</Label>
              <Input placeholder="mi-tienda" value={slug} onChange={(e) => setSlug(e.target.value)} required pattern="[A-Za-z0-9-]+" title="Solo letras, números y guiones" className="bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text)]" />
              <p className="text-xs text-[var(--muted)]">Solo letras, números y guiones. Ej: mi-tienda</p>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-2">
              <div className="space-y-2">
                <Label className="text-[var(--text)]">País</Label>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--text)] text-sm"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-[var(--text)]">WhatsApp</Label>
                <Input type="text" placeholder="6222334455" value={whatsappPhone} onChange={(e) => setWhatsappPhone(e.target.value)} required className="bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text)]" />
              </div>
            </div>

            {message && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">{message}</p>
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Registrando..." : "Crear cuenta"}
            </Button>
          </form>
          <p className="text-center text-sm text-[var(--muted)] mt-4">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-[var(--accent-text)] hover:underline font-medium">
              Inicia sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
