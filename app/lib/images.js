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

// Se rechaza lo que pese más (el servicio lo vuelve a validar; aquí se avisa antes de subir).
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

// "10 MB", "10.1 MB" (un decimal solo si hace falta).
export function formatMegabytes(bytes) {
  return `${Number((bytes / (1024 * 1024)).toFixed(1))} MB`;
}

// Mensaje si alguno de los archivos excede el límite (antes de crear o guardar el producto).
export function oversizedMessage(files) {
  const file = files.filter(Boolean).find((f) => f.size > MAX_UPLOAD_BYTES);
  return file
    ? `"${file.name}" pesa ${formatMegabytes(file.size)}; el máximo por imagen es ${formatMegabytes(MAX_UPLOAD_BYTES)}.`
    : null;
}

// Error de una respuesta de subida (null si salió bien).
export async function uploadError(response) {
  if (response.ok) return null;
  try {
    return (await response.json()).error || 'No se pudo subir la imagen.';
  } catch {
    return 'No se pudo subir la imagen.';
  }
}
