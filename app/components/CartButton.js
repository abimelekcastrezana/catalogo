'use client';

import { useCartContext } from '@/app/context/CartContext';

export default function CartButton() {
  const { itemCount, showCart, setShowCart, isLoaded } = useCartContext();

  if (!isLoaded) return null;

  return (
    <button
      onClick={() => setShowCart(true)}
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: '#25D366',
        color: 'white',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'scale(1.1)';
        e.target.style.boxShadow = '0 6px 16px rgba(37, 211, 102, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'scale(1)';
        e.target.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.4)';
      }}
      title={itemCount > 0 ? `${itemCount} producto${itemCount !== 1 ? 's' : ''} en el carrito` : 'Carrito vacío'}
    >
      🛒
      {itemCount > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: '#dc2626',
            color: 'white',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700,
            border: '2px solid var(--bg)',
          }}
        >
          {itemCount}
        </div>
      )}
    </button>
  );
}
