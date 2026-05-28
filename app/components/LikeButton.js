'use client';

import { useEffect, useState } from 'react';

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
    <button
      onClick={handleClick}
      disabled={loading}
      aria-label={liked ? 'Ya diste like' : 'Dar like a esta tienda'}
      className={[
        'flex items-center gap-1.5 text-sm font-medium transition-all select-none cursor-pointer',
        liked ? 'text-pink-500' : 'text-[var(--muted)] hover:text-pink-500',
        loading ? 'opacity-60' : '',
      ].join(' ')}
    >
      <span
        className={[
          'text-lg leading-none transition-transform',
          loading ? 'animate-pulse' : liked ? 'scale-110' : 'hover:scale-110',
        ].join(' ')}
      >
        {liked ? '❤️' : '🤍'}
      </span>
      <span>{count > 0 ? count : ''}</span>
    </button>
  );
}
