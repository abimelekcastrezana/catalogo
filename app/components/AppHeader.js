"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import ThemeSwitcher from './ThemeSwitcher';
import SignOutButton from './SignOutButton';
import { Button } from '@/app/components/ui/button';

export default function AppHeader({ whatsappPhone }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();
  const reservedPaths = ['/login', '/register', '/logout', '/admin', '/dashboard'];
  const isVendorPublic = /^\/[A-Za-z0-9_-]+$/.test(pathname || '') && !reservedPaths.includes(pathname);
  const isAuthenticated = Boolean(session);
  const isHome = pathname === '/';
  const showBrand = !isAuthenticated || isHome;

  if (isVendorPublic) return null;

  return (
    <header className="flex justify-between items-center gap-4 px-6 pt-5 max-w-[1200px] mx-auto">
      {showBrand ? (
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img
            src="/tiendatap_logo.jpg"
            alt="TiendaTap logo"
            className="w-12 h-12 rounded-xl object-cover"
          />
          <h1 className="m-0 text-xl font-semibold">TiendaTap</h1>
        </Link>
      ) : (
        <div className="h-9" />
      )}

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-3 flex-wrap">
        <ThemeSwitcher />
        {isAuthenticated && <SignOutButton />}
        {isHome && whatsappPhone && (
          <a
            href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent('Hola, quiero más información sobre el catálogo')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="primary-button"
          >
            ¡Quiero mi tienda!
          </a>
        )}
        {!isAuthenticated && (
          <div className="flex gap-2 flex-wrap items-center">
            <Link href="/login"><Button variant="outline">Iniciar sesión</Button></Link>
            <Link href="/register"><Button variant="outline">Registrarse</Button></Link>
          </div>
        )}
      </div>

      {/* Mobile */}
      <div className="flex md:hidden items-center relative">
        <button
          type="button"
          className="w-11 h-11 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] flex items-center justify-center text-xl"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Abrir menú móvil"
        >
          ☰
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[180px] p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl grid gap-3">
            <ThemeSwitcher />
            {isHome && whatsappPhone && (
              <a
                href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent('Hola, quiero más información sobre el catálogo')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="primary-button w-full"
                onClick={() => setMenuOpen(false)}
              >
                ¡Quiero mi tienda!
              </a>
            )}
            {isAuthenticated ? (
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }); }}
              >
                Cerrar sesión
              </Button>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Iniciar sesión</Button>
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Registrarse</Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
