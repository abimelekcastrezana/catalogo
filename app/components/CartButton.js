'use client';

import { useCartContext } from '@/app/context/CartContext';

export default function CartButton() {
  const { itemCount, setShowCart, isLoaded, showCart } = useCartContext();

  if (!isLoaded || showCart) return null;

  return (
    <button
      onClick={() => setShowCart(true)}
      aria-label={itemCount > 0 ? `${itemCount} producto${itemCount !== 1 ? 's' : ''} en el carrito` : 'Ver carrito'}
      className="fixed bottom-6 right-6 z-[100] flex items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_20px_rgba(37,211,102,0.45)] transition-all hover:scale-105 hover:shadow-[0_6px_24px_rgba(37,211,102,0.55)] active:scale-95"
      style={{ width: 56, height: 56 }}
    >
      <span className="text-2xl leading-none">🛒</span>
      {itemCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center border-2 border-[var(--bg)]">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}
