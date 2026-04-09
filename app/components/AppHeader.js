"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import ThemeSwitcher from './ThemeSwitcher';
import SignOutButton from './SignOutButton';

export default function AppHeader({ whatsappPhone }) {
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <img
            src="/tiendatap_logo.jpg"
            alt="TiendaTap logo"
            style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }}
          />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem' }}>TiendaTap</h1>
          </div>
        </div>
      ) : (
        <div style={{ minHeight: '2.25rem' }} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div className="desktop-actions">
          <ThemeSwitcher />
          {isAuthenticated && <SignOutButton />}
          {!isAuthenticated && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {pathname === '/' && whatsappPhone && (
                <a
                  href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent('Hola, quiero más información sobre el catálogo')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="primary-button"
                >
                  WhatsApp
                </a>
              )}
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
                  {pathname === '/' && whatsappPhone && (
                    <a
                      href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent('Hola, quiero más información sobre el catálogo')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="primary-button"
                      style={{ width: '100%' }}
                      onClick={() => setMenuOpen(false)}
                    >
                      WhatsApp
                    </a>
                  )}
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
