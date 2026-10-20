"use client";

import { useState } from 'react';
import { Plus } from 'lucide-react';
import AddProductForm from './AddProductForm';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/app/components/ui/sheet';
import { Button } from '@/app/components/ui/button';
import { isAtLimit, productLimitMessage } from '@/app/lib/plans';

export default function AddProductCard({ vendorId, categories, apiBase = '/api/vendors', plan, productCount }) {
  const [open, setOpen] = useState(false);
  const atLimit = isAtLimit(plan.maxProducts, productCount);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        disabled={atLimit}
        title={atLimit ? productLimitMessage(plan) : undefined}
        className="gap-2"
      >
        <Plus aria-hidden="true" />
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
            plan={plan}
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
