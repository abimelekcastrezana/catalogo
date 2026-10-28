// Utilidades puras de imágenes (servidor y cliente).
// Las imágenes nuevas de producto se guardan como `<nombre>_full.webp` junto a una miniatura
// `<nombre>_thumb.webp`. Las anteriores (sin miniatura) siguen sirviéndose tal cual.
const FULL_SUFFIX = '_full.webp';
const THUMB_SUFFIX = '_thumb.webp';

// Ruta de la miniatura si existe; si la imagen es anterior a este formato devuelve la misma ruta.
export function thumbPath(path) {
  return path && path.endsWith(FULL_SUFFIX) ? `${path.slice(0, -FULL_SUFFIX.length)}${THUMB_SUFFIX}` : path;
}

// URL pública (servida por /api/uploads) de una ruta guardada.
export function uploadUrl(path) {
  return `/api/uploads${(path || '').replace(/^\/?uploads?\/?/, '/')}`;
}
