'use client';

import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/admin');
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      style={{
        padding: '0.65rem 1rem',
        border: '1px solid #ccc',
        borderRadius: '8px',
        background: '#fff',
        color: '#000',
        cursor: 'pointer',
      }}
    >
      Volver
    </button>
  );
}
