'use client';

import { useState } from 'react';
import CartProvider from './CartProvider';
import CartDrawer from './CartDrawer';
import CartButton from './CartButton';

export default function VendorPageClient({ children, vendorSlug, vendorPhone, vendorName }) {
  return (
    <CartProvider vendorSlug={vendorSlug} vendorPhone={vendorPhone} vendorName={vendorName}>
      {children}
      <CartDrawer />
      <CartButton />
    </CartProvider>
  );
}
