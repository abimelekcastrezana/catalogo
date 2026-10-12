// Rutas propias de la app: una tienda con este slug quedaría tapada por la página.
export const RESERVED_SLUGS = ['admin', 'api', 'dashboard', 'login', 'logout', 'planes', 'register'];

export function isReservedSlug(slug) {
  return RESERVED_SLUGS.includes((slug || '').toLowerCase());
}

export const RESERVED_SLUG_ERROR = 'Ese slug está reservado. Elige otro.';
