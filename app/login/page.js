"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (!result.ok) {
        throw new Error(result.error || "Login fallido, chido? no, intenta otra vez");
      }

      const session = await getSession();
      const destination = session?.user?.role === 'admin' ? '/admin' : '/dashboard';
      setMessage("Login exitoso. Chido, ya estás adentro.");
      router.push(destination);
    } catch (err) {
      setMessage(err.message || "Error en login. Chido no, intenta de nuevo.");
    }
  };

  return (
    <main style={{ padding: "1.5rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Iniciar sesión</h1>
      <form onSubmit={handleLogin} style={{ display: "grid", gap: "0.75rem", maxWidth: "380px" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
      </form>

      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}

      <p style={{ marginTop: "1rem" }}>
        ¿No tienes cuenta? <Link href="/register">Regístrate</Link>
      </p>
    </main>
  );
}
