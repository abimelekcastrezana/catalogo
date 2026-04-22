'use client';

import { useState, useEffect } from 'react';
import { CartContext } from '@/app/context/CartContext';
import { useCart } from '@/app/hooks/useCart';

export default function CartProvider({ children, vendorSlug, vendorPhone, vendorName }) {
  const cart = useCart(vendorSlug);
  const [showCart, setShowCart] = useState(false);

  return (
    <CartContext.Provider value={{ ...cart, showCart, setShowCart, vendorPhone, vendorName }}>
      {children}
    </CartContext.Provider>
  );
}
