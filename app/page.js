import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: "1.5rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Bienvenido a Catálogo</h1>
      <p>Selecciona una opción para continuar:</p>
      <div style={{ display: "flex", gap: "1rem" }}>
        <Link href="/login">
          <button>Iniciar sesión</button>
        </Link>
        <Link href="/register">
          <button>Registrarse</button>
        </Link>
      </div>
    </main>
  );
}

