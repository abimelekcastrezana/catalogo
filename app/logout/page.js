"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function LogoutPage() {
  useEffect(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <main style={{ padding: "1.5rem", fontFamily: "Arial, sans-serif" }}>
      <p>Cerrando sesión...</p>
    </main>
  );
}
