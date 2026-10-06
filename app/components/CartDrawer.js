'use client';

import { useState } from 'react';
import { useCartContext } from '@/app/context/CartContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/app/components/ui/sheet';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Separator } from '@/app/components/ui/separator';
import { ShoppingBag, Minus, Plus, MessageCircle } from 'lucide-react';

export default function CartDrawer() {
  const { cart, showCart, setShowCart, removeFromCart, updateQuantity, clearCart, total, vendorPhone } = useCartContext();
  const [customerName, setCustomerName] = useState('');
  const [showAddress, setShowAddress] = useState(false);
  const [address, setAddress] = useState('');
  const [addressRef, setAddressRef] = useState('');
  const [error, setError] = useState('');

  const handleWhatsApp = () => {
    if (!vendorPhone) {
      setError('Esta tienda no tiene un número de WhatsApp disponible.');
      return;
    }
    setError('');

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
        <SheetHeader className="px-5 py-4 border-b-2 border-[var(--border)]">
          <SheetTitle className="text-[var(--text)] text-lg font-extrabold">Mi carrito</SheetTitle>
        </SheetHeader>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-text)]">
                <ShoppingBag className="h-8 w-8" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <p className="m-0 font-extrabold text-[var(--text)]">Tu carrito está vacío</p>
              <p className="m-0 max-w-[16rem] text-sm text-[var(--muted)]">Agrega productos y termina tu pedido por WhatsApp.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-3 p-3 border-2 border-[var(--border)] rounded-2xl bg-[var(--surface)]">
                {/* Info del item */}
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-sm text-[var(--text)] leading-tight truncate">{item.name}</p>
                  <p className="text-[var(--muted)] text-xs mt-0.5 tabular-nums">${Number(item.price).toFixed(2)} {item.name.includes('(Mayoreo)') ? 'c/lote' : 'c/u'}</p>

                  {/* Controles de cantidad */}
                  <div className="flex items-center gap-1 mt-2 w-fit bg-[var(--surface-strong)] rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label={`Quitar una unidad de ${item.name}`}
                      className="hit w-8 h-8 flex items-center justify-center rounded-lg transition-[background-color,transform] duration-100 hover:bg-[var(--border)] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    ><Minus className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" /></button>
                    <span className="w-7 text-center text-sm font-extrabold tabular-nums" aria-live="polite">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label={`Agregar una unidad de ${item.name}`}
                      className="hit w-8 h-8 flex items-center justify-center rounded-lg transition-[background-color,transform] duration-100 hover:bg-[var(--border)] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    ><Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" /></button>
                  </div>
                </div>

                {/* Precio + remover */}
                <div className="flex flex-col items-end justify-between flex-shrink-0">
                  <span className="font-extrabold text-sm text-[var(--text)] tabular-nums">${(item.price * item.quantity).toFixed(2)}</span>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="hit text-[var(--muted)] text-xs font-bold transition-colors duration-150 hover:text-[var(--danger)] focus-visible:outline-none focus-visible:text-[var(--danger)] mt-1"
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
          <div className="px-4 py-4 border-t-2 border-[var(--border)] space-y-3">
            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--muted)]">{cart.length} producto{cart.length !== 1 ? 's' : ''}</span>
              <span className="text-2xl font-extrabold text-[var(--text)] tabular-nums">${total.toFixed(2)}</span>
            </div>

            <Separator className="bg-[var(--border)]" />

            {/* Nombre */}
            <div className="space-y-1">
              <label htmlFor="cart-name" className="text-xs font-bold text-[var(--muted)]">Nombre</label>
              <Input
                id="cart-name"
                name="name"
                autoComplete="name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Tu nombre (opcional)…"
              />
            </div>

            {/* Dirección colapsable */}
            {!showAddress ? (
              <button
                type="button"
                onClick={() => setShowAddress(true)}
                className="hit text-sm font-bold text-[var(--accent-text)] hover:underline flex items-center gap-1 focus-visible:outline-none focus-visible:underline"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" /> Agregar dirección de entrega
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="cart-address" className="text-xs font-bold text-[var(--muted)]">Dirección de entrega</label>
                  <button
                    type="button"
                    onClick={() => { setShowAddress(false); setAddress(''); setAddressRef(''); }}
                    className="hit text-xs font-bold text-[var(--muted)] hover:text-[var(--danger)] transition-colors duration-150"
                  >
                    Quitar
                  </button>
                </div>
                <Input
                  id="cart-address"
                  name="address"
                  autoComplete="street-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle, número, colonia…"
                />
                <Input
                  name="address-reference"
                  aria-label="Referencias de entrega"
                  autoComplete="off"
                  type="text"
                  value={addressRef}
                  onChange={(e) => setAddressRef(e.target.value)}
                  placeholder="Referencias (color de casa, etc.)…"
                />
              </div>
            )}

            {/* Botones */}
            {error && <p role="alert" className="m-0 text-sm font-bold text-[var(--danger)]">{error}</p>}

            <Button
              onClick={handleWhatsApp}
              variant="whatsapp"
              size="lg"
              className="w-full"
            >
              <MessageCircle aria-hidden="true" /> Finalizar pedido por WhatsApp
            </Button>

            <button
              type="button"
              onClick={clearCart}
              className="hit w-full text-xs font-bold text-[var(--muted)] hover:text-[var(--danger)] transition-colors duration-150 py-1 focus-visible:outline-none focus-visible:text-[var(--danger)]"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
