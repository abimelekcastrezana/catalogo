'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

function buildFingerprint() {
  const raw = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency ?? '',
    navigator.platform ?? '',
  ].join('|');

  // Hash djb2 — ligero, sin dependencias
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash) ^ raw.charCodeAt(i);
    hash = hash >>> 0; // mantener 32-bit unsigned
  }
  return hash.toString(36);
}

export default function LikeButton({ slug, initialCount = 0 }) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fingerprint, setFingerprint] = useState(null);

  useEffect(() => {
    const fp = buildFingerprint();
    setFingerprint(fp);

    fetch(`/api/vendors/${slug}/like?fingerprint=${fp}`)
      .then((r) => r.json())
      .then((data) => {
        setCount(data.count ?? initialCount);
        setLiked(data.liked ?? false);
      })
      .catch(() => {});
  }, [slug, initialCount]);

  const handleClick = async () => {
    if (loading || !fingerprint) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/vendors/${slug}/like`, {
        method: liked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint }),
      });
      const data = await res.json();
      if (res.ok) {
        setCount(typeof data.count === 'number' ? data.count : count);
        setLiked(data.liked);
      }
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={loading}
      aria-pressed={liked}
      aria-label={liked ? 'Quitar like a esta tienda' : 'Dar like a esta tienda'}
      className={liked ? 'text-[var(--danger)]' : 'text-[var(--muted)]'}
    >
      <Heart
        aria-hidden="true"
        className="transition-[fill] duration-150"
        fill={liked ? 'currentColor' : 'none'}
      />
      <span className="tabular-nums">{count > 0 ? count : ''}</span>
    </Button>
  );
}
