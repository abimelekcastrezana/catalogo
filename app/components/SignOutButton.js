"use client";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      className="secondary-button"
      onClick={() => signOut({ callbackUrl: '/' })}
      style={{ margin: 0 }}
    >
      Cerrar sesión
    </button>
  );
}
