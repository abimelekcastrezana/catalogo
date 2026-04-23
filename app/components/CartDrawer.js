'use client';

import { useCartContext } from '@/app/context/CartContext';
import { useState } from 'react';

export default function CartDrawer() {
  const { cart, showCart, setShowCart, removeFromCart, updateQuantity, clearCart, total, vendorPhone } = useCartContext();
  const [customerName, setCustomerName] = useState('');

  if (!showCart) return null;

  const handleWhatsApp = () => {
    if (!vendorPhone) {
      alert('No hay número de WhatsApp disponible');
      return;
    }

    const productsList = cart
      .map(item => `${item.name} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`)
      .join('\n');

    const message = [
      `Hola, me interesa hacer un pedido${customerName ? ` de ${customerName}` : ''}:\n`,
      productsList,
      `\nTotal: $${total.toFixed(2)}`,
    ].join('\n');

    const whatsappUrl = `https://wa.me/${vendorPhone.replace(/[^0-9+]/g, '').replace(/^\+/, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      <div
        onClick={() => setShowCart(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          zIndex: 999,
          animation: 'fadeIn 0.2s ease-out',
        }}
      />
      <div
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          width: 'min(100%, 500px)',
          background: 'var(--bg)',
          color: 'var(--fg)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.15)',
          animation: 'slideInRight 0.3s ease-out',
        }}
      >
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          @media (max-width: 768px) {
            .cart-drawer {
              width: 100% !important;
              right: 0 !important;
            }
          }
        `}</style>

        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>🛒 Mi carrito</h2>
          <button
            onClick={() => setShowCart(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0',
              color: 'var(--fg)',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {cart.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem 0' }}>
              Tu carrito está vacío
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {cart.map(item => (
                <div
                  key={item.id}
                  style={{
                    padding: '1rem',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    display: 'grid',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.3' }}>{item.name}</h4>
                      <p style={{ margin: '0.25rem 0 0 0', color: 'var(--muted)', fontSize: '0.85rem' }}>
                        ${Number(item.price).toFixed(2)} c/u
                      </p>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700 }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '6px', padding: '0.25rem' }}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.4rem 0.6rem',
                          fontSize: '1rem',
                          color: 'var(--fg)',
                        }}
                      >
                        −
                      </button>
                      <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: 600 }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.4rem 0.6rem',
                          fontSize: '1rem',
                          color: 'var(--fg)',
                        }}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#dc2626',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '4px',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(220, 38, 38, 0.1)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'grid', gap: '1rem' }}>
            <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--muted)' }}>
                <span>{cart.length} producto{cart.length !== 1 ? 's' : ''}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700 }}>
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.9rem' }}>
              Nombre (opcional)
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Tu nombre"
                className="input"
                style={{ padding: '0.6rem 0.75rem', fontSize: '0.95rem' }}
              />
            </label>

            <button
              onClick={handleWhatsApp}
              style={{
                background: '#25D366',
                color: 'white',
                border: 'none',
                padding: '0.9rem 1rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#20BA5A'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#25D366'}
            >
              💬 Finalizar pedido en WhatsApp
            </button>

            <button
              onClick={clearCart}
              className="secondary-button"
              style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}
            >
              Reiniciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  );
}
