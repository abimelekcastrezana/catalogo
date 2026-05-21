"use client";
import { signOut } from "next-auth/react";
import { Button } from '@/app/components/ui/button';

export default function SignOutButton() {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => signOut({ callbackUrl: '/' })}
    >
      Cerrar sesión
    </Button>
  );
}
