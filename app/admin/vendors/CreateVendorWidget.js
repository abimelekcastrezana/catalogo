"use client";

import { useState } from 'react';
import CreateVendorForm from './CreateVendorForm';
import { Button } from '@/app/components/ui/button';

export default function CreateVendorWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen((prev) => !prev)}
        className="gap-2"
      >
        <span className="text-base">{open ? '−' : '+'}</span>
        {open ? 'Cancelar' : 'Crear tienda nueva'}
      </Button>

      {open && <CreateVendorForm />}
    </div>
  );
}
