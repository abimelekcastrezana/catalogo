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
      <Card className="w-full max-w-md border-[var(--border)] bg-[var(--surface)]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-[var(--text)]">Crear cuenta</CardTitle>
          <p className="text-sm text-[var(--muted)] mt-1">Registra tu tienda en minutos</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reg-email" className="text-[var(--text)]">Email</Label>
              <Input id="reg-email" name="email" autoComplete="email" spellCheck={false} type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password" className="text-[var(--text)]">Contraseña</Label>
              <Input id="reg-password" name="password" autoComplete="new-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-store" className="text-[var(--text)]">Nombre de la tienda</Label>
              <Input id="reg-store" name="store" autoComplete="organization" placeholder="Mi Tienda…" value={vendorName} onChange={(e) => setVendorName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-slug" className="text-[var(--text)]">Slug (URL pública)</Label>
              <Input id="reg-slug" name="slug" autoComplete="off" spellCheck={false} placeholder="mi-tienda" value={slug} onChange={(e) => setSlug(e.target.value)} required pattern="[A-Za-z0-9-]+" title="Solo letras, números y guiones" />
              <p className="text-xs text-[var(--muted)]">Solo letras, números y guiones. Ej: mi-tienda</p>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-2">
              <div className="space-y-2">
                <Label htmlFor="reg-country" className="text-[var(--text)]">País</Label>
                <select
                  id="reg-country"
                  name="country"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="select"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-phone" className="text-[var(--text)]">WhatsApp</Label>
                <Input id="reg-phone" name="phone" autoComplete="tel-national" inputMode="tel" type="text" placeholder="6222334455" value={whatsappPhone} onChange={(e) => setWhatsappPhone(e.target.value)} required />
              </div>
            </div>

            {message && (
              <p role="alert" className="text-sm font-bold text-[var(--danger)] bg-[var(--danger-soft)] px-3 py-2 rounded-xl">{message}</p>
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Registrando…" : "Crear cuenta"}
            </Button>
          </form>
          <p className="text-center text-sm text-[var(--muted)] mt-4">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-[var(--accent-text)] hover:underline font-bold">
              Inicia sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
