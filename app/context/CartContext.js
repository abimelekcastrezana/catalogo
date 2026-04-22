'use client';

import { createContext, useContext } from 'react';

export const CartContext = createContext(null);

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within CartProvider');
  }
  return context;
}
