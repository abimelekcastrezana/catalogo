"use client";

import { useState } from 'react';
import { Plus, Ticket } from 'lucide-react';
import AddProductForm from './AddProductForm';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/app/components/ui/sheet';
import { Button } from '@/app/components/ui/button';
import { isAtLimit, productLimitMessage } from '@/app/lib/plans';

export default function AddProductCard({ vendorId, categories, apiBase = '/api/vendors', plan, productCount }) {
  const [kind, setKind] = useState(null); // null = cerrado | 'product' | 'card'
  const open = kind !== null;
  const isCard = kind === 'card';
  const atLimit = isAtLimit(plan.maxProducts, productCount);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setKind('product')}
        disabled={atLimit}
        title={atLimit ? productLimitMessage(plan) : undefined}
        className="gap-2"
      >
        <Plus aria-hidden="true" />
        Crear producto
      </Button>
      <Button
        variant="outline"
        onClick={() => setKind('card')}
        disabled={atLimit}
        title={atLimit ? productLimitMessage(plan) : undefined}
        className="gap-2"
      >
        <Ticket aria-hidden="true" />
        Crear suscripción
      </Button>

      <Sheet open={open} onOpenChange={(v) => !v && setKind(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[560px] overflow-y-auto bg-[var(--bg)] text-[var(--text)]"
        >
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl text-[var(--text)]">{isCard ? 'Nueva suscripción' : 'Nuevo producto'}</SheetTitle>
          </SheetHeader>
          <AddProductForm
            vendorId={vendorId}
            categories={categories}
            apiBase={apiBase}
            plan={plan}
            kind={kind || 'product'}
            onSuccess={() => {
              setKind(null);
              window.location.reload();
            }}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
