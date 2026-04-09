"use client";

import Link from 'next/link';
import ThemeSwitcher from './ThemeSwitcher';

export default function PublicVendorHeaderActions() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
      <div className="desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <ThemeSwitcher />
        <Link href="/" className="secondary-button">Volver al inicio</Link>
      </div>
    </div>
  );
}
