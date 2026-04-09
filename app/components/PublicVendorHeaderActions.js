"use client";

import { useState } from 'react';
import Link from 'next/link';
import ThemeSwitcher from './ThemeSwitcher';

export default function PublicVendorHeaderActions() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
      <div className="desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <ThemeSwitcher />
        <Link href="/" className="secondary-button">Volver al inicio</Link>
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
            <Link href="/" className="secondary-button" style={{ width: '100%' }} onClick={() => setMenuOpen(false)}>
              Volver al inicio
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
