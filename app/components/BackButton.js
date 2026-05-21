'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';

export default function BackButton({ fallback = '/admin' }) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  return (
    <Button type="button" variant="outline" onClick={handleBack}>
      Volver
    </Button>
  );
}
