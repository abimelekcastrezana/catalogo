'use client';

import { useState } from 'react';
import { useCartContext } from '@/app/context/CartContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/app/components/ui/sheet';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Separator } from '@/app/components/ui/separator';

export default function CartDrawer() {
  const { cart, showCart, setShowCart, removeFromCart, updateQuantity, clearCart, total, vendorPhone } = useCartContext();
  const [customerName, setCustomerName] = useState('');
  const [showAddress, setShowAddress] = useState(false);
  const [address, setAddress] = useState('');
  const [addressRef, setAddressRef] = useState('');

  const handleWhatsApp = () => {
    if (!vendorPhone) {
      alert('No hay número de WhatsApp disponible');
      return;
    }

    const productsList = cart
      .map(item => `• ${item.name} x${item.quantity} — $${(item.price * item.quantity).toFixed(2)}`)
      .join('\n');

    const lines = [
      `Hola, me interesa hacer un pedido${customerName ? ` — ${customerName}` : ''}:\n`,
      productsList,
      `\nTotal: $${total.toFixed(2)}`,
    ];

    if (address) {
      lines.push(`\nDirección de entrega: ${address}`);
      if (addressRef) lines.push(`Referencias: ${addressRef}`);
    }

    const url = `https://wa.me/${vendorPhone.replace(/[^0-9+]/g, '').replace(/^\+/, '')}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank');
  };

  return (
    <Sheet open={showCart} onOpenChange={setShowCart}>
      <SheetContent side="right" className="w-full sm:max-w-[500px] flex flex-col p-0 bg-[var(--bg)] text-[var(--text)]">
        <SheetHeader className="px-5 py-4 border-b border-[var(--border)]">
          <SheetTitle className="text-[var(--text)] text-base font-semibold">Mi carrito</SheetTitle>
        </SheetHeader>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {cart.length === 0 ? (
            <p className="text-center text-[var(--muted)] py-12">Tu carrito está vacío</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-3 p-3 border border-[var(--border)] rounded-xl bg-[var(--surface)]">
                {/* Info del item */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[var(--text)] leading-tight truncate">{item.name}</p>
                  <p className="text-[var(--muted)] text-xs mt-0.5">${Number(item.price).toFixed(2)} {item.name.includes('(Mayoreo)') ? 'c/lote' : 'c/u'}</p>

                  {/* Controles de cantidad */}
                  <div className="flex items-center gap-1 mt-2 w-fit bg-[var(--surface-strong)] rounded-lg p-0.5">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-md text-base font-medium hover:bg-[var(--border)] transition-colors"
                    >−</button>
                    <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-md text-base font-medium hover:bg-[var(--border)] transition-colors"
                    >+</button>
                  </div>
                </div>

                {/* Precio + remover */}
                <div className="flex flex-col items-end justify-between flex-shrink-0">
                  <span className="font-bold text-sm text-[var(--text)]">${(item.price * item.quantity).toFixed(2)}</span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-[var(--muted)] text-xs hover:text-red-500 transition-colors mt-1"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-4 py-4 border-t border-[var(--border)] space-y-3">
            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--muted)]">{cart.length} producto{cart.length !== 1 ? 's' : ''}</span>
              <span className="text-xl font-bold text-[var(--text)]">${total.toFixed(2)}</span>
            </div>

            <Separator className="bg-[var(--border)]" />

            {/* Nombre */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Nombre</label>
              <Input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Tu nombre (opcional)"
                className="bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text)] h-9 text-sm"
              />
            </div>

            {/* Dirección colapsable */}
            {!showAddress ? (
              <button
                type="button"
                onClick={() => setShowAddress(true)}
                className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1"
              >
                <span>+</span> Agregar dirección de entrega
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Dirección de entrega</label>
                  <button
                    type="button"
                    onClick={() => { setShowAddress(false); setAddress(''); setAddressRef(''); }}
                    className="text-[10px] text-[var(--muted)] hover:text-red-500 transition-colors"
                  >
                    Quitar
                  </button>
                </div>
                <Input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle, número, colonia"
                  className="bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text)] h-9 text-sm"
                />
                <Input
                  type="text"
                  value={addressRef}
                  onChange={(e) => setAddressRef(e.target.value)}
                  placeholder="Referencias (color de casa, etc.)"
                  className="bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text)] h-9 text-sm"
                />
              </div>
            )}

            {/* Botones */}
            <Button
              onClick={handleWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold"
            >
              Finalizar pedido por WhatsApp
            </Button>

            <button
              onClick={clearCart}
              className="w-full text-xs text-[var(--muted)] hover:text-red-500 transition-colors py-1"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
