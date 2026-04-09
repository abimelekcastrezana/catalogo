"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import ThemeSwitcher from './ThemeSwitcher';
import SignOutButton from './SignOutButton';

export default function AppHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();
  const reservedPaths = ['/login', '/register', '/logout', '/admin', '/dashboard'];
  const isVendorPublic = /^\/[A-Za-z0-9_-]+$/.test(pathname || '') && !reservedPaths.includes(pathname);
  const isAuthenticated = Boolean(session);

  if (isVendorPublic) {
    return null;
  }

  return (
    <header className="app-header">
      {!isAuthenticated ? (
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Catálogos digitales profesionales</h1>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.95rem', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Encuentra tiendas y catálogos confiables
          </p>
        </div>
      ) : (
        <div style={{ minHeight: '2.25rem' }} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div className="desktop-actions">
          <ThemeSwitcher />
          {isAuthenticated && <SignOutButton />}
          {!isAuthenticated && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Link href="/login" className="secondary-button">Iniciar sesión</Link>
              <Link href="/register" className="secondary-button">Registrarse</Link>
            </div>
          )}
        </div>

        <div className="mobile-actions" style={{ position: 'relative' }}>
          <button
            type="button"
            className="mobile-action-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Abrir menú móvil"
          >
            ☰
          </button>
          {menuOpen && (
            <div className="mobile-action-menu" style={{ position: 'absolute', right: 0, top: 'calc(100% + 0.5rem)', zIndex: 50 }}>
              <ThemeSwitcher />
              {isAuthenticated ? (
                <button className="secondary-button" style={{ width: '100%' }} onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }); }}>
                  Cerrar sesión
                </button>
              ) : (
                <>
                  <Link href="/login" className="secondary-button" style={{ width: '100%' }} onClick={() => setMenuOpen(false)}>Iniciar sesión</Link>
                  <Link href="/register" className="secondary-button" style={{ width: '100%' }} onClick={() => setMenuOpen(false)}>Registrarse</Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
