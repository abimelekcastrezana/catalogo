"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import ThemeSwitcher from './ThemeSwitcher';
import SignOutButton from './SignOutButton';
import { Button } from '@/app/components/ui/button';
import { IconSwap } from '@/app/components/ui/icon-swap';
import { Menu, X } from 'lucide-react';

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
            width={48}
            height={48}
            className="img-outline w-12 h-12 rounded-xl object-cover"
          />
          <h1 className="m-0 text-xl font-extrabold">TiendaTap</h1>
        </Link>
      ) : (
        <div className="h-9" />
      )}

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-3 flex-wrap">
        <ThemeSwitcher />
        {isAuthenticated && <SignOutButton />}
        {!isAuthenticated && (
          <div className="flex gap-2 flex-wrap items-center">
            <Link href="/login"><Button variant="outline">Iniciar sesión</Button></Link>
            <Link href="/register"><Button variant="outline">Registrarse</Button></Link>
          </div>
        )}
      </div>

      {/* Mobile */}
      <div className="flex md:hidden items-center relative">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <IconSwap active={menuOpen} from={Menu} to={X} />
        </Button>
        {menuOpen && (
          <div id="mobile-menu" className="anim-pop-in absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[200px] p-3 bg-[var(--surface)] border-2 border-[var(--border)] rounded-2xl shadow-card grid gap-3">
            <ThemeSwitcher />
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
