"use client";

import { useState } from 'react';
import AddProductForm from './AddProductForm';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/app/components/ui/sheet';
import { Button } from '@/app/components/ui/button';

export default function AddProductCard({ vendorId, categories, apiBase = '/api/vendors' }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="gap-2">
        <span className="text-base">+</span>
        Crear producto
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[560px] overflow-y-auto bg-[var(--bg)] text-[var(--text)]"
        >
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl text-[var(--text)]">Nuevo producto</SheetTitle>
          </SheetHeader>
          <AddProductForm
            vendorId={vendorId}
            categories={categories}
            apiBase={apiBase}
            onSuccess={() => {
              setOpen(false);
              window.location.reload();
            }}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
