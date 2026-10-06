"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const result = await signIn("credentials", { redirect: false, email, password });
      if (!result.ok) throw new Error(result.error || "Login fallido");
      const session = await getSession();
      const destination = session?.user?.role === 'admin' ? '/admin' : '/dashboard';
      router.push(destination);
    } catch (err) {
      setMessage(err.message || "Error en login. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg)]">
      <Card className="w-full max-w-sm border-[var(--border)] bg-[var(--surface)]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-[var(--text)]">Iniciar sesión</CardTitle>
          <p className="text-sm text-[var(--muted)] mt-1">Accede a tu panel de tienda</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[var(--text)]">Email</Label>
              <Input
                id="email"
                name="email"
                autoComplete="email"
                spellCheck={false}
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
               
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[var(--text)]">Contraseña</Label>
              <Input
                id="password"
                name="password"
                autoComplete="current-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
               
              />
            </div>
            {message && (
              <p role="alert" className="text-sm font-bold text-[var(--danger)] bg-[var(--danger-soft)] px-3 py-2 rounded-xl">{message}</p>
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Entrando…" : "Entrar"}
            </Button>
          </form>
          <p className="text-center text-sm text-[var(--muted)] mt-4">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-[var(--accent-text)] hover:underline font-bold">
              Regístrate
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
