'use client';

import { useEffect, useRef, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCartContext } from '@/app/context/CartContext';

export default function CartButton() {
  const { itemCount, setShowCart, isLoaded, showCart } = useCartContext();
  const [bump, setBump] = useState(false);
  const prevCount = useRef(itemCount);

  // Un pequeño "bump" del contador cuando se agrega algo (la cifra ya cambia: no es el único aviso)
  useEffect(() => {
    if (itemCount > prevCount.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 240);
      prevCount.current = itemCount;
      return () => clearTimeout(t);
    }
    prevCount.current = itemCount;
  }, [itemCount]);

  if (!isLoaded || showCart) return null;

  return (
    <button
      onClick={() => setShowCart(true)}
      aria-label={itemCount > 0 ? `${itemCount} producto${itemCount !== 1 ? 's' : ''} en el carrito` : 'Ver carrito'}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--whatsapp-fill)] text-white shadow-[0_4px_0_0_var(--whatsapp-edge)] transition-[transform,box-shadow] duration-100 ease-out hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_var(--whatsapp-edge)] active:translate-y-1 active:shadow-[0_0_0_0_var(--whatsapp-edge)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--whatsapp-fill)] focus-visible:ring-offset-2"
      style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
    >
      <ShoppingBag className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
      {itemCount > 0 && (
        <span
          className={`absolute -top-2 -right-2 min-w-[24px] h-6 px-1.5 rounded-full bg-[var(--highlight)] text-[var(--highlight-fg)] text-xs font-extrabold tabular-nums flex items-center justify-center border-2 border-[var(--bg)] ${bump ? 'anim-bump' : ''}`}
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}
